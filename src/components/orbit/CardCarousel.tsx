import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { TYPE_LABEL, fmtRange } from "@/lib/orbit";
import { EventArt } from "./EventArt";
import "./card-carousel.css";

type Event = Doc<"events">;

/** 3D card carousel with swipe/scroll gestures. */
export function CardCarousel({ events }: { events: Event[] }) {
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const dragStartX = useRef(0);
  const dragDelta = useRef(0);
  const isDragging = useRef(false);
  const total = events.length;
  const totalRef = useRef(total);
  totalRef.current = total;

  function prev() {
    setActive((a) => (a - 1 + totalRef.current) % totalRef.current);
    setFlipped({});
  }

  function next() {
    setActive((a) => (a + 1) % totalRef.current);
    setFlipped({});
  }

  function toggleFlip(id: string) {
    if (isDragging.current) return;
    setFlipped((f) => ({ ...f, [id]: !f[id] }));
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX;
    dragDelta.current = 0;
    isDragging.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const dx = e.clientX - dragStartX.current;
    dragDelta.current = dx;
    if (Math.abs(dx) > 5) isDragging.current = true;
  }

  function handlePointerUp() {
    const threshold = 50;
    if (dragDelta.current > threshold) prev();
    else if (dragDelta.current < -threshold) next();
    setTimeout(() => { isDragging.current = false; }, 10);
  }

  function handleWheel(e: React.WheelEvent) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (e.deltaX > 30) next();
      else if (e.deltaX < -30) prev();
    } else {
      if (e.deltaY > 30) next();
      else if (e.deltaY < -30) prev();
    }
  }

  if (total === 0) return null;

  const getSlotIndex = (slot: "left" | "center" | "right") => {
    if (slot === "center") return active;
    if (slot === "left") return (active - 1 + total) % total;
    return (active + 1) % total;
  };

  const slots = (["left", "center", "right"] as const).map((slot) => {
    const idx = getSlotIndex(slot);
    return { slot, event: events[idx], idx };
  });

  return (
    <div
      className="flex flex-col items-center touch-pan-y"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      style={{ touchAction: "pan-y" }}
    >
      <div className="card-carousel cursor-grab active:cursor-grabbing">
        <div className="card-surface" />
        {slots.map(({ slot, event }) => {
          const isFlipped = !!flipped[event._id];
          return (
            <div key={event._id} className={`card-carousel__slot card-carousel__slot--${slot}`}>
              <div
                className={`card-3d ${isFlipped ? "card-3d--flipped" : ""}`}
                onClick={() => slot === "center" && toggleFlip(event._id)}
                style={{
                  ["--card-glow" as string]: `${event.accent}55`,
                  ["--card-bg" as string]: `linear-gradient(160deg, #1a1028 0%, #120a1e 100%)`,
                }}
              >
                <div className="card-3d__face card-3d__front">
                  <EventArt
                    seed={event._id}
                    accent={event.accent}
                    title={event.title}
                    tagline={event.tagline}
                    eventType={event.type}
                    startDate={event.startDate}
                    className="absolute inset-0"
                  />
                </div>
                <div className="card-3d__face card-3d__back" style={{ background: `linear-gradient(160deg, #1a1028, ${event.accent}12)` }}>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ border: `1.5px solid ${event.accent}55`, background: `${event.accent}15` }}>
                    <Sparkles className="h-4 w-4" style={{ color: event.accent }} />
                  </div>
                  <p className="font-display text-lg font-bold leading-tight" style={{ color: event.accent }}>{event.title}</p>
                  <p className="mt-2 text-[11px] leading-5 text-white/55">{event.tagline}</p>
                  <div className="mt-3 h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${event.accent}55, transparent)` }} />
                  <p className="mt-3 text-[10px] uppercase tracking-widest text-white/40">{fmtRange(event.startDate, event.endDate)} · {event.city}</p>
                  <p className="mt-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: event.accent, background: `${event.accent}15`, border: `1px solid ${event.accent}30` }}>
                    {TYPE_LABEL[event.type]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-nav">
        <button type="button" className="card-nav__btn" onClick={prev}>
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </button>
        <div className="card-nav__dots">
          {events.map((e, i) => (
            <button
              key={e._id}
              type="button"
              className={`card-nav__dot ${i === active ? "card-nav__dot--active" : ""}`}
              onClick={() => { setActive(i); setFlipped({}); }}
              aria-label={`Go to ${e.title}`}
            />
          ))}
        </div>
        <button type="button" className="card-nav__btn" onClick={next}>
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Cinematic background with candle glows */
export function CinematicBg({ children }: { children: React.ReactNode }) {
  return (
    <div className="cinematic-bg relative w-full overflow-hidden rounded-3xl border border-white/5">
      <div className="candle-glow candle-glow--1" />
      <div className="candle-glow candle-glow--2" />
      <div className="candle-glow candle-glow--3" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
