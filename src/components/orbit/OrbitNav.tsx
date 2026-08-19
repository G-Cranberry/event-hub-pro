import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "./ProfileProvider";
import { useNavigate } from "react-router";
import { User } from "lucide-react";

/**
 * Replaced the orbit wheel nav with a simple profile trigger button.
 * Clicking it navigates to /profile.
 */
export function OrbitNav() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const displayName = profile?.name || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <button
        type="button"
        aria-label="Open profile"
        onClick={() => navigate("/profile")}
        className="relative z-50 flex h-14 w-14 items-center justify-center rounded-full border border-ember/50 bg-gradient-to-br from-ember/30 to-ember/10 text-white backdrop-blur transition-transform hover:scale-105 active:scale-95 orb-border-glow"
        style={{ boxShadow: "0 8px 30px -6px rgba(255,92,56,0.5), 0 0 20px -4px rgba(255,92,56,0.3)" }}
      >
        <span className="absolute inset-0 rounded-full orb-ring" />
        <span className="absolute inset-1 rounded-full border border-ember/20" />
        {user ? (
          <span className="relative flex h-full w-full items-center justify-center text-sm font-bold text-ember">
            {initials}
          </span>
        ) : (
          <User className="h-5 w-5 text-ember" />
        )}
      </button>
    </div>
  );
}
