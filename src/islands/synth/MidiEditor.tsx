import { useState, useEffect, useMemo, useRef } from 'preact/hooks';
import type { Clip, RecordedNote } from '../../lib/audio/RecordingManager';
import { PPQN } from '../../lib/audio/RecordingManager';

interface MidiEditorProps {
  clip: Clip;
  trackColor: string;
  timeSignature: [number, number];
  scaleNotes?: Set<number>;
  currentTick?: number;
  onClose: () => void;
  onUpdateClip: (clip: Clip) => void;
}

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NUM_OCTAVES = 7;
const TOTAL_KEYS = NUM_OCTAVES * 12;
const ROW_HEIGHT = 16;

export function MidiEditor({ clip, trackColor, timeSignature, scaleNotes, currentTick, onClose, onUpdateClip }: MidiEditorProps) {
  const [notes, setNotes] = useState<RecordedNote[]>(clip.notes);
  const [tool, setTool] = useState<'pointer' | 'pencil' | 'eraser'>('pointer');
  const [quantize, setQuantize] = useState<number>(PPQN / 4); // default 1/16
  const [velocity, setVelocity] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [numBeats, den] = timeSignature;
  const ticksPerBeat = PPQN * (4 / den);
  const ticksPerMeasure = numBeats * ticksPerBeat;
  
  // Update internal notes if external clip changes
  useEffect(() => {
    setNotes(clip.notes);
  }, [clip.notes]);

  const saveNotes = (newNotes: RecordedNote[]) => {
    setNotes(newNotes);
    
    // Automatically expand clip length if notes go past it
    let maxTick = clip.lengthTicks;
    newNotes.forEach(n => {
       const end = n.startTick + n.durationTicks;
       if (end > maxTick) maxTick = end;
    });

    onUpdateClip({ ...clip, notes: newNotes, lengthTicks: maxTick });
  };

  const transposeNotes = (semitones: number) => {
    const newNotes = notes.map(n => ({
      ...n,
      note: Math.max(12, Math.min(95, n.note + semitones))
    }));
    saveNotes(newNotes);
  };

  // Scroll to Middle C (note 60) or first note on mount
  useEffect(() => {
    if (scrollRef.current) {
      const targetNote = notes.length > 0 ? notes[0].note : 60;
      const noteY = (TOTAL_KEYS - 1 - (targetNote - 12)) * ROW_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, noteY - 200); // Center in view
    }
  }, []);

  // Generate piano keys array from highest to lowest (standard piano roll)
  const pianoKeys = useMemo(() => {
    const arr = [];
    for (let i = TOTAL_KEYS - 1; i >= 0; i--) {
      const octave = Math.floor(i / 12) - 1;
      const noteName = KEYS[i % 12];
      const isBlack = noteName.includes('#');
      arr.push({ midiNote: i + 12, noteName, octave, isBlack });
    }
    return arr;
  }, []);

  // Compute total width based on minimum 500 measures (approx 16 mins) or clip length
  const pixelsPerTick = zoom; // use zoom for pixels per tick
  const totalMeasuresToRender = Math.max(500, Math.ceil(clip.lengthTicks / ticksPerMeasure));
  const gridWidth = totalMeasuresToRender * ticksPerMeasure * pixelsPerTick;

  const localTick = currentTick !== undefined ? currentTick - clip.startTick : -1;
  const activeMidiNotes = useMemo(() => {
    if (localTick < 0 || localTick > clip.lengthTicks) return new Set<number>();
    return new Set(
      notes
        .filter(n => localTick >= n.startTick && localTick < n.startTick + n.durationTicks)
        .map(n => n.note)
    );
  }, [notes, localTick, clip.lengthTicks]);

  const getTickFromX = (x: number) => {
    const rawTick = x / pixelsPerTick;
    return Math.max(0, Math.floor(rawTick / quantize) * quantize);
  };

  const getNoteFromY = (y: number) => {
    const rowIndex = Math.floor(y / ROW_HEIGHT);
    return pianoKeys[rowIndex]?.midiNote;
  };

  const handleGridPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && tool !== 'pencil') return; // Only allow left-click to add note
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top; // Fixed offset
    
    const startTick = getTickFromX(x);
    const midiNote = getNoteFromY(y);
    if (!midiNote) return;

    const newNote: RecordedNote = {
       note: midiNote,
       startTick,
       durationTicks: quantize, // Default length is quantize length
       velocity: velocity
    };
    saveNotes([...notes, newNote]);
  };

  const handleNotePointerDown = (e: React.PointerEvent<HTMLDivElement>, noteIndex: number) => {
    e.stopPropagation();
    if (e.button === 2 || tool === 'eraser') {
      const newNotes = [...notes];
      newNotes.splice(noteIndex, 1);
      saveNotes(newNotes);
      return;
    }
    if (e.button === 0 || tool === 'pointer') {
      const note = notes[noteIndex];
      const startX = e.clientX;
      const startY = e.clientY;
      const originalStartTick = note.startTick;
      const originalNote = note.note;
      
      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const tickDelta = Math.round(dx / pixelsPerTick / quantize) * quantize;
        const pitchDelta = -Math.round(dy / ROW_HEIGHT);
        
        const newNotes = [...notes];
        newNotes[noteIndex] = {
           ...note,
           startTick: Math.max(0, originalStartTick + tickDelta),
           note: Math.max(12, Math.min(95, originalNote + pitchDelta))
        };
        setNotes(newNotes); // fast update visually
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        // Save the final state to parent
        setNotes(current => {
          onUpdateClip({ ...clip, notes: current });
          return current;
        });
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }
  };

  return (
    <div className="w-full bg-hw-bg dark:bg-[#050505] border-2 border-hw-border rounded-md shadow-sm flex flex-col md:flex-row h-[500px] overflow-hidden relative">
      
      {/* Left Control Panel */}
      <div className="w-full md:w-48 bg-hw-module-inset dark:bg-[#111] border-r-2 border-hw-border flex flex-col shrink-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-hw-border bg-black">
          <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: trackColor }} />
             <span className="font-mono text-xs font-bold text-hw-text-main dark:text-white uppercase tracking-wider">MIDI Edit</span>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-sm bg-[#333] hover:bg-red-500 text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tools */}
        <div className="p-3 border-b border-[#222]">
          <span className="font-mono text-[9px] text-hw-text-muted uppercase mb-2 block tracking-widest">Tools</span>
          <div className="flex gap-2 mb-3">
             {['pointer', 'pencil', 'eraser'].map(t => (
               <button 
                 key={t}
                 onClick={() => setTool(t as any)}
                 className={`flex-1 py-1 rounded text-xs font-mono border transition-colors ${tool === t ? 'bg-hw-accent-orange text-white border-hw-accent-orange shadow-[0_0_8px_rgba(255,85,0,0.5)]' : 'bg-[#222] text-[#888] border-[#333] hover:bg-[#333]'}`}
                 title={t}
               >
                 {t === 'pointer' ? '↖' : t === 'pencil' ? '✎' : '⌫'}
               </button>
             ))}
          </div>

          <span className="font-mono text-[9px] text-hw-text-muted uppercase mb-2 block tracking-widest">Zoom</span>
          <div className="flex gap-2">
             <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="flex-1 py-1 rounded text-xs font-mono border transition-colors bg-[#222] text-[#888] border-[#333] hover:bg-[#333] hover:text-white">-</button>
             <span className="flex-1 py-1 text-center text-[10px] font-mono text-hw-accent-orange bg-black rounded border border-[#333]">{(zoom * 100).toFixed(0)}%</span>
             <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="flex-1 py-1 rounded text-xs font-mono border transition-colors bg-[#222] text-[#888] border-[#333] hover:bg-[#333] hover:text-white">+</button>
          </div>
        </div>

        {/* Velocity */}
        <div className="p-3 border-b border-[#222]">
          <div className="flex justify-between items-center mb-1">
             <span className="font-mono text-[9px] text-hw-text-muted uppercase tracking-widest">Velocity</span>
             <span className="font-mono text-[9px] text-hw-accent-orange bg-black px-1 rounded">{velocity}</span>
          </div>
          <input 
            type="range" min="1" max="127" value={velocity}
            onInput={(e) => setVelocity(parseInt((e.target as HTMLInputElement).value))}
            className="w-full h-1.5 bg-[#333] appearance-none rounded-full outline-none"
            style={{ WebkitAppearance: 'none' }}
          />
        </div>

        {/* Quantize / Transpose */}
        <div className="p-3">
          <span className="font-mono text-[9px] text-hw-text-muted uppercase mb-2 block tracking-widest">Quantize / Grid</span>
          <select 
             value={quantize}
             onChange={(e) => setQuantize(parseInt((e.target as HTMLSelectElement).value))}
             className="w-full bg-[#000] border border-[#222] text-hw-accent-orange font-mono text-xs p-1 rounded outline-none mb-4 focus:border-hw-accent-orange"
          >
             <option value={PPQN}>1/4</option>
             <option value={PPQN / 2}>1/8</option>
             <option value={PPQN / 4}>1/16</option>
             <option value={PPQN / 8}>1/32</option>
          </select>
          
          <span className="font-mono text-[9px] text-hw-text-muted uppercase mb-2 block tracking-widest">Transpose</span>
          <div className="grid grid-cols-2 gap-1 mb-2">
             <button onClick={() => transposeNotes(-1)} className="bg-[#222] text-[#888] border border-[#333] rounded text-[10px] font-mono py-1.5 hover:bg-[#333] hover:text-white transition-colors">-1 Semi</button>
             <button onClick={() => transposeNotes(1)} className="bg-[#222] text-[#888] border border-[#333] rounded text-[10px] font-mono py-1.5 hover:bg-[#333] hover:text-white transition-colors">+1 Semi</button>
             <button onClick={() => transposeNotes(-12)} className="bg-[#222] text-[#888] border border-[#333] rounded text-[10px] font-mono py-1.5 hover:bg-[#333] hover:text-white transition-colors">-1 Oct</button>
             <button onClick={() => transposeNotes(12)} className="bg-[#222] text-[#888] border border-[#333] rounded text-[10px] font-mono py-1.5 hover:bg-[#333] hover:text-white transition-colors">+1 Oct</button>
          </div>
        </div>

      </div>

      {/* Piano Roll Area */}
      <div ref={scrollRef} className="flex-1 flex overflow-auto relative bg-[#111]" onContextMenu={e => e.preventDefault()}>
         
         {/* Vertical Keyboard */}
         <div className="w-12 shrink-0 sticky left-0 z-40 border-r-2 border-hw-border shadow-[2px_0_10px_rgba(0,0,0,0.5)] bg-[#111]">
            <div className="h-[24px] w-full sticky top-0 bg-black border-b border-[#333] z-50"></div>
            <div className="relative" style={{ height: TOTAL_KEYS * ROW_HEIGHT }}>
               {pianoKeys.map((k, idx) => {
                 const isScaleNote = scaleNotes ? scaleNotes.has(k.midiNote % 12) : false;
                 const isPlayingNote = activeMidiNotes.has(k.midiNote);
                 const y = idx * ROW_HEIGHT;
                 return (
                   <div 
                     key={k.midiNote}
                     className={`absolute left-0 right-0 flex items-center justify-end pr-1 border-b cursor-pointer transition-colors ${k.isBlack ? 'bg-[#1a1a1a] text-[#555] border-[#0a0a0a] hover:brightness-110' : 'bg-[#e0e0e0] text-[#111] border-[#999] shadow-inner hover:brightness-110'} ${isScaleNote && !k.isBlack ? 'bg-[#ffeedd]' : ''} ${isScaleNote && k.isBlack ? 'bg-[#332211]' : ''}`}
                     style={{ top: y, height: ROW_HEIGHT }}
                   >
                     {k.noteName === 'C' && (
                       <span className="text-[8px] font-sans font-black mr-0.5 opacity-60">C{k.octave}</span>
                     )}
                     {isPlayingNote && <div className="absolute left-1 w-1.5 h-1.5 rounded-full bg-hw-accent-orange shadow-[0_0_5px_rgba(255,85,0,1)]" />}
                     {isScaleNote && !isPlayingNote && <div className="w-1 h-1 rounded-full bg-hw-accent-orange absolute left-1 opacity-50" />}
                   </div>
                 );
               })}
            </div>
         </div>

         {/* Grid Matrix */}
         <div 
            className="relative shrink-0" 
            style={{ width: Math.max(800, gridWidth) }}
         >
            {/* Ruler / Measures Header */}
            <div className="h-[24px] w-full sticky top-0 bg-[#050505] border-b border-[#333] z-30 flex">
               {Array.from({ length: totalMeasuresToRender }).map((_, i) => (
                 <div 
                   key={i} 
                   className="h-full border-r border-[#333] flex items-end pb-0.5 px-1 shrink-0"
                   style={{ width: ticksPerMeasure * pixelsPerTick }}
                 >
                   <span className="text-[9px] font-mono text-hw-text-muted font-bold pointer-events-auto select-none">{i + 1}</span>
                 </div>
               ))}
               {/* Playhead Dot inside Ruler */}
               {localTick >= 0 && localTick <= clip.lengthTicks && (
                 <div 
                    className="absolute top-[15px] w-[7px] h-[7px] rounded-full bg-white border border-[#333] shadow-md z-40 transition-all duration-75"
                    style={{ left: localTick * pixelsPerTick - 3 }}
                 />
               )}
            </div>
            
            {/* Content Wrapper */}
            <div 
               className={`relative ${tool === 'pencil' ? 'cursor-crosshair' : tool === 'eraser' ? 'cursor-not-allowed' : 'cursor-default'}`} 
               style={{ height: TOTAL_KEYS * ROW_HEIGHT }}
               onPointerDown={handleGridPointerDown}
            >
               {/* Background Rows */}
               <div className="absolute inset-0 pointer-events-none">
                 {pianoKeys.map((k, idx) => {
                    const isScaleNote = scaleNotes ? scaleNotes.has(k.midiNote % 12) : false;
                    const y = idx * ROW_HEIGHT;
                    return (
                      <div 
                         key={k.midiNote}
                         className={`absolute left-0 right-0 border-b ${k.isBlack ? 'bg-[#141517] border-[#1e1f22]' : 'bg-[#1a1c20] border-[#25272b]'} ${isScaleNote ? 'bg-hw-accent-orange/10' : ''}`}
                         style={{ top: y, height: ROW_HEIGHT }}
                      />
                    );
                 })}
               </div>

               {/* Vertical Measure/Beat Lines */}
               <div className="absolute inset-0 flex pointer-events-none">
                  {Array.from({ length: totalMeasuresToRender }).map((_, i) => (
                     <div key={i} className="h-full border-r border-[#ffffff15] shrink-0" style={{ width: ticksPerMeasure * pixelsPerTick }}>
                       <div className="flex h-full w-full">
                         {Array.from({ length: numBeats }).map((_, j) => (
                           <div key={j} className="h-full flex-1 border-r border-[#ffffff05] last:border-r-0"></div>
                         ))}
                       </div>
                     </div>
                  ))}
               </div>

               {/* Playhead Line */}
               {localTick >= 0 && localTick <= clip.lengthTicks && (
                  <div 
                     className="absolute top-0 bottom-0 w-[2px] bg-white z-20 pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-75"
                     style={{ left: localTick * pixelsPerTick }}
                  />
               )}

               {/* Notes Container */}
               <div className="absolute inset-0 pointer-events-none">
                  {notes.map((note, idx) => {
                     const keyIndex = pianoKeys.findIndex(k => k.midiNote === note.note);
                     if (keyIndex === -1) return null;
                     const y = keyIndex * ROW_HEIGHT;
                     const x = note.startTick * pixelsPerTick;
                     const width = note.durationTicks * pixelsPerTick;

                     return (
                        <div 
                           key={idx}
                           className="absolute rounded-[2px] border shadow-sm hover:brightness-125 transition-all flex items-center justify-center overflow-hidden cursor-pointer pointer-events-auto"
                           style={{
                              top: y + 1,
                              left: x,
                              width: Math.max(2, width),
                              height: ROW_HEIGHT - 2,
                              backgroundColor: `${trackColor}aa`,
                              borderColor: trackColor
                           }}
                           onPointerDown={(e) => handleNotePointerDown(e, idx)}
                        >
                          <div className="w-full h-[2px] bg-white opacity-40 absolute top-1" />
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
