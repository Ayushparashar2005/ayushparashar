import { useRef, useEffect } from 'preact/hooks';

interface WebGLPreviewProps {
  fragmentShaderCode: string;
  className?: string;
  nodes: any[];
  onError?: (err: string | null) => void;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export default function WebGLPreview({ fragmentShaderCode, className, nodes, onError }: WebGLPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>(0);
  const liveInputsRef = useRef<any>(null);

  useEffect(() => {
    import('./liveInputs').then(({ LiveInputs }) => {
      liveInputsRef.current = LiveInputs;
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    glRef.current = gl;

    // Buffer setup
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl || !fragmentShaderCode) return;

    // Compile shaders
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        console.error('Shader compile error:', info);
        onError?.(`Shader Compile Error:\n${info}`);
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderCode);

    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      console.error('Program link error:', info);
      onError?.(`Program Link Error:\n${info}`);
      return;
    }

    onError?.(null); // Clear errors
    programRef.current = program;

    // Cleanup old shaders
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  }, [fragmentShaderCode]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    let startTime = performance.now();

    const render = (time: number) => {
      const program = programRef.current;
      if (!program) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      // Setup positions
      const positionLocation = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Set standard uniforms
      const timeLocation = gl.getUniformLocation(program, "u_time");
      if (timeLocation !== null) {
        gl.uniform1f(timeLocation, (time - startTime) * 0.001);
      }

      const resLocation = gl.getUniformLocation(program, "u_resolution");
      if (resLocation !== null) {
        gl.uniform2f(resLocation, gl.canvas.width, gl.canvas.height);
      }

      // Set custom uniforms for nodes
      const liveInputs = liveInputsRef.current;
      nodes.forEach(node => {
        if (node.type === 'COLOR' && node.customData?.color) {
          const loc = gl.getUniformLocation(program, `u_${node.id}_color`);
          if (loc !== null) {
            const hex = node.customData.color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            gl.uniform3f(loc, r, g, b);
          }
        }
        if (node.type === 'MIC_IN' && liveInputs) {
          const loc = gl.getUniformLocation(program, `u_${node.id}_vol`);
          if (loc !== null) {
            gl.uniform1f(loc, liveInputs.micVolume);
          }
        }
        if (node.type === 'MIDI_IN' && liveInputs) {
          const loc = gl.getUniformLocation(program, `u_${node.id}_val`);
          if (loc !== null) {
            gl.uniform1f(loc, liveInputs.midiValue);
          }
        }
      });

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [nodes]); // Depend on nodes for custom uniform updates

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={800} 
      className={className} 
    />
  );
}
