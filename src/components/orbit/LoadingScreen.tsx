import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LETTERS = "ORBIT".split("");

/** Realistic double doors with wood grain, metal hardware, and depth */
function DoubleDoors({ open }: { open: boolean }) {
  return (
    <div className="absolute right-6 bottom-0 sm:right-10" style={{ perspective: "800px", perspectiveOrigin: "50% 80%" }}>
      <div className="relative" style={{ width: 84, height: 144 }}>
        {/* Door frame — dark stained wood */}
        <div
          className="absolute inset-0 rounded-t-sm"
          style={{
            background: "linear-gradient(180deg, oklch(0.16 0.03 30) 0%, oklch(0.12 0.02 30) 100%)",
            border: "2px solid oklch(0.22 0.03 30)",
            borderBottom: "none",
            boxShadow: `
              inset 0 1px 0 oklch(0.3 0.04 30 / 0.3),
              inset 0 -2px 4px oklch(0 0 0 / 0.4),
              0 0 20px oklch(0 0 0 / 0.5),
              0 8px 32px -4px oklch(0 0 0 / 0.6)
            `,
          }}
        >
          {/* Wood grain lines on frame */}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, oklch(0.4 0.04 30) 3px, oklch(0.4 0.04 30) 4px)",
          }} />
        </div>

        {/* Left door */}
        <div
          className="absolute bottom-0 left-[5px] origin-left"
          style={{
            width: "calc(50% - 6px)",
            height: "calc(100% - 2px)",
            transformStyle: "preserve-3d",
            transform: open ? "rotateY(-75deg)" : "rotateY(0deg)",
            transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Door face — dark walnut wood */}
          <div className="absolute inset-0" style={{
            background: `
              linear-gradient(180deg,
                oklch(0.2 0.03 28) 0%,
                oklch(0.18 0.025 28) 20%,
                oklch(0.22 0.03 28) 50%,
                oklch(0.17 0.025 28) 80%,
                oklch(0.15 0.02 28) 100%
              )
            `,
            borderTopLeftRadius: 4,
            boxShadow: `
              inset 2px 0 6px oklch(0 0 0 / 0.3),
              inset -1px 0 3px oklch(0.35 0.04 30 / 0.1),
              inset 0 2px 4px oklch(0.35 0.04 30 / 0.08),
              inset 0 -4px 8px oklch(0 0 0 / 0.25)
            `,
          }}>
            {/* Wood grain texture */}
            <div className="absolute inset-0 opacity-[0.12]" style={{
              backgroundImage: `
                repeating-linear-gradient(178deg,
                  transparent 0px, transparent 6px,
                  oklch(0.35 0.04 25 / 0.4) 6px, oklch(0.35 0.04 25 / 0.4) 7px
                ),
                repeating-linear-gradient(182deg,
                  transparent 0px, transparent 14px,
                  oklch(0.3 0.03 25 / 0.25) 14px, oklch(0.3 0.03 25 / 0.25) 15px
                )
              `,
              borderRadius: "inherit",
            }} />

            {/* Upper panel — recessed with shadow */}
            <div className="absolute left-2 right-2 top-5" style={{ height: "38%" }}>
              <div className="h-full rounded-sm" style={{
                background: "linear-gradient(180deg, oklch(0.14 0.02 28) 0%, oklch(0.16 0.02 28) 100%)",
                boxShadow: `
                  inset 0 2px 5px oklch(0 0 0 / 0.5),
                  inset 0 -1px 2px oklch(0.3 0.04 30 / 0.06),
                  inset 2px 0 4px oklch(0 0 0 / 0.3),
                  inset -1px 0 3px oklch(0 0 0 / 0.2),
                  0 1px 0 oklch(0.3 0.04 30 / 0.08)
                `,
              }} />
            </div>

            {/* Lower panel — recessed with shadow */}
            <div className="absolute left-2 right-2 bottom-5" style={{ height: "38%" }}>
              <div className="h-full rounded-sm" style={{
                background: "linear-gradient(180deg, oklch(0.13 0.02 28) 0%, oklch(0.15 0.02 28) 100%)",
                boxShadow: `
                  inset 0 2px 5px oklch(0 0 0 / 0.5),
                  inset 0 -1px 2px oklch(0.3 0.04 30 / 0.06),
                  inset 2px 0 4px oklch(0 0 0 / 0.3),
                  inset -1px 0 3px oklch(0 0 0 / 0.2),
                  0 1px 0 oklch(0.3 0.04 30 / 0.08)
                `,
              }} />
            </div>

            {/* Door handle — brass with realistic highlight */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <div style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, oklch(0.82 0.16 82 / 0.9), oklch(0.6 0.12 75) 40%, oklch(0.4 0.08 60) 80%, oklch(0.25 0.04 50))",
                boxShadow: `
                  0 1px 3px oklch(0 0 0 / 0.5),
                  0 0 6px oklch(0.82 0.16 82 / 0.2),
                  inset 0 1px 1px oklch(1 0 0 / 0.3)
                `,
              }} />
              <div style={{
                width: 6,
                height: 20,
                marginTop: 2,
                marginLeft: 2,
                borderRadius: 3,
                background: "linear-gradient(180deg, oklch(0.55 0.1 75) 0%, oklch(0.4 0.08 65) 50%, oklch(0.3 0.05 55) 100%)",
                boxShadow: "0 2px 4px oklch(0 0 0 / 0.4), inset 0 1px 1px oklch(1 0 0 / 0.1)",
              }} />
            </div>

            {/* Hinge — top */}
            <div className="absolute left-0 top-8" style={{
              width: 5,
              height: 14,
              background: "linear-gradient(90deg, oklch(0.35 0.04 60) 0%, oklch(0.5 0.06 65) 40%, oklch(0.35 0.04 60) 100%)",
              boxShadow: "1px 0 2px oklch(0 0 0 / 0.3)",
            }} />
            {/* Hinge — bottom */}
            <div className="absolute left-0 bottom-8" style={{
              width: 5,
              height: 14,
              background: "linear-gradient(90deg, oklch(0.35 0.04 60) 0%, oklch(0.5 0.06 65) 40%, oklch(0.35 0.04 60) 100%)",
              boxShadow: "1px 0 2px oklch(0 0 0 / 0.3)",
            }} />
          </div>
        </div>

        {/* Right door */}
        <div
          className="absolute bottom-0 right-[5px] origin-right"
          style={{
            width: "calc(50% - 6px)",
            height: "calc(100% - 2px)",
            transformStyle: "preserve-3d",
            transform: open ? "rotateY(75deg)" : "rotateY(0deg)",
            transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="absolute inset-0" style={{
            background: `
              linear-gradient(180deg,
                oklch(0.19 0.03 28) 0%,
                oklch(0.17 0.025 28) 20%,
                oklch(0.21 0.03 28) 50%,
                oklch(0.16 0.025 28) 80%,
                oklch(0.14 0.02 28) 100%
              )
            `,
            borderTopRightRadius: 4,
            boxShadow: `
              inset -2px 0 6px oklch(0 0 0 / 0.3),
              inset 1px 0 3px oklch(0.35 0.04 30 / 0.1),
              inset 0 2px 4px oklch(0.35 0.04 30 / 0.08),
              inset 0 -4px 8px oklch(0 0 0 / 0.25)
            `,
          }}>
            {/* Wood grain */}
            <div className="absolute inset-0 opacity-[0.12]" style={{
              backgroundImage: `
                repeating-linear-gradient(178deg,
                  transparent 0px, transparent 6px,
                  oklch(0.35 0.04 25 / 0.4) 6px, oklch(0.35 0.04 25 / 0.4) 7px
                ),
                repeating-linear-gradient(182deg,
                  transparent 0px, transparent 14px,
                  oklch(0.3 0.03 25 / 0.25) 14px, oklch(0.3 0.03 25 / 0.25) 15px
                )
              `,
              borderRadius: "inherit",
            }} />

            {/* Upper panel */}
            <div className="absolute left-2 right-2 top-5" style={{ height: "38%" }}>
              <div className="h-full rounded-sm" style={{
                background: "linear-gradient(180deg, oklch(0.13 0.02 28) 0%, oklch(0.15 0.02 28) 100%)",
                boxShadow: `
                  inset 0 2px 5px oklch(0 0 0 / 0.5),
                  inset 0 -1px 2px oklch(0.3 0.04 30 / 0.06),
                  inset -2px 0 4px oklch(0 0 0 / 0.3),
                  inset 1px 0 3px oklch(0 0 0 / 0.2),
                  0 1px 0 oklch(0.3 0.04 30 / 0.08)
                `,
              }} />
            </div>

            {/* Lower panel */}
            <div className="absolute left-2 right-2 bottom-5" style={{ height: "38%" }}>
              <div className="h-full rounded-sm" style={{
                background: "linear-gradient(180deg, oklch(0.12 0.02 28) 0%, oklch(0.14 0.02 28) 100%)",
                boxShadow: `
                  inset 0 2px 5px oklch(0 0 0 / 0.5),
                  inset 0 -1px 2px oklch(0.3 0.04 30 / 0.06),
                  inset -2px 0 4px oklch(0 0 0 / 0.3),
                  inset 1px 0 3px oklch(0 0 0 / 0.2),
                  0 1px 0 oklch(0.3 0.04 30 / 0.08)
                `,
              }} />
            </div>

            {/* Door handle — brass */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
              <div style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, oklch(0.82 0.16 82 / 0.9), oklch(0.6 0.12 75) 40%, oklch(0.4 0.08 60) 80%, oklch(0.25 0.04 50))",
                boxShadow: "0 1px 3px oklch(0 0 0 / 0.5), 0 0 6px oklch(0.82 0.16 82 / 0.2), inset 0 1px 1px oklch(1 0 0 / 0.3)",
              }} />
              <div style={{
                width: 6,
                height: 20,
                marginTop: 2,
                marginLeft: 2,
                borderRadius: 3,
                background: "linear-gradient(180deg, oklch(0.55 0.1 75) 0%, oklch(0.4 0.08 65) 50%, oklch(0.3 0.05 55) 100%)",
                boxShadow: "0 2px 4px oklch(0 0 0 / 0.4), inset 0 1px 1px oklch(1 0 0 / 0.1)",
              }} />
            </div>

            {/* Hinges */}
            <div className="absolute right-0 top-8" style={{
              width: 5, height: 14,
              background: "linear-gradient(90deg, oklch(0.35 0.04 60) 0%, oklch(0.5 0.06 65) 60%, oklch(0.35 0.04 60) 100%)",
              boxShadow: "-1px 0 2px oklch(0 0 0 / 0.3)",
            }} />
            <div className="absolute right-0 bottom-8" style={{
              width: 5, height: 14,
              background: "linear-gradient(90deg, oklch(0.35 0.04 60) 0%, oklch(0.5 0.06 65) 60%, oklch(0.35 0.04 60) 100%)",
              boxShadow: "-1px 0 2px oklch(0 0 0 / 0.3)",
            }} />
          </div>
        </div>

        {/* Warm light spill when doors open */}
        <div
          className="absolute -left-8 bottom-0 -z-10"
          style={{
            width: 140,
            height: 180,
            background: "radial-gradient(ellipse at 50% 80%, oklch(0.88 0.12 55 / 0.3), oklch(0.8 0.1 55 / 0.1) 40%, transparent 70%)",
            filter: "blur(16px)",
            opacity: open ? 1 : 0,
            transition: "opacity 0.8s ease 0.3s",
          }}
        />

        {/* Ground shadow from doors */}
        <div
          className="absolute -bottom-3 left-1/2 -z-10"
          style={{
            width: "120%",
            height: 12,
            marginLeft: "-10%",
            background: "radial-gradient(ellipse at 50% 0%, oklch(0 0 0 / 0.35), transparent 70%)",
            filter: "blur(6px)",
          }}
        />
      </div>
    </div>
  );
}

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

  const trailWidth = `${progress * 76}%`;
  const rollLeft = `calc(${progress * 76}% + 14px)`;
  const rollScale = 1 - progress * 0.55;
  const rollWidth = 30 * rollScale + 12;

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 35%, #1a0e28 0%, #0d0816 45%, #07040c 100%)" }}
    >
      {/* Ambient overhead light cone */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{
          width: "70%",
          height: "55%",
          background: "radial-gradient(ellipse at 50% 0%, oklch(0.85 0.1 55 / 0.06), transparent 60%)",
        }} />
        {/* Warm side fills */}
        <div className="absolute left-[15%] top-[30%]" style={{
          width: 200,
          height: 300,
          background: "radial-gradient(circle, oklch(0.78 0.18 45 / 0.04), transparent 60%)",
          filter: "blur(40px)",
        }} />
        <div className="absolute right-[15%] top-[30%]" style={{
          width: 200,
          height: 300,
          background: "radial-gradient(circle, oklch(0.72 0.16 175 / 0.03), transparent 60%)",
          filter: "blur(40px)",
        }} />
      </div>

      <div className="orb-scanlines pointer-events-none absolute inset-0 opacity-10" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(oklch(0.78 0.18 45 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 45 / 0.3) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      {/* HUD corners */}
      <div className="absolute left-5 top-5 h-6 w-6 border-t-2 border-l-2 border-ember/30" />
      <div className="absolute right-5 top-5 h-6 w-6 border-t-2 border-r-2 border-ember/30" />
      <div className="absolute bottom-5 left-5 h-6 w-6 border-b-2 border-l-2 border-ember/30" />
      <div className="absolute right-5 bottom-5 h-6 w-6 border-b-2 border-r-2 border-ember/30" />

      {/* ═══ 3D Carpet Track Scene ═══ */}
      <div
        className="relative mb-14 w-[88vw] max-w-[540px]"
        style={{ perspective: "1000px", perspectiveOrigin: "50% 55%" }}
      >
        <div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(22deg)",
            height: 180,
          }}
        >
          {/* Floor / ground plane — subtle reflective surface */}
          <div className="absolute bottom-0 left-0 right-0" style={{
            height: 6,
            background: "linear-gradient(90deg, oklch(0.2 0.02 280 / 0.3), oklch(0.25 0.025 280 / 0.4) 50%, oklch(0.2 0.02 280 / 0.3))",
            borderRadius: 3,
            boxShadow: "0 2px 8px oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.03)",
            transform: "translateZ(-3px)",
          }} />

          {/* Ground reflection / ambient occlusion under the carpet */}
          <div className="absolute bottom-[-6px] left-0" style={{
            width: trailWidth,
            height: 14,
            background: "radial-gradient(ellipse at 50% 0%, oklch(0 0 0 / 0.25), transparent 70%)",
            filter: "blur(4px)",
            transform: "translateZ(-2px)",
          }} />

          {/* ═══ Carpet trail — plush fabric texture ═══ */}
          <div className="absolute bottom-0 left-0" style={{
            height: 46,
            width: trailWidth,
            borderRadius: "2px 2px 4px 4px",
            transform: "translateZ(0px)",
            transformOrigin: "left bottom",
            boxShadow: `
              0 6px 20px oklch(0.3 0.08 15 / 0.35),
              0 2px 6px oklch(0 0 0 / 0.25),
              inset 0 1px 0 oklch(0.75 0.15 15 / 0.15),
              inset 0 -2px 4px oklch(0.2 0.06 15 / 0.3)
            `,
            background: `
              /* Base rich red fabric */
              linear-gradient(180deg,
                oklch(0.52 0.18 16) 0%,
                oklch(0.48 0.17 17) 15%,
                oklch(0.55 0.2 15) 35%,
                oklch(0.50 0.18 16) 55%,
                oklch(0.45 0.16 18) 75%,
                oklch(0.40 0.14 20) 100%
              )
            `,
          }}>
            {/* Fabric weave / pile texture — horizontal threads */}
            <div className="absolute inset-0 opacity-[0.18]" style={{
              backgroundImage: `
                repeating-linear-gradient(0deg,
                  transparent 0px, transparent 1px,
                  oklch(0.7 0.12 15 / 0.3) 1px, oklch(0.7 0.12 15 / 0.3) 2px
                )
              `,
              borderRadius: "inherit",
            }} />
            {/* Vertical weave threads — cross-hatch */}
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: `
                repeating-linear-gradient(90deg,
                  transparent 0px, transparent 3px,
                  oklch(0.3 0.08 15 / 0.4) 3px, oklch(0.3 0.08 15 / 0.4) 4px
                )
              `,
              borderRadius: "inherit",
            }} />
            {/* Pile texture — scattered soft dots for plush feel */}
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `
                radial-gradient(circle 1px at 20% 30%, oklch(0.8 0.1 15 / 0.5), transparent 100%),
                radial-gradient(circle 1px at 60% 20%, oklch(0.7 0.1 15 / 0.4), transparent 100%),
                radial-gradient(circle 1px at 80% 60%, oklch(0.75 0.1 15 / 0.4), transparent 100%),
                radial-gradient(circle 1px at 40% 70%, oklch(0.8 0.1 15 / 0.3), transparent 100%),
                radial-gradient(circle 1px at 10% 80%, oklch(0.7 0.1 15 / 0.4), transparent 100%)
              `,
              backgroundSize: "12px 8px",
              borderRadius: "inherit",
            }} />

            {/* Gold border trim — top edge with metallic sheen */}
            <div className="absolute left-1 right-1 top-[3px] h-[2px]" style={{
              background: "linear-gradient(90deg, oklch(0.65 0.14 82 / 0.3), oklch(0.82 0.16 82 / 0.6) 30%, oklch(0.88 0.14 80 / 0.7) 50%, oklch(0.82 0.16 82 / 0.6) 70%, oklch(0.65 0.14 82 / 0.3))",
              boxShadow: "0 1px 2px oklch(0 0 0 / 0.2), inset 0 1px 0 oklch(1 0 0 / 0.15)",
            }} />
            {/* Gold border trim — bottom edge */}
            <div className="absolute bottom-[3px] left-1 right-1 h-[2px]" style={{
              background: "linear-gradient(90deg, oklch(0.65 0.14 82 / 0.3), oklch(0.82 0.16 82 / 0.6) 30%, oklch(0.88 0.14 80 / 0.7) 50%, oklch(0.82 0.16 82 / 0.6) 70%, oklch(0.65 0.14 82 / 0.3))",
              boxShadow: "0 1px 2px oklch(0 0 0 / 0.2), inset 0 1px 0 oklch(1 0 0 / 0.15)",
            }} />

            {/* Diamond motifs — embroidered look */}
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-around px-6 opacity-25">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rotate-45 border border-gold/40"
                  style={{
                    opacity: progress > (i + 1) * 0.12 ? 1 : 0,
                    transition: "opacity 0.4s ease",
                    boxShadow: "inset 0 0 2px oklch(0.82 0.16 82 / 0.2)",
                  }}
                />
              ))}
            </div>

            {/* 3D fabric shading — top highlight, bottom shadow */}
            <div className="absolute inset-0 rounded-[2px]" style={{
              background: "linear-gradient(180deg, rgba(255,200,170,0.08) 0%, transparent 25%, transparent 65%, rgba(0,0,0,0.18) 100%)",
            }} />
          </div>

          {/* Leading edge curl — fabric peeling up */}
          {progress > 0.02 && progress < 0.97 && (
            <div className="absolute bottom-0" style={{
              left: rollLeft,
              width: 16,
              height: 54,
              transform: "translateZ(2px)",
              transformOrigin: "left bottom",
              borderRadius: "0 8px 6px 0",
              boxShadow: "6px 2px 16px oklch(0.3 0.08 15 / 0.3)",
              background: `
                linear-gradient(90deg,
                  oklch(0.42 0.16 17 / 0.9) 0%,
                  oklch(0.48 0.18 16) 30%,
                  oklch(0.52 0.2 15) 60%,
                  oklch(0.55 0.2 15) 100%
                )
              `,
            }}>
              {/* Curl highlight */}
              <div className="absolute inset-0 rounded-r-[8px]" style={{
                background: "linear-gradient(180deg, oklch(0.7 0.12 15 / 0.1) 0%, transparent 30%, transparent 70%, oklch(0 0 0 / 0.15) 100%)",
              }} />
            </div>
          )}

          {/* ═══ Carpet roll — plush fabric cylinder ═══ */}
          <div className="absolute bottom-0" style={{ left: rollLeft, transform: "translateZ(5px)" }}>
            <div style={{
              transform: `scale(${rollScale})`,
              transformOrigin: "center bottom",
              filter: `drop-shadow(0 8px 20px oklch(0.3 0.08 15 / ${0.35 + progress * 0.15}))`,
            }}>
              <div className="relative rounded-full overflow-hidden" style={{
                width: rollWidth,
                height: 56,
              }}>
                {/* Base fabric color */}
                <div className="absolute inset-0 rounded-full" style={{
                  background: `
                    linear-gradient(90deg,
                      oklch(0.28 0.08 20) 0%,
                      oklch(0.42 0.14 18) 12%,
                      oklch(0.55 0.18 16) 28%,
                      oklch(0.62 0.2 15) 42%,
                      oklch(0.58 0.18 16) 55%,
                      oklch(0.48 0.15 18) 70%,
                      oklch(0.35 0.1 20) 88%,
                      oklch(0.25 0.06 22) 100%
                    )
                  `,
                  boxShadow: `
                    inset 0 -6px 12px oklch(0 0 0 / 0.35),
                    inset 0 6px 8px oklch(0.7 0.12 15 / 0.1),
                    inset 3px 0 8px oklch(0 0 0 / 0.2),
                    inset -3px 0 8px oklch(0 0 0 / 0.2)
                  `,
                }} />

                {/* Fabric weave on cylinder */}
                <div className="absolute inset-0 rounded-full opacity-[0.12]" style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent 0px, transparent 1px, oklch(0.7 0.1 15 / 0.3) 1px, oklch(0.7 0.1 15 / 0.3) 2px),
                    repeating-linear-gradient(90deg, transparent 0px, transparent 2px, oklch(0.3 0.06 15 / 0.3) 2px, oklch(0.3 0.06 15 / 0.3) 3px)
                  `,
                }} />

                {/* Top specular highlight — soft fabric sheen, not glossy */}
                <div className="absolute left-2 right-2 top-[6px] h-[3px] rounded-full" style={{
                  background: "linear-gradient(90deg, transparent 5%, oklch(0.8 0.1 15 / 0.12) 30%, oklch(0.85 0.1 15 / 0.15) 50%, oklch(0.8 0.1 15 / 0.12) 70%, transparent 95%)",
                }} />

                {/* Spiral end cap — left */}
                <div className="absolute inset-y-[6px] left-0 w-[10px] rounded-l-full" style={{
                  background: "linear-gradient(180deg, oklch(0.25 0.06 22 / 0.6) 0%, oklch(0.45 0.12 18 / 0.5) 30%, oklch(0.55 0.16 16 / 0.4) 50%, oklch(0.45 0.12 18 / 0.5) 70%, oklch(0.25 0.06 22 / 0.6) 100%)",
                  boxShadow: "inset 1px 0 3px oklch(0 0 0 / 0.3)",
                }} />
                {/* Spiral end cap — right */}
                <div className="absolute inset-y-[6px] right-0 w-[10px] rounded-r-full" style={{
                  background: "linear-gradient(180deg, oklch(0.25 0.06 22 / 0.6) 0%, oklch(0.45 0.12 18 / 0.5) 30%, oklch(0.55 0.16 16 / 0.4) 50%, oklch(0.45 0.12 18 / 0.5) 70%, oklch(0.25 0.06 22 / 0.6) 100%)",
                  boxShadow: "inset -1px 0 3px oklch(0 0 0 / 0.3)",
                }} />
              </div>
            </div>
          </div>

          {/* Double doors */}
          <DoubleDoors open={doorsOpen} />

          {/* Door light reflection on carpet */}
          <div className="absolute bottom-0 right-14 sm:right-24" style={{
            width: 120,
            height: 60,
            background: "radial-gradient(ellipse at 50% 0%, oklch(0.88 0.12 55 / 0.15), transparent 65%)",
            filter: "blur(10px)",
            transform: "translateZ(1px)",
            opacity: doorsOpen ? 1 : 0,
            transition: "opacity 0.6s ease 0.4s",
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="mt-4 flex flex-col items-center gap-2">
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
          transition: "none",
        }} />
      </div>

      {/* Loading dots */}
      <div className="mt-4 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1 w-1 rounded-full orb-pulse-dot" style={{
            background: "oklch(0.65 0.22 18)",
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </motion.div>
  );
}
