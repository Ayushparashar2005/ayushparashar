import { useRef, useEffect } from 'preact/hooks';
import { synthEngine } from '../../lib/audio/SynthEngine';

export function Oscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      
      if (!synthEngine.analyser) {
        // Draw flat line
        ctx.strokeStyle = '#ff5500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }
      
      const analyser = synthEngine.analyser;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ff5500';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 85, 0, 0.8)';
      
      ctx.beginPath();
      const sliceWidth = width * 1.0 / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // 0 to 2
        const y = v * height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      // reset shadow for next frame
      ctx.shadowBlur = 0;
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="border-4 border-hw-border rounded-md overflow-hidden bg-black shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(255,255,255,0.05)] pointer-events-none z-10" />
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={120} 
        className="w-full h-full block"
      />
    </div>
  );
}
