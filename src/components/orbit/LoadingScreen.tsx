import { motion } from "framer-motion";

const LETTERS = "ORBIT".split("");

export function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: "blur(6px)" }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0b0f]"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,92,56,0.14),transparent_65%)]" />
      </div>

      {/* orbiting loader mark */}
      <div className="relative mb-10 h-28 w-28">
        <div className="orb-spin-slow absolute inset-0 rounded-full border border-dashed border-ember/40" />
        <div
          className="absolute inset-2 rounded-full border border-white/10"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(255,92,56,0.25) 12%, transparent 30%)",
          }}
        />
        {/* orbiting dot */}
        <div className="orb-spin-slow absolute inset-0" style={{ animationDuration: "2.2s" }}>
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_18px_4px_rgba(255,92,56,0.6)]" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 backdrop-blur" />
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
        className="mt-3 text-xs font-medium uppercase tracking-[0.45em] text-white/40"
      >
        Event management portal
      </motion.p>

      {/* progress shimmer */}
      <div className="mt-12 h-px w-44 overflow-hidden bg-white/10">
        <div className="orb-shimmer h-full w-full" />
      </div>
    </motion.div>
  );
}
