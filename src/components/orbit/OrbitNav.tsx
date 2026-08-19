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
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
    case "gallery": return ev("/gallery", "/events");
    case "transport": return ev("/transport", "/events");
    case "live": return lastEvent ? `/org/events/${lastEvent}/live` : "/org/events";
    case "scanner": return lastEvent ? `/org/events/${lastEvent}/scanner` : "/org/events";
    case "builder": return lastEvent ? `/org/events/${lastEvent}/form` : "/org/events";
    case "certdesigner": return lastEvent ? `/org/events/${lastEvent}/certificate` : "/org/events";
    case "galleryupload": return lastEvent ? `/org/events/${lastEvent}/gallery` : "/org/events";
    default: return to;
  }
}

// ── Geometry ──────────────────────────────────────────────────
// Panel anchored at bottom-right corner of viewport.
// `border-radius: 100% 0 0 0` → quarter-circle in top-left quadrant.
//
// Local coordinate system: origin at bottom-right corner.
//   +X = left, +Y = up.
//   angle 0° = straight left, 90° = straight up.
//
// RADIUS is large so icons sit near the outer curved edge.

const PANEL = 400;
const RADIUS = 355;          // Near the panel edge (400px)
const VISIBLE_COUNT = 3;     // Exactly 3 items visible at a time
const ITEM_ANGULAR_SPAN = 60; // Degrees between visible items (centered in arc)

// Arc center angle and total visible angular span
const ARC_CENTER = 90;  // Straight up (center of quarter-circle)
const ARC_HALF = (VISIBLE_COUNT - 1) * ITEM_ANGULAR_SPAN / 2; // 60°
const ARC_START = ARC_CENTER - ARC_HALF; // 30°
const ARC_END = ARC_CENTER + ARC_HALF;   // 150°

const deg2rad = (d: number) => (d * Math.PI) / 180;

/** Convert arc angle (0°=left, 90°=up) to panel pixel coords (from top-left). */
function arcPos(angleDeg: number) {
  const rad = deg2rad(angleDeg);
  const u = RADIUS * Math.cos(rad); // horizontal from right edge
  const v = RADIUS * Math.sin(rad); // vertical from bottom edge
  return { px: PANEL - u, py: PANEL - v };
}

/** SVG arc path along the curved edge of the quarter-circle. */
function arcPathD() {
  const s = arcPos(ARC_START);
  const e = arcPos(ARC_END);
  return `M ${s.px} ${s.py} A ${RADIUS} ${RADIUS} 0 0 0 ${e.px} ${e.py}`;
}

