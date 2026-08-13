import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bus,
  CalendarDays,
  Camera,
  Orbit,
  ScanLine,
  Sparkles,
  Ticket,
  UserCog,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { useEffect, useRef } from "react";
import { TYPE_LABEL, fmtDate, fmtRange } from "@/lib/orbit";

const LETTERS = "ORBIT".split("");

function OrbitHeroArt() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* rotating orbit rings */}
      <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2">
        <div
          className="orb-spin-slow absolute inset-0 rounded-full border border-dashed border-ember/25"
          style={{ animationDuration: "60s" }}
        />
        <div
          className="orb-spin-slow absolute inset-[12%] rounded-full border border-white/8"
          style={{ animationDuration: "40s", animationDirection: "reverse" }}
        />
        <div
          className="orb-spin-slow absolute inset-[26%] rounded-full border border-accent/20"
          style={{ animationDuration: "80s" }}
        />
        {/* orbiting satellites */}
        <div className="orb-spin-slow absolute inset-0" style={{ animationDuration: "22s" }}>
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_18px_5px_rgba(255,92,56,0.55)]" />
        </div>
        <div className="orb-spin-slow absolute inset-[12%]" style={{ animationDuration: "34s", animationDirection: "reverse" }}>
          <span className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_4px_rgba(45,212,191,0.5)]" />
        </div>
      </div>
      {/* center badge */}
      <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-ember/40 bg-[#0a0b0f]/80 backdrop-blur shadow-[0_0_80px_-10px_rgba(255,92,56,0.45)]">
        <Orbit className="h-9 w-9 text-ember" />
        <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
          Portal
        </span>
      </div>
    </div>
  );
}

export default function Landing() {
  const events = useQuery(api.events.listPublished);
  const seedDemo = useMutation(api.seed.seedDemo);
  const seededRef = useRef(false);
  const upcoming = (events ?? []).filter((e) => e.endDate > Date.now()).slice(0, 3);

  // Seed the demo catalog once when the portal is first opened with no events.
  useEffect(() => {
    if (events !== undefined && events.length === 0 && !seededRef.current) {
      seededRef.current = true;
      seedDemo().catch(() => {});
    }
  }, [events, seedDemo]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OrbitHeroArt />

      {/* nav */}
      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ember/50 bg-ember/10">
            <Orbit className="h-4.5 w-4.5 text-ember" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.28em] text-white">
            ORBIT
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            className="text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button
            asChild
            className="gap-1.5 rounded-full bg-ember text-[#160a04] hover:bg-ember/90"
          >
            <Link to="/auth?returnTo=%2Fevents">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* hero */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 pb-16 pt-24 text-center sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-ember" />
          Events · Passes · Certificates
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-7xl"
        >
          One account.
          <br />
          <span className="text-gradient-ember">Every event.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg"
        >
          ORBIT is the event management portal for campuses and clubs. Discover
          events, register with organizer-designed forms, carry a scannable digital
          pass, and collect certificates — or flip to Organizer mode and run it all
          from the same account.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="h-12 gap-2 rounded-full bg-ember px-7 text-[#160a04] shadow-[0_12px_40px_-10px_rgba(255,92,56,0.6)] hover:bg-ember/90"
          >
            <Link to="/auth?returnTo=%2Fevents">
              Explore events <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-white/15 bg-white/5 px-7 text-white backdrop-blur hover:border-ember/50 hover:bg-ember/10"
          >
            <Link to="/auth?returnTo=%2Fhome">Open the portal</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35"
        >
          <span className="flex items-center gap-2"><Ticket className="h-3.5 w-3.5 text-ember" /> QR digital passes</span>
          <span className="flex items-center gap-2"><ScanLine className="h-3.5 w-3.5 text-ember" /> Organizer scanner</span>
          <span className="flex items-center gap-2"><Bus className="h-3.5 w-3.5 text-ember" /> Transport & carpools</span>
          <span className="flex items-center gap-2"><Camera className="h-3.5 w-3.5 text-ember" /> Photo galleries</span>
        </motion.div>
      </main>

      {/* mode cards */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-20">
        <div className="grid gap-5 sm:grid-cols-2">
          <Link
            to="/auth?returnTo=%2Fhome"
            className="orb-card group block p-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-ember/40 bg-ember/10 text-ember">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-white">Participant</p>
                <p className="text-xs text-white/50">Discover, register, attend</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Browse events, fill organizer-designed forms, carry your pass in a
              wallet, track round results, grab seats in carpools, and download
              certificates.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ember">
              Enter as participant
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to="/auth?returnTo=%2Forg%2Fevents"
            className="orb-card group block p-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
                <UserCog className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-white">Organizer</p>
                <p className="text-xs text-white/50">Create, scan, manage</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Design registration forms field by field, watch registrations land
              live, scan passes at the door, advance teams between rounds, and
              publish certificates and galleries.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              Enter as organizer
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* live events strip */}
      {upcoming.length > 0 && (
        <section className="relative z-10 mx-auto max-w-5xl px-5 pb-24">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
                Live on the portal
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-white">
                Upcoming events
              </h2>
            </div>
            <Link
              to="/auth?returnTo=%2Fevents"
              className="hidden items-center gap-1 text-sm font-semibold text-white/60 hover:text-ember sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {upcoming.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="orb-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color: event.accent,
                      background: `${event.accent}1f`,
                      border: `1px solid ${event.accent}55`,
                    }}
                  >
                    {TYPE_LABEL[event.type]}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    {fmtDate(event.startDate)}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold leading-tight text-white">
                  {event.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/55">
                  {event.tagline}
                </p>
                <p className="mt-4 flex items-center gap-1.5 text-[11px] text-white/45">
                  <CalendarDays className="h-3.5 w-3.5 text-ember" />
                  {fmtRange(event.startDate, event.endDate)} · {event.city}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* footer */}
      <footer className="relative z-10 border-t border-white/8 px-5 py-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <Orbit className="h-4 w-4 text-ember" />
          <span className="font-display text-xs font-bold tracking-[0.3em] text-white/60">
            ORBIT
          </span>
        </div>
        <p className="mt-2 text-[11px] text-white/30">
          Event management portal · {LETTERS.length} letters, one orbit
        </p>
      </footer>
    </div>
  );
}
