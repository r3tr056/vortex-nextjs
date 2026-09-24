// Anonymous funnel events for the booth AR, batched and sent with sendBeacon so nothing is lost
// when a visitor locks their phone or walks off. Stored in the "Events" tab of the lead sheet.

export type Detail = Record<string, string | number | boolean>;

interface QueuedEvent {
  t: number;
  event: string;
  detail?: Detail;
}

const ENDPOINT = '/api/ar/track';

function newSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export class Tracker {
  readonly sessionId = newSessionId();
  anchorMode: string | null = null;
  private queue: QueuedEvent[] = [];
  private timer = 0;
  private readonly onHide = () => {
    if (document.visibilityState === 'hidden') this.flush();
  };

  constructor(private readonly base: { drone: string; platform: string; src: string | null }) {
    this.timer = window.setInterval(() => this.flush(), 20000);
    document.addEventListener('visibilitychange', this.onHide);
    window.addEventListener('pagehide', this.flush);
  }

  track = (event: string, detail?: Detail) => {
    this.queue.push({ t: Date.now(), event, detail });
    if (this.queue.length >= 20) this.flush();
  };

  flush = () => {
    if (!this.queue.length) return;
    const body = JSON.stringify({
      sessionId: this.sessionId,
      ...this.base,
      anchorMode: this.anchorMode,
      events: this.queue.splice(0),
    });
    const blob = new Blob([body], { type: 'application/json' });
    if (!navigator.sendBeacon?.(ENDPOINT, blob)) {
      void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
    }
  };

  dispose() {
    this.flush();
    window.clearInterval(this.timer);
    document.removeEventListener('visibilitychange', this.onHide);
    window.removeEventListener('pagehide', this.flush);
  }
}
