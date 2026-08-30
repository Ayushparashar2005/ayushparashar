// Singleton manager for live hardware inputs (Mic & MIDI)
// Avoids React re-renders by letting the WebGL render loop poll these directly.

class LiveInputsManager {
  public micVolume: number = 0;
  public midiValue: number = 0;
  
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  
  private midiAccess: any | null = null; // WebMidi API

  // MIC
  public async requestMic() {
    if (this.audioContext) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      source.connect(this.analyser);
      
      // Start polling loop
      this.pollMic();
    } catch (err) {
      console.error("Mic access denied or failed", err);
    }
  }

  private pollMic = () => {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray as any);
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i];
      }
      const average = sum / this.dataArray.length;
      // Normalize to 0.0 - 1.0 (roughly)
      this.micVolume = Math.min(average / 128.0, 1.0);
    }
    requestAnimationFrame(this.pollMic);
  }

  // MIDI
  public async requestMidi() {
    if (this.midiAccess) return;
    if (!(navigator as any).requestMIDIAccess) {
      console.error("Web MIDI not supported in this browser");
      return;
    }
    try {
      this.midiAccess = await (navigator as any).requestMIDIAccess();
      const inputs = this.midiAccess.inputs.values();
      for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = this.handleMidiMessage;
      }
    } catch (err) {
      console.error("MIDI access denied or failed", err);
    }
  }

  private handleMidiMessage = (msg: any) => {
    // Only care about Control Change messages for now (knobs/sliders)
    const [command, note, velocity] = msg.data;
    // Control change is usually 176 (0xB0)
    if (command === 176) {
      // Normalize velocity (0-127) to 0.0-1.0
      this.midiValue = velocity / 127.0;
    }
  }
}

export const LiveInputs = new LiveInputsManager();
