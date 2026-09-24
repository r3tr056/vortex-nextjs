import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FlightModel, shapeAxis } from './flight.ts';
import { LockOnMission, SurveyGrid, SurveyMission, gimbalFootprint, nadirFootprint } from './missions.ts';
import { boothPoseFromImage, blendPose, wrapAngle } from './anchor.ts';
import { samplePath } from './track.ts';

const IDLE = { lx: 0, ly: 0, rx: 0, ry: 0 };

function fly(model: FlightModel, sticks: typeof IDLE, seconds: number, controlYaw = model.yaw) {
  for (let t = 0; t < seconds; t += 1 / 60) model.step(1 / 60, sticks, controlYaw);
}

test('shapeAxis applies a deadzone and keeps full deflection at 1', () => {
  assert.equal(shapeAxis(0.05), 0);
  assert.equal(shapeAxis(1), 1);
  assert.equal(shapeAxis(-1), -1);
  assert.ok(shapeAxis(0.5) < 0.5, 'expo softens mid-stick');
});

test('drone stays landed until throttle is raised, then climbs', () => {
  const m = new FlightModel();
  m.reset(0, 0, 1, 0);
  fly(m, { ...IDLE, ry: 1 }, 1);
  assert.ok(m.landed);
  assert.equal(m.position.z, 1, 'cannot slide along the floor');
  fly(m, { ...IDLE, ly: 1 }, 1);
  assert.ok(!m.landed);
  assert.ok(m.altitude > 0.5);
});

test('releasing the sticks brings the drone to a hover', () => {
  const m = new FlightModel();
  m.reset(0, 1.2, 0, 0);
  m.landed = false;
  fly(m, { ...IDLE, ry: 1 }, 1);
  assert.ok(m.velocity.length() > 1);
  fly(m, IDLE, 2);
  assert.ok(m.velocity.length() < 1e-6);
  assert.ok(Math.abs(m.position.y - 1.2) < 1e-6, 'altitude hold');
});

test('stick forward follows the control heading, not the nose', () => {
  const m = new FlightModel();
  m.reset(0, 1, 2, 0); // nose faces +Z (towards the visitor)
  m.landed = false;
  // Camera looks towards the standee (-Z): heading π. Stick forward should move away from camera.
  fly(m, { ...IDLE, ry: 1 }, 0.5, Math.PI);
  assert.ok(m.position.z < 2);
  assert.ok(Math.abs(m.position.x) < 1e-6);
});

test('stick right moves to the right of the control heading', () => {
  const m = new FlightModel();
  m.reset(0, 1, 2, Math.PI);
  m.landed = false;
  fly(m, { ...IDLE, rx: 1 }, 0.5, Math.PI); // facing -Z, visitor's right is +X
  assert.ok(m.position.x > 0);
});

test('yaw right decreases heading and the drone respects the flight volume', () => {
  const m = new FlightModel();
  m.reset(0, 1, 1, 0);
  m.landed = false;
  fly(m, { ...IDLE, lx: 1 }, 0.5);
  assert.ok(m.yaw < 0);
  fly(m, { ...IDLE, ly: 1 }, 10);
  assert.equal(m.position.y, m.bounds.maxY);
  assert.ok(m.atBoundary);
});

test('lock-on mission locks a target after holding it in view', () => {
  const mission = new LockOnMission([{ id: 'a', kind: 'vehicle', label: 'V', x: 0, z: 2 }], 60, 1.5);
  const fp = { x: 0, z: 2, r: 0.5, valid: true };
  let events = mission.update(0.5, fp);
  assert.deepEqual(events, [{ type: 'acquire', id: 'a' }]);
  events = mission.update(1.1, fp);
  assert.ok(events.some((e) => e.type === 'lock'));
  assert.ok(events.some((e) => e.type === 'complete' && e.success));
  assert.ok(mission.done);
});

test('lock-on progress decays when the target leaves view and times out', () => {
  const mission = new LockOnMission([{ id: 'a', kind: 'vehicle', label: 'V', x: 0, z: 2 }], 5, 1.5);
  mission.update(1, { x: 0, z: 2, r: 0.5, valid: true });
  const before = mission.targets[0].progress;
  mission.update(1, { x: 3, z: 3, r: 0.5, valid: true });
  assert.ok(mission.targets[0].progress < before);
  const events = mission.update(4, { x: 3, z: 3, r: 0.5, valid: true });
  assert.deepEqual(events.at(-1), { type: 'complete', success: false });
});

test('footprints are invalid when the drone is too low', () => {
  assert.equal(gimbalFootprint(0, 0.1, 0, 0).valid, false);
  assert.equal(nadirFootprint(0, 0.2, 0).valid, false);
  assert.equal(nadirFootprint(0, 1.5, 0).valid, true);
});

test('survey grid paints cells once and completes at the goal', () => {
  const grid = new SurveyGrid({ minX: 0, maxX: 1.2, minZ: 0, maxZ: 0.4 }, 0.4);
  assert.equal(grid.total, 3);
  const mission = new SurveyMission(grid, 0.6, 60);
  let r = mission.update(0.1, { x: 0.2, z: 0.2, r: 0.3, valid: true });
  assert.deepEqual(r.fresh, [0]);
  r = mission.update(0.1, { x: 0.2, z: 0.2, r: 0.3, valid: true });
  assert.deepEqual(r.fresh, [], 'no double counting');
  r = mission.update(0.1, { x: 0.6, z: 0.2, r: 0.3, valid: true });
  assert.ok(r.events.some((e) => e.type === 'complete' && e.success));
});

test('booth pose sits on the floor below the target, scaled to metres', () => {
  // Target facing +X in world, 1.6 world units long side, printed at 0.8 m → 2 units per metre.
  const s = Math.SQRT1_2;
  const pose = boothPoseFromImage(
    { position: { x: 1, y: 3, z: 0 }, rotation: { x: 0, y: s, z: 0, w: s }, scale: 1.6 },
    { longSideM: 0.8, centerM: [0, 1.2] },
  );
  assert.equal(pose.scale, 2);
  assert.ok(Math.abs(pose.position.y - (3 - 1.2 * 2)) < 1e-9);
  assert.ok(Math.abs(pose.yaw - Math.PI / 2) < 1e-9);
});

test('blendPose wraps yaw the short way round', () => {
  const a = boothPoseFromImage(
    { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 }, scale: 1 },
    { longSideM: 1, centerM: [0, 0] },
  );
  a.yaw = Math.PI - 0.1;
  const b = { ...a, position: a.position.clone(), yaw: -Math.PI + 0.1 };
  blendPose(a, b, 0.5);
  assert.ok(Math.abs(Math.abs(wrapAngle(a.yaw)) - Math.PI) < 1e-9);
});

test('samplePath hits keyframes and clamps outside the range', () => {
  const keys = [
    { t: 0, p: [0, 0, 0] as [number, number, number], yaw: 0 },
    { t: 1, p: [1, 1, 1] as [number, number, number], yaw: 1 },
    { t: 2, p: [2, 0, 0] as [number, number, number], yaw: 0 },
  ];
  const mid = samplePath(keys, 1);
  assert.ok(Math.abs(mid.x - 1) < 1e-9 && Math.abs(mid.y - 1) < 1e-9);
  const end = samplePath(keys, 5);
  assert.deepEqual([end.x, end.y, end.z], [2, 0, 0]);
});
