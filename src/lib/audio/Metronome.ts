export class Metronome {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;

  constructor() {}

  public setContext(ctx: AudioContext) {
    this.ctx = ctx;
  }

  public playClick(time: number, isDownbeat: boolean = false) {
    if (!this.ctx) return;

    // Create a very short sine wave pip
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Higher pitch for downbeat
    osc.frequency.value = isDownbeat ? 1200 : 800;
    osc.type = 'sine';

    // Envelope
    const attack = 0.001;
    const release = 0.05;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.5, time + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, time + attack + release);

    osc.start(time);
    osc.stop(time + attack + release);

    // Clean up
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}

export const metronome = new Metronome();
