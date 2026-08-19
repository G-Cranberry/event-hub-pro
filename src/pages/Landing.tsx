import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Globe,
  Monitor,
  Orbit,
  Smartphone,
  Sparkles,
  Tablet,
  Ticket,
  UserCog,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TYPE_LABEL, fmtDate, fmtRange } from "@/lib/orbit";
import { QrCode } from "@/components/orbit/QrCode";
import { EventArt } from "@/components/orbit/EventArt";
import { ParticleCanvas } from "@/components/orbit/ParticleCanvas";

const PLATFORMS = [
  { label: "Web", icon: Globe },
  { label: "macOS", icon: Monitor },
  { label: "Windows", icon: Monitor },
  { label: "Linux", icon: Monitor },
  { label: "iOS", icon: Smartphone },
  { label: "Android", icon: Smartphone },
  { label: "Tablet", icon: Tablet },
];

function ArtPanel() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md sm:aspect-[5/6]">
      {/* atmospheric backdrop */}
      <div className="orb-scanlines absolute inset-0 overflow-hidden rounded-[2rem] border border-ember/30 bg-[#0e0a16]/80 shadow-[inset_0_0_60px_rgba(0,0,0,0.6),0_30px_90px_-30px_rgba(0,0,0,0.9)]">
        {/* grid lines */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.74 0.16 50 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.74 0.16 50 / 0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* data stream */}
        <div className="orb-data-stream absolute inset-0 opacity-40" />

        {/* orbit shrine */}
        <div className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="orb-spin-slow absolute inset-0 rounded-full border border-dashed border-ember/30"
            style={{ animationDuration: "46s" }}
          />
          <div
            className="orb-spin-slow absolute inset-[11%] rounded-full border border-ember/15"
            style={{ animationDuration: "30s", animationDirection: "reverse" }}
          />
          <div
            className="orb-spin-slow absolute inset-[23%] rounded-full border border-gold/10"
            style={{ animationDuration: "70s" }}
          />
          {/* satellites */}
          <div className="orb-spin-slow absolute inset-0" style={{ animationDuration: "18s" }}>
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_20px_6px_rgba(255,120,50,0.7)]" />
          </div>
          <div className="orb-spin-slow absolute inset-[11%]" style={{ animationDuration: "27s", animationDirection: "reverse" }}>
            <span className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_14px_4px_rgba(232,182,76,0.6)]" />
          </div>

          {/* glowing core */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.85_0.16_50/0.55),oklch(0.74_0.16_50/0.2)_50%,transparent_75%)] blur-lg" />
            <div className="orb-neon-border orb-neon-pulse relative flex h-24 w-24 items-center justify-center rounded-full border border-ember/50 bg-gradient-to-br from-[#1a0e24] to-[#0d0916]">
              <Orbit className="h-9 w-9 text-ember" />
            </div>
          </div>
        </div>

        {/* HUD corner brackets */}
        <div className="absolute left-3 top-3 h-6 w-6 border-t-2 border-l-2 border-ember/60" />
        <div className="absolute right-3 top-3 h-6 w-6 border-t-2 border-r-2 border-ember/60" />
        <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-ember/60" />
        <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-ember/60" />

        {/* floating pass cards */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="orb-float absolute right-4 top-7 w-32 sm:w-36"
          style={{ animationDuration: "7s" }}
        >
          <div className="orb-neon-border rounded-xl bg-[#0e0a16]/90 p-2.5 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.85)]">
            <div className="rounded-md bg-white p-1">
              <QrCode value="orb:demo:pass:1" size={88} className="w-full" />
            </div>
            <p className="mt-1.5 truncate text-[9px] font-bold uppercase tracking-widest text-ember">
              Live pass · QR
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="orb-float absolute bottom-16 left-4 w-32 sm:w-36"
          style={{ animationDuration: "8.5s", animationDelay: "1.2s" }}
        >
          <div className="orb-neon-border rounded-xl bg-[#0e0a16]/90 p-2.5 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.85)]">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-ember/40 bg-ember/15">
                <Ticket className="h-4 w-4 text-ember" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold text-white">Aarambh Fest</p>
                <p className="text-[8px] uppercase tracking-wider text-gold">Advanced ✦</p>
              </div>
            </div>
            <div className="mt-2 h-px bg-gradient-to-r from-transparent via-ember/50 to-transparent" />
            <p className="mt-1.5 text-[8px] uppercase tracking-widest text-white/40">
              Round 2 · selected
            </p>
          </div>
        </motion.div>
      </div>

      {/* bottom label plate */}
      <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-ember/40 bg-[#0e0a16]/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-ember backdrop-blur orb-border-glow">
        <Sparkles className="h-3 w-3" /> Passes · Rounds · Certificates
      </div>
    </div>
  );
}

