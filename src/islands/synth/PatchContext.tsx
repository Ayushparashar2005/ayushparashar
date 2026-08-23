import { createContext } from 'preact';
import { useContext, useState, useRef, useEffect } from 'preact/hooks';

export interface PatchConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceType: 'audio' | 'cv';
}

interface PatchContextType {
  connections: PatchConnection[];
  activeDrag: { sourceId: string; currentX: number; currentY: number; sourceType: 'audio' | 'cv' } | null;
  jackPositions: Record<string, { x: number; y: number; type: 'in' | 'out'; signalType: 'audio' | 'cv' }>;
  
  startDrag: (sourceId: string, startX: number, startY: number, sourceType: 'audio' | 'cv') => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: () => void;
  
  registerJack: (id: string, x: number, y: number, type: 'in' | 'out', signalType: 'audio' | 'cv') => void;
  unregisterJack: (id: string) => void;
  
  connect: (sourceId: string, targetId: string) => void;
  disconnect: (connectionId: string) => void;
}

export const PatchContext = createContext<PatchContextType>({} as PatchContextType);

export function PatchProvider({ children }: { children: any }) {
  const [connections, setConnections] = useState<PatchConnection[]>([]);
  const [activeDrag, setActiveDrag] = useState<PatchContextType['activeDrag']>(null);
  const [jackPositions, setJackPositions] = useState<PatchContextType['jackPositions']>({});

  // Trigger engine update whenever connections change
  useEffect(() => {
    const event = new CustomEvent('synth-patches-changed', { detail: { connections } });
    window.dispatchEvent(event);
  }, [connections]);

  const startDrag = (sourceId: string, currentX: number, currentY: number, sourceType: 'audio' | 'cv') => {
    // If starting drag from an output, we're making a new connection.
    // If starting from an input, maybe we are disconnecting? Keep it simple: only drag from outputs.
    setActiveDrag({ sourceId, currentX, currentY, sourceType });
  };

  const updateDrag = (x: number, y: number) => {
    if (activeDrag) {
      setActiveDrag(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    }
  };

  const endDrag = () => {
    setActiveDrag(null);
  };

  const registerJack = (id: string, x: number, y: number, type: 'in' | 'out', signalType: 'audio' | 'cv') => {
    setJackPositions(prev => {
      // Only update if position actually changed significantly
      const existing = prev[id];
      if (existing && Math.abs(existing.x - x) < 2 && Math.abs(existing.y - y) < 2) return prev;
      return { ...prev, [id]: { x, y, type, signalType } };
    });
  };

  const unregisterJack = (id: string) => {
    setJackPositions(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // Also remove connections
    setConnections(prev => prev.filter(c => c.sourceId !== id && c.targetId !== id));
  };

  const connect = (sourceId: string, targetId: string) => {
    const sourceJack = jackPositions[sourceId];
    const targetJack = jackPositions[targetId];
    
    if (!sourceJack || !targetJack) return;
    if (sourceJack.type !== 'out' || targetJack.type !== 'in') return;
    if (sourceJack.signalType !== targetJack.signalType) return; // Audio to Audio, CV to CV

    // Check if target is already connected (1 input can only have 1 source in this simple model)
    setConnections(prev => {
      const filtered = prev.filter(c => c.targetId !== targetId);
      return [...filtered, {
        id: `${sourceId}-${targetId}-${Date.now()}`,
        sourceId,
        targetId,
        sourceType: sourceJack.signalType
      }];
    });
  };

  const disconnect = (connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
  };

  return (
    <PatchContext.Provider value={{
      connections, activeDrag, jackPositions,
      startDrag, updateDrag, endDrag,
      registerJack, unregisterJack,
      connect, disconnect
    }}>
      <div 
        className="w-full h-full relative"
        onPointerMove={(e) => {
          if (activeDrag) {
             updateDrag(e.clientX, e.clientY);
          }
        }}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {children}
      </div>
    </PatchContext.Provider>
  );
}

export const usePatch = () => useContext(PatchContext);
