import { useRef, useEffect, useState } from 'preact/hooks';

interface FilterPadProps {
  cutoff: number; // 20 - 20000
  resonance: number; // 0 - 20
  onChange: (cutoff: number, resonance: number) => void;
}

export function FilterPad({ cutoff, resonance, onChange }: FilterPadProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert Hz to 0-1 scale logarithmically
  const minCutoff = 20;
  const maxCutoff = 20000;
  
  const getXFromCutoff = (c: number) => {
    return Math.log(c / minCutoff) / Math.log(maxCutoff / minCutoff);
  };
  
  const getCutoffFromX = (x: number) => {
    return minCutoff * Math.pow(maxCutoff / minCutoff, x);
  };

  // Convert resonance (0-20) to 0-1 (inverted for Y axis, where 1 is top)
  const getYFromResonance = (r: number) => {
    return r / 20;
  };
  
  const getResonanceFromY = (y: number) => {
    return y * 20;
  };

  const x = getXFromCutoff(cutoff);
  const y = getYFromResonance(resonance);

  const updateFromEvent = (e: PointerEvent) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    
    let normX = (e.clientX - rect.left) / rect.width;
    let normY = 1 - ((e.clientY - rect.top) / rect.height); // Invert Y so top is max resonance

    normX = Math.max(0, Math.min(1, normX));
    normY = Math.max(0, Math.min(1, normY));

    onChange(getCutoffFromX(normX), getResonanceFromY(normY));
  };

  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    padRef.current?.setPointerCapture(e.pointerId);
    updateFromEvent(e);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    updateFromEvent(e);
  };

  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    padRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[200px]">
      <div 
        ref={padRef}
        className="relative aspect-square w-full rounded-md border-[3px] border-[#222] bg-[#0a1a3a] overflow-hidden cursor-crosshair touch-none shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Grid Background */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 150, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 150, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '12.5% 12.5%'
        }} />

        {/* Labels inside pad */}
        <span className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest pointer-events-none">Cutoff</span>
        <span className="absolute top-8 left-1 text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest pointer-events-none origin-bottom-left -rotate-90">Resonance</span>

        {/* Crosshairs */}
        <div className="absolute top-0 bottom-0 w-px bg-cyan-400/30 pointer-events-none" style={{ left: `${x * 100}%` }} />
        <div className="absolute left-0 right-0 h-px bg-cyan-400/30 pointer-events-none" style={{ bottom: `${y * 100}%` }} />

        {/* Puck */}
        <div 
          className="absolute w-4 h-4 -ml-2 mb-[-8px] rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee,inset_0_0_4px_#fff] pointer-events-none border border-white/50"
          style={{ left: `${x * 100}%`, bottom: `${y * 100}%` }}
        />
      </div>
      
      {/* Readouts */}
      <div className="flex justify-between w-full">
         <div className="flex flex-col">
            <span className="text-[7px] font-mono text-hw-text-muted uppercase">Cutoff</span>
            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-black px-1 rounded">{Math.round(cutoff)} Hz</span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[7px] font-mono text-hw-text-muted uppercase">Res</span>
            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-black px-1 rounded">{resonance.toFixed(2)}</span>
         </div>
      </div>
    </div>
  );
}
