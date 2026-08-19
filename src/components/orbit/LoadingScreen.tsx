import { motion } from "framer-motion";

const LETTERS = "ORBIT".split("");

export function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: "blur(6px)" }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0712]"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,92,56,0.18),transparent_65%)]" />
      </div>
      {/* scan line overlay */}
      <div className="orb-scanlines pointer-events-none absolute inset-0 opacity-25" />
      {/* grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.74 0.16 50 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(0.74 0.16 50 / 0.4) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* HUD corner brackets */}
      <div className="absolute left-6 top-6 h-8 w-8 border-t-2 border-l-2 border-ember/50" />
      <div className="absolute right-6 top-6 h-8 w-8 border-t-2 border-r-2 border-ember/50" />
      <div className="absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-ember/50" />
      <div className="absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-ember/50" />

      {/* orbiting loader mark */}
      <div className="relative mb-10 h-28 w-28">
        <div className="orb-spin-slow absolute inset-0 rounded-full border border-dashed border-ember/35" />
        <div
          className="absolute inset-2 rounded-full border border-ember/10"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(255,92,56,0.3) 12%, transparent 30%)",
          }}
        />
        {/* orbiting dot */}
        <div className="orb-spin-slow absolute inset-0" style={{ animationDuration: "2.2s" }}>
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_22px_6px_rgba(255,92,56,0.7)]" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ember/15 bg-black/40 backdrop-blur" />
      </div>

      {/* wordmark */}
      <div className="flex overflow-hidden">
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl font-bold tracking-[0.12em] text-white sm:text-6xl"
          >
            {letter}
          </motion.span>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.45em] text-white/40"
      >
        <span className="orb-hud-blink h-1 w-1 rounded-full bg-ember" />
        Event management portal
      </motion.p>

      {/* progress shimmer */}
      <div className="mt-12 h-px w-44 overflow-hidden bg-ember/15">
        <div className="orb-shimmer h-full w-full" />
      </div>
    </motion.div>
  );
}
