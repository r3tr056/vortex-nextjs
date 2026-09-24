// DOM callouts pinned to 3D points. Positions are written straight to element styles every
// frame; React never re-renders for them.

import { PerspectiveCamera, Vector3 } from 'three';
import styles from './ar.module.css';

interface Callout {
  el: HTMLDivElement;
  resolve: (out: Vector3) => void;
  side: 'left' | 'right';
  removing: boolean;
}

const tmp = new Vector3();

export class CalloutLayer {
  private readonly items = new Map<string, Callout>();

  constructor(private readonly root: HTMLElement) {}

  show(id: string, title: string, body: string, resolve: (out: Vector3) => void, side: 'left' | 'right' = 'right') {
    const existing = this.items.get(id);
    if (existing) {
      existing.resolve = resolve;
      existing.removing = false;
      existing.el.classList.add(styles.calloutOn);
      (existing.el.querySelector('[data-title]') as HTMLElement).textContent = title;
      (existing.el.querySelector('[data-body]') as HTMLElement).textContent = body;
      return;
    }
    const make = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      return node;
    };
    const el = make('div', `${styles.callout} ${side === 'left' ? styles.calloutLeft : ''}`);
    const card = make('div', styles.calloutCard);
    const t = make('strong');
    t.dataset.title = '';
    t.textContent = title;
    const b = make('span');
    b.dataset.body = '';
    b.textContent = body;
    card.append(t, b);
    el.append(make('span', styles.calloutDot), make('span', styles.calloutLine), card);
    this.root.appendChild(el);
    this.items.set(id, { el, resolve, side, removing: false });
    requestAnimationFrame(() => el.classList.add(styles.calloutOn));
  }

  hide(id: string) {
    const c = this.items.get(id);
    if (!c || c.removing) return;
    c.removing = true;
    c.el.classList.remove(styles.calloutOn);
    window.setTimeout(() => {
      if (c.removing) {
        c.el.remove();
        this.items.delete(id);
      }
    }, 400);
  }

  clear() {
    for (const id of [...this.items.keys()]) this.hide(id);
  }

  update(camera: PerspectiveCamera, width: number, height: number) {
    for (const c of this.items.values()) {
      c.resolve(tmp);
      tmp.project(camera);
      // Behind the camera, or well outside the view (a label pinned to the screen edge misleads).
      const hidden = !(Math.abs(tmp.z) <= 1) || Math.abs(tmp.x) > 1.25 || Math.abs(tmp.y) > 1.25;
      c.el.style.visibility = hidden ? 'hidden' : 'visible';
      if (hidden) continue;
      const x = (tmp.x * 0.5 + 0.5) * width;
      const y = (-tmp.y * 0.5 + 0.5) * height;
      c.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }

  dispose() {
    for (const c of this.items.values()) c.el.remove();
    this.items.clear();
  }
}
