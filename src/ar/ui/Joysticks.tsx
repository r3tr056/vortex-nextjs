'use client';

// Mode 2 virtual sticks. Values go straight to the controller (read by the flight model every
// frame), so dragging never re-renders React.

import { useEffect, useRef } from 'react';
import styles from './ar.module.css';

export interface StickSink {
  setStick(side: 'left' | 'right', x: number, y: number): void;
  releaseSticks(): void;
}

interface StickProps {
  label: string;
  arrows: [string, string, string, string];
  onChange: (x: number, y: number) => void;
}

function Stick({ label, arrows, onChange }: StickProps) {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);

  const move = (clientX: number, clientY: number) => {
    const el = base.current;
    if (!el || !knob.current) return;
    const r = el.getBoundingClientRect();
    const radius = r.width / 2 - 14;
    let dx = clientX - (r.left + r.width / 2);
    let dy = clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > radius) {
      dx = (dx / d) * radius;
      dy = (dy / d) * radius;
    }
    knob.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    onChange(dx / radius, -dy / radius);
  };

  const release = () => {
    pointer.current = null;
    if (knob.current) {
      knob.current.style.transition = 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)';
      knob.current.style.transform = 'translate3d(0, 0, 0)';
    }
    onChange(0, 0);
  };

  return (
    <div className={styles.stickWrap}>
      <div
        ref={base}
        className={styles.stick}
        onPointerDown={(e) => {
          if (pointer.current !== null) return;
          pointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          if (knob.current) knob.current.style.transition = 'none';
          move(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.pointerId === pointer.current) move(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (e.pointerId === pointer.current) release();
        }}
        onPointerCancel={(e) => {
          if (e.pointerId === pointer.current) release();
        }}
        role="application"
        aria-label={label}
      >
        <div className={styles.stickArrows} aria-hidden>
          {arrows.map((a, i) => (
            <span key={i}>{a}</span>
          ))}
        </div>
        <div ref={knob} className={styles.knob} />
      </div>
      <span className={styles.stickLabel}>{label}</span>
    </div>
  );
}

export function Joysticks({ sink }: { sink: StickSink }) {
  // Release both sticks if the component unmounts mid-drag (e.g. mission ends).
  useEffect(() => () => sink.releaseSticks(), [sink]);

  return (
    <div className={styles.sticks}>
      <Stick
        label="Climb · Turn"
        arrows={['▲', '▼', '⟲', '⟳']}
        onChange={(x, y) => sink.setStick('left', x, y)}
      />
      <Stick
        label="Move"
        arrows={['FWD', 'BACK', '◀', '▶']}
        onChange={(x, y) => sink.setStick('right', x, y)}
      />
    </div>
  );
}

/** Desktop preview: W/S climb, A/D turn, arrow keys move. */
export function useKeyboardSticks(sink: StickSink, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const down = new Set<string>();
    const axis = (pos: string, neg: string) => (down.has(pos) ? 1 : 0) - (down.has(neg) ? 1 : 0);
    const apply = () => {
      sink.setStick('left', axis('d', 'a'), axis('w', 's'));
      sink.setStick('right', axis('arrowright', 'arrowleft'), axis('arrowup', 'arrowdown'));
    };
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
    };
    const onDown = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        e.preventDefault();
        down.add(k);
        apply();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      down.delete(e.key.toLowerCase());
      apply();
    };
    const onBlur = () => {
      down.clear();
      apply();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
      onBlur();
    };
  }, [sink, enabled]);
}
