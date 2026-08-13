import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { modeValidator } from "./schema";
import { getCurrentUser } from "./users";

/** Get the signed-in user's app profile (null on first visit). */
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

/** Create the profile row on first access (called after auth from the app). */
export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return existing;

    const user = await ctx.db.get(userId);
    const id = await ctx.db.insert("profiles", {
      userId,
      name: user?.name ?? user?.email ?? undefined,
      college: undefined,
      isParticipant: true,
      isOrganizer: true,
      currentMode: "participant",
    });
    return await ctx.db.get(id);
  },
});

/** Update name / roles / college on the profile. */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    college: v.optional(v.string()),
    isParticipant: v.optional(v.boolean()),
    isOrganizer: v.optional(v.boolean()),
    currentMode: v.optional(modeValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    let profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      const id = await ctx.db.insert("profiles", {
        userId,
        name: args.name,
        college: args.college,
        isParticipant: args.isParticipant ?? true,
        isOrganizer: args.isOrganizer ?? true,
        currentMode: args.currentMode ?? "participant",
      });
      profile = await ctx.db.get(id);
      return profile;
    }

    // A user must always keep at least one role enabled.
    const wantsParticipant = args.isParticipant ?? profile.isParticipant;
    const wantsOrganizer = args.isOrganizer ?? profile.isOrganizer;
    const isParticipant = wantsParticipant || !wantsOrganizer;
    const isOrganizer = wantsOrganizer || !wantsParticipant;

    let currentMode = args.currentMode ?? profile.currentMode;
    if (currentMode === "participant" && !isParticipant) currentMode = "organizer";
    if (currentMode === "organizer" && !isOrganizer) currentMode = "participant";

    await ctx.db.patch(profile._id, {
      name: args.name !== undefined ? args.name : profile.name,
      college: args.college !== undefined ? args.college : profile.college,
      isParticipant,
      isOrganizer,
      currentMode,
    });
    return await ctx.db.get(profile._id);
  },
});

/** Flip the user's current workspace mode (participant <-> organizer). */
export const toggleMode = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Profile not found");

    const next: "participant" | "organizer" =
      profile.currentMode === "participant" ? "organizer" : "participant";
    if (next === "participant" && !profile.isParticipant) return profile;
    if (next === "organizer" && !profile.isOrganizer) return profile;

    await ctx.db.patch(profile._id, { currentMode: next });
    return await ctx.db.get(profile._id);
  },
});

/** Ensure a name is set on the user + profile (used after first sign-in). */
export const setProfileName = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user && !user.name) {
      await ctx.db.patch(userId, { name });
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (profile) {
      await ctx.db.patch(profile._id, { name: profile.name ?? name });
    }
  },
});

/** Convenience: the current user row (used by event queries for ownership). */
export const currentUserRow = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user;
  },
});
