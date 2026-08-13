import { useMemo } from "react";
import { cn } from "@/lib/utils";

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry(seed: number) {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

type ArtScene = {
  blobs: { x: number; y: number; r: number; o: number }[];
  rings: { cx: number; cy: number; rx: number; ry: number; o: number; sw: number }[];
  stars: { x: number; y: number; r: number; o: number }[];
  core: { x: number; y: number; r: number };
  orbit: { x: number; y: number; r: number; speed: number; reverse: boolean };
};

function buildScene(seed: string): ArtScene {
  const rnd = mulberry(hashSeed(seed));
  const blobs = Array.from({ length: 4 }, () => ({
    x: 15 + rnd() * 70,
    y: 15 + rnd() * 70,
    r: 22 + rnd() * 30,
    o: 0.18 + rnd() * 0.22,
  }));
  const rings = Array.from({ length: 3 }, () => ({
    cx: 30 + rnd() * 40,
    cy: 35 + rnd() * 35,
    rx: 20 + rnd() * 34,
    ry: 12 + rnd() * 22,
    o: 0.22 + rnd() * 0.3,
    sw: 0.6 + rnd() * 0.9,
  }));
  const stars = Array.from({ length: 26 }, () => ({
    x: rnd() * 100,
    y: rnd() * 100,
    r: 0.4 + rnd() * 1.1,
    o: 0.25 + rnd() * 0.6,
  }));
  const core = {
    x: 32 + rnd() * 36,
    y: 32 + rnd() * 36,
    r: 7 + rnd() * 5,
  };
  return {
    blobs,
    rings,
    stars,
    core,
    orbit: { x: core.x, y: core.y, r: 16 + rnd() * 10, speed: 18 + rnd() * 16, reverse: rnd() > 0.5 },
  };
}

/**
 * Deterministic procedural cover art for an event — every event id renders a
 * unique themed scene: aurora glows, orbit rings, a starfield and a glowing
 * core in the event's accent color.
 */
export function EventArt({
  seed,
  accent,
  className,
  showOrbit = true,
}: {
  seed: string;
  accent: string;
  className?: string;
  showOrbit?: boolean;
}) {
  const scene = useMemo(() => buildScene(seed), [seed]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* base */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, #191228 0%, #120d1e 55%, #0d0916 100%)`,
        }}
      />
      {/* accent wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(90% 70% at 70% 12%, ${hexToRgba(accent, 0.14)}, transparent 65%)`,
        }}
      />

      {/* svg scene */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id={`core-${seed}`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor={hexToRgba(accent, 0.9)} />
            <stop offset="55%" stopColor={hexToRgba(accent, 0.45)} />
            <stop offset="100%" stopColor={hexToRgba(accent, 0)} />
          </radialGradient>
        </defs>

        {scene.blobs.map((b, i) => (
          <circle
            key={`b${i}`}
            cx={b.x}
            cy={b.y}
            r={b.r}
            fill={hexToRgba(accent, b.o)}
            style={{ filter: "blur(6px)" }}
          />
        ))}

        {scene.stars.map((s, i) => (
          <circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} fill="rgba(255,255,255,0.7)" opacity={s.o} />
        ))}

        {scene.rings.map((r, i) => (
          <ellipse
            key={`r${i}`}
            cx={r.cx}
            cy={r.cy}
            rx={r.rx}
            ry={r.ry}
            fill="none"
            stroke={hexToRgba(accent, r.o)}
            strokeWidth={r.sw}
            transform={`rotate(${(i * 47 + 12) % 360} ${r.cx} ${r.cy})`}
          />
        ))}

        <circle
          cx={scene.core.x}
          cy={scene.core.y}
          r={scene.core.r * 3.4}
          fill={`url(#core-${seed})`}
        />
        <circle
          cx={scene.core.x}
          cy={scene.core.y}
          r={scene.core.r}
          fill={hexToRgba(accent, 0.85)}
        />
        <circle
          cx={scene.core.x}
          cy={scene.core.y}
          r={scene.core.r * 0.45}
          fill="rgba(255,255,255,0.85)"
        />
      </svg>

      {/* animated orbit */}
      {showOrbit && (
        <div
          className="orb-spin-slow absolute"
          style={{
            left: `${scene.orbit.x}%`,
            top: `${scene.orbit.y}%`,
            width: scene.orbit.r * 2,
            height: scene.orbit.r * 2,
            transform: "translate(-50%, -50%)",
            animationDuration: `${scene.orbit.speed}s`,
            animationDirection: scene.orbit.reverse ? "reverse" : "normal",
          }}
        >
          <div
            className="absolute inset-0 rounded-full border border-dashed"
            style={{ borderColor: hexToRgba(accent, 0.35) }}
          />
          <span
            className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: hexToRgba(accent, 0.9), boxShadow: `0 0 8px 2px ${hexToRgba(accent, 0.5)}` }}
          />
        </div>
      )}

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_30%,transparent_55%,rgba(5,3,10,0.55)_100%)]" />
    </div>
  );
}
