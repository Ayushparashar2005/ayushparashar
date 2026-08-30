import { useRef, useEffect } from 'preact/hooks';
import { audioBridge } from '../../lib/audio/AudioBridge';

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
  const feedbackTexRef = useRef<WebGLTexture | null>(null);
  const startTimeRef = useRef<number>(performance.now());

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

    // Setup feedback texture
    const fbTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fbTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    feedbackTexRef.current = fbTex;

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
        gl.uniform1f(timeLocation, (time - startTimeRef.current) * 0.001);
      }

      const resLocation = gl.getUniformLocation(program, "u_resolution");
      if (resLocation !== null) {
        gl.uniform2f(resLocation, gl.canvas.width, gl.canvas.height);
      }

      // Bind feedback texture to texture unit 0
      const fbTex = feedbackTexRef.current;
      if (fbTex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fbTex);
        const fbLoc = gl.getUniformLocation(program, "u_feedback");
        if (fbLoc !== null) {
          gl.uniform1i(fbLoc, 0);
        }
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
        if (node.type === 'FFT_IN') {
          const locB = gl.getUniformLocation(program, `u_${node.id}_bass`);
          const locM = gl.getUniformLocation(program, `u_${node.id}_mid`);
          const locT = gl.getUniformLocation(program, `u_${node.id}_treble`);
          const locP = gl.getUniformLocation(program, `u_${node.id}_peak`);
          if (locB) gl.uniform1f(locB, audioBridge.bass);
          if (locM) gl.uniform1f(locM, audioBridge.mid);
          if (locT) gl.uniform1f(locT, audioBridge.treble);
          if (locP) gl.uniform1f(locP, audioBridge.peak);
        }
        if (node.type === 'SYNTH_AMP') {
          const loc = gl.getUniformLocation(program, `u_${node.id}_amp`);
          if (loc) gl.uniform1f(loc, audioBridge.amp);
        }
        if (node.type === 'SYNTH_ENV') {
          const loc = gl.getUniformLocation(program, `u_${node.id}_env`);
          if (loc) gl.uniform1f(loc, audioBridge.env);
        }
        if (node.type === 'SYNTH_NOTE') {
          const locP = gl.getUniformLocation(program, `u_${node.id}_pitch`);
          const locG = gl.getUniformLocation(program, `u_${node.id}_gate`);
          if (locP) gl.uniform1f(locP, audioBridge.pitch);
          if (locG) gl.uniform1f(locG, audioBridge.gate);
        }
      });

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Copy rendered result to feedback texture for the next frame
      if (fbTex) {
        gl.bindTexture(gl.TEXTURE_2D, fbTex);
        gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, gl.canvas.width, gl.canvas.height, 0);
      }

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
