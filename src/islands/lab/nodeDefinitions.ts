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
  },
  NOISE: {
    type: 'NOISE',
    name: 'NOISE 2D',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'scale', name: 'SCALE', type: 'float', defaultValue: 10.0 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      vec2 st_${nodeId} = ${inputs.uv}.xy * ${inputs.scale};
      vec2 i_${nodeId} = floor(st_${nodeId});
      vec2 f_${nodeId} = fract(st_${nodeId});
      
      float a_${nodeId} = fract(sin(dot(i_${nodeId}, vec2(12.9898, 78.233))) * 43758.5453123);
      float b_${nodeId} = fract(sin(dot(i_${nodeId} + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453123);
      float c_${nodeId} = fract(sin(dot(i_${nodeId} + vec2(0.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453123);
      float d_${nodeId} = fract(sin(dot(i_${nodeId} + vec2(1.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453123);
      
      vec2 u_${nodeId} = f_${nodeId} * f_${nodeId} * (3.0 - 2.0 * f_${nodeId});
      float val_${nodeId}_out = mix(a_${nodeId}, b_${nodeId}, u_${nodeId}.x) + (c_${nodeId} - a_${nodeId}) * u_${nodeId}.y * (1.0 - u_${nodeId}.x) + (d_${nodeId} - b_${nodeId}) * u_${nodeId}.x * u_${nodeId}.y;
    `
  },
  PIXELATE: {
    type: 'PIXELATE',
    name: 'PIXELATE',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'pixels', name: 'PIXELS', type: 'float', defaultValue: 50.0 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = vec3(floor(${inputs.uv}.xy * ${inputs.pixels}) / ${inputs.pixels}, 0.0);
    `
  },
  FRACTAL: {
    type: 'FRACTAL',
    name: 'FRACTAL KALEIDOSCOPE',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'segments', name: 'SEGMENTS', type: 'float', defaultValue: 6.0 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec2 uv_${nodeId} = ${inputs.uv}.xy - 0.5;
      float angle_${nodeId} = atan(uv_${nodeId}.y, uv_${nodeId}.x);
      float radius_${nodeId} = length(uv_${nodeId});
      angle_${nodeId} = mod(angle_${nodeId}, 6.28318 / ${inputs.segments});
      angle_${nodeId} = abs(angle_${nodeId} - (6.28318 / ${inputs.segments}) / 2.0);
      vec2 uv_fractal_${nodeId} = vec2(cos(angle_${nodeId}), sin(angle_${nodeId})) * radius_${nodeId} + 0.5;
      vec3 val_${nodeId}_out = vec3(uv_fractal_${nodeId}, 0.0);
    `
  },
  MIC_IN: {
    type: 'MIC_IN',
    name: 'MIC IN',
    inputs: [],
    outputs: [{ id: 'vol', name: 'VOL', type: 'float' }],
    getUniforms: (nodeId) => `uniform float u_${nodeId}_vol;`,
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_vol = u_${nodeId}_vol;
    `
  },
  MIDI_IN: {
    type: 'MIDI_IN',
    name: 'MIDI IN',
    inputs: [],
    outputs: [{ id: 'val', name: 'VAL', type: 'float' }],
    getUniforms: (nodeId) => `uniform float u_${nodeId}_val;`,
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_val = u_${nodeId}_val;
    `
  },
  AUDIO_OUT: {
    type: 'AUDIO_OUT',
    name: 'AUDIO SINK',
    inputs: [{ id: 'in', name: 'IN', type: 'audio' }],
    outputs: [],
    generateGLSL: (inputs, nodeId) => `// Audio node`
  },
  SYNTH_OSC: {
    type: 'SYNTH_OSC',
    name: 'SYNTH OSC',
    inputs: [{ id: 'freq', name: 'FREQ', type: 'float', defaultValue: 440.0 }],
    outputs: [{ id: 'out', name: 'OUT', type: 'audio' }],
    generateGLSL: (inputs, nodeId) => `// Audio node`
  }
};
