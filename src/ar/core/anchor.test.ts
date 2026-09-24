import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Matrix4, PerspectiveCamera, Quaternion, Vector3, Euler } from 'three';
import { AnchorFilter, boothPoseFromPlanar, tiltFromVertical, type BoothPose } from './anchor.ts';
import { solveMarkerPose } from './qrPose.ts';

const pose = (x: number, z: number, yaw: number, scale = 1): BoothPose => ({ position: new Vector3(x, 0, z), yaw, scale });

test('planar pose accounts for an off-centre print (e.g. the QR code)', () => {
  // Standee facing +Z; QR 0.24 m right of centre, 0.14 m above the floor.
  const p = boothPoseFromPlanar({ x: 0.24, y: 0.14, z: 0 }, { x: 0, y: 0, z: 0, w: 1 }, 1, { centerM: [0.24, 0.14] });
  assert.ok(p.position.length() < 1e-9);
  // Same standee rotated to face +X: booth +X becomes world -Z.
  const s = Math.SQRT1_2;
  const q = boothPoseFromPlanar({ x: 1, y: 0.14, z: -0.24 }, { x: 0, y: s, z: 0, w: s }, 1, { centerM: [0.24, 0.14] });
  assert.ok(q.position.distanceTo(new Vector3(1, 0, 0)) < 1e-9);
  assert.ok(Math.abs(q.yaw - Math.PI / 2) < 1e-9);
});

test('tiltFromVertical flags a print lying flat', () => {
  assert.ok(tiltFromVertical({ x: 0, y: 0, z: 0, w: 1 }) < 1e-9);
  const flat = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0));
  assert.ok(Math.abs(tiltFromVertical(flat) - Math.PI / 2) < 1e-6);
});

test('filter locks only after several agreeing detections', () => {
  const f = new AnchorFilter({ lockCount: 3, posTol: 0.15, yawTol: 0.2, windowMs: 2000, relockCount: 5, follow: 0.1 });
  assert.equal(f.push(pose(0, 0, 0), 0), 'pending');
  assert.equal(f.push(pose(2, 2, 1), 50), 'pending'); // glare misread
  assert.equal(f.push(pose(0.05, 0, 0.05), 100), 'pending');
  assert.equal(f.push(pose(0.02, 0.03, -0.02), 150), 'locked');
  assert.ok(f.locked!.position.length() < 0.06, 'the misread is excluded from the average');
});

test('filter rejects outliers after lock but re-locks on sustained disagreement', () => {
  const f = new AnchorFilter({ lockCount: 2, posTol: 0.15, yawTol: 0.2, windowMs: 2000, relockCount: 4, follow: 0.1 });
  f.push(pose(0, 0, 0), 0);
  assert.equal(f.push(pose(0, 0, 0), 10), 'locked');
  assert.equal(f.push(pose(1, 0, 0), 20), 'rejected');
  assert.equal(f.push(pose(0.02, 0, 0), 30), 'updated');
  assert.ok(f.locked!.position.x < 0.01);
  for (let i = 0; i < 3; i++) assert.equal(f.push(pose(1, 0, 0), 40 + i), 'rejected');
  assert.equal(f.push(pose(1.01, 0, 0), 50), 'relocked');
  assert.ok(Math.abs(f.locked!.position.x - 1) < 0.02);
});

test('filter tolerance scales with world units per metre (8th Wall responsive scale)', () => {
  const f = new AnchorFilter({ lockCount: 2, posTol: 0.15, yawTol: 0.2, windowMs: 2000, relockCount: 4, follow: 0.1 });
  f.push(pose(0, 0, 0, 2), 0);
  assert.equal(f.push(pose(0.25, 0, 0, 2), 10), 'locked', '0.25 world units = 0.125 m at scale 2');
});

function project(p: Vector3, cam: PerspectiveCamera) {
  const v = p.clone().project(cam);
  return { x: v.x, y: v.y };
}

test('marker pose is recovered from its projected corners', () => {
  const cam = new PerspectiveCamera(63, 9 / 19.5, 0.01, 20);
  cam.updateProjectionMatrix();
  const size = 0.1166;
  const truth = new Matrix4().compose(
    new Vector3(0.12, -0.35, -1.1),
    new Quaternion().setFromEuler(new Euler(0.35, -0.5, 0.05)),
    new Vector3(1, 1, 1),
  );
  const h = size / 2;
  const corners = [
    [-h, h],
    [h, h],
    [h, -h],
    [-h, -h],
  ].map(([x, y]) => project(new Vector3(x, y, 0).applyMatrix4(truth), cam));
  const solved = solveMarkerPose(corners, cam.projectionMatrix, size);
  assert.ok(solved);
  const tPos = new Vector3().setFromMatrixPosition(truth);
  assert.ok(solved!.position.distanceTo(tPos) < 1e-6, `position ${solved!.position.toArray()} vs ${tPos.toArray()}`);
  const tQ = new Quaternion().setFromRotationMatrix(truth);
  assert.ok(solved!.quaternion.angleTo(tQ) < 1e-6);
});

test('marker pose tolerates a pixel of corner noise and rejects a back-facing solution', () => {
  const cam = new PerspectiveCamera(63, 9 / 19.5, 0.01, 20);
  cam.updateProjectionMatrix();
  const size = 0.1166;
  const truth = new Matrix4().makeTranslation(0, -0.3, -0.8);
  const h = size / 2;
  const px = 2 / 1080; // one pixel on a 1080-wide image
  const noise = [
    [px, 0],
    [0, -px],
    [-px, px],
    [px, px],
  ];
  const corners = [
    [-h, h],
    [h, h],
    [h, -h],
    [-h, -h],
  ].map(([x, y], i) => {
    const c = project(new Vector3(x, y, 0).applyMatrix4(truth), cam);
    return { x: c.x + noise[i][0], y: c.y + noise[i][1] };
  });
  const solved = solveMarkerPose(corners, cam.projectionMatrix, size)!;
  assert.ok(solved.position.distanceTo(new Vector3(0, -0.3, -0.8)) < 0.03);
  // Mirrored corner order = looking at the back of the print.
  const mirrored = [corners[1], corners[0], corners[3], corners[2]];
  assert.equal(solveMarkerPose(mirrored, cam.projectionMatrix, size), null);
});
