import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Camera,
  Globe,
  Mail,
  MapPin,
  Orbit,
  QrCode,
  ScanLine,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { ParticleCanvas } from "@/components/orbit/ParticleCanvas";
import { CardCarousel, CinematicBg } from "@/components/orbit/CardCarousel";

const FEATURES = [
  { icon: CalendarDays, title: "Event Discovery", desc: "Browse upcoming events with rich posters, detailed info, and one-click registration. Never miss what matters.", color: "text-ember", bg: "bg-ember/10", border: "border-ember/40", to: "/events" },
  { icon: Ticket, title: "Digital Pass", desc: "Every registration gives you a unique QR pass stored in your wallet. Show it at the door — scan and go.", color: "text-accent", bg: "bg-accent/10", border: "border-accent/40", to: "/passes" },
  { icon: ScanLine, title: "Live Scanning", desc: "Organizers scan passes at the door with instant validation. Track entries, advance rounds, manage capacity in real time.", color: "text-amber-300", bg: "bg-amber-300/10", border: "border-amber-300/40", to: "/events" },
  { icon: QrCode, title: "Dynamic Forms", desc: "Organizers design custom registration forms field by field. Individual or team sign-ups, fully flexible.", color: "text-ember", bg: "bg-ember/10", border: "border-ember/40", to: "/events" },
  { icon: Award, title: "Certificates", desc: "Download personalized attendance or achievement certificates. Customizable templates for every event.", color: "text-gold", bg: "bg-gold/10", border: "border-gold/40", to: "/certificates" },
  { icon: Camera, title: "Photo Galleries", desc: "Organizers upload event photos, participants relive the day. A shared visual memory of every gathering.", color: "text-accent", bg: "bg-accent/10", border: "border-accent/40", to: "/events" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Sign Up", desc: "Create your account in seconds with email OTP. One account, two modes.", icon: Users },
  { step: "02", title: "Discover & Register", desc: "Browse events, fill forms, grab your digital pass instantly.", icon: Ticket },
  { step: "03", title: "Attend & Scan", desc: "Show your QR at the door. Scan validates your pass live.", icon: QrCode },
  { step: "04", title: "Collect & Share", desc: "Download certificates, browse galleries, share memories.", icon: Award },
];

export default function Home() {
  const events = useQuery(api.events.listPublished);
  const upcoming = (events ?? []).filter((e) => e.endDate > Date.now()).slice(0, 5);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* particle bg */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <ParticleCanvas count={50} color="mixed" />
      </div>
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[600px] bg-[radial-gradient(800px_400px_at_60%_-5%,oklch(0.78_0.18_45/0.14),transparent_60%)]" />
      {/* scan line overlay */}
      <div className="orb-scanlines pointer-events-none absolute inset-0 z-[1] opacity-20" />

      {/* ─── Hero with Carousel ─── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-20 sm:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-ember">
            <span className="orb-hud-blink h-1.5 w-1.5 rounded-full bg-ember" />
            <span className="h-px w-8 bg-ember/60" />
            Event Management Portal
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Every event,<br /><span className="text-gradient-ember">in one orbit</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-foreground/60">
            ORBIT unifies registration, digital passes, live scanning, certificates,
            and galleries into a single immersive platform.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-10">
          <CinematicBg>
            <div className="px-4 py-8 sm:px-8 sm:py-12">
              <CardCarousel events={upcoming} />
            </div>
          </CinematicBg>
        </motion.div>
      </section>

      {/* ─── 1. Features Grid ─── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-ember">What ORBIT does</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need, <span className="text-gradient-ember">nothing you don't</span>
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm leading-6 text-foreground/55">
            A complete event lifecycle — from discovery to certificate — in one seamless experience.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg, border, to }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.06 }}>
              <Link to={to} className="orb-card orb-neon-border orb-hud-corners group block h-full p-6 transition-transform hover:-translate-y-0.5">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl border ${bg} ${border}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground/55">{desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 2. How It Works ─── */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 py-20">
        <div className="mb-12 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-ember">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            From signup to <span className="text-gradient-ember">certificate</span>
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }} className="orb-card orb-neon-border group relative p-6">
              <span className="font-display text-4xl font-bold text-ember/15">{step}</span>
              <span className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl border border-ember/30 bg-ember/10">
                <Icon className="h-5 w-5 text-ember" />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-5 text-foreground/55">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 3. Choose your mode ─── */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-ember">Two worlds, one account</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Choose your <span className="text-gradient-ember">mode</span>
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link to="/auth?returnTo=%2Fevents" className="orb-card orb-hud-corners orb-scanlines group block p-8">
            <div className="flex items-center gap-3">
              <span className="orb-neon-border flex h-12 w-12 items-center justify-center rounded-xl bg-ember/10 text-ember"><Users className="h-5 w-5" /></span>
              <div>
                <p className="font-display text-xl font-bold text-foreground">Participant</p>
                <p className="text-xs uppercase tracking-widest text-foreground/40">Discover · Register · Attend</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-foreground/60">Browse events, fill forms, carry your pass, track rounds, grab carpools, download certificates.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-ember">Enter as participant <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/auth?returnTo=%2Forg%2Fevents" className="orb-card orb-hud-corners orb-scanlines group block p-8">
            <div className="flex items-center gap-3">
              <span className="orb-neon-border flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold"><Sparkles className="h-5 w-5" /></span>
              <div>
                <p className="font-display text-xl font-bold text-foreground">Organizer</p>
                <p className="text-xs uppercase tracking-widest text-foreground/40">Create · Scan · Manage</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-foreground/60">Design forms, watch live registrations, scan passes, advance rounds, publish certificates.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-gold">Enter as organizer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </section>

      {/* ─── 4. CTA ─── */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 py-16">
        <div className="orb-card orb-neon-border orb-hud-corners orb-scanlines relative overflow-hidden p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_300px_at_50%_0%,oklch(0.78_0.18_45/0.12),transparent)]" />
          <h2 className="relative font-display text-2xl font-bold text-foreground sm:text-3xl">Ready to enter the orbit?</h2>
          <p className="relative mt-3 text-sm leading-6 text-foreground/55">Sign up for free, discover events, and carry your passes everywhere.</p>
          <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth?returnTo=%2Fevents" className="rounded-full bg-ember px-7 py-3 text-sm font-bold text-[#1a0d02] shadow-[0_10px_30px_-8px_rgba(255,120,50,0.6)] hover:bg-ember/90">Get started free</Link>
            <Link to="/auth?returnTo=%2Forg%2Fevents" className="rounded-full border border-foreground/20 bg-foreground/5 px-7 py-3 text-sm font-bold text-foreground hover:bg-foreground/10">I'm an organizer</Link>
          </div>
        </div>
      </section>

      {/* ─── 5. Footer ─── */}
      <footer className="relative z-10 border-t border-foreground/10 px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ember/15"><Orbit className="h-4 w-4 text-ember" /></span>
                <span className="font-display text-lg font-bold tracking-[0.2em] text-foreground">ORBIT</span>
              </Link>
              <p className="mt-3 text-sm leading-5 text-foreground/50">Every event, in one orbit. Registration, digital passes, and certificates.</p>
            </div>
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-foreground/40">Explore</h4>
              <ul className="space-y-2">
                {[{ label: "Events", to: "/events" }, { label: "Passes", to: "/passes" }, { label: "Certificates", to: "/certificates" }].map((l) => (
                  <li key={l.label}><Link to={l.to} className="text-sm text-foreground/55 transition-colors hover:text-ember">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-foreground/40">Organizers</h4>
              <ul className="space-y-2">
                {[{ label: "Create Event", to: "/org/events/new" }, { label: "My Events", to: "/org/events" }, { label: "Form Builder", to: "/org/events" }].map((l) => (
                  <li key={l.label}><Link to={l.to} className="text-sm text-foreground/55 transition-colors hover:text-ember">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-foreground/40">Connect</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-foreground/55"><Mail className="h-3.5 w-3.5 text-ember" />hello@orbit.events</li>
                <li className="flex items-center gap-2 text-sm text-foreground/55"><Globe className="h-3.5 w-3.5 text-ember" />orbit.events</li>
                <li className="flex items-center gap-2 text-sm text-foreground/55"><MapPin className="h-3.5 w-3.5 text-ember" />Built with Convex</li>
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
    </div>
  );
}
