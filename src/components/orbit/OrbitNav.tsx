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
  Palette,
  ScanLine,
  Ticket,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ── UK Flag icon (simplified inline SVG) ──────────────────────
function BritainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2L3 7v5c0 5.25 3.75 10 9 11.25C17.25 22 21 17.25 21 12V7L12 2z" />
      <path d="M12 7v5M9.5 9.5h5M12 12l-2.5 2.5M12 12l2.5 2.5" strokeWidth="1.2" />
    </svg>
  );
}

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
  { id: "britain", label: "Britain", icon: BritainIcon as unknown as LucideIcon, to: "/events", ctx: "britain" },
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
  { id: "britain", label: "Britain", icon: BritainIcon as unknown as LucideIcon, to: "/org/events", ctx: "britain" },
  { id: "budget", label: "Budget", icon: Award, to: "/org/events", ctx: "budget" },
  { id: "comms", label: "Announcements", icon: Images, to: "/org/events", ctx: "comms" },
  { id: "feedback", label: "Feedback", icon: Palette, to: "/org/events", ctx: "feedback" },
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
    case "britain": return ev("/britain", "/events");
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

const SLOTS = [20, 45, 70] as const;
const SPACING = 25;
const ICON_R_RATIO = 0.78;
const SCROLL_THRESHOLD = 30;
const deg2rad = (d: number) => (d * Math.PI) / 180;

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

  useEffect(() => {
    const measure = () => {
      if (panelRef.current) setPanelPx(panelRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => { setCollapsed(true); }, [location.pathname]);

  useEffect(() => {
    if (collapsed) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      html.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (cooldown.current) return;
      if (Math.abs(e.deltaY) < SCROLL_THRESHOLD) return;
      cooldown.current = true;
      setTimeout(() => { cooldown.current = false; }, 380);
      setRotIdx((p) => {
        if (e.deltaY > 0) return (p + 1) % total;
        return (p - 1 + total) % total;
      });
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheel, { capture: true });
  }, [collapsed, total]);

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
  const focusedIdx = (rotIdx + 1) % total;

  const positioned = useMemo(() => {
    return items.map((item, i) => {
      const raw = ((i - rotIdx) % total + total) % total;
      let slotAngle: number;
      let opacity = 0;
      let itemScale = 0.75;
      let isActive = false;
      if (raw === 0) { slotAngle = SLOTS[0]; opacity = 0.6; itemScale = 0.88; }
      else if (raw === 1) { slotAngle = SLOTS[1]; opacity = 1; itemScale = 1; isActive = true; }
      else if (raw === 2) { slotAngle = SLOTS[2]; opacity = 0.6; itemScale = 0.88; }
      else { slotAngle = SLOTS[2] + SPACING; opacity = 0; itemScale = 0.6; }
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
      {/* Backdrop */}
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

      {/* Toggle button */}
      <button
        type="button"
        aria-label={collapsed ? "Open navigation" : "Close navigation"}
        onClick={toggle}
        className="fixed bottom-5 right-5 z-[62] flex h-[46px] w-[46px] items-center justify-center rounded-full border border-ember/50 bg-gradient-to-br from-ember/30 to-ember/10 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 sm:bottom-6 sm:right-6"
        style={{ boxShadow: "0 6px 24px -4px rgba(255,92,56,0.45), 0 0 16px -2px rgba(255,92,56,0.25)" }}
      >
        {ripples.map((t) => (
          <span key={t} className="orb-ripple absolute inset-0 rounded-full" />
        ))}
        <span className="absolute inset-[3px] rounded-full border border-ember/20" />
        <X className="h-5 w-5 text-ember transition-transform duration-500" style={{ transform: collapsed ? "rotate(135deg)" : "rotate(0deg)" }} />
      </button>

      {/* Quarter-circle wheel panel — items only render when expanded */}
      {!collapsed && (
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
            overflow: "visible",
          }}
        >
          {/* Warm glow */}
          <div className="pointer-events-none absolute bottom-0 right-0" style={{ width: "60%", height: "60%", background: "radial-gradient(circle at 100% 100%, oklch(0.78 0.18 45 / 0.08), transparent 70%)" }} />

          {/* Dashed arc guide */}
          <svg className="pointer-events-none absolute inset-0" width={panelPx} height={panelPx} viewBox={`0 0 ${panelPx} ${panelPx}`}>
            <circle cx={panelPx} cy={panelPx} r={iconR} fill="none" stroke="oklch(0.78 0.18 45 / 0.1)" strokeWidth="1" strokeDasharray="3 7" />
          </svg>

          {/* Nav items */}
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
                  left: x, top: y,
                  transform: `translate(-50%, -50%) scale(${itemScale})`,
                  opacity,
                  transition: "transform .5s cubic-bezier(.65,0,.35,1), opacity .5s ease",
                  pointerEvents: opacity < 0.2 ? "none" : "auto",
                  zIndex: isActive ? 20 : 5,
                }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-[52px] sm:w-[52px]" style={{
                  borderColor: highlighted ? "oklch(0.78 0.18 45 / 0.95)" : isActive ? "oklch(0.78 0.18 45 / 0.4)" : "oklch(0.78 0.18 45 / 0.18)",
                  background: highlighted ? "oklch(0.78 0.18 45 / 0.25)" : isActive ? "oklch(0 0 0 / 0.5)" : "oklch(0 0 0 / 0.35)",
                  color: highlighted ? "oklch(0.78 0.18 45)" : isActive ? "oklch(1 0 0 / 0.85)" : "oklch(1 0 0 / 0.55)",
                  boxShadow: highlighted ? "0 0 24px oklch(0.78 0.18 45 / 0.5), 0 0 48px -8px oklch(0.78 0.18 45 / 0.2)" : "0 2px 10px rgba(0,0,0,0.3)",
                }}>
                  <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                </span>
                <span className="whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider backdrop-blur-md sm:text-[9px]" style={{
                  border: isActive ? "1px solid oklch(0.78 0.18 45 / 0.3)" : "1px solid oklch(1 0 0 / 0.08)",
                  background: isActive ? "oklch(0 0 0 / 0.8)" : "oklch(0 0 0 / 0.55)",
                  color: highlighted ? "oklch(0.78 0.18 45)" : isActive ? "oklch(1 0 0 / 0.9)" : "oklch(1 0 0 / 0.5)",
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Dot indicators */}
          <div className="absolute z-20 flex gap-1.5" style={{ left: panelPx * 0.55, top: panelPx * 0.06, transform: "translateX(-50%)" }}>
            {items.map((_, i) => {
              const activeDot = i === focusedIdx;
              return (
                <span key={i} className="rounded-full transition-all duration-400" style={{
                  width: activeDot ? 7 : 3, height: activeDot ? 7 : 3,
                  background: activeDot ? "oklch(0.78 0.18 45)" : "oklch(1 0 0 / 0.12)",
                  boxShadow: activeDot ? "0 0 6px oklch(0.78 0.18 45 / 0.5)" : "none",
                }} />
              );
            })}
          </div>

          {/* Scroll hint */}
          <div className="absolute z-20 whitespace-nowrap" style={{ left: panelPx * 0.5, top: panelPx * 0.13, transform: "translateX(-50%)" }}>
            <span className="text-[7px] font-bold uppercase tracking-[0.25em] text-white/20 sm:text-[8px]">scroll to rotate</span>
          </div>
        </div>
      )}
    </>
  );
}
