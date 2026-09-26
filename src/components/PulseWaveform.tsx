'use client';

import React, { useEffect, useRef } from 'react';
import { TestPhase } from '@/types/speedtest';

interface PulseWaveformProps {
  phase: TestPhase;
  speed: number;
}

export const PulseWaveform: React.FC<PulseWaveformProps> = ({ phase, speed }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = 120 * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine wave intensity from speed
      const isTesting = ['ping', 'download', 'upload', 'calculating'].includes(phase);
      const intensity = isTesting ? Math.min(Math.max(speed / 80, 0.4), 3.0) : 0.2;
      const speedFactor = isTesting ? 0.05 + intensity * 0.04 : 0.015;

      step += speedFactor;

      // Color scheme according to phase
      let strokeColor1 = 'rgba(6, 182, 212, 0.6)'; // Cyan
      let strokeColor2 = 'rgba(16, 185, 129, 0.4)'; // Emerald
      if (phase === 'ping') {
        strokeColor1 = 'rgba(168, 85, 247, 0.6)'; // Purple
        strokeColor2 = 'rgba(236, 72, 153, 0.4)'; // Pink
      } else if (phase === 'upload') {
        strokeColor1 = 'rgba(16, 185, 129, 0.7)'; // Emerald
        strokeColor2 = 'rgba(52, 211, 153, 0.4)';
      }

      // Draw primary wave
      ctx.beginPath();
      ctx.lineWidth = isTesting ? 2.5 : 1.5;
      ctx.strokeStyle = strokeColor1;

      for (let x = 0; x < width; x += 2) {
        // Multi-frequency sine combination
        const amp = 15 * intensity;
        const y =
          centerY +
          Math.sin(x * 0.015 + step) * amp * Math.sin(x / width * Math.PI) +
          Math.sin(x * 0.035 - step * 1.5) * (amp * 0.4) * Math.sin(x / width * Math.PI);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw secondary harmonic wave
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = strokeColor2;

      for (let x = 0; x < width; x += 2) {
        const amp = 10 * intensity;
        const y =
          centerY +
          Math.sin(x * 0.02 - step * 0.8 + Math.PI / 3) * amp * Math.sin(x / width * Math.PI) +
          Math.cos(x * 0.01 + step) * (amp * 0.3) * Math.sin(x / width * Math.PI);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Soft center glowing pulse dot
      if (isTesting) {
        const pulseX = width / 2;
        const pulseY = centerY;
        const grad = ctx.createRadialGradient(pulseX, pulseY, 2, pulseX, pulseY, 40 * intensity);
        grad.addColorStop(0, strokeColor1);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 40 * intensity, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [phase, speed]);

  return (
    <div className="w-full h-28 relative overflow-hidden pointer-events-none opacity-80">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
