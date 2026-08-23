import { Knob } from './Knob';
import { PatchJack } from './PatchJack';
import type { Waveform } from '../../lib/audio/SynthEngine';

export interface LFOParams {
  shape: Waveform;
  rate: number;
  amount: number;
}

interface LFOModuleProps {
  params: LFOParams;
  onChange: (params: LFOParams) => void;
  className?: string;
}

export function LFOModule({ params, onChange, className = '' }: LFOModuleProps) {
  return (
    <div className={`hw-module bg-hw-bg dark:bg-[#050505] border-2 border-hw-border rounded-md shadow-sm flex flex-col ${className}`}>
      <div className="bg-hw-module-inset dark:bg-[#111] border-b-2 border-hw-border px-3 py-1 flex justify-between items-center">
        <span className="font-mono text-[10px] font-bold text-hw-text-main dark:text-[#cc4400]">LFO</span>
        <PatchJack id="lfo_out" label="LFO OUT" type="out" signalType="cv" />
      </div>
      <div className="p-3 flex justify-around items-center h-full gap-2">
        <div className="flex flex-col gap-2 border-r-2 border-hw-border pr-4">
           {['sine', 'sawtooth', 'square'].map((wave) => (
             <button
                key={wave}
                className={`w-6 h-6 flex items-center justify-center rounded border shadow-sm transition-colors ${params.shape === wave ? 'bg-hw-accent-orange border-[#ffaa00] text-white shadow-[0_0_10px_rgba(255,85,0,0.5)]' : 'bg-white dark:bg-[#222] border-gray-300 dark:border-gray-700 text-gray-500'}`}
                onClick={() => onChange({ ...params, shape: wave as Waveform })}
                title={`LFO Shape: ${wave}`}
              >
                {wave === 'sine' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12c4 0 4-8 8-8s4 8 8 8"/></svg>}
                {wave === 'sawtooth' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16L12 8L20 16"/></svg>}
                {wave === 'square' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12V8h8v8h8v-4"/></svg>}
             </button>
           ))}
        </div>
        
        <Knob 
          label="RATE" 
          value={params.rate} 
          min={0.1} max={20} 
          onChange={(v) => onChange({ ...params, rate: v })} 
          formatValue={(v) => `${v.toFixed(1)}Hz`}
        />
        
        <Knob 
          label="AMOUNT" 
          value={params.amount} 
          min={0} max={1} 
          onChange={(v) => onChange({ ...params, amount: v })} 
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />
      </div>
    </div>
  );
}
