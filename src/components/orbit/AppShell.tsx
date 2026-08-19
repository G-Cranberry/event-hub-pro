import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";

import { LogOut, Orbit, UserCog, Users } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { cn } from "@/lib/utils";

import { OrbitNav } from "./OrbitNav";
import { ProfileProvider, useProfile } from "./ProfileProvider";
import { ThemeToggle, applySavedTheme } from "./ThemeToggle";

function BrandMark() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(isAuthenticated ? "/home" : "/")}
      className="glass fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full px-3.5 py-2 transition-colors hover:border-ember/50"
    >
      <Orbit className="h-4 w-4 text-ember" />
      <span className="font-display text-sm font-bold tracking-[0.22em] text-foreground">
        ORBIT
      </span>
    </button>
  );
}

function TopControls() {
  const { isAuthenticated, signOut, user } = useAuth();
  const { profile } = useProfile();
  const toggleMode = useMutation(api.profiles.toggleMode);
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const mode = profile?.currentMode ?? "participant";
  const displayName = profile?.name || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      <ThemeToggle />
      <button
        type="button"
        onClick={() => toggleMode()}
        className="glass group flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 transition-colors hover:border-ember/50"
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
        <span className="hidden text-xs font-semibold uppercase tracking-widest text-foreground/80 sm:inline">
          {mode}
        </span>
      </button>
      {/* Profile on right — clickable */}
      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="glass flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:border-ember/50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ember to-gold text-xs font-bold text-white shadow-[0_0_12px_rgba(255,120,50,0.4)]">
          {initials}
        </span>
        <span className="hidden text-xs font-semibold text-foreground/85 sm:inline max-w-[80px] truncate">
          {displayName}
        </span>
      </button>
      <button
        type="button"
        onClick={handleSignOut}
        className="glass flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:border-destructive/60 hover:text-destructive"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    applySavedTheme();
  }, []);

  return (
    <ProfileProvider>
      <div className="relative min-h-screen">
        <BrandMark />
        <TopControls />
        <OrbitNav />
        {children}
      </div>
    </ProfileProvider>
  );
}
