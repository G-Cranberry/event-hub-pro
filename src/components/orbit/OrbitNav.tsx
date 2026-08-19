import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "./ProfileProvider";
import { useLocation, useNavigate } from "react-router";
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
  const ev = (s: string, f: string) => lastEvent ? `/events/${lastEvent}${s}` : f;
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

// ── Geometry ──────────────────────────────────────────────────
// Panel anchored at bottom-right. Quarter-circle with curve toward top-left.
// Straight edges: bottom and right of viewport.
//
// Pole = bottom-right corner of panel (where straight edges meet).
// Angle α measured from the vertical (pointing UP from pole along right edge)
//   sweeping counterclockwise toward horizontal (pointing LEFT from pole along bottom edge).
//
// α = 0°  → on right edge, above pole
// α = 90° → on bottom edge, left of pole
//
// Panel-local coords (top-left origin):
//   x = S - R * sin(α)
//   y = S - R * cos(α)
//   where S = panel size, R = icon radius

const SLOTS = [20, 45, 70] as const; // 3 visible slot angles (degrees)
const SPACING = 25; // angular spacing between items in the ring (degrees)
const ICON_R_RATIO = 0.78; // icons sit at 78% of panel size from the pole

const deg2rad = (d: number) => (d * Math.PI) / 180;

/** Convert angle α (from vertical) to panel-local pixel position. */
function arcPos(alphaDeg: number, radius: number, panelSize: number) {
  const rad = deg2rad(alphaDeg);
  return {
    x: panelSize - radius * Math.sin(rad),
    y: panelSize - radius * Math.cos(rad),
  };
}

