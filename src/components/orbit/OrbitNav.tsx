import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "./ProfileProvider";
import { useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Award,
  Blocks,
  Bus,
  Camera,
  CalendarDays,
  Home,
  Images,
  LayoutGrid,
  Orbit,
  Palette,
  ScanLine,
  Ticket,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type WheelItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  ctx?: string;
};

const PARTICIPANT_ITEMS: WheelItem[] = [
  { id: "home", label: "Home", icon: Home, to: "/home" },
  { id: "profile", label: "Profile", icon: User, to: "/profile" },
  { id: "events", label: "Events", icon: CalendarDays, to: "/events" },
  { id: "passes", label: "Passes", icon: Ticket, to: "/passes" },
  { id: "certs", label: "Certificates", icon: Award, to: "/certificates" },
  { id: "gallery", label: "Gallery", icon: Camera, to: "/events", ctx: "gallery" },
  { id: "transport", label: "Transport", icon: Bus, to: "/events", ctx: "transport" },
];

const ORGANIZER_ITEMS: WheelItem[] = [
  { id: "home", label: "Home", icon: Home, to: "/home" },
  { id: "profile", label: "Profile", icon: User, to: "/profile" },
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

/**
 * Quarter-circle wheel anchored at bottom-right corner.
 * Items are laid out along an arc (90° to 180° range = bottom-right quadrant).
 * Scroll rotates the visible items along the arc.
 */
export function OrbitNav() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const mode = profile?.currentMode ?? "participant";
  const items = mode === "organizer" ? ORGANIZER_ITEMS : PARTICIPANT_ITEMS;

  // Arc config: items spread across a 180° arc (from 180° up to 360° = bottom-right quadrant)
  const ARC_START = 180; // degrees — left side of arc (bottom)
  const ARC_END = 360; // degrees — right side of arc (right edge)
  const ARC_SPAN = ARC_END - ARC_START; // 180° sweep
  const RADIUS = 160; // distance from the corner origin

  // Normalize scroll offset
  const maxOffset = Math.max(0, (items.length - 5) * 28);
  const clampedOffset = Math.min(Math.max(scrollOffset, 0), maxOffset);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Scroll handler when open
  useEffect(() => {
    if (!open) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScrollOffset((prev) => {
        const next = prev + e.deltaY * 0.35;
        return Math.min(Math.max(next, 0), maxOffset);
      });
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
  }, [open, maxOffset]);

  const go = (item: WheelItem) => {
    setOpen(false);
    navigate(resolveCtx(item.to, item.ctx));
  };

  const activePath = location.pathname;

  // Compute item positions along the quarter-circle arc
  const positioned = useMemo(() => {
    const visibleCount = 5;
    const spacing = ARC_SPAN / (visibleCount + 1);

    return items.map((item, i) => {
      // Each item gets a position along the arc based on index minus scroll
      const itemAngle = ARC_START + (i + 1) * spacing - clampedOffset * (spacing / 28);
      const isWithinArc = itemAngle >= ARC_START - 5 && itemAngle <= ARC_END + 5;

      const rad = (itemAngle * Math.PI) / 180;
      const x = RADIUS * Math.cos(rad);
      const y = RADIUS * Math.sin(rad);

      // Fade edges
      const centerAngle = (ARC_START + ARC_END) / 2;
      const distFromCenter = Math.abs(itemAngle - centerAngle);
      const fade = isWithinArc ? Math.max(0, 1 - distFromCenter / (ARC_SPAN / 2 + 10)) : 0;

      const resolvedPath = resolveCtx(item.to, item.ctx);
      const isActive = activePath.startsWith(resolvedPath.split("/").slice(0, 3).join("/"));

      return { item, x, y, visible: isWithinArc && fade > 0.05, fade, isActive, angle: itemAngle };
    });
  }, [items, clampedOffset, activePath, ARC_START, ARC_SPAN, RADIUS]);

  const displayName =
    profile?.name || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />

            {/* Quarter-circle arc container */}
            <motion.div
              ref={containerRef}
              initial={{ scale: 0.1, opacity: 0, borderRadius: "100%" }}
              animate={{ scale: 1, opacity: 1, borderRadius: "0%" }}
              exit={{ scale: 0.1, opacity: 0, borderRadius: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="fixed bottom-0 right-0 z-50 overflow-hidden orb-scanlines"
              style={{
                width: RADIUS * 2 + 100,
                height: RADIUS * 2 + 100,
                background:
                  "radial-gradient(ellipse at 100% 100%, oklch(0.22 0.04 305 / 0.92), oklch(0.10 0.025 305 / 0.96))",
                borderRadius: "100% 0 0 0",
                border: "1px solid oklch(0.82 0.13 78 / 0.12)",
                borderTop: "none",
                borderRight: "none",
              }}
            >
              {/* Ghost ticks along the arc */}
              {items.map((_, i) => {
                const visibleCount = 5;
                const spacing = ARC_SPAN / (visibleCount + 1);
                const angle = ARC_START + (i + 1) * spacing - clampedOffset * (spacing / 28);
                if (angle < ARC_START - 10 || angle > ARC_END + 10) return null;
                const rad = (angle * Math.PI) / 180;
                const tx = RADIUS * Math.cos(rad);
                const ty = RADIUS * Math.sin(rad);
                return (
                  <span
                    key={`tick-${i}`}
                    className="absolute h-1 w-1 rounded-full bg-white/8"
                    style={{
                      left: RADIUS + 50 + tx,
                      top: RADIUS + 50 + ty,
                    }}
                  />
                );
              })}

              {/* Nav items along the arc */}
              {positioned.map(({ item, x, y, visible, fade, isActive }) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-hidden={!visible}
                    tabIndex={visible ? 0 : -1}
                    onClick={() => go(item)}
                    className="absolute flex flex-col items-center gap-1.5 outline-none transition-all duration-200"
                    style={{
                      left: RADIUS + 50 + x,
                      top: RADIUS + 50 + y,
                      transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.4})`,
                      opacity: visible ? fade : 0,
                      pointerEvents: visible ? "auto" : "none",
                      zIndex: visible ? 10 : 0,
                    }}
                  >
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-200"
                      style={{
                        borderColor: isActive
                          ? "oklch(0.74 0.16 50 / 0.9)"
                          : "oklch(1 0 0 / 0.12)",
                        background: isActive
                          ? "oklch(0.74 0.16 50 / 0.2)"
                          : "oklch(0 0 0 / 0.35)",
                        color: isActive ? "oklch(0.74 0.16 50)" : "oklch(1 0 0 / 0.85)",
                        boxShadow: isActive
                          ? "0 0 24px oklch(0.74 0.16 50 / 0.4), 0 0 40px -8px oklch(0.74 0.16 50 / 0.2)"
                          : undefined,
                      }}
                    >
                      <Icon className="h-5.5 w-5.5" />
                    </span>
                    <span className="whitespace-nowrap rounded-full border border-ember/20 bg-black/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur">
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Corner hub label */}
              <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end">
                <span className="font-display text-sm font-bold tracking-[0.15em] text-white/80">
                  ORBIT
                </span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-ember">
                  {mode}
                </span>
                <span className="mt-1 text-[8px] uppercase tracking-widest text-white/30">
                  scroll · rotate
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trigger button — anchored bottom-right */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open navigation"}
        onClick={() => {
          setOpen((o) => {
            if (!o) setScrollOffset(0);
            return !o;
          });
        }}
        className="relative z-50 flex h-14 w-14 items-center justify-center rounded-full border border-ember/50 bg-gradient-to-br from-ember/30 to-ember/10 text-white backdrop-blur transition-transform hover:scale-105 active:scale-95 orb-border-glow"
        style={{
          boxShadow: open
            ? undefined
            : "0 8px 30px -6px rgba(255,92,56,0.5), 0 0 20px -4px rgba(255,92,56,0.3)",
        }}
      >
        {!open && <span className="absolute inset-0 rounded-full orb-ring" />}
        <span className="absolute inset-1 rounded-full border border-ember/20" />
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <span className="relative flex h-full w-full items-center justify-center">
            {user ? (
              <span className="text-sm font-bold text-ember">
                {initials}
              </span>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-ember" />
                <span
                  className="absolute h-4 w-4 rounded-full border border-ember/70"
                  style={{ transform: "translate(9px, -9px)" }}
                />
              </>
            )}
          </span>
        )}
      </button>
    </div>
  );
}
