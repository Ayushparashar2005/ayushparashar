import type { Track } from '../../lib/audio/RecordingManager';
import { PPQN } from '../../lib/audio/RecordingManager';

interface TimelineProps {
  tracks: Track[];
  currentTick: number;
  totalMeasures: number;
  pixelsPerMeasure: number;
  timeSignature: [number, number];
  onSeek?: (tick: number) => void;
  onClipDoubleClick?: (trackId: string, clipId: string) => void;
  onTrackClick?: (trackId: string, tick: number) => void;
  onClipDelete?: (trackId: string, clipId: string) => void;
}

export function Timeline({ tracks, currentTick, totalMeasures, pixelsPerMeasure, timeSignature, onSeek, onClipDoubleClick, onTrackClick, onClipDelete }: TimelineProps) {
  const [numBeats, den] = timeSignature;
  // A quarter note is PPQN ticks.
  // The measure length depends on the denominator.
  // 4/4 = 4 quarter notes = 4 * PPQN
  // 3/4 = 3 quarter notes = 3 * PPQN
  // 6/8 = 6 eighth notes = 6 * (PPQN / 2)
  const ticksPerBeat = PPQN * (4 / den);
  const ticksPerMeasure = numBeats * ticksPerBeat;
  const playheadX = (currentTick / ticksPerMeasure) * pixelsPerMeasure;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const updateSeek = (ev: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
      const x = Math.max(0, ev.clientX - rect.left + e.currentTarget.scrollLeft);
      const tick = (x / pixelsPerMeasure) * ticksPerMeasure;
      onSeek(Math.max(0, tick));
    };
    updateSeek(e);

    const onMove = (ev: PointerEvent) => updateSeek(ev);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleLanePointerDown = (e: React.PointerEvent<HTMLDivElement>, trackId: string) => {
    if (e.button !== 0) return;
    // Don't stop propagation, allow seek to happen as well if desired
    if (!onTrackClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left + e.currentTarget.scrollLeft);
    const tick = (x / pixelsPerMeasure) * ticksPerMeasure;
    onTrackClick(trackId, Math.max(0, tick));
  };

  return (
    <div 
      className="flex-1 bg-hw-bg dark:bg-[#050505] overflow-x-auto overflow-y-hidden relative select-none rounded-r-md border-y-2 border-r-2 border-hw-border cursor-pointer"
      onPointerDown={handlePointerDown}
    >
      
      {/* Ruler / Measures Header */}
      <div className="h-6 border-b-2 border-hw-border sticky top-0 bg-hw-module-inset dark:bg-[#111] z-10 flex relative">
        {Array.from({ length: totalMeasures }).map((_, i) => (
          <div 
            key={i} 
            className="h-full border-r border-[#333] flex items-end pb-0.5 px-1 shrink-0"
            style={{ width: pixelsPerMeasure }}
          >
            <span className="text-[9px] font-mono text-hw-text-muted font-bold">{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Grid and Tracks */}
      <div className="relative" style={{ width: totalMeasures * pixelsPerMeasure, minHeight: '100px' }}>
        
        {/* Z-0: Track Lane Backgrounds */}
        <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
          {tracks.map((track, idx) => (
            <div 
              key={`bg-${track.id}`} 
              className={`h-16 w-full ${idx % 2 === 0 ? 'bg-black/20' : 'bg-black/40'}`} 
              style={{ backgroundColor: `${track.color}15` }} 
            />
          ))}
        </div>

        {/* Z-10: Background Measure Lines */}
        <div className="absolute inset-0 flex pointer-events-none z-10">
          {Array.from({ length: totalMeasures }).map((_, i) => (
            <div 
              key={i} 
              className="h-full border-r border-[#ffffff10]"
              style={{ width: pixelsPerMeasure }}
            >
              {/* Beat lines */}
              <div className="flex h-full w-full">
                {Array.from({ length: numBeats }).map((_, j) => (
                  <div key={j} className="h-full flex-1 border-r border-[#ffffff05] last:border-r-0"></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Z-20: Tracks Content (Clips) */}
        <div className="relative z-20">
          {tracks.map(track => (
            <div 
              key={track.id} 
              className="h-16 relative w-full border-b border-[#ffffff10] last:border-b-0"
              onPointerDown={(e: any) => handleLanePointerDown(e, track.id)}
            >
              {track.clips.map(clip => {
                const startX = (clip.startTick / ticksPerMeasure) * pixelsPerMeasure;
                const widthX = (clip.lengthTicks / ticksPerMeasure) * pixelsPerMeasure;
                return (
                  <div 
                    key={clip.id}
                    className="absolute top-1 bottom-1 rounded border overflow-hidden shadow-sm backdrop-blur-sm cursor-pointer hover:brightness-125 transition-all"
                    style={{
                      left: startX,
                      width: widthX,
                      backgroundColor: `${track.color}50`, // 30% opacity
                      borderColor: track.color
                    }}
                    onDblClick={(e) => {
                      e.stopPropagation(); // prevent seek on double click
                      if (onClipDoubleClick) onClipDoubleClick(track.id, clip.id);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onClipDelete) onClipDelete(track.id, clip.id);
                    }}
                    onPointerDown={(e) => {
                      // Prevent drawing a new clip on top when clicking an existing clip
                      e.stopPropagation();
                    }}
                  >
                    {/* Render mini notes inside clip */}
                    <div className="relative w-full h-full pointer-events-none">
                      {clip.notes.map((note, idx) => {
                        const noteStartX = (note.startTick / clip.lengthTicks) * 100;
                        const noteWidthX = (note.durationTicks / clip.lengthTicks) * 100;
                        const noteY = 100 - (((note.note - 36) / 60) * 100);
                        
                        return (
                          <div 
                            key={idx}
                            className="absolute h-[3px] rounded-sm shadow-sm"
                            style={{
                              backgroundColor: '#fff',
                              left: `${noteStartX}%`,
                              width: `${Math.max(1, noteWidthX)}%`,
                              top: `${Math.max(0, Math.min(100, noteY))}%`
                            }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Z-30: Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-[1px] bg-[#e0e0e0] z-30 pointer-events-none shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          style={{ transform: `translateX(${playheadX}px)` }}
        >
          {/* Playhead dot */}
          <div className="absolute -top-[3px] -left-[3px] w-[7px] h-[7px] rounded-full bg-white border border-[#333] shadow-md"></div>
        </div>

      </div>
    </div>
  );
}
