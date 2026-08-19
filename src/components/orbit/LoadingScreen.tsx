import { motion } from "framer-motion";

const LETTERS = "ORBIT".split("");

export function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: "blur(6px)" }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a0e28 0%, #0d0816 45%, #07040c 100%)" }}
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,120,50,0.15), transparent 65%)" }} />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(26,181,160,0.08), transparent 60%)" }} />
      </div>

      {/* scan lines */}
      <div className="orb-scanlines pointer-events-none absolute inset-0 opacity-20" />

      {/* grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(oklch(0.78 0.18 45 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 45 / 0.4) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      {/* HUD corners */}
      <div className="absolute left-6 top-6 h-8 w-8 border-t-2 border-l-2 border-ember/50" />
      <div className="absolute right-6 top-6 h-8 w-8 border-t-2 border-r-2 border-ember/50" />
      <div className="absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-ember/50" />
      <div className="absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-ember/50" />

      {/* ── Branded orbit loader ── */}
      <div className="relative mb-8 h-36 w-36 sm:h-40 sm:w-40">
        {/* Outer ring — slow rotation */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "1.5px dashed oklch(0.78 0.18 45 / 0.25)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        {/* Middle ring — reverse rotation */}
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{ border: "1px solid oklch(0.82 0.16 175 / 0.18)" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        {/* Conic glow sweep */}
        <div className="absolute inset-2 rounded-full" style={{
          background: "conic-gradient(from 0deg, transparent 0%, rgba(255,120,50,0.25) 10%, transparent 25%)",
        }} />
        {/* Inner ring */}
        <motion.div
          className="absolute inset-6 rounded-full"
          style={{ border: "1px solid oklch(0.78 0.18 45 / 0.12)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbiting dot 1 — ember */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{
            background: "oklch(0.78 0.18 45)",
            boxShadow: "0 0 20px 6px oklch(0.78 0.18 45 / 0.6), 0 0 40px 12px oklch(0.78 0.18 45 / 0.2)",
          }} />
        </motion.div>

        {/* Orbiting dot 2 — teal, opposite direction */}
        <motion.div
          className="absolute inset-3"
          animate={{ rotate: -360 }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{
            background: "oklch(0.78 0.16 175)",
            boxShadow: "0 0 14px 4px oklch(0.78 0.16 175 / 0.5)",
          }} />
        </motion.div>

        {/* Orbiting dot 3 — gold, slow */}
        <motion.div
          className="absolute inset-1"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full" style={{
            background: "oklch(0.82 0.14 80)",
            boxShadow: "0 0 10px 3px oklch(0.82 0.14 80 / 0.4)",
          }} />
        </motion.div>

        {/* Core — pulsing */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.78 0.18 45 / 0.25), transparent 70%)",
            border: "1px solid oklch(0.78 0.18 45 / 0.2)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Core dot */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "oklch(0.78 0.18 45)" }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Letter reveal ── */}
      <div className="flex overflow-hidden">
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ y: 50, opacity: 0, rotateX: -40 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{
              delay: 0.2 + i * 0.08,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-display text-5xl font-bold tracking-[0.14em] text-white sm:text-6xl"
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-4 flex flex-col items-center gap-2"
      >
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.45em] text-white/40">
          <span className="orb-hud-blink h-1 w-1 rounded-full bg-ember" />
          Event management portal
        </p>
      </motion.div>

      {/* Progress shimmer bar */}
      <div className="mt-10 h-px w-48 overflow-hidden rounded-full bg-ember/15">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, oklch(0.78 0.18 45 / 0.5), transparent)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Loading dots */}
      <motion.div
        className="mt-5 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1 w-1 rounded-full bg-ember/60"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
