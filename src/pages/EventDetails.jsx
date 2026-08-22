import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Bus,
  CalendarDays,
  Camera,
  CheckCircle2,
  MapPin,
  PartyPopper,
  Ticket,
  Users } from
"lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PassCard } from "@/components/orbit/PassCard";
import { EventArt } from "@/components/orbit/EventArt";
import { DynamicForm, initialValues, validateSchema } from "@/components/orbit/DynamicForm";
import { TYPE_LABEL, fmtRange, isUpcoming } from "@/lib/orbit";
import { cn } from "@/lib/utils";

export default function EventDetails() {
  const { id = "" } = useParams();
  const context = useQuery(api.events.getEventContext, { eventId: id });
  const register = useMutation(api.registrations.register);

  const [regType, setRegType] = useState("individual");
  const [values, setValues] = useState({});
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [justRegistered, setJustRegistered] = useState(false);
  const initialized = useRef(false);

  const event = context?.event ?? null;
  const myRegistration = context?.myRegistration ?? null;

  useEffect(() => {
    if (id) sessionStorage.setItem("orbit:lastEvent", id);
  }, [id]);

  // Initialize the form exactly once. The reactive `event` reference can change
  // between renders (Convex re-returns query results), so depending on it here
  // would wipe whatever the participant has typed.
  useEffect(() => {
    if (event && !initialized.current) {
      initialized.current = true;
      setRegType(event.registrationType === "team" ? "team" : "individual");
      setValues(initialValues(event.formSchema));
    }
  }, [event]);

  const updateValues = (next) => {
    setValues(next);
    if (error) setError(null);
  };

  const open = !!event && event.regOpen && event.status === "published" && isUpcoming(event);
  const showForm = open && !myRegistration && !justRegistered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;
    setError(null);

    const missing = validateSchema(event.formSchema, values);
    if (missing) {
      setError(`* "${missing}" is required`);
      return;
    }
    if (regType === "team" && !teamName.trim()) {
      setError("Team name is required");
      return;
    }
    if (regType === "team") {
      const cleaned = members.map((m) => m.trim()).filter(Boolean);
      if (cleaned.length < 1) {
        setError("Add at least one team member");
        return;
      }
      if (cleaned.length + 1 > event.maxTeamSize) {
        setError(`Team size cannot exceed ${event.maxTeamSize} including you`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await register({
        eventId: event._id,
        type: regType,
        teamName: regType === "team" ? teamName.trim() : undefined,
        teamMembers: regType === "team" ? members.map((m) => m.trim()).filter(Boolean) : undefined,
        formData: values
      });
      setJustRegistered(true);
      toast.success("You're registered! Your pass is ready.", {
        icon: <PartyPopper className="h-4 w-4" />
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const memberFields = useMemo(
    () => members.map((_, i) => i),
    [members]
  );

  if (!context || !event) {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-5 pt-28">
        <div className="orb-card p-10 text-center">
          <p className="text-sm text-white/50">Loading event…</p>
        </div>
      </div>);

  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-ember">
        
        <ArrowLeft className="h-3.5 w-3.5" /> All events
      </Link>

      {/* hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="orb-card mt-4 overflow-hidden">
        
        <div className="relative px-6 py-10 sm:px-10">
          <EventArt seed={event._id} accent={event.accent} />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className="border-white/20 bg-black/40 font-bold uppercase tracking-wider text-white backdrop-blur">
                
                {TYPE_LABEL[event.type]}
              </Badge>
              <Badge className="border-white/20 bg-black/40 text-white/75 backdrop-blur">
                by {event.organizerName}
              </Badge>
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
              {event.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-ember" />
                {fmtRange(event.startDate, event.endDate)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-ember" />
                {event.venue}, {event.city}
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-ember" />
                {event.registrationType === "individual" ?
                "Individual entry" :
                event.registrationType === "team" ?
                `Teams up to ${event.maxTeamSize}` :
                `Individual · teams of ${event.maxTeamSize}`}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* left column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="space-y-8">
          
          <section>
            <h2 className="font-display text-lg font-bold text-white">About this event</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/60">
              {event.description}
            </p>
          </section>

          {event.subEvents.length > 0 &&
          <section>
              <h2 className="font-display text-lg font-bold text-white">Schedule</h2>
              <div className="mt-3 space-y-2">
                {event.subEvents.map((sub, i) =>
              <div
                key={sub.id}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-ember/10 text-xs font-bold text-ember">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{sub.label}</p>
                      <p className="text-xs text-white/45">
                        {sub.time || "All day"}
                        {sub.date ? ` · ${new Date(sub.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}` : ""}
                      </p>
                    </div>
                  </div>
              )}
              </div>
            </section>
          }

          {event.rounds.length > 0 &&
          <section>
              <h2 className="font-display text-lg font-bold text-white">Rounds</h2>
              <p className="mt-1 text-xs text-white/45">
                Passes turn green when your team advances. The organizer marks each round.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.rounds.map((r, i) =>
              <span
                key={r.id}
                className="rounded-full border border-white/12 bg-black/30 px-3.5 py-1.5 text-xs font-semibold text-white/70">
                
                    R{i + 1} · {r.label}
                  </span>
              )}
              </div>
            </section>
          }

          {/* event tools */}
          <section>
            <h2 className="font-display text-lg font-bold text-white">Event tools</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Link
                to={`/events/${event._id}/transport`}
                className="orb-card group flex items-center gap-3 p-4">
                
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
                  <Bus className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Transport & carpools</p>
                  <p className="truncate text-[11px] text-white/45">
                    Bus routes, pickup points, ride sharing
                  </p>
                </div>
              </Link>
              <Link
                to={`/events/${event._id}/gallery`}
                className="orb-card group flex items-center gap-3 p-4">
                
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
                  <Camera className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Photo gallery</p>
                  <p className="truncate text-[11px] text-white/45">
                    {myRegistration ? "Registered — view the gallery" : "Available to registered participants"}
                  </p>
                </div>
              </Link>
            </div>
          </section>
        </motion.div>

        {/* right column: registration / pass */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}>
          
          {myRegistration ?
          <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">
                <CheckCircle2 className="h-4 w-4" />
                You're registered — show this pass at entry
              </div>
              <PassCard reg={myRegistration} event={event} />
              {event.certificate?.enabled &&
            <Link
              to="/certificates"
              className="orb-card flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
              
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
                    <Award className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">Certificate</p>
                    <p className="text-[11px] text-white/45">
                      Downloadable once the event completes
                    </p>
                  </div>
                </Link>
            }
            </div> :
          justRegistered ?
          <div className="orb-card p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ember/40 border-t-ember" />
              <p className="mt-4 text-sm font-semibold text-white">Issuing your pass…</p>
            </div> :
          showForm ?
          <form onSubmit={handleSubmit} className="orb-card p-6">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-ember" />
                <h2 className="font-display text-lg font-bold text-white">
                  Register for {event.title}
                </h2>
              </div>

              {event.registrationType === "both" &&
            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
                  {["individual", "team"].map((t) =>
              <button
                key={t}
                type="button"
                onClick={() => setRegType(t)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold capitalize transition-colors",
                  regType === t ?
                  "bg-ember text-[#160a04]" :
                  "text-white/55 hover:text-white"
                )}>
                
                      {t}
                    </button>
              )}
                </div>
            }

              {regType === "team" &&
            <div className="mt-5 space-y-3">
                  <div>
                    <Label className="mb-1.5 text-sm font-medium text-white/85">
                      Team name <span className="text-ember">*</span>
                    </Label>
                    <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. The Orbitals"
                  className="bg-black/20" />
                
                  </div>
                  <div>
                    <Label className="mb-1.5 text-sm font-medium text-white/85">
                      Team members (max {event.maxTeamSize - 1} others)
                    </Label>
                    <div className="space-y-2">
                      {memberFields.map((i) =>
                  <div key={i} className="flex gap-2">
                          <Input
                      value={members[i]}
                      onChange={(e) => {
                        const next = [...members];
                        next[i] = e.target.value;
                        setMembers(next);
                      }}
                      placeholder={`Member ${i + 1} name`}
                      className="bg-black/20" />
                    
                          {members.length > 1 &&
                    <button
                      type="button"
                      onClick={() => setMembers(members.filter((_, j) => j !== i))}
                      className="rounded-md border border-white/10 px-3 text-xs text-white/50 hover:border-destructive/50 hover:text-destructive">
                      
                              ✕
                            </button>
                    }
                        </div>
                  )}
                    </div>
                    {members.length < event.maxTeamSize - 1 &&
                <button
                  type="button"
                  onClick={() => setMembers([...members, ""])}
                  className="mt-2 text-xs font-semibold text-ember hover:underline">
                  
                        + Add member
                      </button>
                }
                  </div>
                </div>
            }

              <div className="mt-6">
                <DynamicForm
                schema={event.formSchema}
                values={values}
                onChange={updateValues} />
              
              </div>

              {error &&
            <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
            }

              <Button
              type="submit"
              disabled={submitting}
              className="mt-6 h-11 w-full gap-2 rounded-xl bg-ember font-bold text-[#160a04] hover:bg-ember/90">
              
                {submitting ? "Registering…" : "Confirm registration"}
                {!submitting && <PartyPopper className="h-4 w-4" />}
              </Button>
              <p className="mt-3 text-center text-[11px] text-white/40">
                You'll receive a QR pass instantly. No payment is collected here.
              </p>
            </form> :

          <div className="orb-card p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/30">
                <Ticket className="h-6 w-6 text-white/40" />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-white">
                {event.status === "ended" ?
              "This event has ended" :
              !event.regOpen ?
              "Registration is closed" :
              "Registration opens soon"}
              </p>
              <p className="mt-1 text-sm text-white/50">
                {event.status === "ended" ?
              "Check the gallery and your certificates in the wallet." :
              "The organizer will open registration closer to the event."}
              </p>
              {event.status === "ended" &&
            <Link
              to={`/events/${event._id}/gallery`}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-ember/50 px-5 py-2 text-sm font-semibold text-ember hover:bg-ember/10">
              
                  <Camera className="h-4 w-4" /> View gallery
                </Link>
            }
            </div>
          }
        </motion.div>
      </div>
    </div>);

}