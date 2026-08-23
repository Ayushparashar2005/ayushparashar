import { useState, useRef, useEffect } from 'preact/hooks';
import { Knob } from './Knob';
import { VerticalFader } from './VerticalFader';
import { ToggleSwitch } from './ToggleSwitch';

type EffectType = 'delay' | 'chorus' | 'phaser' | 'distortion';

interface EffectsModuleProps {
  params: any; // effects params
  onChange: (efx: any) => void;
}

const EFFECT_DETAILS: Record<EffectType, { name: string; color: string; desc: string }> = {
  delay: { name: 'DELAY', color: '#00aaff', desc: 'Echo and spatial feedback' },
  chorus: { name: 'CHORUS', color: '#ff00aa', desc: 'Thick ensemble modulation' },
  phaser: { name: 'PHASER', color: '#aaff00', desc: 'Sweeping frequency notches' },
  distortion: { name: 'DISTORTION', color: '#ff4400', desc: 'Tube overdrive and bitcrushing' }
};

export function EffectsModule({ params, onChange }: EffectsModuleProps) {
  // Derive active effects directly from params so they disappear when disabled
  const activeEffects = (Object.keys(EFFECT_DETAILS) as EffectType[]).filter(k => params[k]?.enabled);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const update = (effect: EffectType, key: string, value: any) => {
    onChange({
      ...params,
      [effect]: { ...params[effect], [key]: value }
    });
  };

  const addEffect = (effect: EffectType) => {
    update(effect, 'enabled', true);
    setIsMenuOpen(false);
  };

  const removeEffect = (effect: EffectType) => {
    update(effect, 'enabled', false);
  };

  const availableEffects = (Object.keys(EFFECT_DETAILS) as EffectType[]).filter(e => !activeEffects.includes(e));

  const renderEffectCard = (effect: EffectType) => {
    switch (effect) {
      case 'delay':
        return (
          <div className="flex-1 p-4 flex flex-col gap-6">
            <div className="flex justify-center">
               <Knob label="Time" value={params.delay.time} min={0.1} max={2.0} onChange={(v) => update('delay', 'time', v)} formatValue={(v) => `${v.toFixed(2)}s`} />
            </div>
            <div className="flex justify-around mt-4">
               <VerticalFader label="Feedback" value={params.delay.feedback} min={0} max={0.9} onChange={(v) => update('delay', 'feedback', v)} formatValue={(v) => `${Math.round(v*100)}%`} />
               <VerticalFader label="Filter" value={params.delay.filter} min={0} max={1} onChange={(v) => update('delay', 'filter', v)} formatValue={(v) => `${Math.round(v*100)}%`} />
               <VerticalFader label="Mix" value={params.delay.mix} min={0} max={1} onChange={(v) => update('delay', 'mix', v)} formatValue={(v) => `${Math.round(v*100)}%`} />
            </div>
          </div>
        );
      case 'chorus':
        return (
          <div className="flex-1 p-4 flex flex-col gap-6">
            <div className="flex justify-center">
              <Knob label="Rate" value={params.chorus.rate} min={0.1} max={10} onChange={(v) => update('chorus', 'rate', v)} formatValue={(v) => `${v.toFixed(1)}Hz`} />
            </div>
            <div className="flex justify-around mt-4">
              <VerticalFader label="Mod Depth" value={params.chorus.mod} min={0} max={1} onChange={(v) => update('chorus', 'mod', v)} formatValue={(v) => `${Math.round(v*100)}%`} />
              <VerticalFader label="Mix" value={params.chorus.mix} min={0} max={1} onChange={(v) => update('chorus', 'mix', v)} formatValue={(v) => `${Math.round(v*100)}%`} />
            </div>
          </div>
        );
      case 'phaser':
        return (
          <div className="flex-1 p-4 flex flex-col gap-6">
            <div className="flex justify-center">
              <Knob label="Rate" value={params.phaser.rate} min={0.1} max={10} onChange={(v) => update('phaser', 'rate', v)} formatValue={(v) => `${v.toFixed(1)}Hz`} />
            </div>
            <div className="flex justify-around mt-4">
              <VerticalFader label="Width" value={params.phaser.width} min={0} max={1} onChange={(v) => update('phaser', 'width', v)} formatValue={(v) => `${Math.round(v*100)}%`} />
              <VerticalFader label="Feedback" value={params.phaser.feedback} min={0} max={0.95} onChange={(v) => update('phaser', 'feedback', v)} formatValue={(v) => `${Math.round(v*100)}%`} />
              <VerticalFader label="Freq" value={params.phaser.freq} min={0} max={1} onChange={(v) => update('phaser', 'freq', v)} formatValue={(v) => `${Math.round(v*100)}%`} />
              <VerticalFader label="Mix" value={params.phaser.mix} min={0} max={1} onChange={(v) => update('phaser', 'mix', v)} formatValue={(v) => `${Math.round(v*100)}%`} />
            </div>
          </div>
        );
      case 'distortion':
        return (
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="flex justify-around pt-4">
              <Knob label="Overdrive" value={params.distortion.overdrive} min={0} max={50} onChange={(v) => update('distortion', 'overdrive', v)} formatValue={(v) => v.toFixed(1)} />
              <Knob label="Decimator" value={params.distortion.decimator} min={0} max={100} onChange={(v) => update('distortion', 'decimator', v)} formatValue={(v) => Math.round(v).toString()} />
            </div>
            
            {/* Glowing Vacuum Tubes Graphic */}
            <div className="w-full h-20 mt-6 relative bg-[#050505] rounded shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-around px-4 border border-[#ffffff10]">
              <div className="absolute inset-0 z-10 pointer-events-none opacity-40 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(#000 30%, transparent 35%)', backgroundSize: '4px 4px' }} />
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-around py-1">
                 <div className="w-full h-1 bg-[#222] shadow-[0_1px_1px_rgba(0,0,0,1)] opacity-80" />
                 <div className="w-full h-1 bg-[#222] shadow-[0_1px_1px_rgba(0,0,0,1)] opacity-80" />
                 <div className="w-full h-1 bg-[#222] shadow-[0_1px_1px_rgba(0,0,0,1)] opacity-80" />
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="relative w-8 h-16 rounded-t-full bg-[#111] flex flex-col items-center justify-end overflow-hidden border-2 border-[#ffffff10]">
                   <div className={`w-6 h-14 rounded-full bg-orange-500 blur-md transition-opacity duration-300 ${params.distortion.enabled ? 'opacity-80 animate-pulse' : 'opacity-0'}`} />
                   <div className={`absolute w-0.5 h-12 bg-yellow-200 bottom-1 transition-opacity ${params.distortion.enabled ? 'opacity-100 shadow-[0_0_8px_#ffeb3b]' : 'opacity-20'}`} />
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      {activeEffects.map(effect => {
        const details = EFFECT_DETAILS[effect];
        return (
          <div key={effect} className="hw-module shrink-0 w-[280px] bg-hw-bg dark:bg-[#050505] border-2 border-hw-border rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="bg-hw-module-inset dark:bg-[#111] border-b-2 border-hw-border px-3 py-2 flex justify-between items-center group">
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold tracking-wider" style={{ color: details.color }}>
                  {details.name}
                </span>
                <span className="text-[9px] text-hw-text-muted font-mono mt-0.5">{details.desc}</span>
              </div>
              <div className="flex items-center gap-2">
                <ToggleSwitch label="" checked={params[effect]?.enabled || false} onChange={(v) => update(effect, 'enabled', v)} />
                <button 
                  onClick={() => removeEffect(effect)}
                  className="w-5 h-5 rounded hover:bg-hw-accent-orange text-hw-text-muted hover:text-white flex items-center justify-center transition-colors border border-hw-border hover:border-transparent"
                  title="Remove Plugin"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
            {renderEffectCard(effect)}
          </div>
        );
      })}

      {/* Add Effect Button / Menu Container */}
      <div className="relative shrink-0" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-[280px] h-[120px] rounded-lg border-2 border-dashed border-hw-border hover:border-hw-accent-orange bg-hw-bg dark:bg-[#050505] hover:bg-hw-module-inset flex flex-col items-center justify-center gap-2 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-hw-module-inset flex items-center justify-center transition-colors group-hover:bg-hw-accent-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-hw-text-muted group-hover:stroke-white transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <span className="font-mono text-[10px] font-bold text-hw-text-muted group-hover:text-hw-text-main">ADD EFFECT</span>
        </button>

        {/* Popover Menu */}
        {isMenuOpen && (
          <div className="absolute top-[130px] left-0 w-[320px] bg-hw-bg dark:bg-[#050505] border-2 border-hw-border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="p-3 border-b-2 border-hw-border bg-hw-module-inset dark:bg-[#111]">
              <span className="font-mono text-[10px] font-bold text-hw-text-muted">AVAILABLE PLUGINS</span>
            </div>
            <div className="flex flex-col max-h-[300px] overflow-y-auto custom-scrollbar">
              {availableEffects.length === 0 ? (
                <div className="p-6 text-center text-hw-text-muted font-mono text-[10px]">
                  All plugins added!
                </div>
              ) : (
                availableEffects.map(effect => {
                  const details = EFFECT_DETAILS[effect];
                  return (
                    <button 
                      key={effect}
                      onClick={() => addEffect(effect)}
                      className="w-full flex items-center gap-4 p-4 border-b border-hw-border hover:bg-hw-module-inset dark:hover:bg-[#111] transition-colors text-left group last:border-b-0"
                    >
                      <div className="w-10 h-10 rounded bg-hw-bg border border-hw-border flex items-center justify-center shadow-inner group-hover:border-hw-accent-orange transition-colors">
                        <span className="font-black text-lg opacity-80" style={{ color: details.color }}>
                          {details.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-hw-text-main group-hover:text-white transition-colors">{details.name}</span>
                        <span className="font-mono text-[10px] text-hw-text-muted mt-0.5">{details.desc}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

    </>
  );
}
