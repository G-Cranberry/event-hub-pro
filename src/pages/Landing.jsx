import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Monitor,
  Orbit,
  Smartphone,
  Sparkles,
  Tablet,
  UserCog,
  Users } from
"lucide-react";
import { Link } from "react-router";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ParticleCanvas } from "@/components/orbit/ParticleCanvas";
import { FloatingCards } from "@/components/orbit/FloatingCards";

const PLATFORMS = [
{ label: "Web", icon: Globe },
{ label: "macOS", icon: Monitor },
{ label: "Windows", icon: Monitor },
{ label: "Linux", icon: Monitor },
{ label: "iOS", icon: Smartphone },
{ label: "Android", icon: Smartphone },
{ label: "Tablet", icon: Tablet }];


export default function Landing() {
  const seedDemo = useMutation(api.seed.seedDemo);
  const events = useQuery(api.events.listPublished);
  const seededRef = useRef(false);

  useEffect(() => {
    if (events !== undefined && events.length === 0 && !seededRef.current) {
      seededRef.current = true;
      seedDemo().catch(() => {});
    }
  }, [events, seedDemo]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* floating background cards */}
      <FloatingCards />
      {/* particle canvas */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <ParticleCanvas count={70} color="mixed" />
      </div>
      {/* ambient hero glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[720px] bg-[radial-gradient(900px_520px_at_70%_-8%,oklch(0.78_0.18_45/0.18),transparent_62%),radial-gradient(700px_420px_at_8%_6%,oklch(0.82_0.16_175/0.1),transparent_60%)]" />
      {/* scan line overlay */}
      <div className="orb-scanlines pointer-events-none absolute inset-0 z-[1] opacity-30" />

      {/* ─── Header ─── */}
      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="orb-neon-border flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ember/20 to-[#0e0a16]/80">
            <Orbit className="h-4.5 w-4.5 text-ember" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.24em] text-foreground">ORBIT</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-foreground/60 md:flex">
          {[
          { label: "Discover", to: "/auth?returnTo=%2Fevents" },
          { label: "Wallet", to: "/auth?returnTo=%2Fpasses" },
          { label: "Gallery", to: "/auth?returnTo=%2Fevents" },
          { label: "Organizer", to: "/auth?returnTo=%2Forg%2Fevents" }].
          map((link) =>
          <Link key={link.label} to={link.to} className="transition-colors hover:text-ember">{link.label}</Link>
          )}
        </nav>

        <Button asChild variant="outline" className="orb-neon-border gap-2 rounded-full bg-foreground/5 text-foreground backdrop-blur hover:border-ember/70 hover:bg-ember/10 hover:text-ember">
          <Link to="/auth">
            <Sparkles className="h-4 w-4 text-ember" />
            Sign in
          </Link>
        </Button>
      </header>

      {/* ─── Hero — full width ─── */}
      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-10 sm:pt-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-ember">
          
          <span className="orb-hud-blink h-1.5 w-1.5 rounded-full bg-ember" />
          <span className="h-px w-8 bg-ember/60" />
          Powered by Convex
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.04] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
          
          <span className="orb-glitch" data-text="EVERY EVENT">EVERY EVENT</span>
          <br />
          <span className="text-gradient-ember">in one orbit</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-7 max-w-2xl text-base leading-7 text-foreground/65 sm:text-lg">
          
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
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          
          <Button asChild size="lg" className="orb-neon-pulse h-12 gap-2 rounded-full bg-ember px-7 font-bold text-[#1a0d02] shadow-[0_14px_44px_-12px_rgba(255,120,50,0.7)] hover:bg-ember/90">
            <Link to="/auth?returnTo=%2Fevents">
              Enter the portal <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="orb-neon-border h-12 rounded-full bg-foreground/5 px-7 text-foreground backdrop-blur hover:border-ember/60 hover:bg-ember/10 hover:text-ember">
            <Link to="/auth?returnTo=%2Forg%2Fevents">Run an event</Link>
          </Button>
        </motion.div>

        {/* platform badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2">
          
          {PLATFORMS.map(({ label, icon: Icon }) =>
          <span key={label} className="flex items-center gap-1.5 rounded-md border border-ember/15 bg-foreground/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
              <Icon className="h-3.5 w-3.5 text-ember/80" />
              {label}
            </span>
          )}
        </motion.div>
      </main>

      {/* ─── Choose your mode (after hero, before footer) ─── */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-24">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-ember">Two worlds, one account</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
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
                <p className="font-display text-xl font-bold text-foreground">Participant</p>
                <p className="text-xs uppercase tracking-widest text-foreground/40">Discover · Register · Attend</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-foreground/60">
              Browse events, fill organizer-designed forms, carry your pass in a
              wallet, track round results, grab seats in carpools, and download certificates.
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
                <p className="font-display text-xl font-bold text-foreground">Organizer</p>
                <p className="text-xs uppercase tracking-widest text-foreground/40">Create · Scan · Manage</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-foreground/60">
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

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-foreground/10 px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ember/15">
                  <Orbit className="h-4 w-4 text-ember" />
                </span>
                <span className="font-display text-lg font-bold tracking-[0.2em] text-foreground">ORBIT</span>
              </Link>
              <p className="mt-3 text-sm leading-5 text-foreground/50">
                Every event, in one orbit. A unified platform for registration, digital passes, and certificates.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-foreground/40">Explore</h4>
              <ul className="space-y-2">
                {[{ label: "Events", to: "/events" }, { label: "Passes", to: "/passes" }, { label: "Certificates", to: "/certificates" }].map((l) =>
                <li key={l.label}><Link to={l.to} className="text-sm text-foreground/55 transition-colors hover:text-ember">{l.label}</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-foreground/40">Organizers</h4>
              <ul className="space-y-2">
                {[{ label: "Create Event", to: "/org/events/new" }, { label: "My Events", to: "/org/events" }, { label: "Form Builder", to: "/org/events" }].map((l) =>
                <li key={l.label}><Link to={l.to} className="text-sm text-foreground/55 transition-colors hover:text-ember">{l.label}</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-foreground/40">Connect</h4>
              <ul className="space-y-2">
                <li className="text-sm text-foreground/55">hello@orbit.events</li>
                <li className="text-sm text-foreground/55">orbit.events</li>
                <li className="text-sm text-foreground/55">Built with Convex</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-foreground/10 pt-6 sm:flex-row">
            <p className="text-[11px] text-foreground/35">© {new Date().getFullYear()} ORBIT · Event Management Portal</p>
            <div className="flex items-center gap-4 text-[11px] text-foreground/35">
              <Link to="/auth" className="transition-colors hover:text-foreground/60">Sign in</Link>
              <span>·</span>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground/60">GitHub</a>
              <span>·</span>
              <a href="https://convex.dev" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground/60">Convex</a>
            </div>
          </div>
        </div>
      </footer>
    </div>);

}