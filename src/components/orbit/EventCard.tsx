import type { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router";
import { TYPE_LABEL, daysUntil, fmtRange } from "@/lib/orbit";
import { EventArt } from "./EventArt";

type Event = Doc<"events">;

export function EventCard({
  event,
  registered,
  ended,
}: {
  event: Event;
  registered?: boolean;
  ended?: boolean;
}) {
  const days = daysUntil(event.startDate);
  const live = event.regOpen && event.status === "published" && days >= 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className="orb-card group block overflow-hidden"
      onClick={() => sessionStorage.setItem("orbit:lastEvent", event._id)}
    >
      {/* poster cover — taller, more prominent */}
      <div className="event-poster relative h-52 sm:h-60">
        <EventArt seed={event._id} accent={event.accent} className="event-poster__img" />
        <div className="event-poster__overlay" />
        <div
          className="event-poster__glow"
          style={{
            background: `radial-gradient(ellipse at 30% 70%, ${event.accent}55, transparent 60%), radial-gradient(ellipse at 80% 20%, ${event.accent}33, transparent 50%)`,
          }}
        />

        {/* title overlay at bottom */}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <p className="font-display text-2xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-3xl">
            {event.title}
          </p>
          <p className="mt-1.5 max-w-[85%] truncate text-sm text-white/75">
            {event.tagline}
          </p>
        </div>

        {/* type badge top-right */}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <Badge
            className="border-white/15 bg-black/40 font-semibold uppercase tracking-wider text-white backdrop-blur-md"
            style={{ borderColor: `${event.accent}55` }}
          >
            {TYPE_LABEL[event.type]}
          </Badge>
        </div>

        {/* bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${event.accent}88, transparent)` }} />
      </div>

      {/* body */}
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2 text-xs text-foreground/60">
          <CalendarDays className="h-3.5 w-3.5 text-ember" />
          <span>{fmtRange(event.startDate, event.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground/60">
          <MapPin className="h-3.5 w-3.5 text-ember" />
          <span className="truncate">
            {event.venue} · {event.city}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-foreground/40">
            <Users className="h-3.5 w-3.5" />
            {event.registrationType === "individual"
              ? "Individual"
              : event.registrationType === "team"
                ? `Teams of ${event.maxTeamSize}`
                : `Individual · Teams of ${event.maxTeamSize}`}
          </div>
          {registered ? (
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              Registered ✓
            </span>
          ) : ended ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
              Ended
            </span>
          ) : live ? (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: event.accent, background: `${event.accent}15` }}
            >
              {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
              {event.status}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
