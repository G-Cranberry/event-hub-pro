import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CalendarDays, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EventCard } from "@/components/orbit/EventCard";

type Tab = "upcoming" | "past";

export default function Events() {
  const events = useQuery(api.events.listPublished);
  const myRegs = useQuery(api.registrations.myRegistrations);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [q, setQ] = useState("");

  const registeredIds = useMemo(
    () => new Set((myRegs ?? []).map((r) => r.event._id)),
    [myRegs],
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    const list = (events ?? []).filter((e) => {
      const upcoming = e.endDate > now;
      if (tab === "upcoming" && !upcoming) return false;
      if (tab === "past" && upcoming) return false;
      if (q.trim()) {
        const hay = `${e.title} ${e.tagline} ${e.city} ${e.venue} ${e.organizerName}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
    return tab === "upcoming"
      ? list.sort((a, b) => a.startDate - b.startDate)
      : list.sort((a, b) => b.startDate - a.startDate);
  }, [events, tab, q]);

  const upcomingCount = (events ?? []).filter((e) => e.endDate > Date.now()).length;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-24 sm:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
          Discover
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Events
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
          Every event on the portal. Pick one, register with the organizer's own
          form, and get your digital pass.
        </p>
      </motion.div>

      {/* toolbar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur">
          {(["upcoming", "past"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? "bg-ember text-[#160a04]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t}
              {t === "upcoming" && (
                <span
                  className={`ml-1.5 text-[11px] ${
                    tab === t ? "text-[#160a04]/70" : "text-ember"
                  }`}
                >
                  {upcomingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, city, organizer…"
            className="h-11 w-full rounded-full border border-white/10 bg-black/30 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-ember/60 sm:w-72"
          />
        </div>
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="orb-card mt-10 flex flex-col items-center gap-3 p-12 text-center"
        >
          <CalendarDays className="h-8 w-8 text-white/30" />
          <p className="font-display text-lg font-bold text-white">
            No {tab} events match
          </p>
          <p className="max-w-sm text-sm text-white/50">
            {tab === "upcoming"
              ? "New events land here as organizers publish them. Check back soon."
              : "Past events will appear in this archive once they wrap up."}
          </p>
        </motion.div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event, i) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
            >
              <EventCard
                event={event}
                registered={registeredIds.has(event._id)}
                ended={event.endDate < Date.now()}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
