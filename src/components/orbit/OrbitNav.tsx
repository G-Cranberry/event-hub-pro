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

// ── Geometry constants ──────────────────────────────────────────
// The quarter-circle panel is anchored at the bottom-right of the
// viewport. Its curved edge sweeps from the bottom-left corner of
// the panel up to the top-right corner.
//
// We define a local coordinate system whose origin (0, 0) is the
// bottom-right corner of the panel (the anchor point).
//   • +X goes LEFT  (into the viewport)
//   • +Y goes UP    (into the viewport)
//
// Items are placed at distance RADIUS from the origin at angles
// from 0° (straight left) to 90° (straight up).

const PANEL_SIZE = 420; // px — diameter of the quarter circle + padding
const RADIUS = 170; // px — distance from corner origin to items
const ARC_DEG_START = 5; // degrees from the left edge (bottom)
const ARC_DEG_END = 85; // degrees from the left edge (top/right)
const ARC_DEG_SPAN = ARC_DEG_END - ARC_DEG_START;
const MAX_VISIBLE = 5; // items visible at once

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Convert an arc angle (0°=left, 90°=up) to panel-local pixel coords. */
function arcToPixel(angleDeg: number): { px: number; py: number } {
  const rad = degToRad(angleDeg);
  // +X = left, +Y = up → pixel coords from top-left of panel
  const px = PANEL_SIZE - RADIUS * Math.cos(rad); // from left edge
  const py = PANEL_SIZE - RADIUS * Math.sin(rad); // from top edge
  return { px, py };
}

/** Quarter-circle SVG arc path for the curved border. */
function arcPath(): string {
  const start = arcToPixel(ARC_DEG_START);
  const end = arcToPixel(ARC_DEG_END);
  // SVG arc: A rx ry x-rotation large-arc-flag sweep-flag x y
  return `M ${start.px} ${start.py} A ${RADIUS} ${RADIUS} 0 0 0 ${end.px} ${end.py}`;
}

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

  // Scroll offset controls which slice of items is visible on the arc
  const maxOffset = Math.max(0, items.length - MAX_VISIBLE);
  const clampedOffset = Math.min(Math.max(scrollOffset, 0), maxOffset);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Scroll / keyboard handlers when open
  useEffect(() => {
    if (!open) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScrollOffset((prev) => {
        const next = prev + (e.deltaY > 0 ? 0.4 : -0.4);
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

  // Position items along the arc
  const positioned = useMemo(() => {
    // Spread items evenly across the arc span
    const spacing = ARC_DEG_SPAN / (MAX_VISIBLE - 1 || 1);

    return items.map((item, i) => {
      // Map item index to an arc angle, offset by scroll
      const angle = ARC_DEG_START + (i - clampedOffset) * spacing;

      // Is this item within the visible arc range?
      const visible = angle >= ARC_DEG_START - 2 && angle <= ARC_DEG_END + 2;

      // Fade at edges
      const center = (ARC_DEG_START + ARC_DEG_END) / 2;
      const dist = Math.abs(angle - center);
      const fade = visible ? Math.max(0, 1 - (dist / (ARC_DEG_SPAN / 2 + 8)) * 0.6) : 0;

      const { px, py } = visible ? arcToPixel(Math.max(ARC_DEG_START, Math.min(ARC_DEG_END, angle))) : arcToPixel(center);

      const resolvedPath = resolveCtx(item.to, item.ctx);
      const isActive = activePath.startsWith(resolvedPath.split("/").slice(0, 3).join("/"));

      return { item, px, py, visible: visible && fade > 0.1, fade, isActive, angle };
    });
  }, [items, clampedOffset, activePath]);

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

            {/* Quarter-circle panel — anchored bottom-right */}
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, scale: 0.15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.15 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="fixed bottom-0 right-0 z-50 orb-scanlines"
              style={{
                width: PANEL_SIZE,
                height: PANEL_SIZE,
                background:
                  "radial-gradient(ellipse at 100% 100%, oklch(0.20 0.04 305 / 0.94), oklch(0.08 0.025 305 / 0.97))",
                borderRadius: "100% 0 0 0",
                border: "1px solid oklch(0.82 0.13 78 / 0.10)",
                borderTop: "none",
                borderRight: "none",
                transformOrigin: "100% 100%",
                overflow: "hidden",
              }}
            >
              {/* SVG arc border along the curved edge */}
              <svg
                className="pointer-events-none absolute inset-0 z-30"
                width={PANEL_SIZE}
                height={PANEL_SIZE}
                viewBox={`0 0 ${PANEL_SIZE} ${PANEL_SIZE}`}
              >
                <path
                  d={arcPath()}
                  fill="none"
                  stroke="oklch(0.74 0.16 50 / 0.20)"
                  strokeWidth="1.5"
                />
                {/* Ghost tick marks along the arc */}
                {items.map((_, i) => {
                  const spacing = ARC_DEG_SPAN / (MAX_VISIBLE - 1 || 1);
                  const angle = ARC_DEG_START + (i - clampedOffset) * spacing;
                  if (angle < ARC_DEG_START - 5 || angle > ARC_DEG_END + 5)
                    return null;
                  const clamped = Math.max(
                    ARC_DEG_START,
                    Math.min(ARC_DEG_END, angle),
                  );
                  const { px, py } = arcToPixel(clamped);
                  return (
                    <circle
                      key={`tick-${i}`}
                      cx={px}
                      cy={py}
                      r="2"
                      fill="oklch(1 0 0 / 0.08)"
                    />
                  );
                })}
              </svg>

              {/* Nav items along the arc circumference */}
              {positioned.map(({ item, px, py, visible, fade, isActive }) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-hidden={!visible}
                    tabIndex={visible ? 0 : -1}
                    onClick={() => go(item)}
                    className="absolute flex flex-col items-center gap-1.5 outline-none transition-all duration-300"
                    style={{
                      left: px,
                      top: py,
                      transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.3})`,
                      opacity: visible ? fade : 0,
                      pointerEvents: visible ? "auto" : "none",
                      zIndex: visible ? 10 : 0,
                    }}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200 sm:h-14 sm:w-14"
                      style={{
                        borderColor: isActive
                          ? "oklch(0.74 0.16 50 / 0.9)"
                          : "oklch(1 0 0 / 0.12)",
                        background: isActive
                          ? "oklch(0.74 0.16 50 / 0.2)"
                          : "oklch(0 0 0 / 0.40)",
                        color: isActive
                          ? "oklch(0.74 0.16 50)"
                          : "oklch(1 0 0 / 0.85)",
                        boxShadow: isActive
                          ? "0 0 20px oklch(0.74 0.16 50 / 0.35), 0 0 40px -8px oklch(0.74 0.16 50 / 0.15)"
                          : undefined,
                      }}
                    >
                      <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                    </span>
                    <span className="whitespace-nowrap rounded-full border border-ember/20 bg-black/70 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur sm:text-[9px]">
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Corner hub — brand label at the origin (bottom-right) */}
              <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end sm:bottom-4 sm:right-4">
                <span className="font-display text-xs font-bold tracking-[0.15em] text-white/80 sm:text-sm">
                  ORBIT
                </span>
                <span className="text-[7px] font-semibold uppercase tracking-[0.3em] text-ember sm:text-[8px]">
                  {mode}
                </span>
                <span className="mt-0.5 text-[7px] uppercase tracking-widest text-white/30 sm:text-[8px]">
                  scroll · rotate
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trigger button — bottom-right */}
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
              <span className="text-sm font-bold text-ember">{initials}</span>
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
