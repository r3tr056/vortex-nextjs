import type { PerspectiveCamera, Quaternion, Scene, Texture, Vector3, WebGLRenderer } from 'three';
import type { ImageDetection, BoothPose } from '../core/anchor.ts';

export type EngineKind = 'webxr' | 'xr8' | 'preview';

export interface SessionHandles {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  canvas: HTMLCanvasElement;
  /** Native surface under the screen centre (WebXR hit-test), world space; null if none. */
  hitTest?: () => Vector3 | null;
  /** True when 1 world unit is exactly 1 metre (ARCore). */
  metric: boolean;
}

export type SessionErrorKind = 'camera-denied' | 'unsupported' | 'engine';

export interface ImageEvent extends ImageDetection {
  name: string;
}

export interface MarkerEvent {
  /** QR pose in world space. */
  position: Vector3;
  quaternion: Quaternion;
  /** Metres from the camera. */
  distance: number;
  value: string;
}

export type LightingEvent =
  | { kind: 'exposure'; exposure: number; temperature: number }
  | { kind: 'estimated'; active: boolean; environment: Texture | null };

export interface SessionCallbacks {
  onReady(handles: SessionHandles): void;
  /** Called once per frame, after the camera pose is updated and before rendering. */
  onFrame(dt: number): void;
  onImageFound?(e: ImageEvent): void;
  onImageUpdated?(e: ImageEvent): void;
  onImageLost?(e: ImageEvent): void;
  onMarker?(e: MarkerEvent): void;
  /** Native anchor refined by the AR platform (world-space booth origin + yaw). */
  onAnchor?(position: Vector3, yaw: number): void;
  onLighting?(e: LightingEvent): void;
  onTracking?(status: string, reason: string): void;
  /** The platform ended the session (back button, app switch on some Androids). */
  onEnded?(): void;
  onError(kind: SessionErrorKind, message: string): void;
}

export interface SessionCapabilities {
  depthOcclusion: boolean;
  lightEstimation: boolean;
  anchors: boolean;
  markerTracking: boolean;
  imageTargets: boolean;
  photo: boolean;
}

export interface ArSession {
  readonly kind: EngineKind;
  start(canvas: HTMLCanvasElement, callbacks: SessionCallbacks): Promise<void>;
  stop(): void;
  /** JPEG of the camera feed + 3D scene. */
  screenshot(): Promise<Blob | null>;
  capabilities(): SessionCapabilities;
  /** Pin the booth to a native anchor (WebXR) so the platform keeps it in place. */
  setBoothAnchor?(pose: BoothPose): void;
  /** Turn QR scanning on/off (WebXR). */
  setMarkerScanning?(on: boolean): void;
}
