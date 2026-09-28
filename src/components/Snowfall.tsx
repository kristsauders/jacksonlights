"use client";
import { useEffect, useRef } from 'react';

interface Flake {
  x: number;
  y: number;
  r: number;
  fallSpeed: number; // px/sec
  swaySpeed: number; // rad/sec
  swayAmp: number; // px
  phase: number;
  opacity: number;
}

const DESKTOP_COUNT = 60;
const MOBILE_COUNT = 26;
const MOBILE_BREAKPOINT = 640;
const MAX_DPR = 1.5; // more than this is wasted fill-rate for a soft background layer

function spawnFlake(width: number, height: number, atTop: boolean): Flake {
  return {
    x: Math.random() * width,
    y: atTop ? -10 - Math.random() * 40 : Math.random() * height,
    r: 1 + Math.random() * 2.2,
    fallSpeed: 16 + Math.random() * 26,
    swaySpeed: 0.4 + Math.random() * 0.8,
    swayAmp: 8 + Math.random() * 18,
    phase: Math.random() * Math.PI * 2,
    opacity: 0.18 + Math.random() * 0.42,
  };
}

/**
 * A quiet, fixed full-viewport snowfall behind all page content. Deliberately
 * simple — plain filled circles on canvas, no shadows/blur (expensive to
 * rasterize every frame), a small particle count, DPR capped, paused
 * whenever the tab isn't visible, and skipped entirely for
 * prefers-reduced-motion or a save-data connection.
 */
export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ((navigator as any).connection?.saveData) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let raf = 0;
    let running = true;
    let last = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < MOBILE_BREAKPOINT ? MOBILE_COUNT : DESKTOP_COUNT;
      flakes = Array.from({ length: count }, () => spawnFlake(width, height, false));
    }

    function frame(now: number) {
      if (!running) return;
      const dt = Math.min(now - last, 50) / 1000; // clamp so a backgrounded tab doesn't jump on return
      last = now;

      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = '#ffffff';
      for (const f of flakes) {
        f.y += f.fallSpeed * dt;
        f.phase += f.swaySpeed * dt;
        if (f.y - f.r > height) Object.assign(f, spawnFlake(width, height, true));
        const x = f.x + Math.sin(f.phase) * f.swayAmp;
        ctx!.globalAlpha = f.opacity;
        ctx!.beginPath();
        ctx!.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function handleVisibility() {
      running = !document.hidden;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    }

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />;
}