export default function Landing() {
  const events = useQuery(api.events.listPublished);
  const seedDemo = useMutation(api.seed.seedDemo);
  const seededRef = useRef(false);
  const upcoming = (events ?? []).filter((e) => e.endDate > Date.now()).slice(0, 3);

  useEffect(() => {
    if (events !== undefined && events.length === 0 && !seededRef.current) {
      seededRef.current = true;
      seedDemo().catch(() => {});
    }
  }, [events, seedDemo]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* particle canvas background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <ParticleCanvas count={70} color="mixed" />
      </div>

      {/* ambient hero glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[720px] bg-[radial-gradient(900px_520px_at_70%_-8%,oklch(0.74_0.16_50/0.18),transparent_62%),radial-gradient(700px_420px_at_8%_6%,oklch(0.82_0.13_78/0.1),transparent_60%)]" />

      {/* scan line overlay */}
      <div className="orb-scanlines pointer-events-none absolute inset-0 z-[1] opacity-30" />

      {/* header */}
      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="orb-neon-border flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ember/20 to-[#0e0a16]/80">
            <Orbit className="h-4.5 w-4.5 text-ember" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.24em] text-white">
            ORBIT
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-white/60 md:flex">
          {[
            { label: "Discover", to: "/auth?returnTo=%2Fevents" },
            { label: "Wallet", to: "/auth?returnTo=%2Fpasses" },
            { label: "Gallery", to: "/auth?returnTo=%2Fevents" },
            { label: "Organizer", to: "/auth?returnTo=%2Forg%2Fevents" },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="transition-colors hover:text-ember"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button
          asChild
          variant="outline"
          className="orb-neon-border gap-2 rounded-full bg-white/5 text-white backdrop-blur hover:border-ember/70 hover:bg-ember/10 hover:text-ember"
        >
          <Link to="/auth">
            <Sparkles className="h-4 w-4 text-ember" />
            Sign in
          </Link>
        </Button>
      </header>

      {/* hero */}
      <main className="relative z-10 mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
        {/* left copy */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-ember"
          >
            <span className="orb-hud-blink h-1.5 w-1.5 rounded-full bg-ember" />
            <span className="h-px w-8 bg-ember/60" />
            Powered by Convex
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            <span className="orb-glitch" data-text="EVERY EVENT">
              EVERY EVENT
            </span>
            <br />
            <span className="text-gradient-ember">in one orbit</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-lg text-[15px] leading-7 text-white/65"
          >
            Proudly powered by Convex, enter the immersive world of ORBIT — a
            multi-mode event platform. Marrying the best of registration, digital
            passes and certificates in a fresh new package, ORBIT draws thematic
            influence from campus culture to create an experience like no other
            available today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="orb-neon-pulse h-12 gap-2 rounded-full bg-ember px-7 font-bold text-[#1a0d02] shadow-[0_14px_44px_-12px_rgba(255,120,50,0.7)] hover:bg-ember/90"
            >
              <Link to="/auth?returnTo=%2Fevents">
                Enter the portal <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="orb-neon-border h-12 rounded-full bg-white/5 px-7 text-white backdrop-blur hover:border-ember/60 hover:bg-ember/10 hover:text-ember"
            >
              <Link to="/auth?returnTo=%2Forg%2Fevents">Run an event</Link>
            </Button>
          </motion.div>

          {/* platform badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-2"
          >
            {PLATFORMS.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-md border border-ember/15 bg-black/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/55"
              >
                <Icon className="h-3.5 w-3.5 text-ember/80" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* right art */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="pb-6"
        >
          <ArtPanel />
        </motion.div>
      </main>

      {/* mode cards */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-24">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-ember">
            Two worlds, one account
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Choose your <span className="text-gradient-ember">role</span>
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link to="/auth?returnTo=%2Fhome" className="orb-card orb-hud-corners orb-scanlines group block p-8">
            <div className="flex items-center gap-3">
              <span className="orb-neon-border flex h-12 w-12 items-center justify-center rounded-xl bg-ember/10 text-ember">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xl font-bold text-white">Participant</p>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Discover · Register · Attend
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/60">
              Browse events, fill organizer-designed forms, carry your pass in a
              wallet, track round results, grab seats in carpools, and download
              certificates.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-ember">
              Enter as participant
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link to="/auth?returnTo=%2Forg%2Fevents" className="orb-card orb-hud-corners orb-scanlines group block p-8">
            <div className="flex items-center gap-3">
              <span className="orb-neon-border flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <UserCog className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xl font-bold text-white">Organizer</p>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Create · Scan · Manage
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/60">
              Design registration forms field by field, watch registrations land
              live, scan passes at the door, advance teams between rounds, and
              publish certificates and galleries.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-gold">
              Enter as organizer
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* live events strip */}
      {upcoming.length > 0 && (
        <section className="relative z-10 mx-auto max-w-5xl px-5 pb-24">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-ember">
                <span className="orb-hud-blink mr-2 inline-block h-1.5 w-1.5 rounded-full bg-ember align-middle" />
                Live on the portal
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">
                Upcoming <span className="text-gradient-ember">events</span>
              </h2>
            </div>
            <Link
              to="/auth?returnTo=%2Fevents"
              className="hidden items-center gap-1 text-sm font-semibold text-white/60 transition-colors hover:text-ember sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {upcoming.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="orb-card orb-scanlines overflow-hidden p-0"
              >
                <div className="relative h-28">
                  <EventArt seed={event._id} accent={event.accent} showOrbit={false} />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-2.5">
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
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                      {fmtDate(event.startDate)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold leading-tight text-white">
                    {event.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">
                    {event.tagline}
                  </p>
                  <p className="mt-5 flex items-center gap-1.5 text-[11px] text-white/45">
                    <CalendarDays className="h-3.5 w-3.5 text-ember" />
                    {fmtRange(event.startDate, event.endDate)} · {event.city}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* footer */}
      <footer className="relative z-10 border-t border-ember/15 px-5 py-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <Orbit className="h-4 w-4 text-ember" />
          <span className="font-display text-xs font-bold tracking-[0.3em] text-white/60">
            ORBIT
          </span>
        </div>
        <p className="mt-2 text-[11px] text-white/35">
          Event management portal · every event, in one orbit
        </p>
      </footer>
    </div>
  );
}
