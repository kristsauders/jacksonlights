"use client";
import { useEffect, useRef, useState } from 'react';

interface Props { audioSelector?: string; }

// Cache a single MediaElementSource per element (browser limitation)
const elementSourceMap: WeakMap<HTMLMediaElement, { ctx: AudioContext; analyser: AnalyserNode }> = new WeakMap();

export default function AudioVisualizer({ audioSelector = '#show-audio-element' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audioEl = document.querySelector<HTMLAudioElement>(audioSelector);
    if (!audioEl) return;
    if (!window.AudioContext) { setEnabled(false); return; }

    let entry = elementSourceMap.get(audioEl);
    let ctx: AudioContext;
    let analyser: AnalyserNode;
    if (entry) {
      ctx = entry.ctx;
      analyser = entry.analyser;
    } else {
      ctx = new AudioContext();
      const src = ctx.createMediaElementSource(audioEl);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      elementSourceMap.set(audioEl, { ctx, analyser });
    }

    // Resume context on user interaction if suspended (auto-play policies)
  const resume = () => { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); };
  const onPlay = () => { resume(); setIsPlaying(true); };
  const onPause = () => setIsPlaying(false);
  audioEl.addEventListener('play', onPlay);
  audioEl.addEventListener('pause', onPause);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext('2d');
    if (!c) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    }
    resize();
    window.addEventListener('resize', resize);

    let raf: number;
    function draw() {
      raf = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      if (!canvas || !c) return;
      c.clearRect(0,0,canvas.width,canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.6;
      for (let i=0; i<bufferLength; i++) {
        const val = dataArray[i];
        const h = (val / 255) * canvas.height * 0.9;
        const x = i * barWidth;
        const y = canvas.height - h;
        const grd = c.createLinearGradient(x, y, x, canvas.height);
        grd.addColorStop(0, '#E2C044');
        grd.addColorStop(1, '#BF2C31');
        c.fillStyle = grd;
        c.fillRect(x, y, barWidth * 0.8, h);
      }
    }
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
  audioEl.removeEventListener('play', onPlay);
  audioEl.removeEventListener('pause', onPause);
      // Don't close context; reused elsewhere.
    };
  }, [audioSelector]);

  if (!enabled) return null;
//   if (!isPlaying) return <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400" aria-live="polite">Press play to visualize audio.</p>;
  return (
    <div className="mt-3 h-24 rounded-md bg-neutral-200 dark:bg-neutral-800 overflow-hidden relative" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_60%)]" />
    </div>
  );
}
