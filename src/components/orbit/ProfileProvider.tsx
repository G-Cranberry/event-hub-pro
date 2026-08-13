import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

type Profile = Doc<"profiles"> | null | undefined;

const ProfileContext = createContext<{ profile: Profile }>({ profile: undefined });

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const profile = useQuery(api.profiles.getMyProfile, {});
  const ensureProfile = useMutation(api.profiles.ensureProfile);
  const ran = useRef(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && profile === null && !ran.current) {
      ran.current = true;
      ensureProfile().catch(() => {});
    }
    if (profile !== undefined) ran.current = true;
  }, [authLoading, isAuthenticated, profile, ensureProfile]);

  return (
    <ProfileContext.Provider value={{ profile }}>{children}</ProfileContext.Provider>
  );
}
