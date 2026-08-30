import { useState, useRef, useEffect } from 'preact/hooks';
import type { NodeState, EdgeState } from './types';
import Node from './Node';

interface NodeCanvasProps {
  nodes: NodeState[];
  edges: EdgeState[];
  onMoveNode: (id: string, dx: number, dy: number) => void;
  onUpdateNodeData: (id: string, data: any) => void;
  onRemoveNode: (id: string) => void;
  onAddEdge: (edge: Omit<EdgeState, 'id'>) => void;
  onRemoveEdge: (id: string) => void;
}

export default function NodeCanvas({ nodes, edges, onMoveNode, onUpdateNodeData, onRemoveNode, onAddEdge, onRemoveEdge }: NodeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Viewport Transform (Pan & Zoom)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);

  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string, jackId: string, type: 'in' | 'out', x: number, y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [jackPositions, setJackPositions] = useState<Record<string, { x: number, y: number }>>({});

  // Update jack positions periodically or when nodes move
  const updateJackPositions = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const jacks = containerRef.current.querySelectorAll('.jack');
    const newPositions: Record<string, { x: number, y: number }> = {};
    const t = transformRef.current;
    
    jacks.forEach(jack => {
      const rect = jack.getBoundingClientRect();
      const nodeId = jack.getAttribute('data-node-id');
      const jackId = jack.getAttribute('data-jack-id');
      const type = jack.getAttribute('data-jack-type');
      if (nodeId && jackId && type) {
        newPositions[`${nodeId}-${jackId}-${type}`] = {
          x: ((rect.left + rect.width / 2) - containerRect.left - t.x) / t.scale,
          y: ((rect.top + rect.height / 2) - containerRect.top - t.y) / t.scale
        };
      }
    });
    setJackPositions(newPositions);
  };

  useEffect(() => {
    updateJackPositions();
    const interval = setInterval(updateJackPositions, 16);
    return () => clearInterval(interval);
  }, [nodes]);

  const handlePointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('.hw-module')) return;
    setIsPanning(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isPanning) {
      const next = { ...transformRef.current, x: transformRef.current.x + e.movementX, y: transformRef.current.y + e.movementY };
      setTransform(next);
      transformRef.current = next;
      return;
    }

    if (!isConnecting || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const t = transformRef.current;
    setMousePos({
      x: (e.clientX - rect.left - t.x) / t.scale,
      y: (e.clientY - rect.top - t.y) / t.scale
    });
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    
    setTransform(prev => {
      let nextScale = prev.scale * (1 + delta);
      nextScale = Math.min(Math.max(0.2, nextScale), 3);
      
      if (!containerRef.current) return prev;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleRatio = nextScale / prev.scale;
      const nextX = mouseX - (mouseX - prev.x) * scaleRatio;
      const nextY = mouseY - (mouseY - prev.y) * scaleRatio;

      const next = { x: nextX, y: nextY, scale: nextScale };
      transformRef.current = next;
      return next;
    });
  };

  const handleJackMouseDown = (e: MouseEvent, nodeId: string, jackId: string, type: 'in' | 'out') => {
    e.stopPropagation();
    const posKey = `${nodeId}-${jackId}-${type}`;
    const startPos = jackPositions[posKey];
    if (startPos) {
      setIsConnecting(true);
      setConnectionStart({ nodeId, jackId, type, x: startPos.x, y: startPos.y });
      setMousePos({ x: startPos.x, y: startPos.y });
    }
  };

  const handleJackMouseUp = (nodeId: string, jackId: string, type: 'in' | 'out') => {
    if (isConnecting && connectionStart) {
      if (connectionStart.type === 'out' && type === 'in') {
        onAddEdge({
          sourceNodeId: connectionStart.nodeId,
          sourceOutputId: connectionStart.jackId,
          targetNodeId: nodeId,
          targetInputId: jackId
        });
      } else if (connectionStart.type === 'in' && type === 'out') {
        onAddEdge({
          sourceNodeId: nodeId,
          sourceOutputId: jackId,
          targetNodeId: connectionStart.nodeId,
          targetInputId: connectionStart.jackId
        });
      }
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const renderCable = (x1: number, y1: number, x2: number, y2: number, active: boolean, key: string, onRemove?: () => void) => {
    const dx = Math.abs(x2 - x1);
    const cp1x = x1 + dx * 0.5;
    const cp1y = y1;
    const cp2x = x2 - dx * 0.5;
    const cp2y = y2;
    const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

    return (
      <g key={key} className={onRemove ? 'cursor-pointer group' : ''} onDblClick={onRemove}>
        {onRemove && <path d={path} fill="none" stroke="transparent" strokeWidth="15" />}
        <path 
          d={path} 
          fill="none" 
          stroke={active ? 'var(--hw-accent-orange)' : 'var(--hw-border-screen)'} 
          strokeWidth={active ? '3' : '2'}
          className="transition-colors group-hover:stroke-red-500"
          style={active ? { filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.6))' } : {}}
        />
      </g>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 relative overflow-hidden bg-hw-module-inset border-l-2 border-hw-border y2k-grid shadow-inner ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <div 
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
      >
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-auto" style={{ zIndex: 0 }}>
          {edges.map(edge => {
            const outPos = jackPositions[`${edge.sourceNodeId}-${edge.sourceOutputId}-out`];
            const inPos = jackPositions[`${edge.targetNodeId}-${edge.targetInputId}-in`];
            if (!outPos || !inPos) return null;
            return renderCable(outPos.x, outPos.y, inPos.x, inPos.y, true, edge.id, () => onRemoveEdge(edge.id));
          })}
          {isConnecting && connectionStart && (
            renderCable(connectionStart.x, connectionStart.y, mousePos.x, mousePos.y, true, 'connecting')
          )}
        </svg>

        {nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            scale={transform.scale}
            onMove={onMoveNode}
            onUpdateData={onUpdateNodeData}
            onRemove={onRemoveNode}
            onJackMouseDown={handleJackMouseDown}
            onJackMouseUp={handleJackMouseUp}
          />
        ))}
      </div>
    </div>
  );
}
