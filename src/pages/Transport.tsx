import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bus,
  CalendarDays,
  Car,
  MapPin,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate } from "@/lib/orbit";

export default function Transport() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const event = useQuery(api.events.getEvent, { eventId: id as any });
  const carpools = useQuery(api.carpools.listForEvent, { eventId: id as any });
  const createCarpool = useMutation(api.carpools.createCarpool);
  const joinCarpool = useMutation(api.carpools.joinCarpool);
  const leaveCarpool = useMutation(api.carpools.leaveCarpool);
  const deleteCarpool = useMutation(api.carpools.deleteCarpool);

  const [posting, setPosting] = useState(false);
  const [from, setFrom] = useState("");
  const [seats, setSeats] = useState(2);
  const [time, setTime] = useState("08:00");
  const [notes, setNotes] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (id) sessionStorage.setItem("orbit:lastEvent", id);
  }, [id]);

  if (!event) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-white/50">
          Loading transport…
        </div>
      </div>
    );
  }

  const userId = user?._id;
  const myCarpools = (carpools ?? []).filter((c) => c.carpool.userId === userId);
  const others = (carpools ?? []).filter((c) => c.carpool.userId !== userId);
  const joinedIds = new Set((carpools ?? []).filter((c) => c.joined).map((c) => c.carpool._id));

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from.trim() || seats < 1) {
      toast.error("Add a pickup point and at least one seat");
      return;
    }
    await createCarpool({
      eventId: event._id,
      from: from.trim(),
      seats,
      time,
      notes: notes.trim() || undefined,
      contact: contact.trim() || undefined,
    });
    setPosting(false);
    setFrom("");
    setSeats(2);
    setNotes("");
    setContact("");
    toast.success("Carpool posted — others can book a seat");
  };

  const handleJoin = async (carpoolId: string) => {
    setBusy(`join-${carpoolId}`);
    try {
      await joinCarpool({ carpoolId: carpoolId as any });
      toast.success("Seat booked!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not book seat");
    } finally {
      setBusy(null);
    }
  };

  const handleLeave = async (carpoolId: string) => {
    setBusy(`leave-${carpoolId}`);
    await leaveCarpool({ carpoolId: carpoolId as any });
    setBusy(null);
  };

  const handleDelete = async (carpoolId: string) => {
    await deleteCarpool({ carpoolId: carpoolId as any });
    toast.success("Carpool removed");
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
      <Link
        to={`/events/${event._id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-ember"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {event.title}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
          Getting there
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">
          Transport
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {event.title} · {fmtDate(event.startDate)} · {event.venue}, {event.city}
        </p>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* buses */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="orb-card p-6"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
              <Bus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Shuttle buses</h2>
              <p className="text-xs text-white/45">Official transport for the event day</p>
            </div>
          </div>

          {event.transport.buses.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45">
              No shuttle buses scheduled for this event. Consider carpooling below.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {event.transport.buses.map((bus, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-black/25 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{bus.route}</p>
                    <span className="text-[11px] text-white/45">
                      {bus.from} → {bus.to}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bus.departures.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-ember/40 bg-ember/10 px-3 py-1 font-mono text-xs font-semibold text-ember"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {event.transport.pickupPoints.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/45">
                Pickup points
              </p>
              <div className="mt-2 space-y-1.5">
                {event.transport.pickupPoints.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-white/8 bg-black/20 px-3.5 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 text-white/75">
                      <MapPin className="h-3.5 w-3.5 text-ember" /> {p.name}
                    </span>
                    <span className="font-mono text-xs text-white/50">{p.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>

        {/* carpools */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="orb-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
                  <Car className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Carpools</h2>
                  <p className="text-xs text-white/45">
                    {others.length} rides from fellow participants
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setPosting((p) => !p)}
                className="gap-1.5 rounded-full border border-ember/50 bg-ember/10 text-ember hover:bg-ember/20 hover:text-ember"
                variant="outline"
              >
                <Plus className="h-4 w-4" /> Offer a ride
              </Button>
            </div>

            {posting && (
              <form onSubmit={handlePost} className="mt-5 space-y-4 rounded-xl border border-white/10 bg-black/25 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 text-xs font-semibold text-white/70">
                      Leaving from
                    </Label>
                    <Input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Area, landmark, campus block…"
                      className="bg-black/20"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs font-semibold text-white/70">
                      Seats available
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="bg-black/20"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs font-semibold text-white/70">
                      Departure time
                    </Label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-black/20"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 text-xs font-semibold text-white/70">
                      Notes <span className="text-white/35">(optional)</span>
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Fuel cost split, meeting spot, luggage room…"
                      rows={2}
                      className="resize-none bg-black/20"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 text-xs font-semibold text-white/70">
                      Contact <span className="text-white/35">(optional)</span>
                    </Label>
                    <Input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Phone / WhatsApp"
                      className="bg-black/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl bg-ember font-bold text-[#160a04] hover:bg-ember/90"
                  >
                    Post carpool
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setPosting(false)}
                    className="text-white/50 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {myCarpools.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/45">
                  Your rides
                </p>
                <div className="mt-2 space-y-2">
                  {myCarpools.map((c) => (
                    <div
                      key={c.carpool._id}
                      className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-white">
                          {c.carpool.from} · {c.carpool.time}
                        </p>
                        <p className="text-xs text-accent">
                          {c.taken}/{c.carpool.seats} seats booked
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.carpool._id)}
                        className="rounded-md border border-white/10 p-2 text-white/40 hover:border-destructive/50 hover:text-destructive"
                        title="Remove carpool"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* other rides */}
          <div className="space-y-3">
            {others.length === 0 && (
              <div className="orb-card p-8 text-center">
                <Car className="mx-auto h-8 w-8 text-white/25" />
                <p className="mt-3 text-sm font-semibold text-white/70">
                  No carpools yet
                </p>
                <p className="mt-1 text-xs text-white/45">
                  Be the first to offer a ride to {event.city}.
                </p>
              </div>
            )}
            {others.map((c) => {
              const isJoined = joinedIds.has(c.carpool._id);
              const full = c.taken >= c.carpool.seats;
              return (
                <div
                  key={c.carpool._id}
                  className="orb-card flex items-center gap-4 p-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30">
                    <User className="h-5 w-5 text-white/60" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {c.ownerName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/55">
                      <MapPin className="h-3 w-3 text-ember" /> {c.carpool.from}
                      <span className="text-white/30">·</span>
                      <CalendarDays className="h-3 w-3 text-ember" /> {c.carpool.time}
                    </p>
                    {c.carpool.notes && (
                      <p className="mt-1 line-clamp-1 text-[11px] text-white/40">
                        {c.carpool.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`text-[11px] font-semibold ${
                        full ? "text-red-300" : "text-white/50"
                      }`}
                    >
                      {c.taken}/{c.carpool.seats} taken
                    </span>
                    {isJoined ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleLeave(c.carpool._id)}
                        disabled={busy === `leave-${c.carpool._id}`}
                        className="h-8 rounded-full border-accent/50 text-xs text-accent hover:bg-accent/10 hover:text-accent"
                      >
                        Booked ✓
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleJoin(c.carpool._id)}
                        disabled={full || busy === `join-${c.carpool._id}`}
                        className="h-8 rounded-full bg-ember text-xs font-bold text-[#160a04] hover:bg-ember/90 disabled:opacity-40"
                      >
                        {full ? "Full" : "Book seat"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
