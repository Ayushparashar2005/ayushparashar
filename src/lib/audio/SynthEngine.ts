import { audioBridge } from './AudioBridge';

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface SynthParams {
  waveform: Waveform;
  transpose: number; // -24 to 24 semitones
  noiseAmount: number; // 0 to 1
  filterCutoff: number; // 20 - 20000 Hz
  filterResonance: number; // 0 - 20
  envelope: {
    attack: number;  // seconds
    decay: number;   // seconds
    sustain: number; // 0.0 - 1.0 (gain)
    release: number; // seconds
  };
  lfo: {
    shape: Waveform;
    rate: number;
    amount: number;
  };
  effects: {
    delay: { enabled: boolean; time: number; feedback: number; filter: number; mix: number };
    chorus: { enabled: boolean; rate: number; mod: number; mix: number };
    phaser: { enabled: boolean; rate: number; width: number; feedback: number; freq: number; mix: number };
    distortion: { enabled: boolean; overdrive: number; decimator: number };
  };
  masterVolume: number; // 0.0 - 1.0
}

export const DEFAULT_PARAMS: SynthParams = {
  waveform: 'sawtooth',
  transpose: 0,
  noiseAmount: 0,
  filterCutoff: 2000,
  filterResonance: 2,
  envelope: {
    attack: 0.05,
    decay: 0.2,
    sustain: 0.5,
    release: 0.5
  },
  lfo: {
    shape: 'sine',
    rate: 1,
    amount: 0.5
  },
  effects: {
    delay: { enabled: false, time: 0.5, feedback: 0.3, filter: 0.8, mix: 0.5 },
    chorus: { enabled: false, rate: 2, mod: 0.5, mix: 0.5 },
    phaser: { enabled: false, rate: 1, width: 0.5, feedback: 0.5, freq: 0.5, mix: 0.5 },
    distortion: { enabled: false, overdrive: 15, decimator: 0 }
  },
  masterVolume: 0.5
};

class Voice {
  private ctx: AudioContext;
  private osc: OscillatorNode;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode;
  private vca: GainNode;
  private envSignal: ConstantSourceNode;
  private params: SynthParams;

  constructor(ctx: AudioContext, frequency: number, params: SynthParams, destination: AudioNode, activePatches: {sourceId: string, targetId: string}[]) {
    this.ctx = ctx;
    this.params = params;

    // Create nodes
    this.osc = this.ctx.createOscillator();
    this.filter = this.ctx.createBiquadFilter();
    this.vca = this.ctx.createGain();

    // Configure Oscillator
    this.osc.type = this.params.waveform;
    this.osc.frequency.value = frequency * Math.pow(2, this.params.transpose / 12);

    // Configure Noise if needed
    if (this.params.noiseAmount > 0) {
      // Create a short white noise buffer
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = this.params.noiseAmount;
      this.noiseNode.connect(noiseGain);
      noiseGain.connect(this.filter);
    }

    // Configure Filter
    this.filter.type = 'lowpass';
    this.filter.frequency.value = this.params.filterCutoff;
    this.filter.Q.value = this.params.filterResonance;

    // Configure VCA (Start at 0 volume)
    this.vca.gain.value = 0;

    // Create Envelope Signal generator
    this.envSignal = this.ctx.createConstantSource();
    this.envSignal.offset.value = 0;
    this.envSignal.start();
    
    // Default hardwired route: Envelope -> VCA Gain
    this.envSignal.connect(this.vca.gain);

    // Apply modular patches
    const hasPatch = (src: string, dest: string) => activePatches.some(p => p.sourceId === src && p.targetId === dest);

    if (hasPatch('env_out', 'filter_cutoff_in')) {
      const scale = this.ctx.createGain();
      scale.gain.value = 5000; // Modulate cutoff by +5000 Hz
      this.envSignal.connect(scale);
      scale.connect(this.filter.frequency);
    }
    
    if (hasPatch('env_out', 'osc_pitch_in')) {
      const scale = this.ctx.createGain();
      scale.gain.value = 2400; // Modulate pitch by +2400 cents (2 octaves)
      this.envSignal.connect(scale);
      scale.connect(this.osc.detune);
    }
    
    // We will connect the global LFO from SynthEngine down in noteOn if needed.

    // Route: Osc -> Filter -> VCA -> Destination (Master Gain)
    this.osc.connect(this.filter);
    this.filter.connect(this.vca);
    this.vca.connect(destination);

    this.osc.start();
    if (this.noiseNode) this.noiseNode.start();
  }

