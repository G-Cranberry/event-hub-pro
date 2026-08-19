import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

/**
 * Floating background cards that gently shift position and
 * transition between placements — inspired by KAMUI's
 * animated background card layout.
 */
export function FloatingCards() {
  const events = useQuery(api.events.listPublished);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || !events || events.length === 0) return null;

  // Pick up to 5 events for floating cards
  const cards = events.slice(0, 5);

  // Fixed positions for each card (percentage-based for responsiveness)
  const positions = [
    { top: "5%", left: "3%", rotate: -8, scale: 0.7, delay: 0 },
    { top: "12%", right: "5%", rotate: 5, scale: 0.65, delay: 1.5 },
    { top: "45%", left: "8%", rotate: -4, scale: 0.75, delay: 3 },
    { top: "55%", right: "10%", rotate: 7, scale: 0.6, delay: 0.8 },
    { top: "75%", left: "20%", rotate: -6, scale: 0.55, delay: 2.2 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {cards.map((event, i) => {
        const pos = positions[i % positions.length];
        return (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, scale: 0.5, y: 40 }}
            animate={{
              opacity: [0, 0.12, 0.08, 0.14, 0.1],
              scale: [0.5, pos.scale, pos.scale * 0.95, pos.scale * 1.02, pos.scale],
              y: [40, -10, 15, -25, 0],
              rotate: [0, pos.rotate, pos.rotate * -0.5, pos.rotate * 1.2, pos.rotate],
            }}
            transition={{
              duration: 20 + i * 3,
              delay: pos.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-48 rounded-2xl overflow-hidden border border-white/5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"
            style={{
              top: pos.top,
              left: "left" in pos ? pos.left : undefined,
              right: "right" in pos ? pos.right : undefined,
            }}
          >
            {/* Card content — simplified event preview */}
            <div
              className="h-64 w-full"
              style={{
                background: `linear-gradient(135deg, ${event.accent}33, ${event.accent}11, #1a102808)`,
              }}
            >
              <div className="flex h-full flex-col justify-end p-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-3" />
                <p
                  className="text-xs font-bold tracking-wider uppercase"
                  style={{ color: event.accent }}
                >
                  {event.type}
                </p>
                <p className="mt-1 text-sm font-bold text-white/90 leading-tight line-clamp-2">
                  {event.title}
                </p>
                <p className="mt-1 text-[10px] text-white/40">{event.city}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
