import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TYPE_LABEL } from "@/lib/orbit";
import { fmtDate } from "@/lib/orbit";

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

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue = 0;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;
  return { h: hue * 360, s: s * 100, l: l * 100 };
}

interface EventArtProps {
  seed: string;
  accent: string;
  title?: string;
  tagline?: string;
  eventType?: "single" | "multi" | "round";
  startDate?: number;
  className?: string;
  showOrbit?: boolean;
}

/**
 * Generates a rich, poster-style visual for an event.
 * Renders the event title, type, date, and themed decorations.
 */
export function EventArt({
  seed,
  accent,
  title = "",
  tagline = "",
  eventType = "single",
  startDate,
  className,
  showOrbit = false,
}: EventArtProps) {
  const scene = useMemo(() => {
    const rnd = mulberry(hashSeed(seed));
    return {
      bgAngle: 120 + rnd() * 60,
      shapes: Array.from({ length: 6 }, () => ({
        type: ["circle", "rect", "diamond", "line"][Math.floor(rnd() * 4)] as string,
        x: rnd() * 100,
        y: rnd() * 100,
        size: 8 + rnd() * 40,
        rotation: rnd() * 360,
        opacity: 0.04 + rnd() * 0.1,
      })),
      gridLines: Math.floor(3 + rnd() * 5),
      gridAngle: -30 + rnd() * 60,
      cornerDecor: rnd() > 0.4,
      topBar: rnd() > 0.3,
    };
  }, [seed]);

  const hsl = hexToHSL(accent);
  const darkBg = `hsl(${hsl.h}, ${Math.min(hsl.s + 10, 40)}%, 8%)`;
  const midBg = `hsl(${hsl.h}, ${Math.min(hsl.s + 5, 35)}%, 12%)`;
  const label = eventType ? TYPE_LABEL[eventType] : "";
  const dateStr = startDate ? fmtDate(startDate) : "";

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${scene.bgAngle}deg, ${darkBg} 0%, ${midBg} 50%, ${darkBg} 100%)`,
        }}
      />

      {/* accent radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 25% 35%, ${accent}33 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, ${accent}22 0%, transparent 45%)`,
        }}
      />

      {/* diagonal grid pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden>
        {Array.from({ length: scene.gridLines }, (_, i) => {
          const offset = (i + 1) * (100 / (scene.gridLines + 1));
          return (
            <line
              key={i}
              x1={`${offset}%`}
              y1="0"
              x2={`${offset - 15}%`}
              y2="100%"
              stroke={accent}
              strokeWidth="0.5"
              transform={`rotate(${scene.gridAngle} 50 50)`}
            />
          );
        })}
      </svg>

      {/* decorative shapes */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        {scene.shapes.map((s, i) => {
          if (s.type === "circle") {
            return (
              <circle
                key={i}
                cx={`${s.x}%`}
                cy={`${s.y}%`}
                r={s.size / 2}
                fill="none"
                stroke={accent}
                strokeWidth="0.5"
                opacity={s.opacity}
              />
            );
          }
          if (s.type === "rect") {
            return (
              <rect
                key={i}
                x={`${s.x - s.size / 2}%`}
                y={`${s.y - s.size / 2}%`}
                width={`${s.size}%`}
                height={`${s.size * 0.6}%`}
                fill="none"
                stroke={accent}
                strokeWidth="0.5"
                opacity={s.opacity}
                transform={`rotate(${s.rotation} ${s.x} ${s.y})`}
                rx="2"
              />
            );
          }
          if (s.type === "diamond") {
            return (
              <polygon
                key={i}
                points={`${s.x},${s.y - s.size / 3} ${s.x + s.size / 4},${s.y} ${s.x},${s.y + s.size / 3} ${s.x - s.size / 4},${s.y}`}
                fill="none"
                stroke={accent}
                strokeWidth="0.5"
                opacity={s.opacity}
              />
            );
          }
          // line
          return (
            <line
              key={i}
              x1={`${s.x}%`}
              y1={`${s.y}%`}
              x2={`${s.x + s.size * 0.5}%`}
              y2={`${s.y + s.size * 0.3}%`}
              stroke={accent}
              strokeWidth="0.5"
              opacity={s.opacity}
            />
          );
        })}
      </svg>

      {/* corner brackets */}
      {scene.cornerDecor && (
        <>
          <div className="absolute left-3 top-3 h-8 w-8 border-t-2 border-l-2" style={{ borderColor: `${accent}44` }} />
          <div className="absolute right-3 top-3 h-8 w-8 border-t-2 border-r-2" style={{ borderColor: `${accent}44` }} />
          <div className="absolute bottom-3 left-3 h-8 w-8 border-b-2 border-l-2" style={{ borderColor: `${accent}44` }} />
          <div className="absolute bottom-3 right-3 h-8 w-8 border-b-2 border-r-2" style={{ borderColor: `${accent}44` }} />
        </>
      )}

      {/* top bar with type + date */}
      {scene.topBar && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3">
          {label && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
              style={{
                color: accent,
                background: `${accent}18`,
                border: `1px solid ${accent}40`,
              }}
            >
              {label}
            </span>
          )}
          {dateStr && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/45">
              {dateStr}
            </span>
          )}
        </div>
      )}

      {/* title text at bottom — large, bold */}
      {title && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 pt-16">
          <p
            className="font-display text-xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-2xl"
            style={{ textShadow: `0 0 30px ${accent}44` }}
          >
            {title}
          </p>
          {tagline && (
            <p className="mt-1 max-w-[85%] truncate text-[11px] text-white/60">
              {tagline}
            </p>
          )}
          <div className="mt-2 h-px w-full" style={{ background: `linear-gradient(to right, ${accent}88, transparent)` }} />
        </div>
      )}

      {/* orbit decoration (optional, for landing page art panel) */}
      {showOrbit && (
        <div className="absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="orb-spin-slow absolute inset-0 rounded-full border border-dashed"
            style={{ borderColor: `${accent}30`, animationDuration: "40s" }}
          />
          <div
            className="orb-spin-slow absolute inset-[15%] rounded-full border"
            style={{ borderColor: `${accent}18`, animationDuration: "28s", animationDirection: "reverse" }}
          />
          <div className="orb-spin-slow absolute inset-0" style={{ animationDuration: "16s" }}>
            <span
              className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: accent, boxShadow: `0 0 12px 4px ${accent}88` }}
            />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="h-16 w-16 rounded-full blur-lg"
              style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)` }}
            />
          </div>
        </div>
      )}

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_30%,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
