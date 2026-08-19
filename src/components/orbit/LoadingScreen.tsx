import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LETTERS = "ORBIT".split("");

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 3500;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDoorsOpen(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Trail grows from 0% to 75% of the track width
  const trailPct = progress * 75;
  // Roll position sits at the leading edge of the trail
  const rollLeftPct = trailPct;
  // Roll shrinks as carpet unrolls
  const rollScale = 1 - progress * 0.5;
  const rollW = 30 * rollScale + 10;

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a0e28 0%, #0d0816 45%, #07040c 100%)", pointerEvents: "none" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2" style={{
          background: "radial-gradient(circle, rgba(180,30,20,0.08), transparent 60%)",
        }} />
      </div>

      {/* Scan lines */}
      <div className="orb-scanlines pointer-events-none absolute inset-0 opacity-10" />

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "linear-gradient(oklch(0.78 0.18 45 / 0.25) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 45 / 0.25) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      {/* HUD corners */}
      <div className="absolute left-5 top-5 h-6 w-6 border-t-2 border-l-2 border-ember/25" />
      <div className="absolute right-5 top-5 h-6 w-6 border-t-2 border-r-2 border-ember/25" />
      <div className="absolute bottom-5 left-5 h-6 w-6 border-b-2 border-l-2 border-ember/25" />
      <div className="absolute right-5 bottom-5 h-6 w-6 border-b-2 border-r-2 border-ember/25" />

      {/* ═══ SCENE — centered, simple ═══ */}
      <div className="relative mb-12 w-[80vw] max-w-[480px]" style={{ height: 140 }}>

        {/* ── Floor track — thin horizontal rail ── */}
        <div className="absolute bottom-[48px] left-0 right-0" style={{
          height: 6,
          background: "linear-gradient(90deg, oklch(0.2 0.02 280 / 0.3), oklch(0.22 0.02 280 / 0.4) 50%, oklch(0.2 0.02 280 / 0.3))",
          borderRadius: 3,
          boxShadow: "0 1px 4px oklch(0 0 0 / 0.2)",
        }} />

        {/* ── Carpet trail — flat on the track ── */}
        <div className="absolute bottom-[44px] left-0" style={{
          width: `${trailPct}%`,
          height: 40,
          borderRadius: "2px 2px 3px 3px",
          transition: "width 0.05s linear",
          /* Base fabric color with weave texture */
          background: `
            linear-gradient(180deg,
              oklch(0.50 0.19 15) 0%,
              oklch(0.46 0.18 16) 25%,
              oklch(0.53 0.21 14) 50%,
              oklch(0.48 0.19 15) 75%,
              oklch(0.42 0.17 17) 100%
            )
          `,
          boxShadow: `
            0 4px 14px oklch(0.3 0.08 15 / 0.3),
            0 1px 4px oklch(0 0 0 / 0.2),
            inset 0 1px 0 oklch(0.7 0.12 15 / 0.1),
            inset 0 -2px 4px oklch(0.2 0.06 15 / 0.2)
          `,
        }}>
          {/* Horizontal weave threads */}
          <div className="absolute inset-0 opacity-[0.14]" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 1px, oklch(0.7 0.12 15 / 0.35) 1px, oklch(0.7 0.12 15 / 0.35) 2px)",
            borderRadius: "inherit",
          }} />
          {/* Vertical weave threads */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 3px, oklch(0.3 0.08 15 / 0.3) 3px, oklch(0.3 0.08 15 / 0.3) 4px)",
            borderRadius: "inherit",
          }} />
          {/* Gold trim top */}
          <div className="absolute left-[3%] right-[3%] top-[2px] h-[1.5px]" style={{
            background: "linear-gradient(90deg, oklch(0.65 0.14 82 / 0.25), oklch(0.85 0.14 80 / 0.55) 50%, oklch(0.65 0.14 82 / 0.25))",
          }} />
          {/* Gold trim bottom */}
          <div className="absolute bottom-[2px] left-[3%] right-[3%] h-[1.5px]" style={{
            background: "linear-gradient(90deg, oklch(0.65 0.14 82 / 0.25), oklch(0.85 0.14 80 / 0.55) 50%, oklch(0.65 0.14 82 / 0.25))",
          }} />
          {/* Diamond motifs */}
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-around px-[8%] opacity-20">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-2.5 w-2.5 rotate-45 border border-gold/35" style={{
                opacity: progress > (i + 1) * 0.14 ? 1 : 0,
                transition: "opacity 0.4s ease",
              }} />
            ))}
          </div>
          {/* Shading overlay */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, oklch(0.6 0.1 15 / 0.06) 0%, transparent 25%, transparent 70%, oklch(0 0 0 / 0.1) 100%)",
            borderRadius: "inherit",
          }} />
        </div>

        {/* ── Carpet roll — sitting on the track at the leading edge ── */}
        {progress > 0.005 && progress < 0.96 && (
          <div className="absolute" style={{
            left: `${rollLeftPct}%`,
            bottom: "52px",
            transform: "translateX(-50%)",
          }}>
            <div style={{ filter: `drop-shadow(0 6px 12px oklch(0.3 0.08 15 / 0.3))` }}>
              <div className="relative overflow-hidden rounded-full" style={{
                width: rollW,
                height: 42 * rollScale + 8,
              }}>
                {/* Base fabric */}
                <div className="absolute inset-0 rounded-full" style={{
                  background: `linear-gradient(90deg,
                    oklch(0.26 0.07 20) 0%,
                    oklch(0.40 0.13 18) 12%,
                    oklch(0.54 0.18 16) 30%,
                    oklch(0.60 0.20 15) 45%,
                    oklch(0.55 0.18 16) 58%,
                    oklch(0.45 0.14 18) 72%,
                    oklch(0.33 0.09 20) 88%,
                    oklch(0.22 0.05 22) 100%
                  )`,
                  boxShadow: `
                    inset 0 -5px 10px oklch(0 0 0 / 0.25),
                    inset 0 4px 6px oklch(0.7 0.1 15 / 0.07),
                    inset 3px 0 6px oklch(0 0 0 / 0.12),
                    inset -3px 0 6px oklch(0 0 0 / 0.12)
                  `,
                }} />
                {/* Weave on roll */}
                <div className="absolute inset-0 rounded-full opacity-[0.08]" style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 1px, oklch(0.7 0.1 15 / 0.25) 1px, oklch(0.7 0.1 15 / 0.25) 2px), repeating-linear-gradient(90deg, transparent 0px, transparent 2px, oklch(0.3 0.06 15 / 0.2) 2px, oklch(0.3 0.06 15 / 0.2) 3px)",
                }} />
                {/* Soft specular */}
                <div className="absolute left-[15%] right-[15%] top-[4px] h-[2px] rounded-full" style={{
                  background: "linear-gradient(90deg, transparent, oklch(0.8 0.1 15 / 0.08) 30%, oklch(0.85 0.1 15 / 0.1) 50%, oklch(0.8 0.1 15 / 0.08) 70%, transparent)",
                }} />
                {/* Left end cap */}
                <div className="absolute inset-y-[4px] left-0 w-[7px] rounded-l-full" style={{
                  background: "linear-gradient(180deg, oklch(0.22 0.05 22 / 0.4) 0%, oklch(0.42 0.11 18 / 0.35) 50%, oklch(0.22 0.05 22 / 0.4) 100%)",
                  boxShadow: "inset 1px 0 2px oklch(0 0 0 / 0.2)",
                }} />
                {/* Right end cap */}
                <div className="absolute inset-y-[4px] right-0 w-[7px] rounded-r-full" style={{
                  background: "linear-gradient(180deg, oklch(0.22 0.05 22 / 0.4) 0%, oklch(0.42 0.11 18 / 0.35) 50%, oklch(0.22 0.05 22 / 0.4) 100%)",
                  boxShadow: "inset -1px 0 2px oklch(0 0 0 / 0.2)",
                }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Double doors — at the right end of the track ── */}
        <div className="absolute bottom-[42px] right-[2%]" style={{ perspective: "400px" }}>
          <div className="relative" style={{ width: 64, height: 100 }}>
            {/* Frame — dark wood */}
            <div className="absolute inset-0 rounded-t-sm" style={{
              background: "linear-gradient(180deg, oklch(0.16 0.03 30) 0%, oklch(0.12 0.02 30) 100%)",
              border: "2px solid oklch(0.22 0.03 30)",
              borderBottom: "none",
              boxShadow: "inset 0 1px 0 oklch(0.3 0.04 30 / 0.2), 0 4px 16px oklch(0 0 0 / 0.35)",
            }}>
              {/* Frame wood grain */}
              <div className="absolute inset-0 opacity-[0.06]" style={{
                backgroundImage: "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, oklch(0.4 0.04 30) 3px, oklch(0.4 0.04 30) 4px)",
              }} />
            </div>

            {/* Left door */}
            <div className="absolute bottom-0 left-[4px] origin-left" style={{
              width: "calc(50% - 5px)",
              height: "calc(100% - 2px)",
              transform: doorsOpen ? "rotateY(-75deg)" : "rotateY(0deg)",
              transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
            }}>
              <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, oklch(0.20 0.03 28) 0%, oklch(0.18 0.025 28) 40%, oklch(0.22 0.03 28) 70%, oklch(0.16 0.025 28) 100%)",
                borderTopLeftRadius: 3,
                boxShadow: "inset 2px 0 5px oklch(0 0 0 / 0.2), inset 0 2px 3px oklch(0.35 0.04 30 / 0.05), inset 0 -3px 5px oklch(0 0 0 / 0.15)",
              }}>
                {/* Wood grain */}
                <div className="absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: "repeating-linear-gradient(178deg, transparent 0px, transparent 5px, oklch(0.35 0.04 25 / 0.3) 5px, oklch(0.35 0.04 25 / 0.3) 6px)",
                  borderRadius: "inherit",
                }} />
                {/* Upper panel — recessed */}
                <div className="absolute left-[5px] right-[5px] top-[10px]" style={{ height: "35%" }}>
                  <div className="h-full rounded-[2px]" style={{
                    background: "linear-gradient(180deg, oklch(0.13 0.02 28) 0%, oklch(0.15 0.02 28) 100%)",
                    boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.4), inset 2px 0 3px oklch(0 0 0 / 0.2), inset -1px 0 2px oklch(0 0 0 / 0.12), 0 1px 0 oklch(0.3 0.04 30 / 0.05)",
                  }} />
                </div>
                {/* Lower panel */}
                <div className="absolute left-[5px] right-[5px] bottom-[8px]" style={{ height: "35%" }}>
                  <div className="h-full rounded-[2px]" style={{
                    background: "linear-gradient(180deg, oklch(0.12 0.02 28) 0%, oklch(0.14 0.02 28) 100%)",
                    boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.4), inset 2px 0 3px oklch(0 0 0 / 0.2), inset -1px 0 2px oklch(0 0 0 / 0.12)",
                  }} />
                </div>
                {/* Brass knob */}
                <div className="absolute right-[6px] top-1/2 -translate-y-1/2" style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, oklch(0.82 0.16 82 / 0.85), oklch(0.6 0.12 75) 40%, oklch(0.4 0.08 60) 80%)",
                  boxShadow: "0 1px 2px oklch(0 0 0 / 0.35), inset 0 1px 1px oklch(1 0 0 / 0.2)",
                }} />
              </div>
            </div>

            {/* Right door */}
            <div className="absolute bottom-0 right-[4px] origin-right" style={{
              width: "calc(50% - 5px)",
              height: "calc(100% - 2px)",
              transform: doorsOpen ? "rotateY(75deg)" : "rotateY(0deg)",
              transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
            }}>
              <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, oklch(0.19 0.03 28) 0%, oklch(0.17 0.025 28) 40%, oklch(0.21 0.03 28) 70%, oklch(0.15 0.025 28) 100%)",
                borderTopRightRadius: 3,
                boxShadow: "inset -2px 0 5px oklch(0 0 0 / 0.2), inset 0 2px 3px oklch(0.35 0.04 30 / 0.05), inset 0 -3px 5px oklch(0 0 0 / 0.15)",
              }}>
                <div className="absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: "repeating-linear-gradient(178deg, transparent 0px, transparent 5px, oklch(0.35 0.04 25 / 0.3) 5px, oklch(0.35 0.04 25 / 0.3) 6px)",
                  borderRadius: "inherit",
                }} />
                <div className="absolute left-[5px] right-[5px] top-[10px]" style={{ height: "35%" }}>
                  <div className="h-full rounded-[2px]" style={{
                    background: "linear-gradient(180deg, oklch(0.12 0.02 28) 0%, oklch(0.14 0.02 28) 100%)",
                    boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.4), inset -2px 0 3px oklch(0 0 0 / 0.2), inset 1px 0 2px oklch(0 0 0 / 0.12)",
                  }} />
                </div>
                <div className="absolute left-[5px] right-[5px] bottom-[8px]" style={{ height: "35%" }}>
                  <div className="h-full rounded-[2px]" style={{
                    background: "linear-gradient(180deg, oklch(0.11 0.02 28) 0%, oklch(0.13 0.02 28) 100%)",
                    boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.4), inset -2px 0 3px oklch(0 0 0 / 0.2), inset 1px 0 2px oklch(0 0 0 / 0.12)",
                  }} />
                </div>
                <div className="absolute left-[6px] top-1/2 -translate-y-1/2" style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, oklch(0.82 0.16 82 / 0.85), oklch(0.6 0.12 75) 40%, oklch(0.4 0.08 60) 80%)",
                  boxShadow: "0 1px 2px oklch(0 0 0 / 0.35), inset 0 1px 1px oklch(1 0 0 / 0.2)",
                }} />
              </div>
            </div>

            {/* Light spill when doors open */}
            <div className="absolute -left-5 bottom-0 -z-10" style={{
              width: 80, height: 110,
              background: "radial-gradient(ellipse at 50% 80%, oklch(0.88 0.12 55 / 0.25), transparent 65%)",
              filter: "blur(12px)",
              opacity: doorsOpen ? 1 : 0,
              transition: "opacity 0.8s ease 0.3s",
            }} />

            {/* Door ground shadow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2" style={{
              width: 80, height: 8,
              background: "radial-gradient(ellipse at 50% 0%, oklch(0 0 0 / 0.2), transparent 70%)",
              filter: "blur(3px)",
            }} />
          </div>
        </div>

        {/* Carpet ground shadow */}
        <div className="absolute bottom-[40px] left-0" style={{
          width: `${trailPct}%`,
          height: 8,
          background: "radial-gradient(ellipse at 50% 0%, oklch(0 0 0 / 0.15), transparent 70%)",
          filter: "blur(3px)",
        }} />
      </div>

      {/* ═══ ORBIT Wordmark ═══ */}
      <div className="flex overflow-hidden">
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ y: 50, opacity: 0, rotateX: -40 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl font-bold tracking-[0.14em] text-white sm:text-6xl"
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Tagline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="mt-4">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.45em] text-white/40">
          <span className="orb-hud-blink h-1 w-1 rounded-full bg-ember" />
          Event management portal
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full" style={{
          width: `${progress * 100}%`,
          background: "linear-gradient(90deg, oklch(0.55 0.2 18), oklch(0.65 0.24 15), oklch(0.78 0.18 45))",
          boxShadow: "0 0 12px oklch(0.65 0.22 18 / 0.5), 0 0 24px -4px oklch(0.78 0.18 45 / 0.3)",
        }} />
      </div>

      {/* Loading dots */}
      <div className="mt-4 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1 w-1 rounded-full orb-pulse-dot" style={{
            background: "oklch(0.65 0.22 18)", animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </motion.div>
  );
}
