import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Blocks,
  LayoutGrid,
  Palette,
  Plus,
  ScanLine,
  Sparkles,
  Ticket } from
"lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TYPE_LABEL, fmtRange } from "@/lib/orbit";
import { EventArt } from "@/components/orbit/EventArt";

export default function OrgEvents() {
  const myEvents = useQuery(api.events.myEvents);
  const createSample = useMutation(api.seed.createSampleEvent);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateSample = async () => {
    setCreating(true);
    try {
      const id = await createSample();
      navigate(`/org/events/${id}`);
      toast.success("Sample event created — start with the form builder");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create sample");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-24 sm:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
            Organizer studio
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            My events
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
            Create events, design registration forms, scan passes at the door, and
            publish certificates and galleries — all from here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCreateSample}
            disabled={creating}
            className="gap-2 rounded-full border-white/15 bg-white/5 text-white hover:border-ember/50 hover:bg-ember/10">
            
            <Sparkles className="h-4 w-4 text-ember" />
            {creating ? "Creating…" : "Create sample"}
          </Button>
          <Button
            asChild
            className="gap-2 rounded-full bg-ember font-bold text-[#160a04] hover:bg-ember/90">
            
            <Link to="/org/events/new">
              <Plus className="h-4 w-4" /> New event
            </Link>
          </Button>
        </div>
      </motion.div>

      {myEvents === undefined ?
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) =>
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/5" />
        )}
        </div> :
      myEvents.length === 0 ?
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="orb-card mt-10 flex flex-col items-center gap-5 p-14 text-center">
        
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-ember/40 bg-ember/10">
            <LayoutGrid className="h-7 w-7 text-ember" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-white">
              No events yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">
              Create your first event, or spin up a fully-formed sample to explore
              every organizer tool immediately.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
            asChild
            className="gap-2 rounded-full bg-ember font-bold text-[#160a04] hover:bg-ember/90">
            
              <Link to="/org/events/new">
                <Plus className="h-4 w-4" /> Create an event
              </Link>
            </Button>
            <Button
            type="button"
            variant="outline"
            onClick={handleCreateSample}
            disabled={creating}
            className="gap-2 rounded-full border-white/15 text-white hover:border-ember/50 hover:bg-ember/10">
            
              <Sparkles className="h-4 w-4 text-ember" />
              {creating ? "Creating…" : "Create sample event"}
            </Button>
          </div>
        </motion.div> :

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {myEvents.map((event, i) =>
        <motion.div
          key={event._id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}>
          
              <Link
            to={`/org/events/${event._id}`}
            className="orb-card group block overflow-hidden">
            
                <div className="relative px-5 py-6">
                  <EventArt seed={event._id} accent={event.accent} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <Badge className="border-white/20 bg-black/40 font-bold uppercase tracking-wider text-white backdrop-blur">
                        {TYPE_LABEL[event.type]}
                      </Badge>
                      <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                    event.status === "published" ?
                    event.regOpen ?
                    "text-accent" :
                    "text-amber-300" :
                    "text-white/40"}`
                    }>
                    
                        {event.status === "ended" ?
                    "Ended" :
                    event.regOpen ?
                    "● Live" :
                    "Closed"}
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-xl font-bold text-white">
                      {event.title}
                    </h2>
                    <p className="mt-1 text-xs text-white/60">
                      {fmtRange(event.startDate, event.endDate)} · {event.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/8 px-5 py-3.5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    <span className="flex items-center gap-1">
                      <Ticket className="h-3 w-3" /> regs
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" /> live
                    </span>
                    <span className="flex items-center gap-1">
                      <ScanLine className="h-3 w-3" /> scan
                    </span>
                    <span className="flex items-center gap-1">
                      <Blocks className="h-3 w-3" /> form
                    </span>
                    <span className="flex items-center gap-1">
                      <Palette className="h-3 w-3" /> cert
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-ember">
                    Manage <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
        )}
        </div>
      }
    </div>);

}