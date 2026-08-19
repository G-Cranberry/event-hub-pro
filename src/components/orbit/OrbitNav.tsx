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
// Items sit at distance RADIUS from the origin along the arc.
// The SVG arc border traces the curved edge of the panel.

const PANEL = 400;
const RADIUS = 165;

// Arc angles — items spread across this range along the circumference
const ARC_START = 10;  // near the left edge (bottom of arc)
const ARC_END = 170;   // near the top edge (top of arc)
const ARC_SPAN = ARC_END - ARC_START; // 160°

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
  const [scrollOffset, setScrollOffset] = useState(0);

  const mode = profile?.currentMode ?? "participant";
  const items = mode === "organizer" ? ORGANIZER_ITEMS : PARTICIPANT_ITEMS;

  const maxOffset = Math.max(0, items.length - 1);
  const clampedOffset = Math.min(Math.max(scrollOffset, 0), maxOffset);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Scroll / keyboard when open
  useEffect(() => {
    if (!open) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScrollOffset((p) => {
        const n = p + (e.deltaY > 0 ? 0.5 : -0.5);
        return Math.min(Math.max(n, 0), maxOffset);
      });
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
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

  // Position ALL items evenly along the arc.
  // Key fix: spacing is based on items.length, not MAX_VISIBLE,
  // so every item gets a unique angle within the arc range.
  const positioned = useMemo(() => {
    // Spread all items across the arc. Use the larger of
    // items.length and a minimum so spacing stays reasonable.
    const count = Math.max(items.length, 3);
    const spacing = ARC_SPAN / (count - 1);

    return items.map((item, i) => {
      const angle = ARC_START + i * spacing;

      // Visible if within the arc range (with small margin)
      const margin = 6;
      const visible = angle >= ARC_START - margin && angle <= ARC_END + margin;

      // Fade toward edges — full opacity in center, fade at edges
      const center = (ARC_START + ARC_END) / 2;
      const dist = Math.abs(angle - center);
      const halfSpan = ARC_SPAN / 2;
      const fade = visible ? Math.max(0.15, 1 - (dist / halfSpan) * 0.7) : 0;

      // Clamp the angle for positioning so edge items sit on the arc boundary
      const clampedAngle = Math.max(ARC_START, Math.min(ARC_END, angle));
      const { px, py } = arcPos(clampedAngle);

      const resolvedPath = resolveCtx(item.to, item.ctx);
      const isActive = activePath.startsWith(resolvedPath.split("/").slice(0, 3).join("/"));

      return { item, px, py, visible, fade, isActive, angle };
    });
  }, [items, activePath]);

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
              onClick={() => setOpen(false)}
            />

            {/* Quarter-circle panel — anchored bottom-right, grows inward */}
            <motion.div
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.1 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
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
              {/* SVG arc border + ghost ticks along the circumference */}
              <svg
                className="pointer-events-none absolute inset-0 z-30"
                width={PANEL}
                height={PANEL}
                viewBox={`0 0 ${PANEL} ${PANEL}`}
              >
                <path
                  d={arcPathD()}
                  fill="none"
                  stroke="oklch(0.78 0.18 45 / 0.25)"
                  strokeWidth="2"
                />
                {/* Ghost tick dots along the arc for visual rhythm */}
                {positioned.map(({ px, py, visible }, i) =>
                  visible ? (
                    <circle
                      key={`tick-${i}`}
                      cx={px}
                      cy={py}
                      r="2"
                      fill="oklch(1 0 0 / 0.06)"
                    />
                  ) : null,
                )}
              </svg>

              {/* Nav items positioned along the arc circumference */}
              {positioned.map(({ item, px, py, visible, fade, isActive }) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-hidden={!visible}
                    tabIndex={visible ? 0 : -1}
                    onClick={() => go(item)}
                    className="absolute flex flex-col items-center gap-1 outline-none transition-all duration-300"
                    style={{
                      left: px,
                      top: py,
                      transform: "translate(-50%, -50%)",
                      opacity: visible ? fade : 0,
                      pointerEvents: visible ? "auto" : "none",
                      zIndex: visible ? 10 : 0,
                    }}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200"
                      style={{
                        borderColor: isActive
                          ? "oklch(0.78 0.18 45 / 0.9)"
                          : "oklch(1 0 0 / 0.15)",
                        background: isActive
                          ? "oklch(0.78 0.18 45 / 0.22)"
                          : "oklch(0 0 0 / 0.45)",
                        color: isActive
                          ? "oklch(0.78 0.18 45)"
                          : "oklch(1 0 0 / 0.88)",
                        boxShadow: isActive
                          ? "0 0 18px oklch(0.78 0.18 45 / 0.4), 0 0 36px -6px oklch(0.78 0.18 45 / 0.15)"
                          : undefined,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className="whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider backdrop-blur"
                      style={{
                        border: "1px solid oklch(0.78 0.18 45 / 0.2)",
                        background: "oklch(0 0 0 / 0.7)",
                        color: "oklch(1 0 0 / 0.75)",
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Corner hub — brand at bottom-right */}
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
        onClick={() => setOpen((o) => { if (!o) setScrollOffset(0); return !o; })}
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
