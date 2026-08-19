import type { Doc } from "@/convex/_generated/dataModel";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router";
import { daysUntil, fmtRange } from "@/lib/orbit";
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
      {/* poster cover — title, type, date all rendered by EventArt */}
      <div className="event-poster relative h-52 sm:h-60">
        <EventArt
          seed={event._id}
          accent={event.accent}
          title={event.title}
          tagline={event.tagline}
          eventType={event.type}
          startDate={event.startDate}
          className="event-poster__img"
        />
        <div className="event-poster__overlay" />
        <div
          className="event-poster__glow"
          style={{
            background: `radial-gradient(ellipse at 30% 70%, ${event.accent}55, transparent 60%), radial-gradient(ellipse at 80% 20%, ${event.accent}33, transparent 50%)`,
          }}
        />
      </div>

      {/* body — date, venue, registration info */}
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
