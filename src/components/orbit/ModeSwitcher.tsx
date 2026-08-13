import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { CalendarDays, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "./ProfileProvider";

export function ModeSwitcher({ large }: { large?: boolean }) {
  const { profile } = useProfile();
  const updateProfile = useMutation(api.profiles.updateProfile);
  const mode = profile?.currentMode ?? "participant";

  const setMode = (next: "participant" | "organizer") => {
    if (next === mode) return;
    if (next === "participant" && profile && !profile.isParticipant) return;
    if (next === "organizer" && profile && !profile.isOrganizer) return;
    updateProfile({ currentMode: next });
  };

  return (
    <div
      className={cn(
        "relative grid w-full grid-cols-2 rounded-2xl border border-white/10 bg-black/30 p-1.5",
        large ? "max-w-md" : "max-w-sm",
      )}
    >
      <div
        className={cn(
          "absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-300 ease-out",
          mode === "participant"
            ? "left-1.5 bg-gradient-to-br from-ember/30 to-ember/10 shadow-[0_0_24px_rgba(255,92,56,0.25)]"
            : "left-[calc(50%+3px)] bg-gradient-to-br from-accent/30 to-accent/10 shadow-[0_0_24px_rgba(45,212,191,0.25)]",
        )}
      />
      {[
        { key: "participant" as const, label: "Participant", desc: "Discover & join events", icon: CalendarDays },
        { key: "organizer" as const, label: "Organizer", desc: "Run events & scan passes", icon: UserCog },
      ].map(({ key, label, desc, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => setMode(key)}
          className={cn(
            "relative z-10 flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-left transition-colors",
            mode === key ? "text-white" : "text-white/55 hover:text-white/85",
          )}
        >
          <Icon
            className={cn("h-5 w-5 shrink-0", mode === key && (key === "participant" ? "text-ember" : "text-accent"))}
          />
          <span>
            <span className="block text-sm font-bold leading-tight">{label}</span>
            <span className="hidden text-[11px] leading-tight text-white/50 sm:block">{desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