export function OrbitNav() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [ripple, setRipple] = useState(false);

  const mode = profile?.currentMode ?? "participant";
  const items = mode === "organizer" ? ORGANIZER_ITEMS : PARTICIPANT_ITEMS;

  // Maximum scroll index so the last window doesn't overflow
  const maxScroll = Math.max(0, items.length - VISIBLE_COUNT);
  const clampedIndex = Math.min(Math.max(Math.round(scrollIndex), 0), maxScroll);

  // Close on navigation
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Scroll / keyboard when open
  useEffect(() => {
    if (!open) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScrollIndex((p) => {
        const n = p + (e.deltaY > 0 ? 1 : -1);
        return Math.min(Math.max(n, 0), maxScroll);
      });
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, maxScroll]);

  const toggleOpen = useCallback(() => {
    setOpen((o) => {
      if (!o) {
        setScrollIndex(0);
        // Trigger ripple on open
        setRipple(true);
        setTimeout(() => setRipple(false), 600);
      } else {
        // Trigger ripple on close
        setRipple(true);
        setTimeout(() => setRipple(false), 600);
      }
      return !o;
    });
  }, []);

  const go = (item: WheelItem) => {
    setOpen(false);
    navigate(resolveCtx(item.to, item.ctx));
  };

  const activePath = location.pathname;

  // Get the 3 visible items based on scrollIndex
  const visibleItems = useMemo(() => {
    const startIdx = clampedIndex;
    return items.slice(startIdx, startIdx + VISIBLE_COUNT).map((item, localIdx) => {
      const angle = ARC_START + localIdx * ITEM_ANGULAR_SPAN;
      const { px, py } = arcPos(angle);

      const resolvedPath = resolveCtx(item.to, item.ctx);
      const isActive = activePath.startsWith(resolvedPath.split("/").slice(0, 3).join("/"));

      // Fade edges: full opacity in center, slight fade at edges
      const distFromCenter = Math.abs(angle - ARC_CENTER);
      const fade = Math.max(0.45, 1 - (distFromCenter / ARC_HALF) * 0.55);

      return { item, px, py, fade, isActive, angle, localIdx };
    });
  }, [items, clampedIndex, activePath]);

  const displayName = profile?.name || user?.name || user?.email?.split("@")[0] || "User";
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
              onClick={toggleOpen}
            />

            {/* Quarter-circle panel — anchored bottom-right, grows inward */}
            <motion.div
              initial={{ opacity: 0, scale: 0.15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.15 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed bottom-0 right-0 z-50 orb-scanlines"
              style={{
                width: PANEL,
                height: PANEL,
                background:
                  "radial-gradient(ellipse at 100% 100%, oklch(0.22 0.05 305 / 0.95), oklch(0.09 0.03 305 / 0.98))",
                borderRadius: "100% 0 0 0",
                border: "1px solid oklch(0.8 0.14 78 / 0.12)",
                borderTop: "none",
                borderRight: "none",
                transformOrigin: "100% 100%",
                overflow: "hidden",
              }}
            >
              {/* SVG arc border */}
              <svg
                className="pointer-events-none absolute inset-0 z-30"
                width={PANEL}
                height={PANEL}
                viewBox={`0 0 ${PANEL} ${PANEL}`}
              >
                <path
                  d={arcPathD()}
                  fill="none"
                  stroke="oklch(0.78 0.18 45 / 0.2)"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Nav items — exactly 3 visible, positioned on the circumference */}
              {visibleItems.map(({ item, px, py, fade, isActive }) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => go(item)}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.25 }}
                    className="absolute flex flex-col items-center gap-1.5 outline-none"
                    style={{
                      left: px,
                      top: py,
                      transform: "translate(-50%, -50%)",
                      opacity: fade,
                      zIndex: isActive ? 20 : 10,
                    }}
                  >
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300"
                      style={{
                        borderColor: isActive
                          ? "oklch(0.78 0.18 45 / 0.9)"
                          : "oklch(1 0 0 / 0.18)",
                        background: isActive
                          ? "oklch(0.78 0.18 45 / 0.25)"
                          : "oklch(0 0 0 / 0.5)",
                        color: isActive
                          ? "oklch(0.78 0.18 45)"
                          : "oklch(1 0 0 / 0.88)",
                        boxShadow: isActive
                          ? "0 0 20px oklch(0.78 0.18 45 / 0.45), 0 0 40px -8px oklch(0.78 0.18 45 / 0.18)"
                          : "0 4px 12px rgba(0,0,0,0.3)",
                      }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span
                      className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
                      style={{
                        border: "1px solid oklch(0.78 0.18 45 / 0.2)",
                        background: "oklch(0 0 0 / 0.75)",
                        color: isActive
                          ? "oklch(0.78 0.18 45)"
                          : "oklch(1 0 0 / 0.8)",
                      }}
                    >
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}

              {/* Scroll hint dots */}
              <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                {items.map((_, i) => (
                  <span
                    key={i}
                    className="h-1 w-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i >= clampedIndex && i < clampedIndex + VISIBLE_COUNT
                          ? "oklch(0.78 0.18 45 / 0.8)"
                          : "oklch(1 0 0 / 0.15)",
                      transform:
                        i >= clampedIndex && i < clampedIndex + VISIBLE_COUNT
                          ? "scale(1.4)"
                          : "scale(1)",
                    }}
                  />
                ))}
              </div>

              {/* Scroll hint text */}
              <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-center">
                <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-white/25">
                  scroll to rotate
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Toggle button — at the corner where two straight edges meet ═══ */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open navigation"}
        onClick={toggleOpen}
        className="relative z-50 flex h-14 w-14 items-center justify-center rounded-full border border-ember/50 bg-gradient-to-br from-ember/30 to-ember/10 text-white backdrop-blur transition-all duration-300 hover:scale-110 active:scale-95 orb-border-glow"
        style={{
          boxShadow: open
            ? "0 4px 20px -4px rgba(255,92,56,0.3)"
            : "0 8px 30px -6px rgba(255,92,56,0.5), 0 0 20px -4px rgba(255,92,56,0.3)",
        }}
      >
        {/* Ripple ring animation */}
        <span
          className={`absolute inset-0 rounded-full ${ripple ? "orb-ripple" : ""}`}
        />
        {!open && <span className="absolute inset-0 rounded-full orb-ring" />}
        <span className="absolute inset-1 rounded-full border border-ember/20" />
        {open ? (
          <X className="h-5 w-5 transition-transform duration-300" style={{ transform: "rotate(90deg)" }} />
        ) : (
          <span className="relative flex h-full w-full items-center justify-center">
            {user ? (
              <span className="text-sm font-bold text-ember">{initials}</span>
            ) : (
              <Menu className="h-5 w-5 text-ember" />
            )}
          </span>
        )}
      </button>
    </div>
  );
}
