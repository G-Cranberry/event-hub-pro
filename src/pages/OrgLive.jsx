import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Users,
  X } from
"lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";



export default function OrgLive() {
  const { id = "" } = useParams();
  const data = useQuery(api.registrations.eventRegistrations, { eventId: id });
  const markAttended = useMutation(api.registrations.markAttended);
  const markSubEvent = useMutation(api.registrations.markSubEvent);
  const markRound = useMutation(api.registrations.markRound);

  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const event = data?.event ?? null;
  const regs = data?.registrations ?? [];

  const stats = useMemo(() => {
    return {
      total: regs.length,
      attended: regs.filter((r) => r.registration.status === "attended").length,
      pending: regs.filter((r) => r.registration.status === "pending").length,
      selected: regs.filter((r) => r.registration.roundStatus === "selected").length,
      eliminated: regs.filter((r) => r.registration.roundStatus === "eliminated").length
    };
  }, [regs]);

  const filtered = useMemo(() => {
    let list = regs;
    if (status === "pending") list = list.filter((r) => r.registration.status === "pending");
    if (status === "attended") list = list.filter((r) => r.registration.status === "attended");
    if (status === "selected") list = list.filter((r) => r.registration.roundStatus === "selected");
    if (status === "eliminated") list = list.filter((r) => r.registration.roundStatus === "eliminated");
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
        r.participantName.toLowerCase().includes(needle) ||
        r.participantEmail.toLowerCase().includes(needle) ||
        (r.registration.teamName ?? "").toLowerCase().includes(needle)
      );
    }
    return list;
  }, [regs, status, q]);

  if (!event) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-white/50">
          Loading live dashboard…
        </div>
      </div>);

  }

  const isRound = event.type === "round";
  const isMulti = event.type === "multi" && event.subEvents.length > 0;

  const run = async (fn) => {
    try {
      await fn();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
      <Link
        to={`/org/events/${event._id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-ember">
        
        <ArrowLeft className="h-3.5 w-3.5" /> Event hub
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
            Live dashboard
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">
            {event.title}
          </h1>
          <p className="mt-1 text-xs text-white/45">
            Updates in real time as participants register and get scanned.
          </p>
        </div>
        <Badge className="w-fit border-accent/40 bg-accent/10 text-accent">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Live
        </Badge>
      </motion.div>

      {/* stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
        { label: "Registered", value: stats.total, color: "text-white" },
        { label: "Attended", value: stats.attended, color: "text-accent" },
        { label: "Pending", value: stats.pending, color: "text-amber-300" },
        { label: "Advanced", value: stats.selected, color: "text-emerald-400" },
        { label: "Eliminated", value: stats.eliminated, color: "text-red-300" }].
        map(({ label, value, color }) =>
        <div key={label} className="orb-card p-4">
            <p className={cn("font-display text-3xl font-bold", color)}>{value}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
              {label}
            </p>
          </div>
        )}
      </div>

      {/* Scan Activity Pulse */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6 orb-card orb-neon-border p-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
            </span>
            <h2 className="font-display text-lg font-bold text-white">Scan Activity</h2>
          </div>
          <p className="text-[11px] text-white/45">Real-time check-in heatmap</p>
        </div>
        <div className="mt-4 grid grid-cols-24 gap-1" style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)" }}>
          {Array.from({ length: 24 }).map((_, hour) => {
            const hourScans = regs.filter((r) => {
              if (r.registration.status !== "attended") return false;
              const d = new Date(r.registration.createdAt);
              return d.getHours() === hour;
            }).length;
            const intensity = stats.attended > 0 ? hourScans / Math.max(stats.attended * 0.15, 1) : 0;
            const clamped = Math.min(intensity, 1);
            return (
              <div
                key={hour}
                className="relative group"
                title={`${hour}:00 — ${hourScans} check-ins`}>
                
                <div
                  className="aspect-square rounded-sm transition-all duration-300"
                  style={{
                    background: hourScans === 0 ?
                    "rgba(255,255,255,0.03)" :
                    `rgba(255, ${Math.round(120 - clamped * 80)}, ${Math.round(50 - clamped * 30)}, ${0.2 + clamped * 0.8})`,
                    boxShadow: hourScans > 0 ? `0 0 ${4 + clamped * 12}px rgba(255,120,50,${clamped * 0.4})` : "none"
                  }} />
                
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/30">
                  {hour % 3 === 0 ? `${hour}` : ""}
                </span>
              </div>);

          })}
        </div>
        <div className="mt-8 flex items-center gap-4 text-[10px] text-white/40">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(255,255,255,0.03)" }} />
            <span>No scans</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(255,120,50,0.3)" }} />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(255,50,20,0.9)" }} />
            <span>Peak</span>
          </div>
        </div>
      </motion.div>

      {/* toolbar */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {
          [
          ["all", "All", stats.total],
          ["pending", "Pending", stats.pending],
          ["attended", "Attended", stats.attended],
          ["selected", "Advanced", stats.selected],
          ["eliminated", "Eliminated", stats.eliminated]].

          map(([key, label, count]) =>
          <button
            key={key}
            type="button"
            onClick={() => setStatus(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              status === key ?
              "border-ember bg-ember text-[#160a04]" :
              "border-white/12 bg-black/25 text-white/60 hover:border-white/30 hover:text-white"
            )}>
            
              {label}
              <span className={cn("text-[10px]", status === key ? "text-[#160a04]/70" : "text-ember")}>
                {count}
              </span>
            </button>
          )}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, team…"
          className="h-10 w-full rounded-full border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-ember/60 lg:w-64" />
        
      </div>

      {/* roster */}
      <div className="mt-6 space-y-2">
        {filtered.length === 0 &&
        <div className="orb-card flex flex-col items-center gap-3 p-12 text-center">
            <Users className="h-8 w-8 text-white/25" />
            <p className="font-display text-lg font-bold text-white">No registrations yet</p>
            <p className="max-w-sm text-sm text-white/50">
              Registrations appear here the moment participants sign up. Share the
              event link to get the ball rolling.
            </p>
          </div>
        }

        {filtered.map(({ registration, participantName, participantEmail }, i) => {
          const reg = registration;
          const isOpen = expanded === reg._id;
          const isAttended = reg.status === "attended";
          const isSelected = reg.roundStatus === "selected";
          const isEliminated = reg.roundStatus === "eliminated";
          return (
            <motion.div
              key={reg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              className="orb-card overflow-hidden p-0">
              
              {/* row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : reg._id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                      isAttended ?
                      "border-accent/50 bg-accent/15 text-accent" :
                      isSelected ?
                      "border-emerald-400/50 bg-emerald-400/15 text-emerald-400" :
                      isEliminated ?
                      "border-red-400/40 bg-red-400/10 text-red-300" :
                      "border-amber-400/40 bg-amber-400/10 text-amber-300"
                    )}>
                    
                    {participantName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {participantName}
                      {reg.type === "team" && reg.teamName &&
                      <span className="ml-1.5 text-xs font-medium text-white/40">
                          · {reg.teamName}
                        </span>
                      }
                    </span>
                    <span className="block truncate text-[11px] text-white/40">
                      {participantEmail}
                    </span>
                  </span>
                </button>

                <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                  {isAttended ?
                  <Badge className="border-accent/40 bg-accent/15 text-accent">Attended ✓</Badge> :
                  isSelected ?
                  <Badge className="border-emerald-400/40 bg-emerald-400/15 text-emerald-400">Advanced ✦</Badge> :
                  isEliminated ?
                  <Badge className="border-red-400/40 bg-red-400/10 text-red-300">Eliminated</Badge> :

                  <Badge className="border-amber-400/40 bg-amber-400/10 text-amber-300">Pending</Badge>
                  }
                </div>

                <Button
                  type="button"
                  size="sm"
                  disabled={busyId === `att-${reg._id}`}
                  onClick={() => {
                    setBusyId(`att-${reg._id}`);
                    run(async () => {
                      await markAttended({ registrationId: reg._id });
                      toast.success(isAttended ? "Marked as pending" : "Checked in!");
                    });
                  }}
                  className={cn(
                    "h-8 shrink-0 rounded-full px-3.5 text-xs font-bold",
                    isAttended ?
                    "border border-white/15 bg-black/30 text-white/70 hover:bg-black/50" :
                    "bg-ember text-[#160a04] hover:bg-ember/90"
                  )}>
                  
                  {isAttended ? "Undo" : "Check in"}
                </Button>

                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : reg._id)}
                  className={cn(
                    "shrink-0 rounded-md p-1 text-white/40 transition-transform hover:text-white",
                    isOpen && "rotate-180"
                  )}>
                  
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* expand */}
              {isOpen &&
              <div className="border-t border-white/8 bg-black/20 px-4 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* multi-day check-ins */}
                    {isMulti &&
                  <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                          Day check-ins
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {event.subEvents.map((sub) => {
                        const done = reg.subStatus[sub.id] === "attended";
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            disabled={busyId === `sub-${reg._id}-${sub.id}`}
                            onClick={() => {
                              setBusyId(`sub-${reg._id}-${sub.id}`);
                              run(() => markSubEvent({ registrationId: reg._id, subEventId: sub.id }));
                            }}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                              done ?
                              "border-accent/50 bg-accent/15 text-accent" :
                              "border-white/12 bg-black/25 text-white/55 hover:border-white/30"
                            )}>
                            
                                {done ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                                {sub.label}
                              </button>);

                      })}
                        </div>
                      </div>
                  }

                    {/* round status */}
                    {isRound &&
                  <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                          Round status
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {
                      [
                      ["none", "Not started", "text-white/60 border-white/15"],
                      ["selected", "Advanced ✦", "text-emerald-400 border-emerald-400/50"],
                      ["eliminated", "Eliminated", "text-red-300 border-red-400/40"]].

                      map(([value, label, cls]) =>
                      <button
                        key={value}
                        type="button"
                        disabled={busyId === `r-${reg._id}`}
                        onClick={() => {
                          setBusyId(`r-${reg._id}`);
                          run(() => markRound({ registrationId: reg._id, roundStatus: value }));
                        }}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                          reg.roundStatus === value ? cn("bg-emerald-400/10", cls) : cn("border-white/12 bg-black/25 text-white/55 hover:border-white/30", cls)
                        )}>
                        
                              {label}
                            </button>
                      )}
                        </div>
                      </div>
                  }

                    {/* team members */}
                    {reg.type === "team" && reg.teamMembers && reg.teamMembers.length > 0 &&
                  <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                          Team members
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {reg.teamMembers.map((m, idx) =>
                      <span
                        key={idx}
                        className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/70">
                        
                              {m}
                            </span>
                      )}
                        </div>
                      </div>
                  }

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                        Pass code
                      </p>
                      <p className="mt-2 break-all rounded-lg border border-white/8 bg-black/30 px-3 py-2 font-mono text-[11px] text-white/50">
                        {reg.qrData}
                      </p>
                    </div>
                  </div>
                </div>
              }
            </motion.div>);

        })}
      </div>

      {regs.length > 0 &&
      <p className="mt-6 flex items-center gap-2 text-[11px] text-white/35">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
          Actions here update participant passes instantly — no refresh needed.
        </p>
      }
    </div>);

}