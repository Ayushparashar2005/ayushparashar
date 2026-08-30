import type { NodeDefinition } from './types';

export const NodeDefinitions: Record<string, NodeDefinition> = {
  OUTPUT: {
    type: 'OUTPUT',
    name: 'SCREEN OUT',
    inputs: [
      { id: 'color', name: 'COLOR', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] }
    ],
    outputs: [],
    generateGLSL: (inputs, nodeId) => `
      gl_FragColor = vec4(${inputs.color}, 1.0);
    `
  },
  TIME: {
    type: 'TIME',
    name: 'GLOBAL CLOCK',
    inputs: [],
    outputs: [{ id: 'out', name: 'TIME', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = u_time;
    `
  },
  UV: {
    type: 'UV',
    name: 'COORDS (UV)',
    inputs: [],
    outputs: [{ id: 'out', name: 'UV', type: 'vec3' }], // output as vec3 for easy usage
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = vec3(v_uv, 0.0);
    `
  },
  OSCILLATOR: {
    type: 'OSCILLATOR',
    name: 'LFO',
    inputs: [
      { id: 'freq', name: 'FREQ', type: 'float', defaultValue: 1.0 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = sin(u_time * ${inputs.freq} * 3.14159 * 2.0) * 0.5 + 0.5;
    `
  },
  MATH_ADD: {
    type: 'MATH_ADD',
    name: 'ADD (VEC3)',
    inputs: [
      { id: 'a', name: 'A', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'b', name: 'B', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = ${inputs.a} + ${inputs.b};
    `
  },
  MATH_MULT: {
    type: 'MATH_MULT',
    name: 'MULT (VEC3)',
    inputs: [
      { id: 'a', name: 'A', type: 'vec3', defaultValue: [1.0, 1.0, 1.0] },
      { id: 'b', name: 'B', type: 'vec3', defaultValue: [1.0, 1.0, 1.0] }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = ${inputs.a} * ${inputs.b};
    `
  },
  MATH_MULT_FLOAT: {
    type: 'MATH_MULT_FLOAT',
    name: 'MULT (FLOAT)',
    inputs: [
      { id: 'a', name: 'A', type: 'vec3', defaultValue: [1.0, 1.0, 1.0] },
      { id: 'b', name: 'B (FLT)', type: 'float', defaultValue: 1.0 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = ${inputs.a} * ${inputs.b};
    `
  },
  COLOR: {
    type: 'COLOR',
    name: 'COLOR RGB',
    inputs: [],
    outputs: [{ id: 'out', name: 'RGB', type: 'vec3' }],
    getUniforms: (nodeId) => `uniform vec3 u_${nodeId}_color;`,
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = u_${nodeId}_color;
    `
  },
  SHAPE_CIRCLE: {
    type: 'SHAPE_CIRCLE',
    name: 'CIRCLE',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'radius', name: 'RADIUS', type: 'float', defaultValue: 0.5 },
      { id: 'blur', name: 'BLUR', type: 'float', defaultValue: 0.01 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec2 st_${nodeId} = ${inputs.uv}.xy - vec2(0.5);
      float dist_${nodeId} = length(st_${nodeId});
      float circle_${nodeId} = smoothstep(${inputs.radius} + ${inputs.blur}, ${inputs.radius} - ${inputs.blur}, dist_${nodeId});
      vec3 val_${nodeId}_out = vec3(circle_${nodeId});
    `
  },
  MIX: {
    type: 'MIX',
    name: 'LERP MIX',
    inputs: [
      { id: 'a', name: 'A', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'b', name: 'B', type: 'vec3', defaultValue: [1.0, 1.0, 1.0] },
      { id: 't', name: 'T', type: 'float', defaultValue: 0.5 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = mix(${inputs.a}, ${inputs.b}, ${inputs.t});
    `
  }
};
