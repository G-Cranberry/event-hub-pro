import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** All of my registrations joined with their events (the wallet). */
export const myRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const regs = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const out = [];
    for (const reg of regs) {
      const event = await ctx.db.get(reg.eventId);
      if (event) {
        out.push({ registration: reg, event });
      }
    }
    return out;
  },
});

/** My registration for a specific event (or null). */
export const myRegistrationForEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("registrations")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId),
      )
      .first();
  },
});

/** Live roster for an event (organizer only) — joins participant names. */
export const eventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { registrations: [], event: null };
    const event = await ctx.db.get(eventId);
    if (!event) return { registrations: [], event: null };
    if (event.ownerId !== userId) return { registrations: [], event: null };

    const regs = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .order("desc")
      .collect();

    const out = [];
    for (const reg of regs) {
      const user = await ctx.db.get(reg.userId);
      out.push({
        registration: reg,
        participantName: user?.name ?? "Participant",
        participantEmail: user?.email ?? "",
      });
    }
    return { registrations: out, event };
  },
});

// ---------------------------------------------------------------------------
// Registration mutation
// ---------------------------------------------------------------------------

function uid(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export const register = mutation({
  args: {
    eventId: v.id("events"),
    type: v.union(v.literal("individual"), v.literal("team")),
    teamName: v.optional(v.string()),
    teamMembers: v.optional(v.array(v.string())),
    formData: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (!event.regOpen || event.status !== "published")
      throw new Error("Registration is closed for this event");

    if (event.registrationType === "individual" && args.type !== "individual")
      throw new Error("This event only accepts individual registration");
    if (event.registrationType === "team" && args.type !== "team")
      throw new Error("This event only accepts team registration");

    if (args.type === "team") {
      if (!args.teamName) throw new Error("Team name is required");
      if (!args.teamMembers || args.teamMembers.length < 1)
        throw new Error("Add at least one team member");
      if (args.teamMembers.length + 1 > event.maxTeamSize)
        throw new Error(
          `Team size cannot exceed ${event.maxTeamSize} (including you)`,
        );
    }

    const existing = await ctx.db
      .query("registrations")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", args.eventId),
      )
      .first();
    if (existing) throw new Error("You are already registered for this event");

    const subStatus: Record<string, "pending" | "attended"> = {};
    for (const sub of event.subEvents) subStatus[sub.id] = "pending";

    const qrData = JSON.stringify({
      v: 1,
      reg: uid("orb"),
      event: args.eventId,
      name: args.formData?.fullname ?? args.teamName ?? "Attendee",
    });

    const regId = await ctx.db.insert("registrations", {
      eventId: args.eventId,
      userId,
      type: args.type,
      teamName: args.type === "team" ? args.teamName : undefined,
      teamMembers: args.type === "team" ? args.teamMembers : undefined,
      formData: args.formData ?? {},
      qrData,
      status: "pending",
      roundStatus: "none",
      subStatus,
      createdAt: Date.now(),
    });
    return await ctx.db.get(regId);
  },
});

// ---------------------------------------------------------------------------
// Pass status mutations (organizer actions, reflected live for participants)
// ---------------------------------------------------------------------------

async function requireOwner(ctx: any, eventId: any) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  const event = await ctx.db.get(eventId);
  if (!event) throw new Error("Event not found");
  if (event.ownerId !== userId) throw new Error("Not your event");
  return event;
}

export const markAttended = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, { registrationId }) => {
    const reg = await ctx.db.get(registrationId);
    if (!reg) throw new Error("Registration not found");
    await requireOwner(ctx, reg.eventId);
    const next = reg.status === "attended" ? "pending" : "attended";
    await ctx.db.patch(registrationId, { status: next });
    return { status: next };
  },
});

export const markSubEvent = mutation({
  args: {
    registrationId: v.id("registrations"),
    subEventId: v.string(),
  },
  handler: async (ctx, { registrationId, subEventId }) => {
    const reg = await ctx.db.get(registrationId);
    if (!reg) throw new Error("Registration not found");
    await requireOwner(ctx, reg.eventId);
    const current = reg.subStatus[subEventId] ?? "pending";
    const next: "pending" | "attended" = current === "attended" ? "pending" : "attended";
    await ctx.db.patch(registrationId, {
      subStatus: { ...reg.subStatus, [subEventId]: next },
    });
    return { subEventId, status: next };
  },
});

export const markRound = mutation({
  args: {
    registrationId: v.id("registrations"),
    roundStatus: v.union(
      v.literal("none"),
      v.literal("selected"),
      v.literal("eliminated"),
    ),
  },
  handler: async (ctx, { registrationId, roundStatus }) => {
    const reg = await ctx.db.get(registrationId);
    if (!reg) throw new Error("Registration not found");
    await requireOwner(ctx, reg.eventId);
    await ctx.db.patch(registrationId, { roundStatus });
    return { roundStatus };
  },
});

/** Look up a registration by its QR payload (used by the scanner). */
export const lookupByQrData = mutation({
  args: { qrData: v.string(), eventId: v.id("events") },
  handler: async (ctx, { qrData, eventId }) => {
    await requireOwner(ctx, eventId);
    const regs = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    const match = regs.find((r) => r.qrData === qrData);
    if (!match) return null;
    const user = await ctx.db.get(match.userId);
    return {
      registration: match,
      participantName: user?.name ?? "Participant",
      participantEmail: user?.email ?? "",
    };
  },
});

/** Participant-facing: whether the user is registered (boolean helper). */
export const isRegistered = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return false;
    const reg = await ctx.db
      .query("registrations")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId),
      )
      .first();
    return reg !== null;
  },
});

export { getCurrentUser };
