// Procedural rotor + UI sounds (Web Audio). Nothing to download, which matters on hall 4G.
// Must be unlocked from a user gesture (the Start tap) on iOS.

type Blip = 'scan' | 'lock' | 'beat' | 'acquire' | 'success' | 'fail' | 'ui';

export class RotorAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private rotorGain: GainNode | null = null;
  private band: BiquadFilterNode | null = null;
  private hum: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private tremolo: OscillatorNode | null = null;
  private muted = false;
  private readonly onVisible = () => {
    if (document.visibilityState === 'visible') void this.ctx?.resume();
  };

  /** Call synchronously inside a tap handler. */
  unlock() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    // iOS suspends ("interrupts") the context on app switch / screen lock.
    document.addEventListener('visibilitychange', this.onVisible);
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.9;
    master.connect(ctx.destination);
    this.master = master;

    // Rotor wash: looping brown-ish noise through a band-pass whose centre tracks RPM.
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 300;
    band.Q.value = 0.8;
    const rotorGain = ctx.createGain();
    rotorGain.gain.value = 0;

    // Blade-pass tremolo gives the characteristic multirotor flutter.
    const tremolo = ctx.createOscillator();
    tremolo.frequency.value = 40;
    const tremoloDepth = ctx.createGain();
    tremoloDepth.gain.value = 0.25;
    tremolo.connect(tremoloDepth).connect(rotorGain.gain);

    const hum = ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.value = 110;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 500;
    const humGain = ctx.createGain();
    humGain.gain.value = 0;

    noise.connect(band).connect(rotorGain).connect(master);
    hum.connect(humFilter).connect(humGain).connect(master);
    noise.start();
    hum.start();
    tremolo.start();
    this.band = band;
    this.rotorGain = rotorGain;
    this.hum = hum;
    this.humGain = humGain;
    this.tremolo = tremolo;
  }

  /** rpm 0..1; distance in metres from the phone to the drone. */
  setRotor(rpm: number, distance: number) {
    const ctx = this.ctx;
    if (!ctx || !this.band || !this.rotorGain || !this.hum || !this.humGain || !this.tremolo) return;
    const t = ctx.currentTime;
    const falloff = 1 / (1 + Math.max(0, distance - 0.6) * 0.6);
    const level = rpm < 0.02 ? 0 : (0.12 + rpm * 0.35) * falloff;
    this.rotorGain.gain.setTargetAtTime(level, t, 0.08);
    this.band.frequency.setTargetAtTime(180 + rpm * 520, t, 0.1);
    this.hum.frequency.setTargetAtTime(70 + rpm * 120, t, 0.1);
    this.humGain.gain.setTargetAtTime(rpm < 0.02 ? 0 : 0.02 * rpm * falloff, t, 0.1);
    this.tremolo.frequency.setTargetAtTime(20 + rpm * 60, t, 0.1);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  blip(kind: Blip) {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted) return;
    const tones: Record<Blip, [number, number, number]> = {
      scan: [520, 1040, 0.35],
      lock: [880, 1320, 0.14],
      beat: [330, 330, 0.12],
      acquire: [660, 740, 0.08],
      success: [660, 1320, 0.45],
      fail: [300, 180, 0.4],
      ui: [700, 700, 0.05],
    };
    const [f0, f1, dur] = tones[kind];
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = kind === 'beat' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Call on any HUD tap: a cheap way to recover from an interrupted context. */
  resume() {
    if (this.ctx && this.ctx.state !== 'running') void this.ctx.resume();
  }

  dispose() {
    document.removeEventListener('visibilitychange', this.onVisible);
    void this.ctx?.close();
    this.ctx = null;
  }
}
