import { useRef, useEffect } from 'preact/hooks';
import { usePatch } from './PatchContext';

interface PatchJackProps {
  id: string;
  label: string;
  type: 'in' | 'out';
  signalType?: 'audio' | 'cv'; // default cv
}

export function PatchJack({ id, label, type, signalType = 'cv' }: PatchJackProps) {
  const { registerJack, unregisterJack, startDrag, endDrag, activeDrag, connect, connections, disconnect } = usePatch();
  const ref = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    // Get position relative to the PatchProvider container (we assume the provider is offsetParent or we can just use a global coordinates approach, 
    // but the simplest way is finding the nearest absolute/relative container, which is our PatchProvider).
    // Actually, bounding client rect is relative to viewport. Let's use viewport coords and have the PatchCables SVG be fixed to viewport!
    registerJack(id, rect.left + rect.width / 2, rect.top + rect.height / 2, type, signalType);
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      unregisterJack(id);
    };
  }, [id, type, signalType]);

  const handlePointerDown = (e: PointerEvent) => {
    if (type === 'out') {
      startDrag(id, e.clientX, e.clientY, signalType);
    } else if (type === 'in') {
      // Disconnect existing if we click an input
      const existingConn = connections.find(c => c.targetId === id);
      if (existingConn) {
        disconnect(existingConn.id);
      }
    }
    e.stopPropagation(); // don't let parent handle
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (type === 'in' && activeDrag && activeDrag.sourceType === signalType) {
      connect(activeDrag.sourceId, id);
    }
    endDrag();
    e.stopPropagation();
  };

  const isConnected = connections.some(c => c.sourceId === id || c.targetId === id);

  return (
    <div className="flex flex-col items-center gap-1 group">
      <span className="font-mono text-[8px] font-bold uppercase text-hw-text-muted group-hover:text-hw-accent-orange transition-colors">
        {label}
      </span>
      <div 
        ref={ref}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all shadow-inner
          ${type === 'out' ? 'border-gray-500 bg-gray-800' : 'border-gray-400 bg-gray-900'}
          ${isConnected ? 'shadow-[0_0_8px_rgba(255,85,0,0.8)] border-hw-accent-orange' : 'hover:border-hw-accent-orange'}
        `}
      >
        <div className={`w-3 h-3 rounded-full shadow-inner ${isConnected ? 'bg-[#ff5500]' : 'bg-black'}`} />
      </div>
    </div>
  );
}
