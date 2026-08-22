import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  LogOut,
  Mail,
  Orbit,
  Settings,
  Shield,
  Ticket,
  UserCog,
  Users } from
"lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/components/orbit/ProfileProvider";
import { ModeSwitcher } from "@/components/orbit/ModeSwitcher";
import { ParticleCanvas } from "@/components/orbit/ParticleCanvas";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const toggleMode = useMutation(api.profiles.toggleMode);
  const myRegs = useQuery(api.registrations.myRegistrations);
  const events = useQuery(api.events.listPublished);

  const passes = myRegs ?? [];
  const upcoming = (events ?? []).filter((e) => e.endDate > Date.now());
  const mode = profile?.currentMode ?? "participant";
  const displayName = profile?.name || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const email = user?.email ?? "—";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* bg */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <ParticleCanvas count={30} color="ember" />
      </div>
      <div className="orb-scanlines pointer-events-none absolute inset-0 z-[1] opacity-20" />

      <div className="relative z-10 mx-auto max-w-2xl px-5 pb-24 pt-20 sm:pt-24">
        {/* back */}
        <Link
          to="/home"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/50 transition-colors hover:text-ember">
          
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* avatar + name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center">
          
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-ember to-gold text-2xl font-bold text-white shadow-[0_0_30px_rgba(255,120,50,0.4)]">
            {initials}
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
            {displayName}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground/50">
            <Mail className="h-3.5 w-3.5 text-ember" />
            {email}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-ember/20 bg-ember/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ember">
            <Orbit className="h-3 w-3" />
            {mode} mode
          </span>
        </motion.div>

        {/* mode switcher */}
        {profile && profile.isParticipant && profile.isOrganizer &&
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-8">
          
            <ModeSwitcher />
          </motion.div>
        }

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="mt-10 grid grid-cols-3 gap-3">
          
          {[
          { label: "Passes", value: passes.length, icon: Ticket, color: "text-ember" },
          { label: "Events", value: upcoming.length, icon: CalendarDays, color: "text-accent" },
          { label: "Certs", value: passes.filter((p) => p.event.certificate?.enabled).length, icon: Award, color: "text-gold" }].
          map(({ label, value, icon: Icon, color }) =>
          <div key={label} className="orb-card orb-neon-border orb-hud-corners flex flex-col items-center p-5">
              <Icon className={`h-5 w-5 ${color}`} />
              <p className="mt-3 font-display text-2xl font-bold text-foreground">{value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40">{label}</p>
            </div>
          )}
        </motion.div>

        {/* quick links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10">
          
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-foreground/40">
            Quick links
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
            { label: "Events", desc: "Browse & register", icon: CalendarDays, to: "/events", color: "text-ember" },
            { label: "My passes", desc: "Wallet & QR", icon: Ticket, to: "/passes", color: "text-ember" },
            { label: "Certificates", desc: "Download PDFs", icon: Award, to: "/certificates", color: "text-gold" },
            ...(mode === "organizer" ?
            [{ label: "My events", desc: "Create & manage", icon: UserCog, to: "/org/events", color: "text-accent" }] :
            [{ label: "Organizer", desc: "Switch & create", icon: UserCog, to: "/org/events", color: "text-gold" }])].
            map(({ label, desc, icon: Icon, to, color }) =>
            <Link key={label} to={to} className="orb-card orb-neon-border group p-4">
                <Icon className={`h-5 w-5 ${color}`} />
                <p className="mt-2 text-sm font-bold text-foreground">{label}</p>
                <p className="mt-0.5 text-[11px] text-foreground/45">{desc}</p>
              </Link>
            )}
          </div>
        </motion.div>

        {/* settings & sign out */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="mt-10 space-y-3">
          
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-foreground/40">
            Account
          </h2>

          <div className="orb-card orb-neon-border flex items-center gap-3 p-4">
            <Shield className="h-5 w-5 text-foreground/40" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Account details</p>
              <p className="text-[11px] text-foreground/45">Signed in as {email}</p>
            </div>
          </div>

          <div className="orb-card orb-neon-border flex items-center gap-3 p-4">
            <Settings className="h-5 w-5 text-foreground/40" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Appearance</p>
              <p className="text-[11px] text-foreground/45">Toggle theme from the header</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="orb-card orb-neon-border flex w-full items-center gap-3 p-4 text-left transition-colors hover:border-destructive/50">
            
            <LogOut className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-bold text-destructive">Sign out</p>
              <p className="text-[11px] text-foreground/45">End your session</p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>);

}