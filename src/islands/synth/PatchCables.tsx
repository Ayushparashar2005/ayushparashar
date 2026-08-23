import { usePatch } from './PatchContext';

export function PatchCables() {
  const { connections, jackPositions, activeDrag } = usePatch();

  // Helper to draw a nice hanging cubic bezier curve for patch cables
  const renderCable = (startX: number, startY: number, endX: number, endY: number, color: string) => {
    // Add "sag" to the cable for a realistic hanging wire look
    const dx = Math.abs(endX - startX);
    const sag = Math.min(200, dx * 0.5 + 50); // Gravity sag effect
    
    const cp1x = startX;
    const cp1y = startY + sag;
    const cp2x = endX;
    const cp2y = endY + sag;
    
    return (
      <path 
        d={`M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`}
        fill="transparent"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))'
        }}
      />
    );
  };

  return (
    <svg 
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ overflow: 'visible' }}
    >
      {/* Draw active established connections */}
      {connections.map(conn => {
        const source = jackPositions[conn.sourceId];
        const target = jackPositions[conn.targetId];
        if (!source || !target) return null;
        
        // Color code: Audio gets one color, CV gets another
        const color = conn.sourceType === 'audio' ? '#ffaa00' : '#00ffff';

        return (
          <g key={conn.id}>
            {renderCable(source.x, source.y, target.x, target.y, color)}
            {/* Inner highlight core of the cable */}
            {renderCable(source.x, source.y, target.x, target.y, 'rgba(255,255,255,0.4)')}
          </g>
        );
      })}

      {/* Draw the currently dragging cable */}
      {activeDrag && jackPositions[activeDrag.sourceId] && (
        <g>
          {renderCable(
            jackPositions[activeDrag.sourceId].x,
            jackPositions[activeDrag.sourceId].y,
            activeDrag.currentX,
            activeDrag.currentY,
            activeDrag.sourceType === 'audio' ? 'rgba(255,170,0,0.5)' : 'rgba(0,255,255,0.5)'
          )}
        </g>
      )}
    </svg>
  );
}