  // Trigger Note On (Attack + Decay to Sustain)
  public noteOn() {
    const { attack, decay, sustain } = this.params.envelope;
    const now = this.ctx.currentTime;
    
    this.envSignal.offset.cancelScheduledValues(now);
    
    // Set to 0 and ramp up to 1 over 'attack' time
    this.envSignal.offset.setValueAtTime(0, now);
    this.envSignal.offset.linearRampToValueAtTime(1, now + attack);
    
    // Ramp down to 'sustain' level over 'decay' time
    this.envSignal.offset.linearRampToValueAtTime(sustain, now + attack + decay);
  }

  // Trigger Note Off (Release)
  public noteOff() {
    const { release } = this.params.envelope;
    const now = this.ctx.currentTime;
    
    this.envSignal.offset.cancelScheduledValues(now);
    const currentVal = this.envSignal.offset.value;
    this.envSignal.offset.setValueAtTime(currentVal, now);
    this.envSignal.offset.linearRampToValueAtTime(0, now + release);

    this.osc.stop(now + release);
    if (this.noiseNode) this.noiseNode.stop(now + release);
    this.envSignal.stop(now + release);
    
    setTimeout(() => {
      this.osc.disconnect();
      if (this.noiseNode) this.noiseNode.disconnect();
      this.filter.disconnect();
      this.vca.disconnect();
      this.envSignal.disconnect();
    }, release * 1000 + 100);
  }

  // Allow real-time parameter updates while note is held
  public updateParams(params: SynthParams) {
    this.params = params;
    this.osc.type = params.waveform;
    
    const now = this.ctx.currentTime;
    this.filter.frequency.setTargetAtTime(params.filterCutoff, now, 0.05);
    this.filter.Q.setTargetAtTime(params.filterResonance, now, 0.05);
  }
  
  public getOscillator() { return this.osc; }
  public getFilter() { return this.filter; }
}

export class SynthEngine {
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  public mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;
  public params: SynthParams;
  public arpParams: import('../../islands/synth/ArpeggiatorPad').ArpParams;
  
  // Global LFO
  public globalLFO: OscillatorNode | null = null;
  public globalLFOGain: GainNode | null = null;
  
  // Global Effects Chain
  private distortionNode: WaveShaperNode | null = null;
  private distortionBypass: GainNode | null = null;
  
  private chorusDelay: DelayNode | null = null;
  private chorusLFO: OscillatorNode | null = null;
  private chorusLFOGain: GainNode | null = null;
  private chorusMix: GainNode | null = null;
  private chorusBypass: GainNode | null = null;

  private phaserFilters: BiquadFilterNode[] = [];
  private phaserLFO: OscillatorNode | null = null;
  private phaserLFOGain: GainNode | null = null;
  private phaserMix: GainNode | null = null;
  private phaserBypass: GainNode | null = null;

  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private delayMix: GainNode | null = null;
  private delayBypass: GainNode | null = null;

  private activeVoices: Map<number, Voice> = new Map();
  private baseKeyToVoices: Map<number, number[]> = new Map();
  private strumTimeouts: Map<number, number[]> = new Map();

  private arpHeldNotes: number[] = [];
  private arpTimerId: number | null = null;
  private arpStepIndex: number = 0;
  private arpLastNote: number | null = null;
  
  public activePatches: { sourceId: string, targetId: string }[] = [];

  private RATES = [
    { id: 1.0, label: '1/4' },
    { id: 0.5, label: '1/8' },
    { id: 0.333, label: '1/12' },
    { id: 0.25, label: '1/16' },
    { id: 0.166, label: '1/24' },
    { id: 0.125, label: '1/32' },
  ];

  constructor() {
    this.params = { ...DEFAULT_PARAMS };
    this.arpParams = { enabled: false, mode: 'up', rate: 0.25, noteLength: 0.5, swing: 0, bpm: 120 };
  }

