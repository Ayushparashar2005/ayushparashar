import { useState, useRef, useEffect } from 'preact/hooks';

interface SmartChordsPadProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  x: number; // 0 to 1
  y: number; // 0 to 1
  onXYChange: (x: number, y: number) => void;
  strum: number; // 0 to 150
  onStrumChange: (strum: number) => void;
}

export function SmartChordsPad({ 
  enabled, onToggle, x, y, onXYChange, strum, onStrumChange 
}: SmartChordsPadProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: PointerEvent) => {
    if (!enabled) return;
    setIsDragging(true);
    updateXY(e);
    padRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !enabled) return;
    updateXY(e);
  };

  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    padRef.current?.releasePointerCapture(e.pointerId);
  };

  const updateXY = (e: PointerEvent) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    
    // Clamp to boundaries
    let newX = (e.clientX - rect.left) / rect.width;
    let newY = (rect.bottom - e.clientY) / rect.height; // Y goes up

    newX = Math.max(0, Math.min(1, newX));
    newY = Math.max(0, Math.min(1, newY));

    onXYChange(newX, newY);
  };

  return (
    <div className={`flex flex-col hw-module bg-hw-bg dark:bg-[#050505] border-2 rounded-md shadow-sm w-full max-w-[220px] select-none transition-colors ${enabled ? 'border-hw-accent-orange/50' : 'border-hw-border'}`}>
      
      {/* Header */}
      <div className="bg-hw-module-inset dark:bg-[#111] border-b-2 border-hw-border px-3 py-2 flex items-center justify-between rounded-t-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onToggle(!enabled)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out border border-hw-border ${enabled ? 'bg-hw-accent-orange' : 'bg-gray-300 dark:bg-[#333]'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className={`font-mono text-[9px] font-bold uppercase transition-colors ${enabled ? 'text-hw-accent-orange' : 'text-hw-text-main dark:text-[#cc4400]'}`}>
            Smart Chords
          </span>
        </div>
      </div>

      {/* XY Pad */}
      <div className="p-4">
        <div className="relative aspect-square w-full rounded-md border-2 border-hw-border bg-white dark:bg-[#222] overflow-hidden" ref={padRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
          {/* Grid Background */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(${enabled ? 'rgba(255,85,0,0.2)' : 'rgba(136,136,136,0.2)'} 1px, transparent 1px)`,
            backgroundSize: '10% 10%'
          }} />

          {/* Axis Labels */}
          <div className={`absolute top-2 left-0 right-0 text-center text-[8px] font-mono font-bold tracking-widest ${enabled ? 'text-hw-accent-orange' : 'text-hw-text-muted'}`}>
            SPREAD
          </div>
          <div className={`absolute left-1 top-0 bottom-0 flex flex-col justify-center items-center text-[8px] font-mono font-bold tracking-widest ${enabled ? 'text-hw-accent-orange' : 'text-hw-text-muted'} pointer-events-none`}>
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>COMPLEXITY</span>
          </div>

          {/* Puck */}
          <div 
            className={`absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md transition-colors ${enabled ? 'bg-hw-accent-orange shadow-[0_0_15px_rgba(255,85,0,0.6)]' : 'bg-gray-400 dark:bg-[#444]'}`}
            style={{ 
              left: `${x * 100}%`, 
              top: `${(1 - y) * 100}%` // Y is inverted in UI
            }} 
          />
        </div>
      </div>

      {/* Strum Slider */}
      <div className="flex items-center gap-3 p-4 border-t-2 border-hw-border">
        <span className={`font-mono font-bold text-[9px] tracking-wider uppercase transition-colors ${enabled ? 'text-hw-accent-orange' : 'text-hw-text-muted'}`}>
          Strum:
        </span>
        <input 
          type="range" 
          min="0" 
          max="150" 
          value={strum} 
          disabled={!enabled}
          onInput={(e) => onStrumChange(parseFloat((e.target as HTMLInputElement).value))}
          className={`flex-1 h-2 rounded-full appearance-none outline-none ${enabled ? 'bg-hw-accent-orange' : 'bg-gray-300 dark:bg-[#333]'}`}
          style={{ WebkitAppearance: 'none' }}
        />
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        input[type=range]:disabled::-webkit-slider-thumb {
          background: #888;
        }
      `}</style>
    </div>
  );
}
