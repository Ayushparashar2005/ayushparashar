import type { Track } from '../../lib/audio/RecordingManager';

export interface TrackListProps {
  tracks: Track[];
  activeTrackId: string;
  onTrackSelect: (id: string) => void;
  onAddTrack: () => void;
  onDeleteTrack: (id: string) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
}

export function TrackList({ tracks, activeTrackId, onTrackSelect, onAddTrack, onDeleteTrack, onToggleMute, onToggleSolo }: TrackListProps) {
  return (
    <div className="w-[180px] md:w-[220px] bg-hw-panel dark:bg-[#111] border-y-2 border-l-2 border-hw-border rounded-l-md flex flex-col shrink-0">
      {/* Header */}
      <div className="h-6 border-b-2 border-hw-border bg-hw-module-inset flex items-center px-2">
        <span className="text-[9px] font-mono font-bold text-hw-text-muted">TRACKS</span>
      </div>

      {/* Tracks */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2">
        {tracks.map(track => (
          <div 
            key={track.id}
            onClick={() => onTrackSelect(track.id)}
            className={`h-16 mx-2 mb-2 border-2 rounded-sm flex flex-col p-1.5 cursor-pointer transition-colors ${activeTrackId === track.id ? 'bg-hw-module-inset dark:bg-[#222] border-hw-accent-orange' : 'bg-hw-bg border-hw-border hover:border-gray-500'}`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: track.color }}></div>
                <span className="text-[10px] font-bold font-mono text-hw-text-main truncate">{track.name}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleMute(track.id); }}
                  className={`w-4 h-4 rounded-[2px] text-[8px] font-bold flex items-center justify-center ${track.muted ? 'bg-orange-500 text-white' : 'bg-[#fff] dark:bg-[#333] text-hw-text-muted border border-gray-300 dark:border-gray-700'}`}>M</button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleSolo(track.id); }}
                  className={`w-4 h-4 rounded-[2px] text-[8px] font-bold flex items-center justify-center ${track.soloed ? 'bg-yellow-500 text-black' : 'bg-[#fff] dark:bg-[#333] text-hw-text-muted border border-gray-300 dark:border-gray-700'}`}>S</button>
                {tracks.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteTrack(track.id); }}
                    className="w-4 h-4 rounded-[2px] text-[8px] font-bold flex items-center justify-center bg-red-900 text-white hover:bg-red-700 border border-red-900 ml-1">✕</button>
                )}
              </div>
            </div>

            {/* Volume */}
            <div className="mt-auto flex flex-col gap-0.5">
              <div className="h-1 w-full bg-black rounded-full overflow-hidden border border-[#333]">
                <div className="h-full" style={{ width: `${track.volume * 100}%`, backgroundColor: track.color }}></div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add Track Button */}
        <div className="px-2 pb-2">
           <button 
             onClick={onAddTrack}
             className="w-full py-1.5 border border-dashed border-gray-600 rounded text-[10px] font-mono text-gray-500 hover:text-hw-accent-orange hover:border-hw-accent-orange transition-colors flex items-center justify-center gap-1"
           >
             <span>+ ADD TRACK</span>
           </button>
        </div>
      </div>
    </div>
  );
}
