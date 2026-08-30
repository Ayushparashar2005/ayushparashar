import { NodeDefinitions } from './nodeDefinitions';

interface NodeLibraryProps {
  onAddNode: (type: string, x: number, y: number) => void;
}

export default function NodeLibrary({ onAddNode }: NodeLibraryProps) {
  const nodeTypes = Object.values(NodeDefinitions);

  return (
    <div className="w-64 bg-hw-panel border-r-2 border-hw-border shadow-md flex flex-col h-full shrink-0 z-20 relative min-h-0">
      <div className="bg-hw-module-inset border-b-2 border-hw-border p-3 shadow-inner shrink-0">
        <h3 className="font-mono text-xs font-bold text-hw-accent-orange tracking-widest uppercase">LAB_CORE // NODES</h3>
        <p className="font-mono text-[9px] text-hw-text-muted mt-1 uppercase">Click to add to canvas</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2 min-h-0">
        {nodeTypes.map(def => (
          <button
            key={def.type}
            onClick={() => onAddNode(def.type, 100, 100)} // Default add position
            className="w-full text-left bg-hw-module border border-hw-border hover:border-hw-accent-orange px-3 py-2 rounded shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            {/* Scanline hover effect */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <span className="font-sans font-bold text-[10px] tracking-wider text-hw-text-main group-hover:text-hw-accent-orange transition-colors">
                {def.name}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-hw-text-muted group-hover:bg-hw-accent-orange transition-colors shadow-[0_0_5px_rgba(255,85,0,0)] group-hover:shadow-[0_0_5px_rgba(255,85,0,0.5)]"></div>
            </div>
            
            <div className="flex gap-2 mt-2 font-mono text-[8px] text-hw-text-muted opacity-80 uppercase tracking-widest relative z-10">
              {def.inputs.length > 0 && (
                <span>IN: {def.inputs.map(i => i.name).join(',')}</span>
              )}
              {def.outputs.length > 0 && (
                <span className="ml-auto">OUT: {def.outputs.map(o => o.name).join(',')}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
