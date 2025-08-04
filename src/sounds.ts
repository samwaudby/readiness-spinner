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
}
