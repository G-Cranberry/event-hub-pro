import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { CalendarDays, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "./ProfileProvider";
import { GlassToggle } from "./GlassToggle";

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
    <GlassToggle
      className={cn(large ? "max-w-md" : "max-w-sm")}
      value={mode}
      onChange={setMode}
      options={[
        {
          key: "participant",
          label: "Participant",
          desc: "Discover & join events",
          icon: CalendarDays,
          activeColor: "oklch(0.74 0.16 50)",
        },
        {
          key: "organizer",
          label: "Organizer",
          desc: "Run events & scan passes",
          icon: UserCog,
          activeColor: "oklch(0.8 0.13 78)",
        },
      ]}
    />
  );
}
