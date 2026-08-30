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
  ROTATE_UV: {
    type: 'ROTATE_UV',
    name: 'ROTATE UV',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'angle', name: 'ANGLE', type: 'float', defaultValue: 0.0, min: 0.0, max: 6.28318, step: 0.01 }
    ],
    outputs: [{ id: 'out', name: 'UV', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      float c_${nodeId} = cos(${inputs.angle});
      float s_${nodeId} = sin(${inputs.angle});
      mat2 rot_${nodeId} = mat2(c_${nodeId}, -s_${nodeId}, s_${nodeId}, c_${nodeId});
      vec2 st_${nodeId} = ${inputs.uv}.xy - 0.5;
      st_${nodeId} = rot_${nodeId} * st_${nodeId} + 0.5;
      vec3 val_${nodeId}_out = vec3(st_${nodeId}, 0.0);
    `
  },
  TILE_UV: {
    type: 'TILE_UV',
    name: 'TILE UV',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'tiles', name: 'TILES', type: 'float', defaultValue: 2.0, min: 1.0, max: 20.0, step: 1.0 }
    ],
    outputs: [{ id: 'out', name: 'UV', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = vec3(fract(${inputs.uv}.xy * ${inputs.tiles}), 0.0);
    `
  },
  OSCILLATOR: {
    type: 'OSCILLATOR',
    name: 'LFO',
    inputs: [
      { id: 'freq', name: 'FREQ', type: 'float', defaultValue: 1.0, min: 0.1, max: 20.0, step: 0.1 }
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
  FLOAT_CONST: {
    type: 'FLOAT_CONST',
    name: 'FLOAT CONST',
    inputs: [
      { id: 'val', name: 'VAL', type: 'float', defaultValue: 1.0, min: -100.0, max: 100.0, step: 0.1 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = ${inputs.val};
    `
  },
  VEC3_CONST: {
    type: 'VEC3_CONST',
    name: 'VEC3 CONST',
    inputs: [
      { id: 'r', name: 'R', type: 'float', defaultValue: 1.0, min: 0.0, max: 1.0, step: 0.01 },
      { id: 'g', name: 'G', type: 'float', defaultValue: 1.0, min: 0.0, max: 1.0, step: 0.01 },
      { id: 'b', name: 'B', type: 'float', defaultValue: 1.0, min: 0.0, max: 1.0, step: 0.01 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = vec3(${inputs.r}, ${inputs.g}, ${inputs.b});
    `
  },
  MATH_REMAP: {
    type: 'MATH_REMAP',
    name: 'REMAP',
    inputs: [
      { id: 'val', name: 'VAL', type: 'float', defaultValue: 0.0 },
      { id: 'inMin', name: 'IN MIN', type: 'float', defaultValue: 0.0, min: -10.0, max: 10.0, step: 0.1 },
      { id: 'inMax', name: 'IN MAX', type: 'float', defaultValue: 1.0, min: -10.0, max: 10.0, step: 0.1 },
      { id: 'outMin', name: 'OUT MIN', type: 'float', defaultValue: 0.0, min: -10.0, max: 10.0, step: 0.1 },
      { id: 'outMax', name: 'OUT MAX', type: 'float', defaultValue: 1.0, min: -10.0, max: 10.0, step: 0.1 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = ${inputs.outMin} + (${inputs.val} - ${inputs.inMin}) * (${inputs.outMax} - ${inputs.outMin}) / (${inputs.inMax} - ${inputs.inMin});
    `
  },
  MATH_ABS: {
    type: 'MATH_ABS',
    name: 'ABS',
    inputs: [
      { id: 'val', name: 'VAL', type: 'float', defaultValue: -1.0 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = abs(${inputs.val});
    `
  },
  MATH_CLAMP: {
    type: 'MATH_CLAMP',
    name: 'CLAMP',
    inputs: [
      { id: 'val', name: 'VAL', type: 'float', defaultValue: 0.0 },
      { id: 'min', name: 'MIN', type: 'float', defaultValue: 0.0, min: -10.0, max: 10.0, step: 0.1 },
      { id: 'max', name: 'MAX', type: 'float', defaultValue: 1.0, min: -10.0, max: 10.0, step: 0.1 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = clamp(${inputs.val}, ${inputs.min}, ${inputs.max});
    `
  },
  MATH_STEP: {
    type: 'MATH_STEP',
    name: 'STEP',
    inputs: [
      { id: 'edge', name: 'EDGE', type: 'float', defaultValue: 0.5, min: 0.0, max: 1.0, step: 0.01 },
      { id: 'val', name: 'VAL', type: 'float', defaultValue: 0.0 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = step(${inputs.edge}, ${inputs.val});
    `
  },
  MATH_SMOOTHSTEP: {
    type: 'MATH_SMOOTHSTEP',
    name: 'SMOOTHSTEP',
    inputs: [
      { id: 'edge0', name: 'EDGE 0', type: 'float', defaultValue: 0.0, min: 0.0, max: 1.0, step: 0.01 },
      { id: 'edge1', name: 'EDGE 1', type: 'float', defaultValue: 1.0, min: 0.0, max: 1.0, step: 0.01 },
      { id: 'val', name: 'VAL', type: 'float', defaultValue: 0.0 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = smoothstep(${inputs.edge0}, ${inputs.edge1}, ${inputs.val});
    `
  },
  MATH_MULT_FLOAT: {
    type: 'MATH_MULT_FLOAT',
    name: 'MULT (FLOAT)',
    inputs: [
      { id: 'a', name: 'A', type: 'vec3', defaultValue: [1.0, 1.0, 1.0] },
      { id: 'b', name: 'B (FLT)', type: 'float', defaultValue: 1.0, min: -10.0, max: 10.0, step: 0.1 }
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
      { id: 'radius', name: 'RADIUS', type: 'float', defaultValue: 0.5, min: 0.0, max: 2.0, step: 0.01 },
      { id: 'blur', name: 'BLUR', type: 'float', defaultValue: 0.01, min: 0.0, max: 1.0, step: 0.01 }
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
      { id: 't', name: 'T', type: 'float', defaultValue: 0.5, min: 0.0, max: 1.0, step: 0.01 }
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
      { id: 'scale', name: 'SCALE', type: 'float', defaultValue: 10.0, min: 0.1, max: 100.0, step: 0.1 }
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
      { id: 'pixels', name: 'PIXELS', type: 'float', defaultValue: 50.0, min: 1.0, max: 200.0, step: 1.0 }
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
      { id: 'segments', name: 'SEGMENTS', type: 'float', defaultValue: 6.0, min: 1.0, max: 24.0, step: 1.0 }
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
  FEEDBACK: {
    type: 'FEEDBACK',
    name: 'FEEDBACK (PREV FRAME)',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    getUniforms: () => `uniform sampler2D u_feedback;`,
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = texture2D(u_feedback, ${inputs.uv}.xy).rgb;
    `
  },
  WAVE: {
    type: 'WAVE',
    name: 'SINE WAVE',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'freq', name: 'FREQ', type: 'float', defaultValue: 10.0, min: 1.0, max: 100.0, step: 0.1 },
      { id: 'phase', name: 'PHASE', type: 'float', defaultValue: 0.0, min: 0.0, max: 6.28318, step: 0.01 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = sin(${inputs.uv}.x * ${inputs.freq} + ${inputs.phase}) * 0.5 + 0.5;
    `
  },
  HSL_TO_RGB: {
    type: 'HSL_TO_RGB',
    name: 'HSL TO RGB',
    inputs: [
      { id: 'h', name: 'HUE', type: 'float', defaultValue: 0.0, min: 0.0, max: 1.0, step: 0.01 },
      { id: 's', name: 'SAT', type: 'float', defaultValue: 1.0, min: 0.0, max: 1.0, step: 0.01 },
      { id: 'l', name: 'LIT', type: 'float', defaultValue: 0.5, min: 0.0, max: 1.0, step: 0.01 }
    ],
    outputs: [{ id: 'out', name: 'RGB', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      vec3 hsl_${nodeId} = vec3(${inputs.h}, ${inputs.s}, ${inputs.l});
      vec3 rgb_${nodeId} = clamp(abs(mod(hsl_${nodeId}.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
      vec3 val_${nodeId}_out = hsl_${nodeId}.z + hsl_${nodeId}.y * (rgb_${nodeId} - 0.5) * (1.0 - abs(2.0 * hsl_${nodeId}.z - 1.0));
    `
  },
  GRADIENT: {
    type: 'GRADIENT',
    name: 'LINEAR GRADIENT',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'colorA', name: 'COLOR A', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'colorB', name: 'COLOR B', type: 'vec3', defaultValue: [1.0, 1.0, 1.0] },
      { id: 'angle', name: 'ANGLE', type: 'float', defaultValue: 0.0, min: 0.0, max: 6.28318, step: 0.01 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'vec3' }],
    generateGLSL: (inputs, nodeId) => `
      float c_${nodeId} = cos(${inputs.angle});
      float s_${nodeId} = sin(${inputs.angle});
      vec2 dir_${nodeId} = vec2(c_${nodeId}, s_${nodeId});
      float t_${nodeId} = dot(${inputs.uv}.xy - 0.5, dir_${nodeId}) + 0.5;
      vec3 val_${nodeId}_out = mix(${inputs.colorA}, ${inputs.colorB}, clamp(t_${nodeId}, 0.0, 1.0));
    `
  },
  VORONOI: {
    type: 'VORONOI',
    name: 'VORONOI',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec3', defaultValue: [0.0, 0.0, 0.0] },
      { id: 'scale', name: 'SCALE', type: 'float', defaultValue: 5.0, min: 1.0, max: 50.0, step: 0.1 }
    ],
    outputs: [{ id: 'out', name: 'OUT', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      vec2 st_${nodeId} = ${inputs.uv}.xy * ${inputs.scale};
      vec2 i_${nodeId} = floor(st_${nodeId});
      vec2 f_${nodeId} = fract(st_${nodeId});
      float m_dist_${nodeId} = 1.0;
      for (int y= -1; y <= 1; y++) {
          for (int x= -1; x <= 1; x++) {
              vec2 neighbor = vec2(float(x),float(y));
              vec2 p = i_${nodeId} + neighbor;
              vec2 pt = fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5,183.3)))) * 43758.5453);
              vec2 diff = neighbor + pt - f_${nodeId};
              float dist = length(diff);
              m_dist_${nodeId} = min(m_dist_${nodeId}, dist);
          }
      }
      float val_${nodeId}_out = m_dist_${nodeId};
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
    inputs: [{ id: 'freq', name: 'FREQ', type: 'float', defaultValue: 440.0, min: 20.0, max: 2000.0, step: 1.0 }],
    outputs: [{ id: 'out', name: 'OUT', type: 'audio' }],
    generateGLSL: (inputs, nodeId) => `// Audio node`
  }
};
