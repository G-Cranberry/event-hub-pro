import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

const LETTERS = "ORBIT".split("");

/** Double doors at the end of the carpet track */
function DoubleDoors({ open }: { open: boolean }) {
  return (
    <div className="absolute right-6 bottom-0 sm:right-12" style={{ perspective: "600px" }}>
      {/* Door frame */}
      <div className="relative" style={{ width: 80, height: 140, perspective: "600px" }}>
        {/* Frame border */}
        <div
          className="absolute inset-0 rounded-t-lg"
          style={{
            border: "3px solid oklch(0.78 0.18 45 / 0.6)",
            borderBottom: "none",
            boxShadow: "inset 0 0 20px oklch(0.78 0.18 45 / 0.1), 0 0 30px oklch(0.78 0.18 45 / 0.08)",
          }}
        />
        {/* Left door */}
        <motion.div
          className="absolute bottom-0 left-0.5 origin-left"
          style={{
            width: "calc(50% - 3px)",
            height: "100%",
            background: "linear-gradient(180deg, oklch(0.25 0.04 305) 0%, oklch(0.18 0.03 305) 100%)",
            borderRight: "1px solid oklch(1 0 0 / 0.08)",
            borderTopLeftRadius: 6,
          }}
          animate={{ rotateY: open ? -70 : 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Door handle */}
          <div className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gold/60" style={{ boxShadow: "0 0 8px oklch(0.82 0.16 82 / 0.4)" }} />
          {/* Panel detail */}
          <div className="absolute left-2 right-2 top-4 h-12 rounded border border-white/5 bg-white/[0.02]" />
          <div className="absolute left-2 right-2 bottom-4 h-12 rounded border border-white/5 bg-white/[0.02]" />
        </motion.div>
        {/* Right door */}
        <motion.div
          className="absolute bottom-0 right-0.5 origin-right"
          style={{
            width: "calc(50% - 3px)",
            height: "100%",
            background: "linear-gradient(180deg, oklch(0.24 0.04 305) 0%, oklch(0.17 0.03 305) 100%)",
            borderLeft: "1px solid oklch(1 0 0 / 0.08)",
            borderTopRightRadius: 6,
          }}
          animate={{ rotateY: open ? 70 : 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Door handle */}
          <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gold/60" style={{ boxShadow: "0 0 8px oklch(0.82 0.16 82 / 0.4)" }} />
          <div className="absolute left-2 right-2 top-4 h-12 rounded border border-white/5 bg-white/[0.02]" />
          <div className="absolute left-2 right-2 bottom-4 h-12 rounded border border-white/5 bg-white/[0.02]" />
        </motion.div>
        {/* Light spill when doors open */}
        <motion.div
          className="absolute -left-4 bottom-0 -z-10"
          style={{
            width: 120,
            height: 160,
            background: "radial-gradient(ellipse at 50% 100%, oklch(0.85 0.14 55 / 0.25), transparent 70%)",
            filter: "blur(12px)",
          }}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
      </div>
    </div>
  );
}

/** The rolled-up carpet cylinder with 3D depth */
function CarpetRoll({ progress }: { progress: number }) {
  // Roll shrinks as it unrolls
  const rollScale = 1 - progress * 0.6;
  const rollWidth = 28 * rollScale + 10;

  return (
    <div
      className="absolute bottom-1"
      style={{
        transform: `scale(${rollScale})`,
        transformOrigin: "center bottom",
        filter: `drop-shadow(0 6px 16px rgba(120,20,10,${0.4 + progress * 0.2}))`,
      }}
    >
      {/* Cylinder body */}
      <div
        className="relative rounded-full"
        style={{
          width: rollWidth,
          height: 52,
          background: `
            linear-gradient(90deg,
              oklch(0.35 0.12 25) 0%,
              oklch(0.55 0.18 20) 15%,
              oklch(0.65 0.22 18) 30%,
              oklch(0.58 0.20 20) 50%,
              oklch(0.45 0.16 22) 70%,
              oklch(0.35 0.12 25) 100%
            )
          `,
          boxShadow: `
            inset 0 -4px 8px rgba(0,0,0,0.4),
            inset 0 4px 6px rgba(255,180,140,0.15),
            0 2px 12px rgba(120,20,10,0.5)
          `,
        }}
      >
        {/* Top highlight stripe */}
        <div
          className="absolute left-1 right-1 top-1 h-1.5 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent 10%, rgba(255,200,160,0.2) 40%, rgba(255,200,160,0.25) 50%, rgba(255,200,160,0.2) 60%, transparent 90%)" }}
        />
        {/* Spiral lines on the face */}
        <div className="absolute inset-y-1 left-0 w-3 rounded-l-full" style={{ background: "linear-gradient(180deg, oklch(0.30 0.10 25) 0%, oklch(0.50 0.18 18) 50%, oklch(0.30 0.10 25) 100%)" }} />
        <div className="absolute inset-y-1 right-0 w-3 rounded-r-full" style={{ background: "linear-gradient(180deg, oklch(0.30 0.10 25) 0%, oklch(0.50 0.18 18) 50%, oklch(0.30 0.10 25) 100%)" }} />
      </div>
    </div>
  );
}

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false);

  useEffect(() => {
    const controls = animate(0, 1, {
      duration: 3.5,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => setProgress(v),
      onComplete: () => setDoorsOpen(true),
    });
    return () => controls.stop();
  }, []);

  // Carpet trail width grows with progress
  const trailWidth = `${progress * 78}%`;
  // Roll position moves right with progress
  const rollLeft = `calc(${progress * 78}% + 12px)`;

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #1a0e28 0%, #0d0816 40%, #07040c 100%)" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(180,30,20,0.12), transparent 65%)" }} />
      </div>

      {/* Scan lines */}
      <div className="orb-scanlines pointer-events-none absolute inset-0 opacity-15" />

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(oklch(0.78 0.18 45 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 45 / 0.4) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      {/* HUD corners */}
      <div className="absolute left-5 top-5 h-6 w-6 border-t-2 border-l-2 border-ember/40" />
      <div className="absolute right-5 top-5 h-6 w-6 border-t-2 border-r-2 border-ember/40" />
      <div className="absolute bottom-5 left-5 h-6 w-6 border-b-2 border-l-2 border-ember/40" />
      <div className="absolute right-5 bottom-5 h-6 w-6 border-b-2 border-r-2 border-ember/40" />

      {/* ═══ 3D Carpet Track Scene ═══ */}
      <div
        className="relative mb-12 w-[85vw] max-w-[520px]"
        style={{ perspective: "900px", perspectiveOrigin: "50% 60%" }}
      >
        {/* 3D scene container */}
        <div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(18deg) rotateZ(0deg)",
            height: 160,
          }}
        >
          {/* Floor / track surface */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 8,
              background: "linear-gradient(90deg, oklch(0.25 0.03 305 / 0.6), oklch(0.20 0.025 305 / 0.4))",
              borderRadius: 4,
              boxShadow: "0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 oklch(1 0 0 / 0.04)",
              transform: "translateZ(-2px)",
            }}
          />

          {/* Carpet trail (flat carpet on the floor) */}
          <motion.div
            className="absolute bottom-0 left-0"
            style={{
              height: 42,
              width: trailWidth,
              background: `
                linear-gradient(180deg,
                  oklch(0.58 0.22 16) 0%,
                  oklch(0.52 0.20 18) 20%,
                  oklch(0.62 0.24 15) 45%,
                  oklch(0.55 0.21 17) 70%,
                  oklch(0.48 0.18 20) 100%
                )
              `,
              borderRadius: "2px 2px 4px 4px",
              boxShadow: `
                0 4px 16px rgba(120,20,10,0.35),
                0 1px 3px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,200,160,0.12),
                inset 0 -1px 0 rgba(0,0,0,0.2)
              `,
              transform: "translateZ(0px)",
              transformOrigin: "left bottom",
            }}
            initial={{ width: 0 }}
            animate={{ width: trailWidth }}
            transition={{ duration: 0.05, ease: "linear" }}
          >
            {/* Carpet pattern — gold border lines */}
            <div className="absolute left-1 right-1 top-1 h-px" style={{ background: "linear-gradient(90deg, oklch(0.82 0.16 82 / 0.4), oklch(0.82 0.16 82 / 0.5), oklch(0.82 0.16 82 / 0.4))" }} />
            <div className="absolute bottom-1 left-1 right-1 h-px" style={{ background: "linear-gradient(90deg, oklch(0.82 0.16 82 / 0.4), oklch(0.82 0.16 82 / 0.5), oklch(0.82 0.16 82 / 0.4))" }} />
            {/* Center pattern — diamond motifs */}
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-around px-4 opacity-20">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rotate-45 border border-gold/50"
                  style={{ opacity: progress > (i + 1) * 0.12 ? 1 : 0, transition: "opacity 0.3s" }}
                />
              ))}
            </div>
            {/* Side shading for 3D depth */}
            <div className="absolute inset-0 rounded-[2px]" style={{ background: "linear-gradient(180deg, rgba(255,180,140,0.06) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.15) 100%)" }} />
          </motion.div>

          {/* Leading edge curl — the carpet curling up at the roll */}
          {progress > 0.02 && progress < 0.98 && (
            <div
              className="absolute bottom-0"
              style={{
                left: rollLeft,
                width: 14,
                height: 50,
                transform: "translateZ(1px)",
                transformOrigin: "left bottom",
                background: "linear-gradient(90deg, oklch(0.50 0.18 18 / 0.8), oklch(0.55 0.22 16))",
                borderRadius: "0 6px 4px 0",
                boxShadow: "4px 0 12px rgba(120,20,10,0.3)",
              }}
            />
          )}

          {/* The roll itself */}
          <div className="absolute bottom-0" style={{ left: rollLeft, transform: "translateZ(4px)" }}>
            <CarpetRoll progress={progress} />
          </div>

          {/* Double doors at the end */}
          <DoubleDoors open={doorsOpen} />

          {/* Door glow on the carpet when doors open */}
          <motion.div
            className="absolute bottom-0 right-10 sm:right-20"
            style={{
              width: 100,
              height: 50,
              background: "radial-gradient(ellipse at 50% 0%, oklch(0.85 0.14 55 / 0.2), transparent 70%)",
              filter: "blur(8px)",
              transform: "translateZ(1px)",
            }}
            animate={{ opacity: doorsOpen ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          />
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
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, oklch(0.55 0.20 18), oklch(0.65 0.24 15), oklch(0.78 0.18 45))",
            boxShadow: "0 0 12px oklch(0.65 0.22 18 / 0.5), 0 0 24px -4px oklch(0.78 0.18 45 / 0.3)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Loading dots */}
      <motion.div className="mt-4 flex gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1 w-1 rounded-full"
            style={{ background: "oklch(0.65 0.22 18)" }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
