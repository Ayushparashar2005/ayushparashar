import { useEffect, useState, useRef } from 'preact/hooks';

// Mapping QWERTY keys to MIDI notes (C3 = 48)
// Z, X, C, V, B, N, M, , . / -> C3 to E4
// S, D, G, H, J, L, ; -> Black keys
const KEY_MAP: Record<string, number> = {
  'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52,
  'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
  ',': 60, 'l': 61, '.': 62, '1': 63,
  'q': 64, 'w': 65, '3': 66, 'e': 67, '4': 68, 'r': 69, '5': 70, 't': 71,
  'y': 72, '7': 73, 'u': 74, '8': 75, 'i': 76,
  'o': 77, '0': 78, 'p': 79
};

const PIANO_KEYS = [
  { note: 48, label: 'Z', type: 'white', labelOctave: 'C3' },
  { note: 49, label: 'S', type: 'black' },
  { note: 50, label: 'X', type: 'white' },
  { note: 51, label: 'D', type: 'black' },
  { note: 52, label: 'C', type: 'white' },
  { note: 53, label: 'V', type: 'white' },
  { note: 54, label: 'G', type: 'black' },
  { note: 55, label: 'B', type: 'white' },
  { note: 56, label: 'H', type: 'black' },
  { note: 57, label: 'N', type: 'white' },
  { note: 58, label: 'J', type: 'black' },
  { note: 59, label: 'M', type: 'white' },
  { note: 60, label: ',', type: 'white', labelOctave: 'C4' },
  { note: 61, label: 'L', type: 'black' },
  { note: 62, label: '.', type: 'white' },
  { note: 63, label: '1', type: 'black' },
  { note: 64, label: 'Q', type: 'white' },
  { note: 65, label: 'W', type: 'white' },
  { note: 66, label: '3', type: 'black' },
  { note: 67, label: 'E', type: 'white' },
  { note: 68, label: '4', type: 'black' },
  { note: 69, label: 'R', type: 'white' },
  { note: 70, label: '5', type: 'black' },
  { note: 71, label: 'T', type: 'white' },
  { note: 72, label: 'Y', type: 'white', labelOctave: 'C5' },
  { note: 73, label: '7', type: 'black' },
  { note: 74, label: 'U', type: 'white' },
  { note: 75, label: '8', type: 'black' },
  { note: 76, label: 'I', type: 'white' },
  { note: 77, label: 'O', type: 'white' },
  { note: 78, label: '0', type: 'black' },
  { note: 79, label: 'P', type: 'white' },
];

