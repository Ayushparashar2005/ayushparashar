import { useState, useRef, useEffect } from 'preact/hooks';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  formatValue?: (val: number) => string;
}

export function Knob({ label, value, min, max, onChange, formatValue }: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  // Convert value to rotation (-135deg to +135deg)
  const percentage = (value - min) / (max - min);
  const rotation = -135 + percentage * 270;

  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
    knobRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    
    // Calculate difference in Y (moving up increases value)
    const deltaY = startYRef.current - e.clientY;
    
    // Assuming 150px of drag equals the full range from min to max
    const deltaPercentage = deltaY / 150;
    
    const range = max - min;
    let newValue = startValRef.current + deltaPercentage * range;
    
    // Clamp to min/max
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    
    onChange(newValue);
  };

  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    knobRef.current?.releasePointerCapture(e.pointerId);
  };

  const displayValue = formatValue ? formatValue(value) : value.toFixed(2);

  return (
    <div className="flex flex-col items-center gap-1 w-12">
      <div 
        ref={knobRef}
        className="knob w-8 h-8 cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div 
          className="knob-indicator transition-transform duration-75" 
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[7px] font-mono font-bold tracking-widest text-hw-text-muted uppercase text-center leading-tight">{label}</span>
        <span className="text-[8px] font-mono font-bold text-hw-accent-orange bg-[#111] px-1 py-0.5 rounded-sm mt-0.5">{displayValue}</span>
      </div>
    </div>
  );
}
