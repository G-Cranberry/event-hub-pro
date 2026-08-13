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
      {/* cover */}
      <div className="relative h-36">
        <EventArt seed={event._id} accent={event.accent} />
        <div className="absolute inset-0 flex items-end justify-between p-4">
          <div>
            <p className="font-display text-2xl font-bold leading-none text-white drop-shadow">
              {event.title}
            </p>
            <p className="mt-1.5 max-w-[80%] truncate text-xs text-white/70">
              {event.tagline}
            </p>
          </div>
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <Badge className="border-white/15 bg-black/50 font-semibold uppercase tracking-wider text-white backdrop-blur">
            {TYPE_LABEL[event.type]}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      {/* body */}
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-xs text-white/65">
          <CalendarDays className="h-3.5 w-3.5 text-ember" />
          <span>{fmtRange(event.startDate, event.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/65">
          <MapPin className="h-3.5 w-3.5 text-ember" />
          <span className="truncate">
            {event.venue} · {event.city}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/45">
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
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Ended
            </span>
          ) : live ? (
            <span className="rounded-full bg-ember/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember">
              {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {event.status}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
