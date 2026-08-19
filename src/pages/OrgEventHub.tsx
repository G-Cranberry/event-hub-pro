import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Blocks,
  Camera,
  DollarSign,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Palette,
  PencilLine,
  ScanLine,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { TYPE_LABEL, fmtRange } from "@/lib/orbit";
import { EventArt } from "@/components/orbit/EventArt";

export default function OrgEventHub() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const data = useQuery(api.registrations.eventRegistrations, { eventId: id as any });
  const updateEvent = useMutation(api.events.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const event = data?.event ?? null;
  const regs = data?.registrations ?? [];

  if (!event) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-white/50">
          Loading event…
        </div>
      </div>
    );
  }

  const attended = regs.filter((r) => r.registration.status === "attended").length;
  const pending = regs.length - attended;
  const selected = regs.filter((r) => r.registration.roundStatus === "selected").length;

  const toggleRegOpen = async () => {
    await updateEvent({ eventId: event._id, patch: { regOpen: !event.regOpen } });
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteEvent({ eventId: event._id });
      toast.success("Event deleted");
      navigate("/org/events");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  };

  const tools = [
    {
      label: "Live dashboard",
      desc: "Registrations & attendance in real time",
      icon: Activity,
      to: `/org/events/${event._id}/live`,
      accent: "border-ember/40 bg-ember/10 text-ember",
    },
    {
      label: "QR scanner",
      desc: "Scan passes at the door",
      icon: ScanLine,
      to: `/org/events/${event._id}/scanner`,
      accent: "border-accent/40 bg-accent/10 text-accent",
    },
    {
      label: "Form builder",
      desc: "Design the registration form",
      icon: Blocks,
      to: `/org/events/${event._id}/form`,
      accent: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    },
    {
      label: "Certificate designer",
      desc: "Tune the certificate template",
      icon: Palette,
      to: `/org/events/${event._id}/certificate`,
      accent: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    },
    {
      label: "Gallery upload",
      desc: "Publish event photos",
      icon: Camera,
      to: `/org/events/${event._id}/gallery`,
      accent: "border-accent/40 bg-accent/10 text-accent",
    },
    {
      label: "Budget & sponsors",
      desc: "Track expenses and sponsor contributions",
      icon: DollarSign,
      to: `/org/events/${event._id}/budget`,
      accent: "border-gold/40 bg-gold/10 text-gold",
    },
    {
      label: "Announcements",
      desc: "Send updates to registered participants",
      icon: Megaphone,
      to: `/org/events/${event._id}/communication`,
      accent: "border-ember/40 bg-ember/10 text-ember",
    },
    {
      label: "Feedback",
      desc: "View participant feedback and ratings",
      icon: MessageSquare,
      to: `/org/events/${event._id}/feedback`,
      accent: "border-accent/40 bg-accent/10 text-accent",
    },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
      <Link
        to="/org/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-ember"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> My events
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="orb-card relative mt-4 overflow-hidden px-6 py-8 sm:px-10"
      >
        <EventArt seed={event._id} accent={event.accent} showOrbit={false} />
        <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-white/20 bg-black/40 font-bold uppercase tracking-wider text-white">
            {TYPE_LABEL[event.type]}
          </Badge>
          <Badge
            className={
              event.status === "ended"
                ? "border-white/15 bg-black/30 text-white/50"
                : event.regOpen
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-amber-400/40 bg-amber-400/10 text-amber-300"
            }
          >
            {event.status === "ended"
              ? "Ended"
              : event.regOpen
                ? "● Registration open"
                : "Registration closed"}
          </Badge>
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {event.title}
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {fmtRange(event.startDate, event.endDate)} · {event.venue}, {event.city}
        </p>
        </div>
      </motion.div>

      {/* stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
        className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: "Registered", value: regs.length, icon: Users, color: "text-ember" },
          { label: "Attended", value: attended, icon: Activity, color: "text-accent" },
          { label: "Pending entry", value: pending, icon: ScanLine, color: "text-amber-300" },
          { label: "Advanced", value: selected, icon: LayoutGrid, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="orb-card p-4 sm:p-5">
            <Icon className={`h-5 w-5 ${color}`} />
            <p className="mt-5 font-display text-3xl font-bold text-white">{value}</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              {label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* tools */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="mt-10"
      >
        <h2 className="mb-4 font-display text-lg font-bold text-white">Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ label, desc, icon: Icon, to, accent }) => (
            <Link key={label} to={to} className="orb-card group flex items-center gap-3.5 p-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="truncate text-[11px] text-white/45">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="orb-card mt-10 p-6"
      >
        <h2 className="font-display text-lg font-bold text-white">Event settings</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-white">Registration open</p>
              <p className="text-xs text-white/45">
                Participants can register and receive passes.
              </p>
            </div>
            <Switch checked={event.regOpen} onCheckedChange={toggleRegOpen} />
          </div>
          <Link
            to={`/org/events/${event._id}/form`}
            className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3.5 transition-colors hover:border-ember/40"
          >
            <div>
              <p className="text-sm font-semibold text-white">Registration form</p>
              <p className="text-xs text-white/45">
                {event.formSchema.length} fields · {event.registrationType} entry
              </p>
            </div>
            <PencilLine className="h-4 w-4 text-ember" />
          </Link>
        </div>
      </motion.div>

      {/* danger zone */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.24 }}
        className="mt-10 flex items-center justify-between rounded-xl border border-destructive/25 bg-destructive/5 px-5 py-4"
      >
        <div>
          <p className="text-sm font-bold text-red-300">Danger zone</p>
          <p className="text-xs text-white/45">
            Deletes the event, all registrations, carpools and photos.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirmDelete(true)}
          className="gap-2 border-destructive/40 text-red-300 hover:bg-destructive/15 hover:text-red-200"
        >
          <Trash2 className="h-4 w-4" /> Delete event
        </Button>
      </motion.div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="border-destructive/30 bg-[#121016]">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this event?</DialogTitle>
            <DialogDescription>
              This permanently removes <span className="font-semibold text-white">{event.title}</span>{" "}
              along with {regs.length} registration(s), carpools, and gallery photos.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} className="text-white/60">
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="gap-2 bg-destructive text-white hover:bg-destructive/85"
            >
              <Trash2 className="h-4 w-4" /> {busy ? "Deleting…" : "Delete event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
