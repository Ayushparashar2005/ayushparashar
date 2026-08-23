import { useState } from 'preact/hooks';

interface TopBarProps {
  isPlaying: boolean;
  isRecording: boolean;
  metronomeEnabled: boolean;
  bpm: number;
  timeSignature: [number, number];
  currentTimeString: string;
  onPlayToggle: () => void;
  onRecordToggle: () => void;
  onStop: () => void;
  onMetronomeToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onTimeSignatureChange: (ts: [number, number]) => void;
  onExportWav: () => void;
  onExportMidi: () => void;
  onSave: () => void;
  onLoad: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function TopBar(props: TopBarProps) {
  const { isPlaying, isRecording, metronomeEnabled, bpm, timeSignature, currentTimeString } = props;

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-hw-bg dark:bg-[#050505] p-3 rounded-lg border-2 border-hw-border shadow-inner">
      {/* Left: Branding & Metronome/Key */}
      <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
        <div className="flex flex-col items-center bg-hw-module-inset dark:bg-[#111] p-2 rounded border border-hw-border">
          <span className="text-[10px] font-mono font-bold text-hw-text-muted mb-1">METRONOME</span>
          <button 
            className={`w-10 h-6 flex items-center justify-center rounded transition-colors border ${metronomeEnabled ? 'bg-hw-accent-orange text-white border-hw-accent-orange shadow-[0_0_10px_rgba(255,85,0,0.5)]' : 'bg-[#fff] dark:bg-[#222] text-hw-text-muted border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333]'}`}
            onClick={props.onMetronomeToggle}
            title="Toggle Metronome"
          >
            <span className="text-[10px]">TICK</span>
          </button>
        </div>
        
        <div className="flex flex-col items-center bg-hw-module-inset dark:bg-[#111] p-2 rounded border border-hw-border">
          <span className="text-[10px] font-mono font-bold text-hw-text-muted mb-1">BPM & TIME</span>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={bpm} 
              onChange={(e) => props.onBpmChange(parseInt(e.currentTarget.value))}
              className="w-12 bg-[#000] border border-[#222] text-hw-accent-orange font-mono text-center rounded text-sm outline-none focus:border-hw-accent-orange"
            />
            <select
              value={`${timeSignature[0]}/${timeSignature[1]}`}
              onChange={(e) => {
                 const [num, den] = (e.currentTarget.value).split('/').map(Number);
                 props.onTimeSignatureChange([num, den]);
              }}
              className="bg-black text-hw-accent-orange border border-[#222] font-mono text-sm rounded outline-none p-0.5"
            >
              <option value="3/4">3/4</option>
              <option value="4/4">4/4</option>
              <option value="5/4">5/4</option>
              <option value="6/8">6/8</option>
              <option value="7/8">7/8</option>
            </select>
          </div>
        </div>
      </div>

      {/* Center: Transport Controls */}
      <div className="flex items-center justify-center gap-2 md:gap-4 flex-1 flex-wrap w-full md:w-auto">
        <div className="flex items-center bg-hw-module-inset dark:bg-[#111] p-2 rounded border border-hw-border gap-2 shrink-0">
          <button 
            className={`w-10 h-8 rounded border flex items-center justify-center transition-colors font-mono text-xs font-bold ${isPlaying ? 'bg-hw-accent-orange text-white border-hw-accent-orange shadow-[0_0_10px_rgba(255,85,0,0.5)]' : 'bg-[#fff] dark:bg-[#222] text-hw-text-main border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333]'}`}
            onClick={props.onPlayToggle}
          >
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
          <button 
            className="w-10 h-8 rounded border flex items-center justify-center font-mono text-xs font-bold bg-[#fff] dark:bg-[#222] text-hw-text-main border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
            onClick={props.onStop}
          >
            STOP
          </button>
          <button 
            className={`w-10 h-8 rounded border flex items-center justify-center transition-colors font-mono text-xs font-bold ${isRecording ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-[#fff] dark:bg-[#222] text-hw-text-main border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-[#422]'}`}
            onClick={props.onRecordToggle}
          >
            REC
          </button>
        </div>

        {/* Time Display */}
        <div className="flex flex-col items-center bg-hw-module-inset dark:bg-[#111] p-2 rounded border border-hw-border">
          <span className="text-[10px] font-mono font-bold text-hw-text-muted mb-1">TIME</span>
          <div className="font-mono text-lg bg-black px-3 py-1 rounded border border-[#222] text-hw-accent-orange shadow-inner min-w-[110px] flex items-center justify-center tracking-widest whitespace-nowrap">
            {currentTimeString}
          </div>
        </div>
      </div>

      {/* Right: Project & Export options */}
      <div className="flex items-center justify-center gap-2 flex-wrap w-full md:w-auto">
        <div className="flex flex-col items-center bg-hw-module-inset dark:bg-[#111] p-2 rounded border border-hw-border shrink-0">
          <span className="text-[10px] font-mono font-bold text-hw-text-muted mb-1">HISTORY</span>
          <div className="flex gap-2">
             <button 
               onClick={props.onUndo}
               disabled={!props.canUndo}
               className={`text-[10px] font-mono font-bold px-2 py-1 rounded transition-colors ${props.canUndo ? 'bg-[#fff] dark:bg-[#222] text-hw-text-main border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333]' : 'bg-[#f0f0f0] dark:bg-[#111] text-[#999] dark:text-[#555] border border-gray-200 dark:border-gray-800 cursor-not-allowed'}`}
             >
               UNDO
             </button>
             <button 
               onClick={props.onRedo}
               disabled={!props.canRedo}
               className={`text-[10px] font-mono font-bold px-2 py-1 rounded transition-colors ${props.canRedo ? 'bg-[#fff] dark:bg-[#222] text-hw-text-main border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333]' : 'bg-[#f0f0f0] dark:bg-[#111] text-[#999] dark:text-[#555] border border-gray-200 dark:border-gray-800 cursor-not-allowed'}`}
             >
               REDO
             </button>
          </div>
        </div>
        <div className="flex flex-col items-center bg-hw-module-inset dark:bg-[#111] p-2 rounded border border-hw-border">
          <span className="text-[10px] font-mono font-bold text-hw-text-muted mb-1">PROJECT</span>
          <div className="flex gap-2">
             <button 
               onClick={props.onSave}
               className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-[#fff] dark:bg-[#222] text-hw-text-main border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
             >
               SAVE
             </button>
             <button 
               onClick={props.onLoad}
               className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-[#fff] dark:bg-[#222] text-hw-text-main border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
             >
               LOAD
             </button>
          </div>
        </div>
        <div className="flex flex-col items-center bg-hw-module-inset dark:bg-[#111] p-2 rounded border border-hw-border">
          <span className="text-[10px] font-mono font-bold text-hw-text-muted mb-1">EXPORT</span>
          <div className="flex gap-2">
             <button 
               onClick={props.onExportWav}
               className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-[#fff] dark:bg-[#222] text-hw-text-main border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
             >
               WAV
             </button>
             <button 
               onClick={props.onExportMidi}
               className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-hw-accent-orange text-white border border-[#cc4400] hover:bg-orange-500 transition-colors"
             >
               MIDI
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
