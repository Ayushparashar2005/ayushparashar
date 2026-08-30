export type SignalType = 'float' | 'vec3' | 'audio';

export interface NodeInput {
  id: string;
  name: string;
  type: SignalType;
  defaultValue?: number | number[]; // e.g. 0.0 or [0,0,0]
  min?: number;
  max?: number;
  step?: number;
}

export interface NodeOutput {
  id: string;
  name: string;
  type: SignalType;
}

export interface NodeDefinition {
  type: string;
  name: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  // A function that returns the GLSL snippet for this node
  // It receives the evaluated input expressions
  generateGLSL: (inputs: Record<string, string>, nodeId: string) => string;
  // A function to declare uniforms if needed
  getUniforms?: (nodeId: string, customData?: any) => string;
}

export interface NodeState {
  id: string;
  type: string;
  position: { x: number; y: number };
  customData?: any; // For nodes that have internal UI state (like color pickers or sliders)
}

export interface EdgeState {
  id: string;
  sourceNodeId: string;
  sourceOutputId: string;
  targetNodeId: string;
  targetInputId: string;
}