  // AudioContext must be initialized after a user interaction (like clicking a button or key)
  public init(sharedCtx?: AudioContext, sharedMasterNode?: AudioNode, sharedDest?: MediaStreamAudioDestinationNode) {
    if (this.ctx) return;
    
    if (sharedCtx) {
       this.ctx = sharedCtx;
       this.masterGain = this.ctx.createGain();
       this.masterGain.gain.value = this.params.masterVolume;
       if (sharedMasterNode) this.masterGain.connect(sharedMasterNode);
       this.mediaStreamDestination = sharedDest || null;
    } else {
       const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
       this.ctx = new AudioContextClass();
       
       this.masterGain = this.ctx.createGain();
       this.masterGain.gain.value = this.params.masterVolume;
       this.mediaStreamDestination = this.ctx.createMediaStreamDestination();
    }
    
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048; // For oscilloscope waveform
    
    // --- Build Effects Chain ---
    
    // 1. Distortion
    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionBypass = this.ctx.createGain();
    
    // 2. Chorus
    this.chorusDelay = this.ctx.createDelay();
    this.chorusDelay.delayTime.value = 0.03; // Base 30ms delay
    this.chorusLFO = this.ctx.createOscillator();
    this.chorusLFOGain = this.ctx.createGain();
    this.chorusMix = this.ctx.createGain();
    this.chorusBypass = this.ctx.createGain();
    
    this.chorusLFO.connect(this.chorusLFOGain);
    this.chorusLFOGain.connect(this.chorusDelay.delayTime);
    this.chorusLFO.start();

    // 3. Phaser (4 stage allpass)
    this.phaserFilters = [];
    let prevNode: AudioNode | null = null;
    for(let i=0; i<4; i++) {
       const f = this.ctx.createBiquadFilter();
       f.type = 'allpass';
       if (prevNode) prevNode.connect(f);
       this.phaserFilters.push(f);
       prevNode = f;
    }
    this.phaserLFO = this.ctx.createOscillator();
    this.phaserLFOGain = this.ctx.createGain();
    this.phaserMix = this.ctx.createGain();
    this.phaserBypass = this.ctx.createGain();
    
    this.phaserLFO.connect(this.phaserLFOGain);
    this.phaserFilters.forEach(f => this.phaserLFOGain!.connect(f.frequency));
    this.phaserLFO.start();

    // 4. Delay
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayFeedback = this.ctx.createGain();
    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayMix = this.ctx.createGain();
    this.delayBypass = this.ctx.createGain();
    
    // Delay feedback loop
    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    // Routing: Master -> Dist -> Chorus -> Phaser -> Delay -> Analyser
    // We will build dynamic routing in a helper method so we can bypass easily.
    this.rebuildEffectsRouting();

    this.analyser.connect(this.ctx.destination);
    
    // Connect to global bridge for visuals
    audioBridge.connectAnalyser(this.analyser);
    
    // Init Global LFO
    this.globalLFO = this.ctx.createOscillator();
    this.globalLFOGain = this.ctx.createGain();
    this.globalLFO.type = this.params.lfo.shape;
    this.globalLFO.frequency.value = this.params.lfo.rate;
    // We scale LFO to 1 internally, then scale per-destination later
    this.globalLFOGain.gain.value = this.params.lfo.amount;
    this.globalLFO.connect(this.globalLFOGain);
    this.globalLFO.start();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('synth-patches-changed', (e: any) => {
        this.activePatches = e.detail.connections;
        this.reapplyGlobalLFOPatches();
      });
    }
  }
  
  private reapplyGlobalLFOPatches() {
    if (!this.globalLFOGain || !this.ctx) return;
    
    // Disconnect existing LFO routes
    this.globalLFOGain.disconnect();
    
    const hasPatch = (src: string, dest: string) => this.activePatches.some(p => p.sourceId === src && p.targetId === dest);
    
    // Scale node to convert LFO 0-1 to Hertz or Cents
    let cutoffScaler: GainNode | null = null;
    if (hasPatch('lfo_out', 'filter_cutoff_in')) {
      cutoffScaler = this.ctx.createGain();
      cutoffScaler.gain.value = 5000; 
      this.globalLFOGain.connect(cutoffScaler);
    }
    
    let pitchScaler: GainNode | null = null;
    if (hasPatch('lfo_out', 'osc_pitch_in')) {
      pitchScaler = this.ctx.createGain();
      pitchScaler.gain.value = 2400;
      this.globalLFOGain.connect(pitchScaler);
    }
    
    // Route to all active voices
    this.activeVoices.forEach(voice => {
      if (cutoffScaler) cutoffScaler.connect(voice.getFilter().frequency);
      if (pitchScaler) pitchScaler.connect(voice.getOscillator().detune);
    });
  }

  // --- Effects Methods ---
  
  private makeDistortionCurve(amount: number) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private rebuildEffectsRouting() {
    if (!this.masterGain || !this.analyser) return;

    // Disconnect all
    this.masterGain.disconnect();
    this.distortionNode?.disconnect();
    this.distortionBypass?.disconnect();
    this.chorusDelay?.disconnect();
    this.chorusMix?.disconnect();
    this.chorusBypass?.disconnect();
    this.phaserFilters.forEach(f => f.disconnect());
    this.phaserMix?.disconnect();
    this.phaserBypass?.disconnect();
    this.delayNode?.disconnect();
    this.delayMix?.disconnect();
    this.delayBypass?.disconnect();

    const efx = this.params.effects;

    // 1. Distortion Routing
    let distOut: AudioNode;
    if (efx.distortion.enabled && efx.distortion.overdrive > 0) {
      this.distortionNode!.curve = this.makeDistortionCurve(efx.distortion.overdrive * 2);
      this.distortionNode!.oversample = '4x';
      this.masterGain.connect(this.distortionNode!);
      distOut = this.distortionNode!;
    } else {
      this.masterGain.connect(this.distortionBypass!);
      distOut = this.distortionBypass!;
    }

    // 2. Chorus Routing
    let chorusOut: AudioNode;
    if (efx.chorus.enabled) {
      this.chorusLFO!.frequency.value = efx.chorus.rate;
      this.chorusLFOGain!.gain.value = efx.chorus.mod * 0.02; // Mod amount in seconds
      
      distOut.connect(this.chorusDelay!); // Wet
      distOut.connect(this.chorusMix!); // Dry
      
      const wetMix = efx.chorus.mix;
      const dryMix = 1 - wetMix;
      
      // We need a dedicated wet gain node, but we can simplify by connecting Delay to ChorusMix
      // Wait, standard mixing needs separate gains. Let's reuse ChorusMix for wet out, and pass dry through Bypass
      // Actually, standard parallel mix:
      this.chorusBypass!.gain.value = dryMix;
      this.chorusMix!.gain.value = wetMix;
      
      distOut.connect(this.chorusBypass!);
      this.chorusDelay!.connect(this.chorusMix!);
      
      chorusOut = this.ctx!.createGain(); // Summing node
      this.chorusBypass!.connect(chorusOut);
      this.chorusMix!.connect(chorusOut);
    } else {
      chorusOut = distOut;
    }

    // 3. Phaser Routing
    let phaserOut: AudioNode;
    if (efx.phaser.enabled) {
      this.phaserLFO!.frequency.value = efx.phaser.rate;
      this.phaserLFOGain!.gain.value = efx.phaser.width * 2000;
      this.phaserFilters.forEach(f => {
        f.frequency.value = 1000 + (efx.phaser.freq * 2000);
        f.Q.value = efx.phaser.feedback * 10;
      });

      chorusOut.connect(this.phaserFilters[0]);
      
      const wetMix = efx.phaser.mix;
      this.phaserBypass!.gain.value = 1 - wetMix;
      this.phaserMix!.gain.value = wetMix;
      
      chorusOut.connect(this.phaserBypass!);
      this.phaserFilters[this.phaserFilters.length - 1].connect(this.phaserMix!);
      
      phaserOut = this.ctx!.createGain();
      this.phaserBypass!.connect(phaserOut);
      this.phaserMix!.connect(phaserOut);
    } else {
      phaserOut = chorusOut;
    }

    // 4. Delay Routing
    let delayOut: AudioNode;
    if (efx.delay.enabled) {
      this.delayNode!.delayTime.value = efx.delay.time;
      this.delayFeedback!.gain.value = efx.delay.feedback;
      this.delayFilter!.frequency.value = efx.delay.filter * 10000 + 200; // 200Hz to 10.2kHz
      
      phaserOut.connect(this.delayNode!);
      
      this.delayBypass!.gain.value = 1 - efx.delay.mix;
      this.delayMix!.gain.value = efx.delay.mix;
      
      phaserOut.connect(this.delayBypass!);
      this.delayNode!.connect(this.delayMix!);
      
      delayOut = this.ctx!.createGain();
      this.delayBypass!.connect(delayOut);
      this.delayMix!.connect(delayOut);
    } else {
      delayOut = phaserOut;
    }

    // Final output
    delayOut.connect(this.analyser);
    if (this.mediaStreamDestination) {
      delayOut.connect(this.mediaStreamDestination);
    }
  }

  public noteOn(midiNote: number, source?: string) {
    if (!this.ctx || !this.masterGain) this.init();
    
    // Calculate frequency from MIDI note (A4 = 69 = 440Hz)
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    // If we are already playing this note, stop the old voice first
    if (this.activeVoices.has(midiNote)) {
      this.activeVoices.get(midiNote)?.noteOff();
    }
    
    const voice = new Voice(this.ctx!, frequency, this.params, this.masterGain!, this.activePatches);
    voice.noteOn();
    this.activeVoices.set(midiNote, voice);
    
    // Always reapply LFO patches when a new voice is born so it gets connected
    this.reapplyGlobalLFOPatches();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('synth-visual-on', { detail: { note: midiNote, source } }));
    }
  }

  public noteOff(midiNote: number, source?: string) {
    if (this.activeVoices.has(midiNote)) {
      const voice = this.activeVoices.get(midiNote);
      voice?.noteOff();
      this.activeVoices.delete(midiNote);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('synth-visual-off', { detail: { note: midiNote, source } }));
      }
    }
  }

  public noteOnMultiple(baseNote: number, notes: number[], strumMs: number) {
    this.noteOffMultiple(baseNote); // Cancel if already playing

    const timeouts: number[] = [];
    const spawned: number[] = [];

    notes.forEach((note, i) => {
      if (this.arpParams.enabled) {
        // Handled by arp loop
        spawned.push(note);
      } else {
        const t = window.setTimeout(() => {
          this.noteOn(note);
        }, i * strumMs);
        timeouts.push(t);
        spawned.push(note);
      }
    });

    this.strumTimeouts.set(baseNote, timeouts);
    this.baseKeyToVoices.set(baseNote, spawned);
    this.updateArpHeldNotes();
  }

  public noteOffMultiple(baseNote: number) {
    const timeouts = this.strumTimeouts.get(baseNote);
    if (timeouts) {
      timeouts.forEach(t => window.clearTimeout(t));
      this.strumTimeouts.delete(baseNote);
    }

    const spawned = this.baseKeyToVoices.get(baseNote);
    if (spawned) {
      if (!this.arpParams.enabled) {
        spawned.forEach(note => this.noteOff(note));
      }
      this.baseKeyToVoices.delete(baseNote);
      this.updateArpHeldNotes();
    }
  }

  public updateArpParams(newParams: import('../../islands/synth/ArpeggiatorPad').ArpParams) {
     const wasEnabled = this.arpParams.enabled;
     this.arpParams = newParams;
     
     if (!wasEnabled && newParams.enabled && this.arpHeldNotes.length > 0) {
        this.startArp();
     } else if (wasEnabled && !newParams.enabled) {
        this.stopArp();
        // Clear all arped notes instantly
        if (this.arpLastNote !== null) {
          this.noteOff(this.arpLastNote);
          this.arpLastNote = null;
        }
     }
  }

  private updateArpHeldNotes() {
    const newNotes: number[] = [];
    this.baseKeyToVoices.forEach(notes => {
       notes.forEach(n => {
         if (!newNotes.includes(n)) newNotes.push(n);
       });
    });
    
    // Filter out notes that are no longer held, append new ones.
    const finalNotes = this.arpHeldNotes.filter(n => newNotes.includes(n));
    newNotes.forEach(n => {
       if (!finalNotes.includes(n)) finalNotes.push(n);
    });
    this.arpHeldNotes = finalNotes;

    if (this.arpParams.enabled) {
      if (this.arpHeldNotes.length > 0 && this.arpTimerId === null) {
         this.startArp();
      } else if (this.arpHeldNotes.length === 0) {
         this.stopArp();
      }
    }
  }

  private startArp() {
     this.arpStepIndex = 0;
     this.playNextArpNote();
  }

  private stopArp() {
     if (this.arpTimerId) {
        window.clearTimeout(this.arpTimerId);
        this.arpTimerId = null;
     }
     if (this.arpLastNote !== null) {
        this.noteOff(this.arpLastNote);
        this.arpLastNote = null;
     }
  }

  private playNextArpNote() {
     if (!this.arpParams.enabled || this.arpHeldNotes.length === 0) {
        this.stopArp();
        return;
     }

     if (this.arpLastNote !== null) {
        this.noteOff(this.arpLastNote);
        this.arpLastNote = null;
     }

     let pool = [...this.arpHeldNotes];
     switch(this.arpParams.mode) {
        case 'up': pool.sort((a,b)=>a-b); break;
        case 'down': pool.sort((a,b)=>b-a); break;
        case 'upDown': {
           const up = [...pool].sort((a,b)=>a-b);
           const down = [...up].reverse().slice(1, -1);
           pool = up.concat(down);
           if (pool.length === 0) pool = up;
           break;
        }
        case 'downUp': {
           const down = [...pool].sort((a,b)=>b-a);
           const up = [...down].reverse().slice(1, -1);
           pool = down.concat(up);
           if (pool.length === 0) pool = down;
           break;
        }
        case 'random': break;
        case 'asPlayed': break;
     }

     if (this.arpStepIndex >= pool.length) {
        this.arpStepIndex = 0;
     }

     let noteToPlay = pool[this.arpStepIndex];
     
     if (this.arpParams.mode === 'random') {
        noteToPlay = pool[Math.floor(Math.random() * pool.length)];
     }
     
     this.noteOn(noteToPlay);
     this.arpLastNote = noteToPlay;
     this.arpStepIndex++;

     const stepTimeMs = (60000 / this.arpParams.bpm) * this.arpParams.rate; 
     
     const swingOffset = this.arpParams.swing * 0.5 * stepTimeMs;
     const currentWait = (this.arpStepIndex % 2 === 1) ? (stepTimeMs + swingOffset) : (stepTimeMs - swingOffset);
     
     const holdTime = stepTimeMs * this.arpParams.noteLength;
     window.setTimeout(() => {
        if (this.arpLastNote === noteToPlay) {
           this.noteOff(noteToPlay);
           this.arpLastNote = null;
        }
     }, holdTime);

     this.arpTimerId = window.setTimeout(() => {
        this.playNextArpNote();
     }, currentWait);
  }

  public updateParams(newParams: Partial<SynthParams>) {
    this.params = { ...this.params, ...newParams };
    
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.params.masterVolume, this.ctx!.currentTime, 0.05);
    }
    
    if (this.globalLFO && this.globalLFOGain) {
      this.globalLFO.type = this.params.lfo.shape;
      this.globalLFO.frequency.setTargetAtTime(this.params.lfo.rate, this.ctx!.currentTime, 0.05);
      this.globalLFOGain.gain.setTargetAtTime(this.params.lfo.amount, this.ctx!.currentTime, 0.05);
    }
    
    // Always rebuild routing when params change to handle enables/disables seamlessly
    // In a real app we'd only do this when specific effects params change, but this is fine for now
    this.rebuildEffectsRouting();
    
    // Update all currently playing voices
    this.activeVoices.forEach(voice => voice.updateParams(this.params));
  }
}

// We keep a default global instance for simple uses, but the DAW will create new ones.
export const synthEngine = new SynthEngine();
