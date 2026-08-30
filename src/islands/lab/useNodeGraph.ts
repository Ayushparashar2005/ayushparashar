import { useState, useCallback, useMemo, useEffect } from 'preact/hooks';
import type { NodeState, EdgeState } from './types';
import { NodeDefinitions } from './nodeDefinitions';

// Initial graph with an OUTPUT node
const initialNodes: NodeState[] = [
  { id: 'out_0', type: 'OUTPUT', position: { x: 600, y: 200 } }
];

export function useNodeGraph() {
  const [nodes, setNodes] = useState<NodeState[]>(initialNodes);
  const [edges, setEdges] = useState<EdgeState[]>([]);
  const [shaderCode, setShaderCode] = useState<string>('');

  const addNode = useCallback((type: string, x: number, y: number) => {
    const id = `${type.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`;
    setNodes(n => [...n, { id, type, position: { x, y } }]);
  }, []);

  const moveNode = useCallback((id: string, dx: number, dy: number) => {
    setNodes(n => n.map(node => node.id === id ? { ...node, position: { x: node.position.x + dx, y: node.position.y + dy } } : node));
  }, []);

  const updateNodeData = useCallback((id: string, data: any) => {
    setNodes(n => n.map(node => node.id === id ? { ...node, customData: { ...node.customData, ...data } } : node));
  }, []);

  const addEdge = useCallback((edge: Omit<EdgeState, 'id'>) => {
    const id = `edge_${Math.random().toString(36).substr(2, 9)}`;
    // Check if target already has a connection
    setEdges(e => {
      const filtered = e.filter(ex => !(ex.targetNodeId === edge.targetNodeId && ex.targetInputId === edge.targetInputId));
      return [...filtered, { ...edge, id }];
    });
  }, []);

  const removeEdge = useCallback((id: string) => {
    setEdges(e => e.filter(edge => edge.id !== id));
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes(n => n.filter(node => node.id !== id));
    setEdges(e => e.filter(edge => edge.sourceNodeId !== id && edge.targetNodeId !== id));
  }, []);

  // Topological sort and compile
  useEffect(() => {
    const compile = () => {
      // Find output node
      const outNode = nodes.find(n => n.type === 'OUTPUT');
      if (!outNode) return '';

      const visited = new Set<string>();
      const ordered: NodeState[] = [];
      const dependencies = new Map<string, string[]>();

      // Build dependency graph
      edges.forEach(edge => {
        if (!dependencies.has(edge.targetNodeId)) {
          dependencies.set(edge.targetNodeId, []);
        }
        dependencies.get(edge.targetNodeId)!.push(edge.sourceNodeId);
      });

      const visit = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        const deps = dependencies.get(nodeId) || [];
        deps.forEach(visit);
        visited.add(nodeId);
        const node = nodes.find(n => n.id === nodeId);
        if (node) ordered.push(node);
      };

      // Ensure we traverse from the OUTPUT node backwards
      visit(outNode.id);

      // Now generate GLSL
      let uniforms = '';
      let mainBody = '';

      ordered.forEach(node => {
        const def = NodeDefinitions[node.type];
        if (!def) return;

        if (def.getUniforms) {
          uniforms += def.getUniforms(node.id, node.customData) + '\n';
        }

        const inputArgs: Record<string, string> = {};
        def.inputs.forEach(inp => {
          // Find incoming edge
          const edge = edges.find(e => e.targetNodeId === node.id && e.targetInputId === inp.id);
          if (edge) {
            inputArgs[inp.id] = `val_${edge.sourceNodeId}_${edge.sourceOutputId}`;
          } else {
            // Default value format
            if (inp.type === 'float') {
              inputArgs[inp.id] = (inp.defaultValue as number).toFixed(2);
            } else if (inp.type === 'vec3') {
              const [r, g, b] = (inp.defaultValue as number[]);
              inputArgs[inp.id] = `vec3(${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)})`;
            }
          }
        });

        mainBody += `\n    // Node: ${node.type} (${node.id})\n`;
        mainBody += def.generateGLSL(inputArgs, node.id);
      });

      const fragmentShader = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
${uniforms}
varying vec2 v_uv;

void main() {
    ${mainBody}
}
      `;

      setShaderCode(fragmentShader);
    };

    compile();

    // Compile Audio Graph
    import('./audioGraph').then(({ AudioGraph }) => {
      AudioGraph.compile(nodes, edges);
    });

  }, [nodes, edges]);

  return {
    nodes, edges, shaderCode,
    addNode, moveNode, updateNodeData, removeNode,
    addEdge, removeEdge
  };
}
