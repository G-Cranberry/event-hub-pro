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
  Menu,
  Palette,
  ScanLine,
  Ticket,
  User,
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
  { id: "budget", label: "Budget", icon: Award, to: "/org/events", ctx: "budget" },
  { id: "comms", label: "Announcements", icon: Images, to: "/org/events", ctx: "comms" },
  { id: "feedback", label: "Feedback", icon: Menu, to: "/org/events", ctx: "feedback" },
  { id: "builder", label: "Form Builder", icon: Blocks, to: "/org/events", ctx: "builder" },
  { id: "certs", label: "Cert Designer", icon: Palette, to: "/org/events", ctx: "certdesigner" },
  { id: "gallery", label: "Gallery Upload", icon: Camera, to: "/org/events", ctx: "galleryupload" },
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
    case "budget": return lastEvent ? `/org/events/${lastEvent}/budget` : "/org/events";
    case "comms": return lastEvent ? `/org/events/${lastEvent}/communication` : "/org/events";
    case "feedback": return lastEvent ? `/org/events/${lastEvent}/feedback` : "/org/events";
    case "builder": return lastEvent ? `/org/events/${lastEvent}/form` : "/org/events";
    case "certdesigner": return lastEvent ? `/org/events/${lastEvent}/certificate` : "/org/events";
    case "galleryupload": return lastEvent ? `/org/events/${lastEvent}/gallery` : "/org/events";
    default: return to;
  }
}

// ── Geometry constants ────────────────────────────────────────
// Pole = top-right corner of viewport. θ=0 = top edge, θ=90 = right edge.
// dx = -R sin(θ), dy = R cos(θ)  (from the pole)
const SLOTS = [18, 47, 76] as const;  // degrees, evenly spaced ~29° apart
const ANGULAR_SPACING = 29;           // degrees between items in the ring
const ICON_RADIUS_RATIO = 0.80;       // icons sit at 80% of panel size

const deg2rad = (d: number) => (d * Math.PI) / 180;

/** Convert an angle (from top edge) to CSS pixel offsets from the top-right pole. */
function polarToOffset(angleDeg: number, radius: number) {
  const rad = deg2rad(angleDeg);
  return {
    dx: -radius * Math.sin(rad),  // leftward
    dy: radius * Math.cos(rad),   // downward
  };
}

