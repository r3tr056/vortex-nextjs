// Metric pose of a square marker (the standee's QR code) from its four image corners.
//
// Planar homography (DLT, 4 points) between the marker plane and normalised camera coordinates,
// decomposed into rotation + translation. Camera convention is three.js: looking down -Z, +Y up.
// Corner order matches BarcodeDetector's cornerPoints: top-left, top-right, bottom-right,
// bottom-left (as seen in the image).

import { Matrix4, Quaternion, Vector3 } from 'three';

export interface NdcPoint {
  x: number;
  y: number;
}

export interface MarkerPose {
  position: Vector3;
  quaternion: Quaternion;
}

/** Solves A x = b for an 8×8 system with partial pivoting. Returns null if singular. */
function solve8(A: number[][], b: number[]): number[] | null {
  const n = 8;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let pivot = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[pivot][c])) pivot = r;
    if (Math.abs(M[pivot][c]) < 1e-12) return null;
    [M[c], M[pivot]] = [M[pivot], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  // Gauss-Jordan leaves a diagonal system: x_i = rhs_i / pivot_i.
  return M.map((row, i) => row[n] / row[i]);
}

/**
 * @param corners NDC coordinates (-1..1, +Y up) of the marker corners.
 * @param projection the camera's projection matrix.
 * @param size marker side length, metres.
 * @returns marker pose in camera space, or null if the solution is degenerate.
 */
export function solveMarkerPose(corners: NdcPoint[], projection: Matrix4, size: number): MarkerPose | null {
  if (corners.length !== 4) return null;
  const e = projection.elements;
  const half = size / 2;
  const plane = [
    [-half, half],
    [half, half],
    [half, -half],
    [-half, -half],
  ];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = plane[i];
    // Normalised image coords: u = X / -Z, v = Y / -Z.
    const u = (corners[i].x + e[8]) / e[0];
    const v = (corners[i].y + e[9]) / e[5];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const h = solve8(A, b);
  if (!h) return null;
  // H columns; the camera-space point (X, Y, -Z) ∝ H (x, y, 1).
  const h1 = new Vector3(h[0], h[3], h[6]);
  const h2 = new Vector3(h[1], h[4], h[7]);
  const h3 = new Vector3(h[2], h[5], 1);
  const lambda = 2 / (h1.length() + h2.length());
  if (!Number.isFinite(lambda) || lambda <= 0) return null;
  const flip = (v: Vector3) => new Vector3(v.x, v.y, -v.z).multiplyScalar(lambda);
  const r1 = flip(h1).normalize();
  let r2 = flip(h2);
  const t = flip(h3);
  r2 = r2.sub(r1.clone().multiplyScalar(r1.dot(r2))).normalize();
  const r3 = new Vector3().crossVectors(r1, r2);
  // The printed face must point back at the camera and sit in front of it.
  if (t.z >= 0 || r3.dot(t) >= 0) return null;
  const basis = new Matrix4().makeBasis(r1, r2, r3);
  return { position: t, quaternion: new Quaternion().setFromRotationMatrix(basis) };
}
