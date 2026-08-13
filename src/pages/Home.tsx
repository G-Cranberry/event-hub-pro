import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Bus,
  CalendarDays,
  Camera,
  LayoutGrid,
  ScanLine,
  Ticket,
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/components/orbit/ProfileProvider";
import { ModeSwitcher } from "@/components/orbit/ModeSwitcher";
import { EventCard } from "@/components/orbit/EventCard";
import { PassCard } from "@/components/orbit/PassCard";
import { fmtDate } from "@/lib/orbit";

export default function Home() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const myRegs = useQuery(api.registrations.myRegistrations);
  const events = useQuery(api.events.listPublished);

  const upcoming = (events ?? []).filter((e) => e.endDate > Date.now()).slice(0, 3);
  const passes = myRegs ?? [];
  const mode = profile?.currentMode ?? "participant";
  const firstName = (user?.name ?? user?.email ?? "").split(/[\s@]/)[0];

  const stats = [
    { label: "My passes", value: passes.length, icon: Ticket, color: "text-ember", to: "/passes" },
    {
      label: "Upcoming events",
      value: upcoming.length,
      icon: CalendarDays,
      color: "text-accent",
      to: "/events",
    },
    {
      label: "Certificates",
      value: passes.filter((p) => p.event.certificate?.enabled).length,
      icon: Award,
      color: "text-amber-300",
      to: "/certificates",
    },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-24 sm:pt-28">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
          Mission control
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
          {mode === "organizer"
            ? "You're in Organizer mode — run your events from here."
            : "Your event orbit, at a glance. Pick up where you left off."}
        </p>
      </motion.div>

      {/* mode switcher */}
      {profile && profile.isParticipant && profile.isOrganizer && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="mt-8"
        >
          <ModeSwitcher />
        </motion.div>
      )}

      {/* stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="mt-8 grid grid-cols-3 gap-3 sm:gap-4"
      >
        {stats.map(({ label, value, icon: Icon, color, to }) => (
          <Link
            key={label}
            to={to}
            className="orb-card group flex flex-col justify-between p-4 sm:p-5"
          >
            <Icon className={`h-5 w-5 ${color}`} />
            <div className="mt-6">
              <p className="font-display text-3xl font-bold text-white">{value}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                {label}
              </p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* quick launch */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="mt-12"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">
            {mode === "organizer" ? "Organizer toolkit" : "Quick launch"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Explore events",
              desc: "Find your next one",
              icon: CalendarDays,
              to: "/events",
              accent: "border-ember/40 text-ember",
            },
            {
              label: "My passes",
              desc: "Wallet & QR",
              icon: Ticket,
              to: "/passes",
              accent: "border-accent/40 text-accent",
            },
            {
              label: "Certificates",
              desc: "Download PDFs",
              icon: Award,
              to: "/certificates",
              accent: "border-amber-400/40 text-amber-300",
            },
            ...(mode === "organizer"
              ? [
                  {
                    label: "Manage events",
                    desc: "Create & run",
                    icon: LayoutGrid,
                    to: "/org/events",
                    accent: "border-ember/40 text-ember",
                  },
                  {
                    label: "QR scanner",
                    desc: "Check passes in",
                    icon: ScanLine,
                    to: "/org/events",
                    accent: "border-accent/40 text-accent",
                  },
                ]
              : [
                  {
                    label: "Photo galleries",
                    desc: "Relive the day",
                    icon: Camera,
                    to: "/events",
                    accent: "border-accent/40 text-accent",
                  },
                  {
                    label: "Transport",
                    desc: "Buses & carpools",
                    icon: Bus,
                    to: "/events",
                    accent: "border-amber-400/40 text-amber-300",
                  },
                ]),
          ].map(({ label, desc, icon: Icon, to, accent }) => (
            <Link key={label} to={to} className="orb-card group p-4">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-black/30 ${accent}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-white">{label}</p>
              <p className="mt-0.5 text-[11px] text-white/45">{desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* latest pass */}
      {passes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-12"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Latest pass</h2>
            <Link
              to="/passes"
              className="flex items-center gap-1 text-xs font-semibold text-ember hover:underline"
            >
              View wallet <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="max-w-2xl">
            <PassCard reg={passes[0].registration} event={passes[0].event} />
          </div>
        </motion.div>
      )}

      {/* upcoming events */}
      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Up next</h2>
            <Link
              to="/events"
              className="flex items-center gap-1 text-xs font-semibold text-ember hover:underline"
            >
              All events <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {upcoming.map((event) => {
              const reg = passes.find((p) => p.event._id === event._id);
              return (
                <EventCard
                  key={event._id}
                  event={event}
                  registered={!!reg}
                  ended={event.endDate < Date.now()}
                />
              );
            })}
          </div>
        </motion.div>
      )}

      {upcoming.length === 0 && passes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="orb-card mt-12 flex flex-col items-center gap-4 p-10 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ember/40 bg-ember/10">
            <CalendarDays className="h-6 w-6 text-ember" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-white">Your orbit is empty</p>
            <p className="mt-1 text-sm text-white/55">
              {fmtDate(Date.now())} — discover an event and grab your first pass.
            </p>
          </div>
          <Link
            to="/events"
            className="rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-[#160a04] hover:bg-ember/90"
          >
            Browse events
          </Link>
        </motion.div>
      )}
    </div>
  );
}
