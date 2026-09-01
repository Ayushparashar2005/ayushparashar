import type { NodeDefinition } from './types';

export const NodeDefinitions: Record<string, NodeDefinition> = {
  OUTPUT: {
    type: 'OUTPUT',
    name: 'SCREEN OUT',
    description: 'The final output destination for your shader. Plug a color (vec3) into this to see it on the screen.',
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
    description: 'Outputs an endlessly increasing number representing time in seconds. Use it to animate parameters.',
    inputs: [],
    outputs: [{ id: 'out', name: 'TIME', type: 'float' }],
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_out = u_time;
    `
  },
  UV: {
    type: 'UV',
    name: 'COORDS (UV)',
    description: 'Provides the 2D coordinates (X, Y) of each pixel on the screen. Essential for drawing shapes or textures.',
    inputs: [],
    outputs: [{ id: 'out', name: 'UV', type: 'vec3' }], // output as vec3 for easy usage
    generateGLSL: (inputs, nodeId) => `
      vec3 val_${nodeId}_out = vec3(v_uv, 0.0);
    `
  },
  ROTATE_UV: {
    type: 'ROTATE_UV',
    name: 'ROTATE UV',
    description: 'Rotates a coordinate space around its center by a given angle.',
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
    description: 'Multiplies and wraps coordinates to create repeating grid patterns.',
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
    description: 'Generates a smooth wave that goes back and forth between 0.0 and 1.0 over time. Good for pulsing animations.',
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
    description: 'Adds two colors or vectors together.',
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
    description: 'Multiplies two colors or vectors together. Can be used to mask or mix signals.',
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
    description: 'Provides a static decimal number you can control with a slider.',
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
    description: 'Provides a static RGB color or 3D vector.',
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
    description: 'Maps a value from one range to another. E.g., convert 0.0-1.0 to 10.0-50.0.',
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
    description: 'Returns the positive version of a number (absolute value).',
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
    description: 'Restricts a value so it cannot go below 0.0 or above 1.0.',
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
    description: 'Creates a hard edge. Returns 0.0 if the signal is below the threshold, and 1.0 if it is above.',
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
    description: 'Creates a smooth transition between two thresholds. Great for anti-aliased circles.',
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
    description: 'Multiplies a color or vector by a single number (scales its intensity).',
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
    description: 'Provides a color picker that outputs an RGB value.',
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
    description: 'Draws a 2D circle using UV coordinates. You can control its radius and blur.',
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
    description: 'Blends between two colors based on a mix factor (0.0 to 1.0).',
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
    description: 'Generates organic, cloudy random noise patterns.',
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
    description: 'Pixelates coordinates into chunky blocks.',
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
    description: 'Generates complex, infinitely repeating fractal patterns based on coordinates.',
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
    description: 'Outputs the pixel data from the PREVIOUS frame. Use to create trails, delays, or infinite zoom loops.',
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
    description: 'Generates different mathematical waveforms (sine, square, saw) based on an input phase.',
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
    description: 'Converts Hue, Saturation, and Lightness values into a standard RGB color.',
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
    description: 'Creates a linear blend between two colors across a coordinate space.',
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
    description: 'Generates cellular \'Worley\' noise, looking like cells, bubbles, or cracked earth.',
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
    description: 'Reacts to your microphone. Outputs the current volume as a number.',
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
    description: 'Reacts to MIDI input from connected devices.',
    inputs: [],
    outputs: [{ id: 'val', name: 'VAL', type: 'float' }],
    getUniforms: (nodeId) => `uniform float u_${nodeId}_val;`,
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_val = u_${nodeId}_val;
    `
  },
  FFT_IN: {
    type: 'FFT_IN',
    name: 'SYNTH FFT',
    description: 'Analyzes playing synth audio and outputs the intensity of Bass, Mid, Treble, and Peak frequencies.',
    inputs: [],
    outputs: [
      { id: 'bass', name: 'BASS', type: 'float' },
      { id: 'mid', name: 'MID', type: 'float' },
      { id: 'treble', name: 'TREBLE', type: 'float' },
      { id: 'peak', name: 'PEAK', type: 'float' }
    ],
    getUniforms: (nodeId) => `
uniform float u_${nodeId}_bass;
uniform float u_${nodeId}_mid;
uniform float u_${nodeId}_treble;
uniform float u_${nodeId}_peak;
    `,
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_bass = u_${nodeId}_bass;
      float val_${nodeId}_mid = u_${nodeId}_mid;
      float val_${nodeId}_treble = u_${nodeId}_treble;
      float val_${nodeId}_peak = u_${nodeId}_peak;
    `
  },
  SYNTH_AMP: {
    type: 'SYNTH_AMP',
    name: 'SYNTH AMP',
    description: 'Outputs the raw volume level of the currently playing synth.',
    inputs: [],
    outputs: [{ id: 'amp', name: 'AMP', type: 'float' }],
    getUniforms: (nodeId) => `uniform float u_${nodeId}_amp;`,
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_amp = u_${nodeId}_amp;
    `
  },
  SYNTH_ENV: {
    type: 'SYNTH_ENV',
    name: 'SYNTH ENV',
    description: 'Outputs a smoothed envelope follower based on the synth volume (great for smooth pulsing).',
    inputs: [],
    outputs: [{ id: 'env', name: 'ENV', type: 'float' }],
    getUniforms: (nodeId) => `uniform float u_${nodeId}_env;`,
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_env = u_${nodeId}_env;
    `
  },
  SYNTH_NOTE: {
    type: 'SYNTH_NOTE',
    name: 'SYNTH NOTE',
    description: 'Outputs the pitch of the currently pressed synth key, and a gate signal (1 when pressed, 0 when released).',
    inputs: [],
    outputs: [
      { id: 'pitch', name: 'PITCH', type: 'float' },
      { id: 'gate', name: 'GATE', type: 'float' }
    ],
    getUniforms: (nodeId) => `
uniform float u_${nodeId}_pitch;
uniform float u_${nodeId}_gate;
    `,
    generateGLSL: (inputs, nodeId) => `
      float val_${nodeId}_pitch = u_${nodeId}_pitch;
      float val_${nodeId}_gate = u_${nodeId}_gate;
    `
  },
  AUDIO_OUT: {
    type: 'AUDIO_OUT',
    name: 'AUDIO SINK',
    description: 'Audio sink for audio-graph logic (Internal use).',
    inputs: [{ id: 'in', name: 'IN', type: 'audio' }],
    outputs: [],
    generateGLSL: (inputs, nodeId) => `// Audio node`
  },
  SYNTH_OSC: {
    type: 'SYNTH_OSC',
    name: 'SYNTH OSC',
    description: 'Audio oscillator for audio-graph logic (Internal use).',
    inputs: [{ id: 'freq', name: 'FREQ', type: 'float', defaultValue: 440.0, min: 20.0, max: 2000.0, step: 1.0 }],
    outputs: [{ id: 'out', name: 'OUT', type: 'audio' }],
    generateGLSL: (inputs, nodeId) => `// Audio node`
  }
};
