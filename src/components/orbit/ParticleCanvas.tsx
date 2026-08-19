import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  o: number;
  hue: number;
}

export function ParticleCanvas({
  className,
  count = 60,
  color = "ember",
}: {
  className?: string;
  count?: number;
  color?: "ember" | "gold" | "mixed";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // init particles
    const rect = canvas.getBoundingClientRect();
    const hues =
      color === "ember" ? [28, 35] : color === "gold" ? [40, 50] : [28, 35, 45, 300];
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.25 + 0.05),
      r: Math.random() * 1.8 + 0.4,
      o: Math.random() * 0.5 + 0.15,
      hue: hues[Math.floor(Math.random() * hues.length)],
    }));

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(0.82 0.13 ${p.hue} / ${p.o})`;
        ctx.fill();

        // glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(0.82 0.13 ${p.hue} / ${p.o * 0.15})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, color]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
      aria-hidden
    />
  );
}
