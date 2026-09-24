// Tappable hotspots pinned to parts of the drone in Explore mode. They're real DOM buttons
// (accessible, easy to hit on a phone) positioned over their 3D anchors every frame.

import { PerspectiveCamera, Vector3 } from 'three';
import styles from './ar.module.css';

export interface HotspotItem {
  id: string;
  index: number;
  label: string;
  resolve: (out: Vector3) => void;
}

interface Entry {
  item: HotspotItem;
  el: HTMLButtonElement;
}

const tmp = new Vector3();
const toCam = new Vector3();

export class HotspotLayer {
  private readonly entries = new Map<string, Entry>();
  private visible = false;

  constructor(
    private readonly root: HTMLElement,
    private readonly onSelect: (id: string) => void,
  ) {}

  show(items: HotspotItem[]) {
    this.clear();
    for (const item of items) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = styles.hotspot;
      el.setAttribute('aria-label', `${item.index}. ${item.label}`);
      const ring = document.createElement('span');
      ring.className = styles.hotspotRing;
      const num = document.createElement('span');
      num.className = styles.hotspotNum;
      num.textContent = String(item.index);
      el.append(ring, num);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onSelect(item.id);
      });
      this.root.appendChild(el);
      this.entries.set(item.id, { item, el });
    }
    this.visible = true;
  }

  setState(active: string | null, explored: string[]) {
    for (const [id, { el }] of this.entries) {
      el.classList.toggle(styles.hotspotActive, id === active);
      el.classList.toggle(styles.hotspotDone, explored.includes(id) && id !== active);
    }
  }

  clear() {
    for (const { el } of this.entries.values()) el.remove();
    this.entries.clear();
    this.visible = false;
  }

  update(camera: PerspectiveCamera, width: number, height: number) {
    if (!this.visible) return;
    camera.getWorldPosition(toCam);
    for (const { item, el } of this.entries.values()) {
      item.resolve(tmp);
      const dist = tmp.distanceTo(toCam);
      tmp.project(camera);
      const offscreen = tmp.z > 1 || Math.abs(tmp.x) > 1.1 || Math.abs(tmp.y) > 1.1;
      const x = (tmp.x * 0.5 + 0.5) * width;
      const y = (-tmp.y * 0.5 + 0.5) * height;
      // Slightly smaller when far away, never below a comfortable tap size.
      const s = Math.max(0.8, Math.min(1.15, 1.4 - dist * 0.25));
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(2)})`;
      el.style.visibility = offscreen ? 'hidden' : 'visible';
    }
  }

  dispose() {
    this.clear();
  }
}
