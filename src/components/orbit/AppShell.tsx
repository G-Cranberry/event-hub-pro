import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Orbit, UserCog, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "./LoadingScreen";
import { OrbitNav } from "./OrbitNav";
import { ProfileProvider, useProfile } from "./ProfileProvider";

function BrandMark() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(isAuthenticated ? "/home" : "/")}
      className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3.5 py-2 backdrop-blur transition-colors hover:border-ember/50"
    >
      <Orbit className="h-4 w-4 text-ember" />
      <span className="font-display text-sm font-bold tracking-[0.22em] text-white">
        ORBIT
      </span>
    </button>
  );
}

function TopControls() {
  const { isAuthenticated, signOut } = useAuth();
  const { profile } = useProfile();
  const toggleMode = useMutation(api.profiles.toggleMode);
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const mode = profile?.currentMode ?? "participant";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={() => toggleMode()}
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/30 py-1.5 pl-2 pr-3.5 backdrop-blur transition-colors hover:border-ember/50"
        title={`Switch to ${mode === "participant" ? "Organizer" : "Participant"} mode`}
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            mode === "participant" ? "bg-ember/25 text-ember" : "bg-accent/20 text-accent",
          )}
        >
          {mode === "participant" ? <Users className="h-3.5 w-3.5" /> : <UserCog className="h-3.5 w-3.5" />}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
          {mode}
        </span>
      </button>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur transition-colors hover:border-destructive/60 hover:text-destructive"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem("orbit:loader")) return false;
    sessionStorage.setItem("orbit:loader", "1");
    return true;
  });

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 2150);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <ProfileProvider>
      <div className="relative min-h-screen">
        <BrandMark />
        <TopControls />
        <OrbitNav />
        <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>
        {children}
      </div>
    </ProfileProvider>
  );
}
