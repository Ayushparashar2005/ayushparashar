import { useState, useRef, useEffect } from 'preact/hooks';
import { synthEngine } from '../../lib/audio/SynthEngine';

export interface ArpParams {
  enabled: boolean;
  mode: 'up' | 'down' | 'upDown' | 'downUp' | 'random' | 'asPlayed';
  rate: number; 
  noteLength: number;
  swing: number;
  bpm: number;
}

export const DEFAULT_ARP_PARAMS: ArpParams = {
  enabled: false,
  mode: 'up',
  rate: 0.25, // 1/16
  noteLength: 0.5,
  swing: 0,
  bpm: 120
};

interface ArpeggiatorPadProps {
  params: ArpParams;
  onChange: (params: ArpParams) => void;
}

const MODES = [
  { id: 'up', label: '↑' },
  { id: 'down', label: '↓' },
  { id: 'upDown', label: '↑↓' },
  { id: 'downUp', label: '↓↑' },
  { id: 'random', label: '🎲' },
  { id: 'asPlayed', label: '🎵' },
];

const RATES = [
  { id: 1.0, label: '1/4' },
  { id: 0.5, label: '1/8' },
  { id: 0.333, label: '1/12' },
  { id: 0.25, label: '1/16' },
  { id: 0.166, label: '1/24' },
  { id: 0.125, label: '1/32' },
];

export function ArpeggiatorPad({ params, onChange }: ArpeggiatorPadProps) {
  const update = (updates: Partial<ArpParams>) => {
    onChange({ ...params, ...updates });
  };

  const currentRateIndex = RATES.findIndex(r => Math.abs(r.id - params.rate) < 0.01);

  return (
    <div className={`flex flex-col hw-module bg-hw-bg dark:bg-[#050505] border-2 rounded-md shadow-sm w-full max-w-[220px] select-none transition-colors ${params.enabled ? 'border-hw-accent-orange/50' : 'border-hw-border'}`}>
      
      {/* Header */}
      <div className="bg-hw-module-inset dark:bg-[#111] border-b-2 border-hw-border px-3 py-2 flex items-center justify-between rounded-t-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => update({ enabled: !params.enabled })}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out border border-hw-border ${params.enabled ? 'bg-hw-accent-orange' : 'bg-gray-300 dark:bg-[#333]'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${params.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className={`font-mono text-[9px] font-bold uppercase transition-colors ${params.enabled ? 'text-hw-accent-orange' : 'text-hw-text-main dark:text-[#cc4400]'}`}>
            Arpeggiator
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-5">
        
        {/* Modes */}
        <div className="flex justify-between gap-2">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => update({ mode: mode.id as any })}
              className={`flex-1 h-8 rounded-sm flex items-center justify-center text-sm font-bold transition-colors border
                ${params.mode === mode.id && params.enabled 
                  ? 'bg-hw-accent-orange border-hw-accent-orange text-white shadow-[0_0_10px_rgba(255,85,0,0.5)]' 
                  : 'bg-white dark:bg-[#222] border-hw-border text-hw-text-muted hover:bg-gray-100 dark:hover:bg-[#333]'
                }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Rate Segmented Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex w-full h-8 rounded-sm overflow-hidden bg-white dark:bg-[#222] border-2 border-hw-border">
            {RATES.map((rate, i) => (
              <div 
                key={rate.id}
                onClick={() => update({ rate: rate.id })}
                className={`flex-1 border-r-2 border-hw-border cursor-pointer transition-colors last:border-r-0
                  ${i <= currentRateIndex && params.enabled ? 'bg-hw-accent-orange' : 'hover:bg-gray-100 dark:hover:bg-[#333]'}`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center px-1">
            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${params.enabled ? 'text-hw-accent-orange' : 'text-hw-text-muted'}`}>Rate</span>
            <span className={`text-[9px] font-mono font-bold bg-black px-1.5 py-0.5 rounded text-hw-accent-orange ${params.enabled ? 'opacity-100' : 'opacity-50'}`}>
              {RATES[currentRateIndex]?.label || '1/16'}
            </span>
          </div>
        </div>

        {/* Note Length Continuous Bar */}
        <div className="flex flex-col gap-1">
          <div className="relative w-full h-8 rounded-sm overflow-hidden bg-white dark:bg-[#222] border-2 border-hw-border cursor-pointer"
               onPointerDown={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const updateLen = (ev: PointerEvent) => {
                   let val = (ev.clientX - rect.left) / rect.width;
                   val = Math.max(0.05, Math.min(1.0, val));
                   update({ noteLength: val });
                 };
                 updateLen(e as unknown as PointerEvent);
                 const onMove = (ev: PointerEvent) => updateLen(ev);
                 const onUp = () => {
                   window.removeEventListener('pointermove', onMove);
                   window.removeEventListener('pointerup', onUp);
                 };
                 window.addEventListener('pointermove', onMove);
                 window.addEventListener('pointerup', onUp);
               }}>
            <div 
              className={`absolute top-0 left-0 bottom-0 pointer-events-none transition-all duration-75 ${params.enabled ? 'bg-hw-accent-orange' : 'bg-gray-300 dark:bg-[#444]'}`}
              style={{ width: `${params.noteLength * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center px-1">
            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${params.enabled ? 'text-hw-accent-orange' : 'text-hw-text-muted'}`}>Note Length</span>
            <span className={`text-[9px] font-mono font-bold bg-black px-1.5 py-0.5 rounded text-hw-accent-orange ${params.enabled ? 'opacity-100' : 'opacity-50'}`}>
              {Math.round(params.noteLength * 100)}%
            </span>
          </div>
        </div>

      </div>

      {/* Swing Slider */}
      <div className="flex items-center gap-3 p-4 border-t-2 border-hw-border">
        <span className={`font-mono font-bold text-[9px] tracking-wider uppercase transition-colors ${params.enabled ? 'text-hw-accent-orange' : 'text-hw-text-muted'}`}>
          Swing
        </span>
        <input 
          type="range" 
          min="0" 
          max="0.75" 
          step="0.01"
          value={params.swing} 
          disabled={!params.enabled}
          onInput={(e) => update({ swing: parseFloat((e.target as HTMLInputElement).value) })}
          className={`flex-1 h-2 rounded-full appearance-none outline-none ${params.enabled ? 'bg-hw-accent-orange' : 'bg-gray-300 dark:bg-[#333]'}`}
          style={{ WebkitAppearance: 'none' }}
        />
      </div>

    </div>
  );
}