export function OrbitNav() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [rotIdx, setRotIdx] = useState(0);
  const [ripples, setRipples] = useState<number[]>([]);
  const cooldown = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPx, setPanelPx] = useState(400);

  const mode = profile?.currentMode ?? "participant";
  const items = mode === "organizer" ? ORGANIZER_ITEMS : PARTICIPANT_ITEMS;
  const total = items.length;

  // Measure actual panel size for responsive radius
  useEffect(() => {
    const measure = () => {
      if (panelRef.current) {
        setPanelPx(panelRef.current.offsetWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Close on navigation
  useEffect(() => { setCollapsed(true); }, [location.pathname]);

  // Scroll to rotate — debounced one-step
  useEffect(() => {
    if (collapsed) return;
    const onWheel = (e: WheelEvent) => {
      if (cooldown.current) return;
      cooldown.current = true;
      setTimeout(() => { cooldown.current = false; }, 350);
      e.preventDefault();
      setRotIdx((p) => {
        if (e.deltaY > 0) return (p + 1) % total;
        if (e.deltaY < 0) return (p - 1 + total) % total;
        return p;
      });
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [collapsed, total]);

  // Escape key
  useEffect(() => {
    if (collapsed) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCollapsed(true); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [collapsed]);

  const toggle = () => {
    const now = Date.now();
    setRipples((prev) => [...prev, now]);
    setTimeout(() => setRipples((prev) => prev.filter((t) => t !== now)), 650);
    setCollapsed((c) => {
      if (!c) return true;
      setRotIdx(0);
      return false;
    });
  };

  const go = (item: WheelItem) => {
    setCollapsed(true);
    navigate(resolveCtx(item.to, item.ctx));
  };

  const activePath = location.pathname;
  const iconR = panelPx * ICON_R_RATIO;
  // The "focused" item is the one at the middle slot (rotIdx + 1)
  const focusedIdx = (rotIdx + 1) % total;

  const positioned = useMemo(() => {
    return items.map((item, i) => {
      // Ring position relative to current rotation
      const raw = ((i - rotIdx) % total + total) % total;

      let slotAngle: number;
      let opacity = 0;
      let itemScale = 0.75;
      let isActive = false;

      if (raw === 0) {
        slotAngle = SLOTS[0]; // incoming slot — dim
        opacity = 0.55;
        itemScale = 0.88;
      } else if (raw === 1) {
        slotAngle = SLOTS[1]; // center/active slot
        opacity = 1;
        itemScale = 1;
        isActive = true;
      } else if (raw === 2) {
        slotAngle = SLOTS[2]; // outgoing slot — dim
        opacity = 0.55;
        itemScale = 0.88;
      } else {
        // Off-stage: just past the last visible slot
        slotAngle = SLOTS[2] + SPACING;
        opacity = 0;
        itemScale = 0.6;
      }

      const { x, y } = arcPos(slotAngle, iconR, panelPx);

      const resolvedPath = resolveCtx(item.to, item.ctx);
      const isPageActive = activePath.startsWith(resolvedPath.split("/").slice(0, 3).join("/"));

      return { item, x, y, opacity, itemScale, isActive, isPageActive, angle: slotAngle, raw };
    });
  }, [items, rotIdx, activePath, total, iconR, panelPx]);

  const displayName = profile?.name || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* ═══ Backdrop ═══ */}
      <div
        className="fixed inset-0 z-[55] transition-all duration-500"
        style={{
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          backdropFilter: collapsed ? "none" : "blur(6px) brightness(0.6)",
          WebkitBackdropFilter: collapsed ? "none" : "blur(6px) brightness(0.6)",
          background: collapsed ? "transparent" : "rgba(0,0,0,0.15)",
        }}
        onClick={() => setCollapsed(true)}
      />

      {/* ═══ Toggle button — fixed bottom-right corner ═══ */}
      <button
        type="button"
        aria-label={collapsed ? "Open navigation" : "Close navigation"}
        onClick={toggle}
        className="fixed bottom-5 right-5 z-[62] flex h-[46px] w-[46px] items-center justify-center rounded-full border border-ember/50 bg-gradient-to-br from-ember/30 to-ember/10 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 sm:bottom-6 sm:right-6"
        style={{
          boxShadow: "0 6px 24px -4px rgba(255,92,56,0.45), 0 0 16px -2px rgba(255,92,56,0.25)",
        }}
      >
        {/* Ripple rings */}
        {ripples.map((t) => (
          <span key={t} className="orb-ripple absolute inset-0 rounded-full" />
        ))}
        <span className="absolute inset-[3px] rounded-full border border-ember/20" />
        <X
          className="h-5 w-5 text-ember transition-transform duration-500"
          style={{ transform: collapsed ? "rotate(135deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* ═══ Quarter-circle wheel panel ═══ */}
      <div
        ref={panelRef}
        className="fixed bottom-0 right-0 z-[56]"
        style={{
          width: "min(45vw, 480px)",
          minWidth: 280,
          height: "min(45vw, 480px)",
          minHeight: 280,
          borderRadius: "100% 0 0 0 / 100% 0 0 0",
          background: "linear-gradient(135deg, oklch(0.12 0.04 305) 0%, oklch(0.07 0.025 305) 60%, oklch(0.18 0.05 305 / 0.6) 100%)",
          border: "1px solid oklch(0.8 0.14 78 / 0.1)",
          borderBottom: "none",
          borderRight: "none",
          transformOrigin: "bottom right",
          transform: collapsed ? "scale(0.05)" : "scale(1)",
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          transition: "transform .5s cubic-bezier(.65,0,.35,1), opacity .45s ease",
          overflow: "visible",
        }}
      >
        {/* Warm glow from the corner */}
        <div
          className="pointer-events-none absolute bottom-0 right-0"
          style={{
            width: "60%",
            height: "60%",
            background: "radial-gradient(circle at 100% 100%, oklch(0.78 0.18 45 / 0.08), transparent 70%)",
          }}
        />

        {/* Dashed arc guide at icon radius */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={panelPx}
          height={panelPx}
          viewBox={`0 0 ${panelPx} ${panelPx}`}
        >
          <circle
            cx={panelPx}
            cy={panelPx}
            r={iconR}
            fill="none"
            stroke="oklch(0.78 0.18 45 / 0.1)"
            strokeWidth="1"
            strokeDasharray="3 7"
          />
        </svg>

        {/* Navigation items along the arc */}
        {positioned.map(({ item, x, y, opacity, itemScale, isActive, isPageActive }) => {
          const Icon = item.icon;
          const highlighted = isActive && isPageActive;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item)}
              className="absolute flex flex-col items-center gap-1 outline-none"
              style={{
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${itemScale})`,
                opacity,
                transition: "transform .5s cubic-bezier(.65,0,.35,1), opacity .5s ease",
                pointerEvents: opacity < 0.2 ? "none" : "auto",
                zIndex: isActive ? 20 : 5,
              }}
            >
              {/* Icon circle */}
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-14 sm:w-14"
                style={{
                  borderColor: highlighted
                    ? "oklch(0.78 0.18 45 / 0.95)"
                    : isActive
                      ? "oklch(0.78 0.18 45 / 0.4)"
                      : "oklch(0.78 0.18 45 / 0.18)",
                  background: highlighted
                    ? "oklch(0.78 0.18 45 / 0.25)"
                    : isActive
                      ? "oklch(0 0 0 / 0.5)"
                      : "oklch(0 0 0 / 0.35)",
                  color: highlighted
                    ? "oklch(0.78 0.18 45)"
                    : isActive
                      ? "oklch(1 0 0 / 0.85)"
                      : "oklch(1 0 0 / 0.55)",
                  boxShadow: highlighted
                    ? "0 0 24px oklch(0.78 0.18 45 / 0.5), 0 0 48px -8px oklch(0.78 0.18 45 / 0.2)"
                    : "0 2px 10px rgba(0,0,0,0.3)",
                }}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              {/* Label — only on the active item */}
              {isActive && (
                <span
                  className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md sm:text-[10px]"
                  style={{
                    border: "1px solid oklch(0.78 0.18 45 / 0.25)",
                    background: "oklch(0 0 0 / 0.8)",
                    color: highlighted ? "oklch(0.78 0.18 45)" : "oklch(1 0 0 / 0.8)",
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Dot indicators — near the top of the arc */}
        <div
          className="absolute z-20 flex gap-1.5"
          style={{
            left: panelPx * 0.55,
            top: panelPx * 0.06,
            transform: "translateX(-50%)",
          }}
        >
          {items.map((_, i) => {
            const activeDot = i === focusedIdx;
            return (
              <span
                key={i}
                className="rounded-full transition-all duration-400"
                style={{
                  width: activeDot ? 7 : 3,
                  height: activeDot ? 7 : 3,
                  background: activeDot ? "oklch(0.78 0.18 45)" : "oklch(1 0 0 / 0.12)",
                  boxShadow: activeDot ? "0 0 6px oklch(0.78 0.18 45 / 0.5)" : "none",
                }}
              />
            );
          })}
        </div>

        {/* Scroll hint — near top of arc */}
        <div
          className="absolute z-20 whitespace-nowrap"
          style={{
            left: panelPx * 0.5,
            top: panelPx * 0.13,
            transform: "translateX(-50%)",
          }}
        >
          <span className="text-[7px] font-bold uppercase tracking-[0.25em] text-white/20 sm:text-[8px]">
            scroll to rotate
          </span>
        </div>
      </div>
    </>
  );
}