export function PianoKeyboard({ scaleNotes = new Set<number>() }: { scaleNotes?: Set<number> }) {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  
  // Use a ref to track the currently pressed key on touch/mouse
  // so dragging off the key doesn't leave it hanging
  const pointerActiveNote = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore auto-repeat when holding down
      const key = e.key.toLowerCase();
      if (KEY_MAP[key]) {
        const note = KEY_MAP[key];
        window.dispatchEvent(new CustomEvent('synth-note-on', { detail: { note } }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEY_MAP[key]) {
        const note = KEY_MAP[key];
        window.dispatchEvent(new CustomEvent('synth-note-off', { detail: { note } }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePointerDown = (note: number, e: PointerEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('synth-note-on', { detail: { note } }));
    pointerActiveNote.current = note;
    
    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (note: number, e: PointerEvent) => {
    e.preventDefault();
    if (pointerActiveNote.current === note) {
      window.dispatchEvent(new CustomEvent('synth-note-off', { detail: { note } }));
      pointerActiveNote.current = null;
    }
    
    const target = e.target as HTMLElement;
    target.releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    const handleVisualOn = (e: any) => {
      const { note } = e.detail;
      setActiveNotes(prev => new Set(prev).add(note));
    };

    const handleVisualOff = (e: any) => {
      const { note } = e.detail;
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    };

    window.addEventListener('synth-visual-on', handleVisualOn);
    window.addEventListener('synth-visual-off', handleVisualOff);

    return () => {
      window.removeEventListener('synth-visual-on', handleVisualOn);
      window.removeEventListener('synth-visual-off', handleVisualOff);
    };
  }, []);

  const handlePointerCancel = (note: number, e: PointerEvent) => {
    handlePointerUp(note, e);
  };

  return (
    <div className="flex h-64 w-full max-w-full mx-auto bg-hw-bg dark:bg-[#111] p-2 rounded-lg border-2 border-hw-border shadow-inner relative select-none">
      {PIANO_KEYS.map((k) => {
        const isActive = activeNotes.has(k.note);
        const inScale = scaleNotes.has(k.note % 12);
        const isScaleRoot = inScale && scaleNotes.size > 0 && Array.from(scaleNotes)[0] === (k.note % 12);
        
        if (k.type === 'white') {
          return (
            <div 
              key={k.note}
              onPointerDown={(e) => handlePointerDown(k.note, e)}
              onPointerUp={(e) => handlePointerUp(k.note, e)}
              onPointerCancel={(e) => handlePointerCancel(k.note, e)}
              className={`flex-1 mx-[1px] rounded-b-md border relative z-0 flex flex-col justify-end pb-2 items-center cursor-pointer touch-none transition-colors duration-75
                ${inScale && !isActive ? 'border-hw-accent-blue/50 bg-blue-50/50 dark:bg-blue-900/20' : 'border-hw-border'}
                ${isActive 
                  ? 'bg-hw-accent-orange shadow-[inset_0_5px_10px_rgba(0,0,0,0.2)] text-white border-hw-accent-orange' 
                  : inScale ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-blue-900/40 shadow-[0_4px_4px_rgba(0,0,0,0.1)]' : 'bg-white shadow-[0_4px_4px_rgba(0,0,0,0.1)] text-gray-300 hover:bg-gray-50'
                }`}
            >
              {k.labelOctave && <span className="absolute bottom-8 text-[10px] text-gray-300 font-sans tracking-tight pointer-events-none">{k.labelOctave}</span>}
              {isScaleRoot && !isActive && <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-hw-accent-blue opacity-50" />}
              <div className={`w-5 h-5 rounded-sm flex items-center justify-center border ${isActive ? 'border-white/30 text-white' : 'border-gray-200 dark:border-gray-300 text-gray-400'} ${inScale && !isActive ? 'text-hw-accent-blue border-hw-accent-blue/30' : ''}`}>
                <span className="text-[10px] font-mono font-bold pointer-events-none uppercase">{k.label}</span>
              </div>
            </div>
          );
        } else {
          // Black key
          return (
            <div 
              key={k.note}
              onPointerDown={(e) => handlePointerDown(k.note, e)}
              onPointerUp={(e) => handlePointerUp(k.note, e)}
              onPointerCancel={(e) => handlePointerCancel(k.note, e)}
              className={`-mx-2.5 sm:-mx-3 w-5 sm:w-6 h-40 rounded-b-sm border relative z-10 flex flex-col justify-end pb-2 items-center cursor-pointer touch-none transition-colors duration-75
                ${inScale && !isActive ? 'border-hw-accent-blue shadow-[0_0_8px_rgba(0,91,196,0.5)]' : 'border-[#111]'}
                ${isActive 
                  ? 'bg-hw-accent-orange shadow-[inset_0_5px_10px_rgba(0,0,0,0.4)] text-white border-hw-accent-orange' 
                  : inScale ? 'bg-[#1a2b4c] shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-gray-400 hover:bg-[#20355c]' : 'bg-[#222] shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-gray-600 hover:bg-[#333]'
                }`}
            >
              {isScaleRoot && !isActive && <div className="absolute top-2 w-1 h-1 rounded-full bg-hw-accent-blue" />}
              <div className={`w-4 h-4 rounded-[2px] flex items-center justify-center border ${isActive ? 'border-white/30 text-white' : 'border-[#444] text-gray-400'} ${inScale && !isActive ? 'text-hw-accent-blue border-hw-accent-blue/50' : ''}`}>
                <span className="text-[8px] font-mono font-bold pointer-events-none uppercase">{k.label}</span>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}
