class AudioBridgeManager {
  public bass: number = 0;
  public mid: number = 0;
  public treble: number = 0;
  public peak: number = 0;
  public amp: number = 0;
  public env: number = 0; // Smoothed amp
  public pitch: number = 0; // 0 to 1
  public gate: number = 0; // 0 or 1

  private analyser: AnalyserNode | null = null;
  private timeData: Uint8Array | null = null;
  private freqData: Uint8Array | null = null;
  
  private activeNotes: Set<number> = new Set();
  private envAttack = 0.1;
  private envRelease = 0.9;
  
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('synth-visual-on', (e: any) => {
        const note = e.detail.note;
        this.activeNotes.add(note);
        this.pitch = note / 127.0; // Normalize MIDI note
        this.gate = 1.0;
      });

      window.addEventListener('synth-visual-off', (e: any) => {
        const note = e.detail.note;
        this.activeNotes.delete(note);
        if (this.activeNotes.size === 0) {
          this.gate = 0.0;
        } else {
          // Set pitch to the highest active note
          this.pitch = Math.max(...Array.from(this.activeNotes)) / 127.0;
        }
      });
    }
  }

  public connectAnalyser(analyser: AnalyserNode) {
    // Only connect if not already connected to avoid duplicate polling loops
    if (this.analyser === analyser) return;
    this.analyser = analyser;
    this.timeData = new Uint8Array(analyser.fftSize);
    this.freqData = new Uint8Array(analyser.frequencyBinCount);
    this.poll();
  }

  private poll = () => {
    if (this.analyser && this.timeData && this.freqData) {
      this.analyser.getByteTimeDomainData(this.timeData);
      this.analyser.getByteFrequencyData(this.freqData);

      // 1. RMS Amplitude
      let sumSquares = 0;
      for (let i = 0; i < this.timeData.length; i++) {
        const normalized = (this.timeData[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      this.amp = Math.sqrt(sumSquares / this.timeData.length) * 2.0; // Scale up a bit

      // 2. Envelope Follower (Smoothed Amp)
      if (this.amp > this.env) {
        this.env = this.env * this.envAttack + this.amp * (1 - this.envAttack);
      } else {
        this.env = this.env * this.envRelease + this.amp * (1 - this.envRelease);
      }

      // 3. FFT Bands
      const binCount = this.freqData.length;
      
      let bassSum = 0;
      let midSum = 0;
      let trebleSum = 0;
      let currentPeak = 0;

      // Extremely simplified band grouping
      const bassEnd = Math.floor(binCount * 0.05);
      const midEnd = Math.floor(binCount * 0.4);
      
      for (let i = 0; i < binCount; i++) {
        const val = this.freqData[i] / 255.0;
        if (val > currentPeak) currentPeak = val;
        
        if (i < bassEnd) bassSum += val;
        else if (i < midEnd) midSum += val;
        else trebleSum += val;
      }

      this.bass = (bassEnd > 0) ? (bassSum / bassEnd) * 1.5 : 0;
      this.mid = (midEnd - bassEnd > 0) ? (midSum / (midEnd - bassEnd)) * 1.5 : 0;
      this.treble = (binCount - midEnd > 0) ? (trebleSum / (binCount - midEnd)) * 2.0 : 0;
      this.peak = currentPeak;
    }
    
    requestAnimationFrame(this.poll);
  }
}

export const audioBridge = new AudioBridgeManager();
