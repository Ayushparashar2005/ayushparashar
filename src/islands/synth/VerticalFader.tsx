import { useState, useRef, useEffect } from 'preact/hooks';

interface VerticalFaderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}

export function VerticalFader({ label, value, min, max, onChange, formatValue }: VerticalFaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    trackRef.current?.setPointerCapture(e.pointerId);
    updateValueFromEvent(e);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    updateValueFromEvent(e);
  };

  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    trackRef.current?.releasePointerCapture(e.pointerId);
  };

  const updateValueFromEvent = (e: PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    // Y is inverted (0 at top, height at bottom)
    let percentY = 1 - ((e.clientY - rect.top) / rect.height);
    percentY = Math.max(0, Math.min(1, percentY));
    const newValue = min + percentY * (max - min);
    onChange(newValue);
  };

  const displayValue = formatValue ? formatValue(value) : value.toFixed(2);

  return (
    <div className="flex flex-col items-center gap-1 w-8">
      <span className="text-[7px] font-mono font-bold tracking-widest text-hw-text-muted uppercase text-center leading-tight mb-1">{label}</span>
      
      <div 
        ref={trackRef}
        className="relative w-8 h-32 bg-[#111] border-2 border-[#050505] rounded shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] cursor-pointer touch-none flex justify-center py-1"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Track Line */}
        <div className="absolute top-1 bottom-1 w-1 bg-black rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,1)]" />
        
        {/* Thumb */}
        <div 
          className="absolute w-7 h-5 bg-gradient-to-b from-[#eee] to-[#aaa] border border-[#666] rounded-sm shadow-[0_4px_6px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-ns-resize z-10 hover:brightness-110 active:brightness-90"
          style={{ bottom: `calc(${percentage * 100}% - 10px)` }}
        >
           <div className="w-5 h-0.5 bg-[#444] shadow-sm rounded-full" />
        </div>
      </div>
      
      <span className="text-[8px] font-mono font-bold text-hw-accent-orange bg-[#111] px-1 py-0.5 rounded-sm mt-1">{displayValue}</span>
    </div>
  );
}
