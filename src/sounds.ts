export class SoundKit {
  private ctx?: AudioContext;
  private enabled = true;
  private reduced = false;

  constructor(enabled: boolean, reduced: boolean) {
    this.enabled = enabled;
    this.reduced = reduced;
  }

  update(enabled: boolean, reduced: boolean) {
    this.enabled = enabled; this.reduced = reduced;
  }

  private ensureCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  tick() {
    if (!this.enabled || this.reduced) return;
    this.ensureCtx();
    const o = this.ctx!.createOscillator();
    const g = this.ctx!.createGain();
    o.type = 'square';
    o.frequency.value = 1100;
    g.gain.value = 0.02;
    o.connect(g).connect(this.ctx!.destination);
    o.start();
    o.stop(this.ctx!.currentTime + 0.02);
  }

  chime() {
    if (!this.enabled || this.reduced) return;
    this.ensureCtx();
    const o = this.ctx!.createOscillator();
    const g = this.ctx!.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(660, this.ctx!.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, this.ctx!.currentTime + 0.2);
    g.gain.setValueAtTime(0.03, this.ctx!.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 0.4);
    o.connect(g).connect(this.ctx!.destination);
    o.start();
    o.stop(this.ctx!.currentTime + 0.45);
  }

  // A short noise whoosh to kick off the spin
  whoosh() {
    if (!this.enabled || this.reduced) return;
    this.ensureCtx();
    const ctx = this.ctx!;
    const duration = 0.5;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(400, ctx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.02, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + duration);
  }

  // A brief celebratory chord at the end of a spin
  fanfare() {
    if (!this.enabled || this.reduced) return;
    this.ensureCtx();
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.02, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    g.connect(ctx.destination);

    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(f, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(f * 0.97, ctx.currentTime + 0.5);
      o.connect(g);
      o.start();
      o.stop(ctx.currentTime + 0.6);
    });
  }
}
