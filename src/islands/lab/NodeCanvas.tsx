import { useState, useRef, useEffect } from 'preact/hooks';
import type { NodeState, EdgeState } from './types';
import Node from './Node';

interface NodeCanvasProps {
  nodes: NodeState[];
  edges: EdgeState[];
  onMoveNode: (id: string, x: number, y: number) => void;
  onUpdateNodeData: (id: string, data: any) => void;
  onRemoveNode: (id: string) => void;
  onAddEdge: (edge: Omit<EdgeState, 'id'>) => void;
  onRemoveEdge: (id: string) => void;
}

export default function NodeCanvas({ nodes, edges, onMoveNode, onUpdateNodeData, onRemoveNode, onAddEdge, onRemoveEdge }: NodeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
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
    
    jacks.forEach(jack => {
      const rect = jack.getBoundingClientRect();
      const nodeId = jack.getAttribute('data-node-id');
      const jackId = jack.getAttribute('data-jack-id');
      const type = jack.getAttribute('data-jack-type');
      if (nodeId && jackId && type) {
        newPositions[`${nodeId}-${jackId}-${type}`] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2
        };
      }
    });
    setJackPositions(newPositions);
  };

  useEffect(() => {
    updateJackPositions();
    // Rough approach: update on animation frame while dragging nodes
    // A better approach would be observer or context, but this works for simple MVP
    const interval = setInterval(updateJackPositions, 16);
    return () => clearInterval(interval);
  }, [nodes]);

  const handlePointerMove = (e: PointerEvent) => {
    if (!isConnecting || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handlePointerUp = () => {
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
    }
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
      // Ensure we are connecting an OUT to an IN
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
    // Bezier curve control points
    const dx = Math.abs(x2 - x1);
    const cp1x = x1 + dx * 0.5;
    const cp1y = y1;
    const cp2x = x2 - dx * 0.5;
    const cp2y = y2;
    const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

    return (
      <g key={key} className={onRemove ? 'cursor-pointer group' : ''} onDblClick={onRemove}>
        {/* Invisible wider path for easier clicking */}
        {onRemove && <path d={path} fill="none" stroke="transparent" strokeWidth="15" />}
        <path 
          d={path} 
          fill="none" 
          stroke={active ? '#ff5500' : '#444'} 
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
      className="flex-1 relative overflow-hidden bg-[#0a0a0a] border-l-2 border-hw-border-screen y2k-grid shadow-inner"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* SVG Canvas for cables */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" style={{ zIndex: 0 }}>
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

      {/* HTML Nodes */}
      {nodes.map(node => (
        <Node
          key={node.id}
          node={node}
          onMove={onMoveNode}
          onUpdateData={onUpdateNodeData}
          onRemove={onRemoveNode}
          onJackMouseDown={handleJackMouseDown}
          onJackMouseUp={handleJackMouseUp}
        />
      ))}
    </div>
  );
}
