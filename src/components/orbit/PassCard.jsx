
import { Badge } from "@/components/ui/badge";
import { Check, CircleDot, Ticket } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { TYPE_LABEL, certNumber, fmtRange, registrationName } from "@/lib/orbit";
import { QrCode } from "./QrCode";




function StatusPill({ reg }) {
  if (reg.status === "attended") {
    return (
      <Badge className="border-accent/40 bg-accent/15 text-accent">Attended ✓</Badge>);

  }
  if (reg.roundStatus === "selected") {
    return (
      <Badge className="border-emerald-400/40 bg-emerald-400/15 text-emerald-400">
        Advanced ✦
      </Badge>);

  }
  return (
    <Badge className="border-amber-400/40 bg-amber-400/10 text-amber-300">
      Pending entry
    </Badge>);

}

export function PassCard({
  reg,
  event,
  compact




}) {
  const isMulti = event.type === "multi" && event.subEvents.length > 0;
  const isRound = event.type === "round" && event.rounds.length > 0;

  return (
    <div
      className="orb-card orb-neon-border orb-hud-corners overflow-hidden p-0"
      style={{ ["--cover-accent"]: event.accent }}>
      
      <div className="relative border-b border-white/10 p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(70% 100% at 20% 0%, ${event.accent}44, transparent 70%)`
          }} />
        
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-white">
              {event.title}
            </p>
            <p className="mt-0.5 text-xs text-white/55">
              {fmtRange(event.startDate, event.endDate)} · {event.city}
            </p>
            {!compact &&
            <p className="mt-1.5 text-sm font-medium text-white/85">
                {registrationName(reg)}
                {reg.type === "team" && reg.teamName &&
              <span className="text-white/50"> · Team</span>
              }
              </p>
            }
          </div>
          <StatusPill reg={reg} />
        </div>
      </div>

      <div className="flex gap-5 p-5">
        <div className="shrink-0 rounded-xl bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <QrCode value={reg.qrData} size={compact ? 108 : 132} />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/45">
            <Ticket className="h-3.5 w-3.5 text-ember" />
            {TYPE_LABEL[event.type]} pass
          </div>

          {isMulti &&
          <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                Day checklist
              </p>
              {event.subEvents.map((sub) => {
              const done = reg.subStatus[sub.id] === "attended";
              return (
                <div
                  key={sub.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                    done ?
                    "border-accent/40 bg-accent/10 text-accent" :
                    "border-white/10 bg-black/20 text-white/60"
                  )}>
                  
                    {done ?
                  <Check className="h-3.5 w-3.5 shrink-0" /> :

                  <CircleDot className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  }
                    <span className="truncate">{sub.label}</span>
                  </div>);

            })}
            </div>
          }

          {isRound &&
          <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                Rounds
              </p>
              <div
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-xs",
                reg.roundStatus === "selected" ?
                "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" :
                reg.roundStatus === "eliminated" ?
                "border-white/10 bg-black/20 text-white/40 line-through" :
                "border-white/10 bg-black/20 text-white/60"
              )}>
              
                {reg.roundStatus === "selected" ?
              "Advanced to the next round ✦" :
              reg.roundStatus === "eliminated" ?
              "Eliminated in earlier round" :
              "Waiting for round results"}
              </div>
            </div>
          }

          {!isMulti && !isRound &&
          <p className="text-xs text-white/50">
              Show this QR at the venue entrance to check in.
            </p>
          }

          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] tracking-widest text-white/35">
              {certNumber(reg._id)}
            </span>
            <Link
              to={`/events/${event._id}`}
              className="text-[11px] font-semibold text-ember hover:underline">
              
              Event →
            </Link>
          </div>
        </div>
      </div>
    </div>);

}