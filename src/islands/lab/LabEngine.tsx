import { useRef, useState } from 'preact/hooks';
import { useNodeGraph } from './useNodeGraph';
import NodeLibrary from './NodeLibrary';
import NodeCanvas, { NodeCanvasRef } from './NodeCanvas';
import WebGLPreview from './WebGLPreview';

export default function LabEngine() {
  const { 
    nodes, edges, shaderCode, 
    addNode, moveNode, updateNodeData, removeNode, 
    addEdge, removeEdge 
  } = useNodeGraph();

  const canvasRef = useRef<NodeCanvasRef>(null);
  const [compileError, setCompileError] = useState<string | null>(null);

  const handleAddNode = (type: string) => {
    if (canvasRef.current) {
      canvasRef.current.addNodeAtCenter(type);
    } else {
      addNode(type, 100, 100);
    }
  };

  return (
    <section class="flex flex-col flex-1 w-full h-full min-h-0 overflow-hidden">
      
      <header class="hw-module-header px-6 relative group">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full border border-hw-border-screen bg-hw-bg shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
            <div class="w-1.5 h-1.5 m-[1px] rounded-full bg-hw-accent-orange shadow-[0_0_5px_rgba(255,85,0,0.8)]"></div>
          </div>
          <span class="text-hw-text-muted">NODE_GRAPH // LAB_CORE</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[10px] opacity-50 ml-2 text-hw-text-muted">≡</span>
        </div>
      </header>

      <div class="flex-grow p-0 md:p-0 relative min-h-0 bg-hw-module">
        <div class="relative z-10 h-full flex flex-row gap-0 min-h-0 overflow-hidden rounded-b-xl border-t border-hw-border">
          
          {/* Left Sidebar: Node Library */}
          <NodeLibrary onAddNode={handleAddNode} />

          {/* Center: Canvas */}
          <NodeCanvas 
            ref={canvasRef}
            nodes={nodes} 
            edges={edges} 
            onMoveNode={moveNode} 
            onUpdateNodeData={updateNodeData}
            onRemoveNode={removeNode} 
            onAddEdge={addEdge} 
            onRemoveEdge={removeEdge} 
            onAddNode={addNode}
          />

          {/* Right Sidebar: Output Preview */}
          <div className="w-80 bg-hw-panel border-l-2 border-hw-border shadow-md flex flex-col h-full shrink-0 z-20 min-h-0 overflow-hidden">
            <div className="bg-hw-module-inset border-b-2 border-hw-border p-3 shadow-inner shrink-0">
              <h3 className="font-mono text-xs font-bold text-hw-accent-orange tracking-widest uppercase">OUTPUT_VIEW</h3>
              <p className="font-mono text-[9px] text-hw-text-muted mt-1 uppercase">Live WebGL Shader</p>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
              
              <div className="w-full aspect-square bg-hw-screen border-4 border-hw-border-screen rounded-lg overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative group shrink-0">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-30 z-20 pointer-events-none mix-blend-overlay"></div>
                
                <WebGLPreview 
                  fragmentShaderCode={shaderCode} 
                  nodes={nodes}
                  onError={setCompileError}
                  className="w-full h-full object-cover block relative z-10"
                />
              </div>

              <div className="bg-hw-screen-light border border-hw-border-screen rounded p-3 text-[9px] font-mono text-[#5f5f5f] overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 shadow-inner min-h-0 relative">
                {compileError ? (
                  <div className="absolute inset-0 bg-red-900/90 text-red-100 p-3 overflow-y-auto z-20 break-all whitespace-pre-wrap">
                    <div className="font-bold text-red-300 mb-2">// FATAL SHADER ERROR</div>
                    {compileError}
                  </div>
                ) : null}
                <div className="text-hw-accent-blue mb-2 font-bold tracking-widest uppercase">// COMPILED GLSL</div>
                <pre className="whitespace-pre-wrap break-words">{shaderCode}</pre>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
