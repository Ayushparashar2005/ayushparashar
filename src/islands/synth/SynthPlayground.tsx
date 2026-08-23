import { useState, useEffect, useMemo, useRef } from 'preact/hooks';
import { SynthEngine, type SynthParams, DEFAULT_PARAMS } from '../../lib/audio/SynthEngine';
import { Knob } from './Knob';
import { Oscilloscope } from './Oscilloscope';
import { PianoKeyboard } from './PianoKeyboard';
import { SmartChordsPad } from './SmartChordsPad';
import { ArpeggiatorPad, type ArpParams, DEFAULT_ARP_PARAMS } from './ArpeggiatorPad';
import { VerticalFader } from './VerticalFader';
import { FilterPad } from './FilterPad';
import { LFOModule } from './LFOModule';
import { EffectsModule } from './EffectsModule';
import { PatchProvider } from './PatchContext';
import { PatchCables } from './PatchCables';
import { PatchJack } from './PatchJack';
import { MidiEditor } from './MidiEditor';
import { TopBar } from '../studio/TopBar';
import { Timeline } from '../studio/Timeline';
import { TrackList } from '../studio/TrackList';
import { recordingManager, type Track, type Clip, PPQN } from '../../lib/audio/RecordingManager';
import { metronome } from '../../lib/audio/Metronome';
import { Exporter } from '../../lib/audio/Exporter';

