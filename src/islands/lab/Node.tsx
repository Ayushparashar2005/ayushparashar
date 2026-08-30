import { useState, useRef, useEffect } from 'preact/hooks';
import type { NodeState } from './types';
import { NodeDefinitions } from './nodeDefinitions';

interface NodeProps {
  node: NodeState;
  onMove: (id: string, x: number, y: number) => void;
  onUpdateData: (id: string, data: any) => void;
  onRemove: (id: string) => void;
  onJackMouseDown: (e: MouseEvent, nodeId: string, jackId: string, type: 'in' | 'out') => void;
  onJackMouseUp: (nodeId: string, jackId: string, type: 'in' | 'out') => void;
}

export default function Node({ node, onMove, onUpdateData, onRemove, onJackMouseDown, onJackMouseUp }: NodeProps) {
  const def = NodeDefinitions[node.type];
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('.jack') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsDragging(true);
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    
    // Get parent offset (the canvas)
    const canvas = nodeRef.current?.parentElement;
    if (canvas) {
      const canvasRect = canvas.getBoundingClientRect();
      // x, y should be relative to canvas
      const x = e.clientX - canvasRect.left - dragOffset.x;
      const y = e.clientY - canvasRect.top - dragOffset.y;
      onMove(node.id, x, y);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  if (!def) return null;

  return (
    <div
      ref={nodeRef}
      className="hw-module absolute w-48 shadow-lg flex flex-col pointer-events-auto"
      style={{
        left: node.position.x,
        top: node.position.y,
        zIndex: isDragging ? 10 : 1
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Screws */}
      <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-hw-screw border border-hw-screw-border shadow-inner z-10"></div>
      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-hw-screw border border-hw-screw-border shadow-inner z-10"></div>
      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-hw-screw border border-hw-screw-border shadow-inner z-10"></div>
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-hw-screw border border-hw-screw-border shadow-inner z-10"></div>

      {/* Header */}
      <div className="hw-module-header cursor-grab active:cursor-grabbing pb-1 pt-1.5 px-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-hw-accent-orange animate-pulse"></div>
          <span>{def.name}</span>
        </div>
        <button 
          className="text-hw-text-muted hover:text-red-500 transition-colors w-4 h-4 flex items-center justify-center font-bold"
          onClick={() => onRemove(node.id)}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3 bg-hw-module-inset flex-grow relative">
        
        {/* Custom UI for specific nodes */}
        {node.type === 'COLOR' && (
          <div className="flex justify-center mb-2">
            <input 
              type="color" 
              value={node.customData?.color || '#ff0000'} 
              onInput={(e) => onUpdateData(node.id, { color: (e.target as HTMLInputElement).value })}
              className="w-12 h-8 rounded cursor-pointer bg-hw-border p-0.5 border border-hw-screw-border"
            />
          </div>
        )}

        <div className="flex justify-between w-full h-full relative z-10">
          
          {/* Inputs */}
          <div className="flex flex-col gap-3 justify-around min-h-[40px]">
            {def.inputs.map(inp => (
              <div key={inp.id} className="flex items-center gap-2 relative">
                {/* Jack */}
                <div 
                  className="jack w-4 h-4 rounded-full bg-black border-2 border-[#555] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.3)] flex items-center justify-center cursor-crosshair -ml-5 absolute z-20"
                  data-node-id={node.id}
                  data-jack-id={inp.id}
                  data-jack-type="in"
                  onMouseDown={(e) => onJackMouseDown(e as unknown as MouseEvent, node.id, inp.id, 'in')}
                  onMouseUp={() => onJackMouseUp(node.id, inp.id, 'in')}
                >
                  <div className="w-1 h-1 rounded-full bg-[#111]"></div>
                </div>
                <span className="hw-label ml-1" title={inp.type}>{inp.name}</span>
              </div>
            ))}
          </div>

          {/* Outputs */}
          <div className="flex flex-col gap-3 justify-around items-end min-h-[40px]">
            {def.outputs.map(out => (
              <div key={out.id} className="flex items-center gap-2 relative justify-end">
                <span className="hw-label mr-1" title={out.type}>{out.name}</span>
                {/* Jack */}
                <div 
                  className="jack w-4 h-4 rounded-full bg-black border-2 border-[#555] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.3)] flex items-center justify-center cursor-crosshair -mr-5 absolute z-20"
                  data-node-id={node.id}
                  data-jack-id={out.id}
                  data-jack-type="out"
                  onMouseDown={(e) => onJackMouseDown(e as unknown as MouseEvent, node.id, out.id, 'out')}
                  onMouseUp={() => onJackMouseUp(node.id, out.id, 'out')}
                >
                  <div className="w-1 h-1 rounded-full bg-[#111]"></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
