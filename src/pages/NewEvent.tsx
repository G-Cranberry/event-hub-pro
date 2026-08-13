import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Plus, Rocket } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fromDateInput, toDateInput } from "@/lib/orbit";
import { cn } from "@/lib/utils";

const ACCENTS = ["#ff5c38", "#7c5cff", "#ffb547", "#2dd4bf", "#4cc9f0", "#f72585"];

const DEFAULT_FORM = [
  {
    id: "fullname",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Your full name",
    half: false,
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "you@example.com",
    half: true,
  },
  {
    id: "phone",
    label: "Phone",
    type: "phone",
    required: false,
    placeholder: "+91 98765 43210",
    half: true,
  },
];

export default function NewEvent() {
  const createEvent = useMutation(api.events.createEvent);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    type: "single" as "single" | "multi" | "round",
    startDate: toDateInput(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: toDateInput(Date.now() + 7 * 24 * 60 * 60 * 1000),
    venue: "",
    city: "",
    accent: ACCENTS[0],
    registrationType: "both" as "individual" | "team" | "both",
    maxTeamSize: 4,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.venue.trim() || !form.city.trim()) {
      toast.error("Title, venue and city are required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Add a short description so participants know what to expect");
      return;
    }

    setSubmitting(true);
    try {
      const start = fromDateInput(form.startDate, 9);
      const end = fromDateInput(form.endDate, form.type === "multi" ? 20 : 17);
      const id = await createEvent({
        title: form.title.trim(),
        tagline: form.tagline.trim() || "A new event on the ORBIT portal",
        description: form.description.trim(),
        type: form.type,
        startDate: start,
        endDate: Math.max(end, start + 60 * 60 * 1000),
        venue: form.venue.trim(),
        city: form.city.trim(),
        accent: form.accent,
        registrationType: form.registrationType,
        maxTeamSize: form.maxTeamSize,
        formSchema: DEFAULT_FORM,
        subEvents:
          form.type === "multi"
            ? [
                { id: "day1", label: "Day 1", date: start, time: "09:00 – 20:00" },
              ]
            : [],
        rounds: form.type === "round" ? [{ id: "r1", label: "Round 1" }] : [],
        transport: { buses: [], pickupPoints: [] },
        certificate: {
          enabled: true,
          title: form.title.trim(),
          subtitle: "Participation certificate",
          accent: form.accent,
          layout: "classic",
          signature: "Organizer",
          note: "Issued by the organizing team",
        },
      });
      toast.success("Event created! Now design the registration form.");
      navigate(`/org/events/${id}/form`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-20 sm:pt-24">
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
        className="mt-4"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
          Organizer studio
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">
          New event
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Start with the essentials — you can tune the form, transport, and
          certificate from the event hub afterwards.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="orb-card mt-8 space-y-6 p-6 sm:p-8">
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 text-sm font-medium text-white/85">
              Event title <span className="text-ember">*</span>
            </Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Aether Hackathon 2026"
              className="bg-black/20"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-sm font-medium text-white/85">
              Tagline
            </Label>
            <Input
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="One line that sells the event"
              className="bg-black/20"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-sm font-medium text-white/85">
              Description <span className="text-ember">*</span>
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What is this event about? Who should attend? What happens?"
              rows={4}
              className="resize-none bg-black/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-sm font-medium text-white/85">Type</Label>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
                {(
                  [
                    ["single", "Single"],
                    ["multi", "Multi-day"],
                    ["round", "Rounds"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("type", value)}
                    className={cn(
                      "rounded-lg px-2 py-2 text-xs font-semibold transition-colors",
                      form.type === value
                        ? "bg-ember text-[#160a04]"
                        : "text-white/55 hover:text-white",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 text-sm font-medium text-white/85">
                Registration
              </Label>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
                {(
                  [
                    ["individual", "Individual"],
                    ["team", "Teams"],
                    ["both", "Both"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("registrationType", value)}
                    className={cn(
                      "rounded-lg px-2 py-2 text-xs font-semibold transition-colors",
                      form.registrationType === value
                        ? "bg-ember text-[#160a04]"
                        : "text-white/55 hover:text-white",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-sm font-medium text-white/85">
                Start date
              </Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="bg-black/20"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-sm font-medium text-white/85">
                End date
              </Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="bg-black/20"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-sm font-medium text-white/85">
                Venue <span className="text-ember">*</span>
              </Label>
              <Input
                value={form.venue}
                onChange={(e) => set("venue", e.target.value)}
                placeholder="Main Auditorium"
                className="bg-black/20"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-sm font-medium text-white/85">
                City <span className="text-ember">*</span>
              </Label>
              <Input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Bengaluru"
                className="bg-black/20"
              />
            </div>
          </div>

          {form.registrationType !== "individual" && (
            <div className="flex items-center gap-3">
              <Label className="shrink-0 text-sm font-medium text-white/85">
                Max team size
              </Label>
              <div className="flex gap-1.5">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("maxTeamSize", n)}
                    className={cn(
                      "h-9 w-9 rounded-lg border text-sm font-bold transition-colors",
                      form.maxTeamSize === n
                        ? "border-ember bg-ember text-[#160a04]"
                        : "border-white/12 bg-black/25 text-white/60 hover:border-white/30",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="mb-1.5 text-sm font-medium text-white/85">
              Brand accent
            </Label>
            <div className="flex flex-wrap gap-2.5">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("accent", c)}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-transform",
                    form.accent === c
                      ? "scale-110 border-white"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ background: c }}
                  aria-label={`Accent ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full gap-2 rounded-xl bg-ember font-bold text-[#160a04] hover:bg-ember/90"
        >
          {submitting ? (
            "Creating event…"
          ) : (
            <>
              <Rocket className="h-4 w-4" /> Create event
            </>
          )}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
          <CalendarDays className="h-3 w-3" />
          Next step: design the registration form from the event hub.
        </p>
        {form.type === "multi" && (
          <p className="-mt-3 text-center text-[11px] text-white/40">
            Multi-day events start with a single day — add more from the event hub.
          </p>
        )}
        {form.type === "round" && (
          <p className="-mt-3 text-center text-[11px] text-white/40">
            Round-based events start with one round — add elimination rounds later.
          </p>
        )}
        <p className="-mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-white/40">
          <Plus className="h-3 w-3" />
          You can edit everything after creation.
        </p>
      </form>
    </div>
  );
}
