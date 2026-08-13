import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Award,
  Blocks,
  Bus,
  CalendarDays,
  Camera,
  Home,
  Images,
  LayoutGrid,
  Palette,
  ScanLine,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useProfile } from "./ProfileProvider";

type WheelItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  ctx?: string;
};

const PARTICIPANT_ITEMS: WheelItem[] = [
  { id: "home", label: "Home", icon: Home, to: "/home" },
  { id: "events", label: "Events", icon: CalendarDays, to: "/events" },
  { id: "passes", label: "Passes", icon: Ticket, to: "/passes" },
  { id: "certs", label: "Certificates", icon: Award, to: "/certificates" },
  { id: "gallery", label: "Gallery", icon: Camera, to: "/events", ctx: "gallery" },
  { id: "transport", label: "Transport", icon: Bus, to: "/events", ctx: "transport" },
];

const ORGANIZER_ITEMS: WheelItem[] = [
  { id: "home", label: "Home", icon: Home, to: "/home" },
  { id: "events", label: "My Events", icon: LayoutGrid, to: "/org/events" },
  { id: "live", label: "Live Dashboard", icon: Activity, to: "/org/events", ctx: "live" },
  { id: "scanner", label: "QR Scanner", icon: ScanLine, to: "/org/events", ctx: "scanner" },
  { id: "builder", label: "Form Builder", icon: Blocks, to: "/org/events", ctx: "builder" },
  { id: "certs", label: "Cert Designer", icon: Palette, to: "/org/events", ctx: "certdesigner" },
  { id: "gallery", label: "Gallery Upload", icon: Images, to: "/org/events", ctx: "galleryupload" },
];

function resolveCtx(to: string, ctx?: string): string {
  if (!ctx) return to;
  const lastEvent = sessionStorage.getItem("orbit:lastEvent");
  const ev = (suffix: string, fallback: string) =>
    lastEvent ? `/events/${lastEvent}${suffix}` : fallback;
  switch (ctx) {
    case "gallery":
      return ev("/gallery", "/events");
    case "transport":
      return ev("/transport", "/events");
    case "live":
      return lastEvent ? `/org/events/${lastEvent}/live` : "/org/events";
    case "scanner":
      return lastEvent ? `/org/events/${lastEvent}/scanner` : "/org/events";
    case "builder":
      return lastEvent ? `/org/events/${lastEvent}/form` : "/org/events";
    case "certdesigner":
      return lastEvent ? `/org/events/${lastEvent}/certificate` : "/org/events";
    case "galleryupload":
      return lastEvent ? `/org/events/${lastEvent}/gallery` : "/org/events";
    default:
      return to;
  }
}

function normDeg(deg: number): number {
  let d = deg % 360;
  if (d < -180) d += 360;
  if (d > 180) d -= 360;
  return d;
}

export function OrbitNav() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [rot, setRot] = useState(0);
  const [radius, setRadius] = useState(150);
  const dialRef = useRef<HTMLDivElement>(null);

  const mode = profile?.currentMode ?? "participant";
  const items = mode === "organizer" ? ORGANIZER_ITEMS : PARTICIPANT_ITEMS;
  const step = 360 / items.length;

  useEffect(() => {
    const onResize = () => {
      const r = Math.min(152, Math.max(104, Math.floor(window.innerWidth * 0.235)));
      setRadius(r);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Scroll rotates the wheel while open; Escape closes it.
  useEffect(() => {
    if (!open) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setRot((r) => r + e.deltaY * 0.28);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const positioned = useMemo(() => {
    return items.map((item, i) => {
      const angle = rot + i * step;
      const rad = (angle * Math.PI) / 180;
      const x = radius * Math.cos(rad);
      const y = -radius * Math.sin(rad);
      const delta = normDeg(angle - 90); // 90° = straight up = "front"
      const visible = Math.abs(delta) <= 72;
      const fade = Math.max(0, 1 - Math.abs(delta) / 88);
      return { item, x, y, visible, fade, angle };
    });
  }, [items, rot, radius, step]);

  const go = (item: WheelItem) => {
    setOpen(false);
    navigate(resolveCtx(item.to, item.ctx));
  };

  const activePath = location.pathname;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <>
            {/* click-outside layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            {/* the dial */}
            <motion.div
              ref={dialRef}
              initial={{ scale: 0.35, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.35, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="glass fixed bottom-4 right-4 z-50 flex items-center justify-center rounded-full sm:bottom-6 sm:right-6"
              style={{
                width: radius * 2 + 148,
                height: radius * 2 + 148,
                background:
                  "radial-gradient(circle at 50% 42%, oklch(0.24 0.025 265 / 0.85), oklch(0.13 0.015 265 / 0.92))",
              }}
            >
              {/* ghost ticks: show the whole wheel rotating */}
              {items.map((_, i) => {
                const a = (rot + i * step) * (Math.PI / 180);
                const tx = radius * Math.cos(a);
                const ty = -radius * Math.sin(a);
                return (
                  <span
                    key={`tick-${i}`}
                    className="absolute h-1.5 w-1.5 rounded-full bg-white/10"
                    style={{ transform: `translate(${tx}px, ${ty}px)` }}
                  />
                );
              })}

              {/* visible feature chips */}
              {positioned.map(({ item, x, y, visible, fade }, i) => {
                const Icon = item.icon;
                const isActive = activePath.startsWith(resolveCtx(item.to, item.ctx).split("/").slice(0, 3).join("/"));
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-hidden={!visible}
                    tabIndex={visible ? 0 : -1}
                    onClick={() => go(item)}
                    className={cn(
                      "absolute flex flex-col items-center gap-1.5 outline-none transition-all duration-200",
                      visible ? "cursor-pointer" : "pointer-events-none",
                    )}
                    style={{
                      left: radius + 74 + x,
                      top: radius + 74 + y,
                      transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.55})`,
                      opacity: visible ? fade : 0,
                      zIndex: visible ? 10 + (10 - i) : 0,
                    }}
                  >
                    <span
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-200",
                        isActive
                          ? "border-ember bg-ember/20 text-ember"
                          : "border-white/15 bg-black/40 text-white/85 hover:border-ember/60 hover:bg-ember/10",
                      )}
                      style={{ boxShadow: isActive ? "0 0 24px rgba(255,92,56,0.35)" : undefined }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="whitespace-nowrap rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/75 backdrop-blur">
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* hub: current mode + hint */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <span className="font-display text-lg font-bold tracking-[0.18em] text-white/90">
                  ORBIT
                </span>
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-ember">
                  {mode} mode
                </span>
                <span className="mt-2 text-[9px] uppercase tracking-widest text-white/35">
                  scroll · rotate
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* trigger */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="relative z-50 flex h-14 w-14 items-center justify-center rounded-full border border-ember/50 bg-gradient-to-br from-ember/30 to-ember/10 text-white backdrop-blur transition-transform hover:scale-105 active:scale-95"
        style={{ boxShadow: open ? undefined : "0 8px 30px -6px rgba(255,92,56,0.5)" }}
      >
        {!open && <span className="absolute inset-0 rounded-full orb-ring" />}
        <span className="absolute inset-1 rounded-full border border-white/10" />
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <span className="relative flex h-full w-full items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-ember" />
            <span className="absolute h-4 w-4 rounded-full border border-ember/70" style={{ transform: "translate(9px, -9px)" }} />
          </span>
        )}
      </button>
    </div>
  );
}