export function OrbitNav() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [ripples, setRipples] = useState<number[]>([]);
  const scrollCooldown = useRef(false);

  const mode = profile?.currentMode ?? "participant";
  const items = mode === "organizer" ? ORGANIZER_ITEMS : PARTICIPANT_ITEMS;
  const itemCount = items.length;

  // Close on navigation
  useEffect(() => { setCollapsed(true); }, [location.pathname]);

  // Scroll handler — debounced so one gesture = one step
  useEffect(() => {
    if (collapsed) return;
    const onWheel = (e: WheelEvent) => {
      if (scrollCooldown.current) return;
      scrollCooldown.current = true;
      setTimeout(() => { scrollCooldown.current = false; }, 300);
      e.preventDefault();
      setRotationIndex((prev) => {
        if (e.deltaY > 0) return (prev + 1) % itemCount;
        if (e.deltaY < 0) return (prev - 1 + itemCount) % itemCount;
        return prev;
      });
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [collapsed, itemCount]);

  // Keyboard escape
  useEffect(() => {
    if (collapsed) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCollapsed(true); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [collapsed]);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      // Spawn ripple on every toggle
      const now = Date.now();
      setRipples((prev) => [...prev, now]);
      setTimeout(() => { setRipples((prev) => prev.filter((t) => t !== now)); }, 650);
      if (!c) return true;  // collapsing
      setRotationIndex(0);
      return false;
    });
  }, []);

  const go = (item: WheelItem) => {
    setCollapsed(true);
    navigate(resolveCtx(item.to, item.ctx));
  };

  const activePath = location.pathname;

  // Active index = rotationIndex + 1 (the middle slot is the focused item)
  const activeItemIndex = (rotationIndex + 1) % itemCount;

  // Panel size (viewport-responsive)
  const panelSize = 480; // max; CSS will clamp via min(46vw, 480px)

  // Icon radius — pushed outward near the curved edge
  const iconRadius = panelSize * ICON_RADIUS_RATIO;

  // Compute which 3 items are visible and where they go
  const visibleItems = useMemo(() => {
    return items.map((item, i) => {
      // Position in the virtual ring relative to rotation
      const raw = ((i - rotationIndex) % itemCount + itemCount) % itemCount;

      let slotAngle: number;
      let opacity = 0;
      let scale = 0.85;
      let isActive = false;

      if (raw === 0) {
        slotAngle = SLOTS[0];  // first slot — incoming, dim
        opacity = 0.6;
        scale = 0.9;
      } else if (raw === 1) {
        slotAngle = SLOTS[1];  // middle slot — active/focused
        opacity = 1;
        scale = 1;
        isActive = true;
      } else if (raw === 2) {
        slotAngle = SLOTS[2];  // third slot — outgoing, dim
        opacity = 0.6;
        scale = 0.9;
      } else {
        // Off-stage: just beyond the last slot
        slotAngle = SLOTS[2] + ANGULAR_SPACING;
        opacity = 0;
        scale = 0.7;
      }

      const { dx, dy } = polarToOffset(slotAngle, iconRadius);

      const resolvedPath = resolveCtx(item.to, item.ctx);
      const itemActive = activePath.startsWith(resolvedPath.split("/").slice(0, 3).join("/"));

      return { item, dx, dy, opacity, scale, isActive: isActive && itemActive, angle: slotAngle, raw };
    });
  }, [items, rotationIndex, activePath, itemCount, iconRadius]);

  const displayName = profile?.name || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* ═══ Toggle button — fixed at the corner pole ═══ */}
      <button
        type="button"
        aria-label={collapsed ? "Open navigation" : "Close navigation"}
        onClick={toggle}
        className="fixed right-5 top-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-ember/50 bg-gradient-to-br from-ember/30 to-ember/10 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 sm:right-6 sm:top-6"
        style={{
          boxShadow: collapsed
            ? "0 8px 30px -6px rgba(255,92,56,0.5), 0 0 20px -4px rgba(255,92,56,0.3)"
            : "0 4px 20px -4px rgba(255,92,56,0.3)",
        }}
      >
        {/* Ripple rings */}
        {ripples.map((t) => (
          <span key={t} className="absolute inset-0 rounded-full orb-ripple" />
        ))}
        {!collapsed && <span className="absolute inset-0 rounded-full orb-ring" />}
        <span className="absolute inset-[3px] rounded-full border border-ember/20" />
        {collapsed ? (
          <span className="relative flex h-full w-full items-center justify-center">
            {user ? (
              <span className="text-xs font-bold text-ember">{initials}</span>
            ) : (
              <Menu className="h-5 w-5 text-ember" />
            )}
          </span>
        ) : (
          <X className="h-5 w-5 transition-transform duration-300" style={{ transform: "rotate(0deg)" }} />
        )}
      </button>

      {/* ═══ Quarter-circle panel ═══ */}
      <div
        className="fixed right-0 top-0 z-50 orb-scanlines"
        style={{
          width: "min(46vw, 480px)",
          minWidth: 280,
          height: "min(46vw, 480px)",
          minHeight: 280,
          borderRadius: "0 0 0 100%",
          background: "radial-gradient(ellipse at 100% 0%, oklch(0.22 0.05 305 / 0.95), oklch(0.09 0.03 305 / 0.98))",
          border: "1px solid oklch(0.8 0.14 78 / 0.12)",
          borderRight: "none",
          borderTop: "none",
          transformOrigin: "top right",
          transform: collapsed ? "scale(0.06)" : "scale(1)",
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          transition: "transform .5s cubic-bezier(.65,0,.35,1), opacity .5s ease",
          overflow: "visible",
        }}
      >
        {/* SVG arc stroke along the curved edge */}
        <svg
          className="pointer-events-none absolute inset-0"
          width="100%"
          height="100%"
          viewBox={`0 0 ${panelSize} ${panelSize}`}
          preserveAspectRatio="xMaxYMin meet"
        >
          <circle
            cx={panelSize}
            cy={0}
            r={iconRadius}
            fill="none"
            stroke="oklch(0.78 0.18 45 / 0.15)"
            strokeWidth="1"
            strokeDasharray="4 6"
            clipPath="url(#quarterClip)"
          />
          <defs>
            <clipPath id="quarterClip">
              <rect x="0" y="0" width={panelSize} height={panelSize} />
            </clipPath>
          </defs>
        </svg>

        {/* Nav items along the arc */}
        {visibleItems.map(({ item, dx, dy, opacity, scale, isActive }) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item)}
              className="absolute flex flex-col items-center gap-1.5 outline-none"
              style={{
                right: -dx,   // dx is negative (leftward), so -dx is positive rightward from pole
                top: dy,      // dy is downward from pole
                transform: `translate(50%, 0) scale(${scale})`,
                opacity,
                transition: "transform .5s cubic-bezier(.65,0,.35,1), opacity .5s ease",
                pointerEvents: opacity < 0.3 ? "none" : "auto",
                zIndex: isActive ? 20 : 10 - Math.abs(dy),
              }}
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300"
                style={{
                  borderColor: isActive
                    ? "oklch(0.78 0.18 45 / 0.9)"
                    : "oklch(0.78 0.18 45 / 0.25)",
                  background: isActive
                    ? "oklch(0.78 0.18 45 / 0.25)"
                    : "oklch(0 0 0 / 0.45)",
                  color: isActive
                    ? "oklch(0.78 0.18 45)"
                    : "oklch(1 0 0 / 0.7)",
                  boxShadow: isActive
                    ? "0 0 24px oklch(0.78 0.18 45 / 0.5), 0 0 48px -8px oklch(0.78 0.18 45 / 0.2)"
                    : "0 2px 8px rgba(0,0,0,0.25)",
                }}
              >
                <Icon className="h-6 w-6" />
              </span>
              {/* Label — only shown on the active item */}
              {isActive && (
                <span
                  className="whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                  style={{
                    border: "1px solid oklch(0.78 0.18 45 / 0.25)",
                    background: "oklch(0 0 0 / 0.75)",
                    color: "oklch(0.78 0.18 45)",
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Pagination dots */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-1.5" style={{ transform: "translateX(-50%)" }}>
          {items.map((_, i) => {
            const isActiveDot = i === activeItemIndex;
            return (
              <span
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: isActiveDot ? 8 : 4,
                  height: isActiveDot ? 8 : 4,
                  background: isActiveDot
                    ? "oklch(0.78 0.18 45)"
                    : "oklch(1 0 0 / 0.15)",
                  boxShadow: isActiveDot ? "0 0 8px oklch(0.78 0.18 45 / 0.5)" : "none",
                }}
              />
            );
          })}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-center whitespace-nowrap">
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/25">
            scroll to rotate
          </span>
        </div>
      </div>
    </>
  );
}
