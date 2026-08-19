import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LETTERS = "ORBIT".split("");

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 3800;
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

  // Carpet trail goes from 0% to ~85% of the track height
  const trailPct = progress * 85;

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a0e28 0%, #0d0816 45%, #07040c 100%)" }}
    >
      {/* Ambient overhead light — warm cone from above */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{
          width: "80%", height: "60%",
          background: "radial-gradient(ellipse at 50% 0%, oklch(0.85 0.1 55 / 0.07), transparent 55%)",
        }} />
      </div>

      <div className="orb-scanlines pointer-events-none absolute inset-0 opacity-10" />

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "linear-gradient(oklch(0.78 0.18 45 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 45 / 0.3) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      {/* HUD corners */}
      <div className="absolute left-5 top-5 h-6 w-6 border-t-2 border-l-2 border-ember/25" />
      <div className="absolute right-5 top-5 h-6 w-6 border-t-2 border-r-2 border-ember/25" />
      <div className="absolute bottom-5 left-5 h-6 w-6 border-b-2 border-l-2 border-ember/25" />
      <div className="absolute right-5 bottom-5 h-6 w-6 border-b-2 border-r-2 border-ember/25" />

      {/* ═══ 3D PERSPECTIVE SCENE ═══ */}
      {/* The scene uses CSS perspective with a rotated floor plane.
          Doors are at the far end (top, small), carpet unrolls toward viewer (bottom, large). */}
      <div className="relative mb-16 w-full" style={{ height: "46vh", maxHeight: 380, perspective: "700px", perspectiveOrigin: "50% 30%" }}>
        {/* The floor plane — rotated to recede into distance */}
        <div className="absolute inset-0" style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(62deg)",
          transformOrigin: "50% 0%",
        }}>

          {/* Floor surface — subtle reflective ground */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{
            width: "90%", height: "110%",
            background: "linear-gradient(180deg, oklch(0.15 0.02 280 / 0.25) 0%, oklch(0.18 0.02 280 / 0.15) 50%, oklch(0.12 0.015 280 / 0.1) 100%)",
            borderRadius: 4,
          }} />

          {/* ═══ CARPET TRAIL — recedes from far (top) to near (bottom) ═══ */}
          <div className="absolute top-0 left-1/2" style={{
            transform: "translateX(-50%)",
            width: "38%",
            height: `${trailPct}%`,
            minHeight: progress > 0.01 ? 8 : 0,
            transition: "height 0.1s linear",
          }}>
            {/* The actual carpet trail */}
            <div className="absolute inset-0" style={{
              borderRadius: "3px 3px 4px 4px",
              /* FABRIC TEXTURE — layered gradients for plush pile */
              background: `
                /* Base rich crimson fabric */
                linear-gradient(180deg,
                  oklch(0.50 0.19 15) 0%,
                  oklch(0.47 0.18 16) 20%,
                  oklch(0.53 0.21 14) 40%,
                  oklch(0.49 0.19 15) 60%,
                  oklch(0.44 0.17 17) 80%,
                  oklch(0.40 0.15 19) 100%
                )
              `,
              boxShadow: `
                /* Soft ambient shadow under carpet */
                0 8px 24px oklch(0.3 0.08 15 / 0.3),
                /* Contact shadow */
                0 2px 6px oklch(0 0 0 / 0.2),
                /* Top highlight — fabric catch light */
                inset 0 1px 0 oklch(0.75 0.12 15 / 0.12),
                /* Bottom darkening — pile shadow */
                inset 0 -3px 6px oklch(0.2 0.06 15 / 0.25),
                /* Side darkening */
                inset 2px 0 6px oklch(0 0 0 / 0.08),
                inset -2px 0 6px oklch(0 0 0 / 0.08)
              `,
            }}>
              {/* Horizontal weave threads */}
              <div className="absolute inset-0 opacity-[0.15]" style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 1px, oklch(0.7 0.12 15 / 0.35) 1px, oklch(0.7 0.12 15 / 0.35) 2px)",
                borderRadius: "inherit",
              }} />
              {/* Vertical weave threads — cross-hatch */}
              <div className="absolute inset-0 opacity-[0.08]" style={{
                backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 3px, oklch(0.3 0.08 15 / 0.35) 3px, oklch(0.3 0.08 15 / 0.35) 4px)",
                borderRadius: "inherit",
              }} />
              {/* Pile tuft texture — subtle dots */}
              <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: "radial-gradient(circle 1px at 25% 25%, oklch(0.8 0.1 15 / 0.5), transparent 100%), radial-gradient(circle 1px at 75% 35%, oklch(0.75 0.1 15 / 0.4), transparent 100%), radial-gradient(circle 1px at 50% 65%, oklch(0.8 0.1 15 / 0.3), transparent 100%)",
                backgroundSize: "10px 8px",
                borderRadius: "inherit",
              }} />
              {/* Top edge highlight */}
              <div className="absolute left-[4%] right-[4%] top-[3px] h-[2px]" style={{
                background: "linear-gradient(90deg, oklch(0.65 0.14 82 / 0.25), oklch(0.85 0.14 80 / 0.6) 50%, oklch(0.65 0.14 82 / 0.25))",
                boxShadow: "0 1px 2px oklch(0 0 0 / 0.15)",
              }} />
              {/* Bottom edge highlight */}
              <div className="absolute bottom-[3px] left-[4%] right-[4%] h-[2px]" style={{
                background: "linear-gradient(90deg, oklch(0.65 0.14 82 / 0.25), oklch(0.85 0.14 80 / 0.6) 50%, oklch(0.65 0.14 82 / 0.25))",
                boxShadow: "0 1px 2px oklch(0 0 0 / 0.15)",
              }} />
              {/* Diamond motifs — embroidered */}
              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-around px-[12%] opacity-20">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-2.5 w-2.5 rotate-45 border border-gold/40" style={{
                    opacity: progress > (i + 1) * 0.14 ? 1 : 0,
                    transition: "opacity 0.4s ease",
                    boxShadow: "inset 0 0 2px oklch(0.82 0.16 82 / 0.15)",
                  }} />
                ))}
              </div>
              {/* 3D shading overlay */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, oklch(0.6 0.1 15 / 0.06) 0%, transparent 20%, transparent 75%, oklch(0 0 0 / 0.12) 100%)",
                borderRadius: "inherit",
              }} />
            </div>

            {/* Ground contact shadow */}
            <div className="absolute -bottom-2 left-[-15%] right-[-15%] h-5" style={{
              background: "radial-gradient(ellipse at 50% 0%, oklch(0 0 0 / 0.2), transparent 70%)",
              filter: "blur(3px)",
            }} />
          </div>

          {/* ═══ CARPET ROLL — at the leading edge, receding ═══ */}
          {progress > 0.01 && progress < 0.97 && (
            <div className="absolute left-1/2" style={{
              top: `${trailPct}%`,
              transform: "translateX(-50%)",
              zIndex: 10,
            }}>
              <div style={{
                filter: `drop-shadow(0 10px 20px oklch(0.3 0.08 15 / 0.35))`,
              }}>
                {/* Cylindrical roll */}
                <div className="relative overflow-hidden rounded-full" style={{
                  width: 32 * (1 - progress * 0.4) + 14,
                  height: 44 * (1 - progress * 0.3) + 10,
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
                      inset 0 -5px 10px oklch(0 0 0 / 0.3),
                      inset 0 4px 6px oklch(0.7 0.1 15 / 0.08),
                      inset 3px 0 6px oklch(0 0 0 / 0.15),
                      inset -3px 0 6px oklch(0 0 0 / 0.15)
                    `,
                  }} />
                  {/* Weave on roll */}
                  <div className="absolute inset-0 rounded-full opacity-[0.1]" style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 1px, oklch(0.7 0.1 15 / 0.3) 1px, oklch(0.7 0.1 15 / 0.3) 2px), repeating-linear-gradient(90deg, transparent 0px, transparent 2px, oklch(0.3 0.06 15 / 0.25) 2px, oklch(0.3 0.06 15 / 0.25) 3px)",
                  }} />
                  {/* Specular — soft fabric sheen */}
                  <div className="absolute left-[15%] right-[15%] top-[5px] h-[3px] rounded-full" style={{
                    background: "linear-gradient(90deg, transparent, oklch(0.8 0.1 15 / 0.1) 30%, oklch(0.85 0.1 15 / 0.12) 50%, oklch(0.8 0.1 15 / 0.1) 70%, transparent)",
                  }} />
                  {/* End caps */}
                  <div className="absolute inset-y-[5px] left-0 w-[8px] rounded-l-full" style={{
                    background: "linear-gradient(180deg, oklch(0.22 0.05 22 / 0.5) 0%, oklch(0.42 0.11 18 / 0.4) 50%, oklch(0.22 0.05 22 / 0.5) 100%)",
                    boxShadow: "inset 1px 0 2px oklch(0 0 0 / 0.25)",
                  }} />
                  <div className="absolute inset-y-[5px] right-0 w-[8px] rounded-r-full" style={{
                    background: "linear-gradient(180deg, oklch(0.22 0.05 22 / 0.5) 0%, oklch(0.42 0.11 18 / 0.4) 50%, oklch(0.22 0.05 22 / 0.5) 100%)",
                    boxShadow: "inset -1px 0 2px oklch(0 0 0 / 0.25)",
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* ═══ DOUBLE DOORS — at the far end (top of floor plane) ═══ */}
          <div className="absolute top-[-8px] left-1/2 -translate-x-1/2" style={{ perspective: "500px", perspectiveOrigin: "50% 100%" }}>
            <div className="relative" style={{ width: 72, height: 110 }}>
              {/* Frame — dark stained wood */}
              <div className="absolute inset-0 rounded-t-sm" style={{
                background: "linear-gradient(180deg, oklch(0.16 0.03 30) 0%, oklch(0.12 0.02 30) 100%)",
                border: "2px solid oklch(0.22 0.03 30)",
                borderBottom: "none",
                boxShadow: "inset 0 1px 0 oklch(0.3 0.04 30 / 0.25), 0 0 16px oklch(0 0 0 / 0.4), 0 6px 24px -4px oklch(0 0 0 / 0.5)",
              }}>
                <div className="absolute inset-0 opacity-[0.06]" style={{
                  backgroundImage: "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, oklch(0.4 0.04 30) 3px, oklch(0.4 0.04 30) 4px)",
                }} />
              </div>

              {/* Left door */}
              <div className="absolute bottom-0 left-[4px] origin-left" style={{
                width: "calc(50% - 5px)", height: "calc(100% - 2px)",
                transformStyle: "preserve-3d",
                transform: doorsOpen ? "rotateY(-75deg)" : "rotateY(0deg)",
                transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
              }}>
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(180deg, oklch(0.20 0.03 28) 0%, oklch(0.18 0.025 28) 30%, oklch(0.22 0.03 28) 60%, oklch(0.16 0.025 28) 100%)",
                  borderTopLeftRadius: 3,
                  boxShadow: "inset 2px 0 5px oklch(0 0 0 / 0.25), inset 0 2px 4px oklch(0.35 0.04 30 / 0.06), inset 0 -3px 6px oklch(0 0 0 / 0.2)",
                }}>
                  {/* Wood grain */}
                  <div className="absolute inset-0 opacity-[0.1]" style={{
                    backgroundImage: "repeating-linear-gradient(178deg, transparent 0px, transparent 5px, oklch(0.35 0.04 25 / 0.35) 5px, oklch(0.35 0.04 25 / 0.35) 6px), repeating-linear-gradient(182deg, transparent 0px, transparent 12px, oklch(0.3 0.03 25 / 0.2) 12px, oklch(0.3 0.03 25 / 0.2) 13px)",
                    borderRadius: "inherit",
                  }} />
                  {/* Upper panel — recessed */}
                  <div className="absolute left-[6px] right-[6px] top-[12px]" style={{ height: "36%" }}>
                    <div className="h-full rounded-[2px]" style={{
                      background: "linear-gradient(180deg, oklch(0.13 0.02 28) 0%, oklch(0.15 0.02 28) 100%)",
                      boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.45), inset 0 -1px 2px oklch(0.3 0.04 30 / 0.05), inset 2px 0 3px oklch(0 0 0 / 0.25), inset -1px 0 2px oklch(0 0 0 / 0.15), 0 1px 0 oklch(0.3 0.04 30 / 0.06)",
                    }} />
                  </div>
                  {/* Lower panel */}
                  <div className="absolute left-[6px] right-[6px] bottom-[10px]" style={{ height: "36%" }}>
                    <div className="h-full rounded-[2px]" style={{
                      background: "linear-gradient(180deg, oklch(0.12 0.02 28) 0%, oklch(0.14 0.02 28) 100%)",
                      boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.45), inset 0 -1px 2px oklch(0.3 0.04 30 / 0.05), inset 2px 0 3px oklch(0 0 0 / 0.25), inset -1px 0 2px oklch(0 0 0 / 0.15), 0 1px 0 oklch(0.3 0.04 30 / 0.06)",
                    }} />
                  </div>
                  {/* Brass knob */}
                  <div className="absolute right-[7px] top-1/2 -translate-y-1/2" style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, oklch(0.82 0.16 82 / 0.85), oklch(0.6 0.12 75) 40%, oklch(0.4 0.08 60) 80%)",
                    boxShadow: "0 1px 3px oklch(0 0 0 / 0.4), inset 0 1px 1px oklch(1 0 0 / 0.25)",
                  }} />
                </div>
              </div>

              {/* Right door */}
              <div className="absolute bottom-0 right-[4px] origin-right" style={{
                width: "calc(50% - 5px)", height: "calc(100% - 2px)",
                transformStyle: "preserve-3d",
                transform: doorsOpen ? "rotateY(75deg)" : "rotateY(0deg)",
                transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
              }}>
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(180deg, oklch(0.19 0.03 28) 0%, oklch(0.17 0.025 28) 30%, oklch(0.21 0.03 28) 60%, oklch(0.15 0.025 28) 100%)",
                  borderTopRightRadius: 3,
                  boxShadow: "inset -2px 0 5px oklch(0 0 0 / 0.25), inset 0 2px 4px oklch(0.35 0.04 30 / 0.06), inset 0 -3px 6px oklch(0 0 0 / 0.2)",
                }}>
                  <div className="absolute inset-0 opacity-[0.1]" style={{
                    backgroundImage: "repeating-linear-gradient(178deg, transparent 0px, transparent 5px, oklch(0.35 0.04 25 / 0.35) 5px, oklch(0.35 0.04 25 / 0.35) 6px), repeating-linear-gradient(182deg, transparent 0px, transparent 12px, oklch(0.3 0.03 25 / 0.2) 12px, oklch(0.3 0.03 25 / 0.2) 13px)",
                    borderRadius: "inherit",
                  }} />
                  <div className="absolute left-[6px] right-[6px] top-[12px]" style={{ height: "36%" }}>
                    <div className="h-full rounded-[2px]" style={{
                      background: "linear-gradient(180deg, oklch(0.12 0.02 28) 0%, oklch(0.14 0.02 28) 100%)",
                      boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.45), inset -2px 0 3px oklch(0 0 0 / 0.25), inset 1px 0 2px oklch(0 0 0 / 0.15)",
                    }} />
                  </div>
                  <div className="absolute left-[6px] right-[6px] bottom-[10px]" style={{ height: "36%" }}>
                    <div className="h-full rounded-[2px]" style={{
                      background: "linear-gradient(180deg, oklch(0.11 0.02 28) 0%, oklch(0.13 0.02 28) 100%)",
                      boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.45), inset -2px 0 3px oklch(0 0 0 / 0.25), inset 1px 0 2px oklch(0 0 0 / 0.15)",
                    }} />
                  </div>
                  <div className="absolute left-[7px] top-1/2 -translate-y-1/2" style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, oklch(0.82 0.16 82 / 0.85), oklch(0.6 0.12 75) 40%, oklch(0.4 0.08 60) 80%)",
                    boxShadow: "0 1px 3px oklch(0 0 0 / 0.4), inset 0 1px 1px oklch(1 0 0 / 0.25)",
                  }} />
                </div>
              </div>

              {/* Warm light spill when doors open */}
              <div className="absolute -left-6 bottom-0 -z-10" style={{
                width: 100, height: 130,
                background: "radial-gradient(ellipse at 50% 80%, oklch(0.88 0.12 55 / 0.3), oklch(0.8 0.1 55 / 0.1) 40%, transparent 70%)",
                filter: "blur(14px)",
                opacity: doorsOpen ? 1 : 0,
                transition: "opacity 0.8s ease 0.3s",
              }} />
            </div>
          </div>

          {/* Door ground shadow */}
          <div className="absolute top-[104px] left-1/2 -translate-x-1/2" style={{
            width: 90, height: 10,
            background: "radial-gradient(ellipse at 50% 0%, oklch(0 0 0 / 0.25), transparent 70%)",
            filter: "blur(3px)",
          }} />
        </div>
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