const SCALES: Record<string, number[]> = {
  none: [],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  minor_pentatonic: [0, 3, 5, 7, 10],
};
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function SynthPlayground() {
  const [params, setParams] = useState<SynthParams>(DEFAULT_PARAMS);
  const [isEngineReady, setIsEngineReady] = useState(false);
  
  const [scaleKey, setScaleKey] = useState<number>(0);
  const [scaleType, setScaleType] = useState<string>('none');
  const [smartChordsEnabled, setSmartChordsEnabled] = useState<boolean>(false);
  const [padX, setPadX] = useState<number>(0.5);
  const [padY, setPadY] = useState<number>(0.5);
  const [strum, setStrum] = useState<number>(30);
  const [arpParams, setArpParams] = useState<ArpParams>(DEFAULT_ARP_PARAMS);

  // --- Sequencer State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [dawBpm, setDawBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState<[number, number]>([4, 4]);
  const [currentTick, setCurrentTick] = useState(0);
  const [tracks, setTracksInternal] = useState<Track[]>([{
    id: 'track_1', name: '01 Instrument + Fx', color: '#ffaa00', clips: [], muted: false, soloed: false, volume: 0.8,
    synthParams: DEFAULT_PARAMS, arpParams: DEFAULT_ARP_PARAMS
  }]);

  const [timelineZoom, setTimelineZoom] = useState(1);
  const historyRef = useRef<Track[][]>([]);
  const historyIndexRef = useRef<number>(0);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });

  // Initialize history on mount
  useEffect(() => {
    if (historyRef.current.length === 0) {
      historyRef.current = [tracks];
    }
  }, []);

  const setTracks = (action: any) => {
    setTracksInternal((prev: Track[]) => {
      const next = typeof action === 'function' ? action(prev) : action;
      
      if (next === prev) return next;
      
      const currentHistory = historyRef.current;
      const currentIndex = historyIndexRef.current;
      
      const newHistory = currentHistory.slice(0, currentIndex + 1);
      newHistory.push(next);
      if (newHistory.length > 50) {
         newHistory.shift();
      }
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
      
      setHistoryState({ canUndo: historyIndexRef.current > 0, canRedo: false });
      
      return next;
    });
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      const newIndex = historyIndexRef.current - 1;
      historyIndexRef.current = newIndex;
      const prevTracks = historyRef.current[newIndex];
      setTracksInternal(prevTracks);
      setHistoryState({ canUndo: newIndex > 0, canRedo: true });
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const newIndex = historyIndexRef.current + 1;
      historyIndexRef.current = newIndex;
      const nextTracks = historyRef.current[newIndex];
      setTracksInternal(nextTracks);
      setHistoryState({ canUndo: true, canRedo: newIndex < historyRef.current.length - 1 });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
           handleRedo();
        } else {
           handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [activeTrackId, setActiveTrackId] = useState<string>('track_1');
  const [selectedClipInfo, setSelectedClipInfo] = useState<{ trackId: string, clipId: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'instrument' | 'effects' | 'midi'>('instrument');

  const isPlayingRef = useRef(isPlaying);
  const bpmRef = useRef(dawBpm);
  const lastTimeRef = useRef(0);
  const currentTickRef = useRef(0);
  const lastProcessedTickRef = useRef(0);
  const metronomeNextTickRef = useRef(0);
  const recordingClipIdRef = useRef<string | null>(null);
  const tracksRef = useRef(tracks);
  
  // --- Multi-Engine State ---
  const globalCtxRef = useRef<AudioContext | null>(null);
  const globalMasterGainRef = useRef<GainNode | null>(null);
  const globalMediaDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const enginesRef = useRef<Map<string, SynthEngine>>(new Map());

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    bpmRef.current = dawBpm;
    tracksRef.current = tracks;
  }, [isPlaying, dawBpm, tracks]);

  // Handle double clicking a clip to open the MIDI editor
  const handleClipDoubleClick = (trackId: string, clipId: string) => {
    setSelectedClipInfo({ trackId, clipId });
    setActiveTab('midi');
  };

  // Handle updates from MIDI editor
  const handleUpdateClip = (updatedClip: Clip) => {
    if (!selectedClipInfo) return;
    setTracks(prev => prev.map(t => {
      if (t.id === selectedClipInfo.trackId) {
        return {
          ...t,
          clips: t.clips.map(c => c.id === updatedClip.id ? updatedClip : c)
        };
      }
      return t;
    }));
  };

  const getEngine = (trackId: string) => {
    if (!enginesRef.current.has(trackId)) {
      const engine = new SynthEngine();
      const track = tracksRef.current.find(t => t.id === trackId);
      if (track) {
         if (track.synthParams) engine.params = JSON.parse(JSON.stringify(track.synthParams));
         if (track.arpParams) engine.arpParams = JSON.parse(JSON.stringify(track.arpParams));
      }
      if (globalCtxRef.current) {
         engine.init(globalCtxRef.current, globalMasterGainRef.current!, globalMediaDestRef.current!);
      }
      enginesRef.current.set(trackId, engine);
    }
    return enginesRef.current.get(trackId)!;
  };

  useEffect(() => {
    const engine = getEngine(activeTrackId);
    setParams(engine.params);
    setArpParams(engine.arpParams);
  }, [activeTrackId]);

  // --- Scale Logic ---
  const scaleNotes = useMemo(() => {
    const notes = new Set<number>();
    const intervals = SCALES[scaleType];
    if (!intervals || intervals.length === 0) return notes;
    
    for (const interval of intervals) {
      notes.add((scaleKey + interval) % 12);
    }
    return notes;
  }, [scaleKey, scaleType]);

  const ensureAudioEngine = () => {
    if (!globalCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      globalCtxRef.current = ctx;
      globalMasterGainRef.current = ctx.createGain();
      globalMasterGainRef.current.connect(ctx.destination);
      globalMediaDestRef.current = ctx.createMediaStreamDestination();
      
      metronome.setContext(ctx);

      // Init all existing engines
      enginesRef.current.forEach(engine => {
         engine.init(ctx, globalMasterGainRef.current!, globalMediaDestRef.current!);
      });
      // Also init the active one if it wasn't created yet
      getEngine(activeTrackId).init(ctx, globalMasterGainRef.current!, globalMediaDestRef.current!);
      
      setIsEngineReady(true);
    }
  };

  // Initialize engine on first user interaction to bypass browser autoplay policy
  useEffect(() => {
    const initAudio = () => {
      if (!isEngineReady) {
        ensureAudioEngine();
      }
    };
    
    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('mousedown', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    
    return () => {
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('mousedown', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  // --- Sequencer Loop ---
  useEffect(() => {
    let animationFrameId: number;
    const loop = (timestamp: number) => {
      if (isPlayingRef.current) {
        if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
        
        const deltaMs = timestamp - lastTimeRef.current;
        const ticksPerMs = (bpmRef.current * PPQN) / 60000;
        const deltaTicks = deltaMs * ticksPerMs;
        
        currentTickRef.current += deltaTicks;
        const current = currentTickRef.current;
        const prev = lastProcessedTickRef.current;
        
        // Playback logic
        const isAnySoloed = tracksRef.current.some(t => t.soloed);
        tracksRef.current.forEach(track => {
           if (track.muted || (isAnySoloed && !track.soloed)) return;
           const engine = enginesRef.current.get(track.id);
           if (!engine) return;
           
           track.clips.forEach(clip => {
              // Ensure clip is within range before looping notes
              if (prev > clip.startTick + clip.lengthTicks || current < clip.startTick) return;
              
              clip.notes.forEach(note => {
                 const absoluteStart = clip.startTick + note.startTick;
                 const absoluteEnd = absoluteStart + note.durationTicks;
                 
                 // Note On
                 if (absoluteStart > prev && absoluteStart <= current) {
                    engine.noteOn(note.note);
                 }
                 // Note Off
                 if (absoluteEnd > prev && absoluteEnd <= current) {
                    engine.noteOff(note.note);
                 }
              });
           });
        });
        
        // Metronome Scheduling
        if (metronomeEnabled && globalCtxRef.current) {
           const nextBeatTick = metronomeNextTickRef.current;
           if (currentTickRef.current >= nextBeatTick) {
              const isDownbeat = (Math.round(nextBeatTick / PPQN) % timeSignature[0]) === 0;
              metronome.playClick(globalCtxRef.current.currentTime + 0.05, isDownbeat);
              metronomeNextTickRef.current += PPQN;
           }
        }
        
        lastProcessedTickRef.current = current;
        setCurrentTick(currentTickRef.current);
        lastTimeRef.current = timestamp;
      } else {
        lastTimeRef.current = 0;
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [metronomeEnabled, timeSignature]);

  const updateActiveTrackClips = (isStop = false) => {
     if (!recordingClipIdRef.current) return;
     
     const recordedNotes = isStop ? recordingManager.stopRecording(currentTickRef.current) : recordingManager.getNotes(currentTickRef.current);
     if (recordedNotes.length === 0) return;

     setTracks(prev => prev.map(t => {
       if (t.id === activeTrackId) {
          return {
            ...t,
            clips: t.clips.map(c => {
               if (c.id === recordingClipIdRef.current) {
                  const relativeNotes = recordedNotes.map(n => ({
                     ...n,
                     startTick: Math.max(0, n.startTick - c.startTick)
                  }));
                  return {
                     ...c,
                     notes: relativeNotes,
                     lengthTicks: Math.max(c.lengthTicks, currentTickRef.current - c.startTick)
                  };
               }
               return c;
            })
          }
       }
       return t;
     }));
  };

  const handlePlayToggle = () => {
    ensureAudioEngine();
    if (!isPlaying) metronomeNextTickRef.current = Math.ceil(currentTickRef.current / PPQN) * PPQN;
    setIsPlaying(!isPlaying);
  };

  const handleRecordToggle = () => {
    ensureAudioEngine();
    if (!isRecording) {
      recordingManager.startRecording();
      recordingClipIdRef.current = `clip_rec_${Date.now()}`;
      // Add empty clip when recording starts
      setTracks(prev => prev.map(t => {
        if (t.id === activeTrackId) {
          return {
             ...t,
             clips: [...t.clips, { id: recordingClipIdRef.current!, startTick: currentTickRef.current, lengthTicks: PPQN * 4, notes: [] }]
          };
        }
        return t;
      }));
      if (!isPlaying) handlePlayToggle();
    } else {
      updateActiveTrackClips(true);
      recordingClipIdRef.current = null;
    }
    setIsRecording(!isRecording);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsRecording(false);
    if (isRecording) {
       updateActiveTrackClips(true);
       recordingClipIdRef.current = null;
    }
    currentTickRef.current = 0;
    lastProcessedTickRef.current = 0;
    setCurrentTick(0);
    metronomeNextTickRef.current = 0;
    // Turn off all active notes
    enginesRef.current.forEach(e => {
       for (let i = 0; i < 127; i++) e.noteOff(i);
    });
  };

  const handleSeek = (tick: number) => {
    currentTickRef.current = tick;
    lastProcessedTickRef.current = tick;
    setCurrentTick(tick);
    metronomeNextTickRef.current = Math.ceil(tick / PPQN) * PPQN;
  };

  const handleExportWav = async () => {
    ensureAudioEngine();
    if (!globalCtxRef.current || !globalMediaDestRef.current) {
      alert("Failed to initialize Audio Engine.");
      return;
    }
    
    // Calculate total duration needed
    let maxTick = 0;
    tracksRef.current.forEach(t => {
       t.clips.forEach(c => {
          const endTick = c.startTick + c.lengthTicks;
          if (endTick > maxTick) maxTick = endTick;
       });
    });
    
    // Default to 5 seconds if completely empty, otherwise calculate time + 2 second tail
    const durationMs = maxTick === 0 ? 5000 : (maxTick / PPQN) * (60000 / dawBpm) + 2000;
    
    alert(`Recording Audio in real-time. Wait ${Math.ceil(durationMs / 1000)} seconds...`);
    
    handleSeek(0);
    if (!isPlayingRef.current) handlePlayToggle();
    
    await Exporter.exportAudio(globalMediaDestRef.current.stream, durationMs);
    
    if (isPlayingRef.current) handleStop();
  };

  const handleExportMidi = () => {
    const activeTrack = tracks.find(t => t.id === activeTrackId);
    if (activeTrack) Exporter.exportMIDI(activeTrack, dawBpm, PPQN);
  };
  
  const handleSave = () => {
     const data = {
        tracks: tracksRef.current.map(t => ({
           ...t,
           synthParams: enginesRef.current.get(t.id)?.params || DEFAULT_PARAMS,
           arpParams: enginesRef.current.get(t.id)?.arpParams || DEFAULT_ARP_PARAMS
        })),
        bpm: dawBpm,
        timeSignature
     };
     localStorage.setItem('portfolio_daw_save', JSON.stringify(data));
     alert("Project saved locally!");
  };

  const handleLoad = () => {
     const raw = localStorage.getItem('portfolio_daw_save');
     if (raw) {
        const parsed = JSON.parse(raw);
        setDawBpm(parsed.bpm || 120);
        if (parsed.timeSignature) {
           if (typeof parsed.timeSignature === 'string') {
              const [num, den] = parsed.timeSignature.split('/').map(Number);
              setTimeSignature([num || 4, den || 4]);
           } else {
              setTimeSignature(parsed.timeSignature);
           }
        }
        setTracks(parsed.tracks);
        
        parsed.tracks.forEach((t: any) => {
           const engine = getEngine(t.id);
           engine.updateParams(t.synthParams);
           engine.updateArpParams(t.arpParams);
        });
        
        setActiveTrackId(parsed.tracks[0]?.id || 'track_1');
        alert("Project loaded!");
     } else {
        alert("No saved project found.");
     }
  };
  
  const handleDeleteTrack = (id: string) => {
    setTracks((prev: Track[]) => {
      const next = prev.filter(t => t.id !== id);
      if (activeTrackId === id && next.length > 0) {
        setActiveTrackId(next[0].id);
      }
      return next;
    });
  };

  const handleToggleMute = (id: string) => {
    setTracks((prev: Track[]) => prev.map(t => t.id === id ? { ...t, muted: !t.muted } : t));
  };

  const handleToggleSolo = (id: string) => {
    setTracks((prev: Track[]) => prev.map(t => t.id === id ? { ...t, soloed: !t.soloed } : t));
  };
  
  const handleAddTrack = () => {
     const newId = `track_${Date.now()}`;
     setTracks(prev => [...prev, {
        id: newId,
        name: `Track ${prev.length + 1}`,
        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
        clips: [],
        muted: false,
        soloed: false,
        volume: 0.8,
        synthParams: DEFAULT_PARAMS,
        arpParams: DEFAULT_ARP_PARAMS
     }]);
     setActiveTrackId(newId);
  };

  const currentTimeString = useMemo(() => {
    const totalBeats = Math.floor(currentTick / PPQN);
    const measures = Math.floor(totalBeats / timeSignature[0]) + 1;
    const beats = (totalBeats % timeSignature[0]) + 1;
    return `${measures.toString().padStart(2, '0')}:${beats.toString().padStart(2, '0')}.0`;
  }, [currentTick, timeSignature]);

  // Handle Smart Chords Scale Defaulting
  useEffect(() => {
    if (smartChordsEnabled && scaleType === 'none') {
      setScaleType('major'); // Default to major if turned on without a scale
      setScaleKey(0); // C Major
    }
  }, [smartChordsEnabled, scaleType]);

  const updateParam = (key: keyof SynthParams, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    const engine = getEngine(activeTrackId);
    engine.updateParams(newParams);
  };

  const updateArp = (newArp: ArpParams) => {
    setArpParams(newArp);
    const engine = getEngine(activeTrackId);
    engine.updateArpParams(newArp);
  };

  const updateEnvelope = (key: keyof SynthParams['envelope'], value: number) => {
    const newParams = { ...params, envelope: { ...params.envelope, [key]: value } };
    setParams(newParams);
    const engine = getEngine(activeTrackId);
    engine.updateParams(newParams);
  };

  const getChordNotes = (baseNote: number): number[] => {
    if (!smartChordsEnabled) return [baseNote];

    let activeScale = scaleType;
    if (activeScale === 'none') activeScale = 'major';
    
    const intervals = SCALES[activeScale];
    if (!intervals || intervals.length === 0) return [baseNote];

    const baseNoteClass = baseNote % 12;
    const baseOctaveRoot = baseNote - baseNoteClass;

    let degreeIndex = -1;
    for (let i = 0; i < intervals.length; i++) {
       if ((scaleKey + intervals[i]) % 12 === baseNoteClass) {
          degreeIndex = i; break;
       }
    }

    if (degreeIndex === -1) {
      // Note not in scale, just play parallel 5th
      return [baseNote, baseNote + 7];
    }

    let numNotes = 2; // Power chord
    if (padY > 0.25) numNotes = 3; // Triad
    if (padY > 0.6) numNotes = 4; // 7th
    if (padY > 0.9) numNotes = 5; // 9th

    const notes = [];
    for (let i = 0; i < numNotes; i++) {
       let targetDegree = degreeIndex + (i * 2);
       if (numNotes === 2 && i === 1) {
         // for power chords, just use the fifth
         targetDegree = degreeIndex + Math.floor(intervals.length * 0.6); 
       }

       const octave = Math.floor(targetDegree / intervals.length);
       const wrapped = targetDegree % intervals.length;
       
       let finalNote = baseOctaveRoot + (scaleKey + intervals[wrapped]) + (octave * 12);
       
       // Handle wrap-around edge case where interval jumps to next octave but math doesn't catch it
       while (finalNote < baseNote && i > 0) finalNote += 12;

       notes.push(finalNote);
    }

    // Spread logic: shift the 2nd note (3rd of the chord) up an octave if spread is high
    if (padX > 0.5 && notes.length >= 3) {
      notes[1] += 12; 
    }
    // Spread logic: shift the highest note up another octave if spread is max
    if (padX > 0.8 && notes.length >= 4) {
      notes[notes.length - 1] += 12;
    }

    return notes;
  };

  // Keyboard Handlers
  useEffect(() => {
    const handleNoteOn = (e: CustomEvent) => {
      const { note } = e.detail;
      const chord = getChordNotes(note);
      const engine = getEngine(activeTrackId);
      engine.noteOnMultiple(note, chord, smartChordsEnabled ? strum : 0);
      if (isRecording) recordingManager.noteOn(note, 100, currentTickRef.current);
    };

    const handleNoteOff = (e: CustomEvent) => {
      const { note } = e.detail;
      const engine = getEngine(activeTrackId);
      engine.noteOffMultiple(note);
      if (isRecording) {
        recordingManager.noteOff(note, currentTickRef.current);
        updateActiveTrackClips();
      }
    };

    window.addEventListener('synth-note-on' as any, handleNoteOn);
    window.addEventListener('synth-note-off' as any, handleNoteOff);

    return () => {
      window.removeEventListener('synth-note-on' as any, handleNoteOn);
      window.removeEventListener('synth-note-off' as any, handleNoteOff);
    };
  }, [smartChordsEnabled, scaleKey, scaleType, padX, padY, strum, activeTrackId, isRecording]);

  const handleTrackClick = (trackId: string, tick: number) => {
    // Snap tick to the nearest measure
    const [numBeats, den] = timeSignature;
    const ticksPerMeasure = numBeats * (PPQN * (4 / den));
    const snappedTick = Math.floor(tick / ticksPerMeasure) * ticksPerMeasure;
    
    const clipId = `clip_${Date.now()}`;
    const newClip = { id: clipId, startTick: snappedTick, lengthTicks: ticksPerMeasure * 2, notes: [] }; // default 2 measures
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return { ...t, clips: [...t.clips, newClip] };
      }
      return t;
    }));
  };

  const handleClipDelete = (trackId: string, clipId: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return { ...t, clips: t.clips.filter(c => c.id !== clipId) };
      }
      return t;
    }));
  };

  const renderMidiEditor = () => {
    let targetTrack = tracks.find(t => t.id === selectedClipInfo?.trackId);
    let targetClip = targetTrack?.clips.find(c => c.id === selectedClipInfo?.clipId);
    if (!targetClip) {
      targetTrack = tracks.find(t => t.id === activeTrackId);
      targetClip = targetTrack?.clips[0]; // fallback to first clip of active track
    }
    
    if (!targetTrack || !targetClip) {
      return (
        <div className="h-[500px] flex items-center justify-center border-2 border-hw-border rounded-md bg-[#111] shadow-inner text-hw-text-muted font-mono text-xs">
          NO CLIP SELECTED. DOUBLE CLICK A TRACK LANE IN THE TIMELINE.
        </div>
      );
    }

    return (
      <MidiEditor 
        clip={targetClip} 
        trackColor={targetTrack.color}
        timeSignature={timeSignature}
        scaleNotes={scaleNotes}
        currentTick={currentTick}
        onClose={() => setActiveTab('instrument')}
        onUpdateClip={handleUpdateClip}
      />
    );
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col gap-4 p-3 md:p-5 bg-hw-panel dark:bg-[#111] border-4 border-hw-border rounded-xl shadow-2xl relative">
      
      {/* Sequencer Module */}
      <div className="hw-module bg-hw-bg dark:bg-[#050505] border-2 border-hw-border rounded-md shadow-sm overflow-hidden flex flex-col">
         <TopBar 
            isPlaying={isPlaying}
            isRecording={isRecording}
            metronomeEnabled={metronomeEnabled}
            bpm={dawBpm}
            timeSignature={timeSignature}
            currentTimeString={currentTimeString}
            onPlayToggle={handlePlayToggle}
            onRecordToggle={handleRecordToggle}
            onStop={handleStop}
            onMetronomeToggle={() => setMetronomeEnabled(!metronomeEnabled)}
            onBpmChange={setDawBpm}
            onTimeSignatureChange={setTimeSignature}
            onExportWav={handleExportWav}
            onExportMidi={handleExportMidi}
            onSave={handleSave}
            onLoad={handleLoad}
            canUndo={historyState.canUndo}
            canRedo={historyState.canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
         />
      </div>
      
      {/* Main Content Area */}
      <PatchProvider>
        {activeTab === 'midi' ? renderMidiEditor() : activeTab === 'effects' ? (
          <div className="flex gap-4 p-4 min-h-[420px] overflow-x-auto bg-hw-panel dark:bg-[#111] rounded-xl border-2 border-hw-border custom-scrollbar relative items-start">
            {/* Oscillator Section */}
            <div className="hw-module shrink-0 w-[280px] bg-hw-bg dark:bg-[#050505] border-2 border-hw-border rounded-md shadow-sm">
              <div className="bg-hw-module-inset dark:bg-[#111] border-b-2 border-hw-border px-3 py-1 flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold text-hw-text-main dark:text-[#cc4400]">OSCILLATOR</span>
                <PatchJack id="osc_pitch_in" label="PITCH IN" type="in" signalType="cv" />
              </div>
              <div className="p-3 flex flex-col gap-3">
                <div className="flex justify-between gap-2">
                  {['sine', 'triangle', 'sawtooth', 'square'].map((wave) => (
                    <button
                      key={wave}
                      className={`flex-1 py-1 px-2 rounded font-mono text-[10px] font-bold tracking-wider transition-colors border ${params.waveform === wave ? 'bg-hw-accent-orange text-white border-[#ffaa00] shadow-[0_0_10px_rgba(255,85,0,0.5)]' : 'bg-[#fff] dark:bg-[#222] text-hw-text-main dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333]'}`}
                      onClick={() => updateParam('waveform', wave)}
                    >
                      {wave}
                    </button>
                  ))}
                </div>
                <div className="flex justify-around items-center pt-2">
                   <Knob 
                     label="TRANSPOSE"
                     value={params.transpose}
                     min={-24} max={24}
                     onChange={(v) => updateParam('transpose', Math.round(v))}
                     formatValue={(v) => v > 0 ? `+${Math.round(v)}` : Math.round(v).toString()}
                   />
                   <Knob 
                     label="NOISE"
                     value={params.noiseAmount}
                     min={0} max={1}
                     onChange={(v) => updateParam('noiseAmount', v)}
                     formatValue={(v) => `${Math.round(v * 100)}%`}
                   />
                </div>
                <div className="flex justify-center mt-2">
                  <Knob 
                    label="MASTER VOL" 
                    value={params.masterVolume} 
                    min={0} 
                    max={1} 
                    onChange={(v) => updateParam('masterVolume', v)}
                    formatValue={(v) => Math.round(v * 100) + '%'}
                  />
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="hw-module shrink-0 w-[280px] bg-hw-bg dark:bg-[#050505] border-2 border-hw-border rounded-md shadow-sm">
              <div className="bg-hw-module-inset dark:bg-[#111] border-b-2 border-hw-border px-3 py-1 flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold text-hw-text-main dark:text-[#cc4400]">FILTER (LPF)</span>
                <PatchJack id="filter_cutoff_in" label="CUTOFF IN" type="in" signalType="cv" />
              </div>
              <div className="p-3 flex justify-center items-center h-full">
                <FilterPad 
                  cutoff={params.filterCutoff}
                  resonance={params.filterResonance}
                  onChange={(cutoff, res) => {
                    const newParams = { ...params, filterCutoff: cutoff, filterResonance: res };
                    setParams(newParams);
                    const engine = getEngine(activeTrackId);
                    engine.updateParams(newParams);
                  }}
                />
              </div>
            </div>

            {/* Envelope Section */}
            <div className="hw-module shrink-0 w-[280px] bg-hw-bg dark:bg-[#050505] border-2 border-hw-border rounded-md shadow-sm">
              <div className="bg-hw-module-inset dark:bg-[#111] border-b-2 border-hw-border px-3 py-1 flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold text-hw-text-main dark:text-[#cc4400]">AMPLIFIER ENVELOPE</span>
                <PatchJack id="env_out" label="ENV OUT" type="out" signalType="cv" />
              </div>
              <div className="p-3 flex justify-around gap-2">
                <VerticalFader 
                  label="ATTACK" 
                  value={params.envelope.attack} 
                  min={0.01} max={2} 
                  onChange={(v) => updateParam('envelope', { ...params.envelope, attack: v })} 
                />
                <VerticalFader 
                  label="DECAY" 
                  value={params.envelope.decay} 
                  min={0.05} max={2} 
                  onChange={(v) => updateParam('envelope', { ...params.envelope, decay: v })} 
                />
                <VerticalFader 
                  label="SUSTAIN" 
                  value={params.envelope.sustain} 
                  min={0} max={1} 
                  onChange={(v) => updateParam('envelope', { ...params.envelope, sustain: v })} 
                />
                <VerticalFader 
                  label="RELEASE" 
                  value={params.envelope.release} 
                  min={0.05} max={5} 
                  onChange={(v) => updateParam('envelope', { ...params.envelope, release: v })} 
                />
              </div>
            </div>
            
            {/* LFO Section */}
            <LFOModule 
               params={params.lfo}
               onChange={(lfoParams) => updateParam('lfo', lfoParams)}
               className="shrink-0 w-[280px]"
            />

            {/* Arpeggiator Pad */}
            <div className="shrink-0 w-[280px] flex justify-center items-start h-full">
               <ArpeggiatorPad 
                 params={arpParams}
                 onChange={updateArp}
               />
            </div>

            {/* Smart Chords Pad */}
            <div className="shrink-0 w-[280px] flex justify-center items-start h-full">
               <SmartChordsPad 
                 enabled={smartChordsEnabled}
                 onToggle={setSmartChordsEnabled}
                 x={padX}
                 y={padY}
                 onXYChange={(x, y) => { setPadX(x); setPadY(y); }}
                 strum={strum}
                 onStrumChange={setStrum}
               />
            </div>

            {/* Effects Module (Pedals) */}
            <EffectsModule 
               params={params.effects}
               onChange={(efxParams) => updateParam('effects', efxParams)}
            />
          </div>
        ) : (
          <>
          <div className="flex bg-hw-bg dark:bg-[#050505] p-2 min-h-[420px] rounded-xl border-2 border-hw-border">
            <TrackList 
               tracks={tracks}
               activeTrackId={activeTrackId}
               onTrackSelect={setActiveTrackId}
               onAddTrack={handleAddTrack}
               onDeleteTrack={handleDeleteTrack}
               onToggleMute={handleToggleMute}
               onToggleSolo={handleToggleSolo}
            />
            <div className="flex-1 flex flex-col relative min-w-0">
               <div className="absolute top-1 right-1 z-50 flex gap-1">
                 <button onClick={() => setTimelineZoom(z => Math.max(0.25, z - 0.25))} className="w-6 h-5 rounded text-[10px] font-mono border transition-colors bg-[#222] text-[#888] border-[#333] hover:bg-[#333] hover:text-white">-</button>
                 <span className="w-8 h-5 flex items-center justify-center text-[9px] font-mono text-hw-accent-orange bg-black rounded border border-[#333]">{(timelineZoom * 100).toFixed(0)}%</span>
                 <button onClick={() => setTimelineZoom(z => Math.min(4, z + 0.25))} className="w-6 h-5 rounded text-[10px] font-mono border transition-colors bg-[#222] text-[#888] border-[#333] hover:bg-[#333] hover:text-white">+</button>
               </div>
               <Timeline 
                  tracks={tracks}
                  currentTick={currentTick}
                  totalMeasures={500}
                  pixelsPerMeasure={100 * timelineZoom}
                  timeSignature={timeSignature}
                  onSeek={handleSeek}
                  onClipDoubleClick={handleClipDoubleClick}
                  onTrackClick={handleTrackClick}
                  onClipDelete={handleClipDelete}
               />
            </div>
          </div>

            
          {/* Keyboard Area */}
          <div className="mt-4 flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-end px-2 max-w-3xl mx-auto w-full">
                <div className="flex gap-2 items-center">
                  <select 
                    value={scaleKey} 
                    onChange={(e) => setScaleKey(parseInt((e.target as HTMLSelectElement).value))}
                    className="bg-hw-bg dark:bg-[#111] border border-hw-border text-hw-text-main dark:text-[#ccc] text-[10px] font-mono p-1 rounded-sm cursor-pointer outline-none focus:border-hw-accent-orange"
                  >
                    {KEYS.map((k, i) => <option key={i} value={i}>{k}</option>)}
                  </select>
                  <select 
                    value={scaleType} 
                    onChange={(e) => setScaleType((e.target as HTMLSelectElement).value)}
                    className="bg-hw-bg dark:bg-[#111] border border-hw-border text-hw-text-main dark:text-[#ccc] text-[10px] font-mono p-1 rounded-sm cursor-pointer outline-none focus:border-hw-accent-orange"
                  >
                    <option value="none">NO HIGHLIGHT</option>
                    <option value="major">MAJOR</option>
                    <option value="minor">MINOR</option>
                    <option value="pentatonic">PENTATONIC</option>
                    <option value="minor_pentatonic">MINOR PENTATONIC</option>
                  </select>
                  <span className="text-[9px] font-mono font-bold text-hw-text-muted ml-2 tracking-widest hidden sm:inline">SCALE HIGHLIGHT</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-hw-accent-blue opacity-80" />
                  <span className="text-[9px] font-mono text-hw-text-muted">ROOT NOTE</span>
                </div>
              </div>
              <PianoKeyboard scaleNotes={scaleNotes} />
            </div>
          </>
        )}
        
        {/* Render active patch cables globally */}
        <PatchCables />
      </PatchProvider>
      
      {/* Bottom Navigation Tabs */}
      <div className="flex flex-col sm:flex-row bg-[#111] border-2 border-hw-border rounded-lg overflow-hidden shadow-sm mt-2">
         <button 
           onClick={() => setActiveTab('instrument')} 
           className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 font-mono text-[9px] sm:text-xs font-bold transition-colors border-b-2 sm:border-b-0 sm:border-r-2 border-hw-border ${activeTab === 'instrument' ? 'bg-hw-accent-orange text-white shadow-[0_4px_15px_rgba(255,85,0,0.4)]' : 'bg-[#181818] text-hw-text-muted hover:bg-[#222]'}`}
         >
           INSTRUMENT
         </button>
         <button 
           onClick={() => setActiveTab('effects')} 
           className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 font-mono text-[9px] sm:text-xs font-bold transition-colors border-b-2 sm:border-b-0 sm:border-r-2 border-hw-border ${activeTab === 'effects' ? 'bg-hw-accent-orange text-white shadow-[0_4px_15px_rgba(255,85,0,0.4)]' : 'bg-[#181818] text-hw-text-muted hover:bg-[#222]'}`}
         >
           FX EFFECTS
         </button>
         <button 
           onClick={() => setActiveTab('midi')} 
           className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 font-mono text-[9px] sm:text-xs font-bold transition-colors ${activeTab === 'midi' ? 'bg-hw-accent-orange text-white shadow-[0_4px_15px_rgba(255,85,0,0.4)]' : 'bg-[#181818] text-hw-text-muted hover:bg-[#222]'}`}
         >
           MIDI EDITOR
         </button>
      </div>

    </div>
  );
}
