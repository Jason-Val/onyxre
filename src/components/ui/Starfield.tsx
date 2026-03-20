'use client';

import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Star properties
    const stars: { 
      x: number; 
      y: number; 
      radius: number; 
      vx: number; 
      vy: number; 
      alpha: number; 
      dAlpha: number;
      isCyan: boolean;
    }[] = [];
    
    const numStars = 150; // Adjust density here

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.2, // Subtle drifting
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random(),
        dAlpha: (Math.random() - 0.5) * 0.02, // Blinking speed
        isCyan: Math.random() > 0.8 // 20% of stars have the brand cyan tint
      });
    }

    const draw = () => {
      // Clear the canvas cleanly
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        // Move star
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Blink effect (pulsing alpha)
        star.alpha += star.dAlpha;
        if (star.alpha <= 0.1 || star.alpha >= 1) {
          star.dAlpha = -star.dAlpha;
        }

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        if (star.isCyan) {
          ctx.fillStyle = `rgba(0, 209, 255, ${star.alpha})`; // Brand Cyan
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`; // White
        }
        
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-60 mix-blend-screen"
    />
  );
}
