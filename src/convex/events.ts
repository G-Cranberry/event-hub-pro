import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import {
  certificateTemplateValidator,
  eventTypeValidator,
  formFieldValidator,
  regTypeValidator,
  roundValidator,
  subEventValidator,
  transportValidator,
} from "./schema";

// ---------------------------------------------------------------------------
// Public queries
// ---------------------------------------------------------------------------

/** All published events, newest first. */
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_owner")
      .order("desc")
      .collect();
    return events.filter((e) => e.status === "published");
  },
});

export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

/** Event plus whether the signed-in user is registered / owns it. */
export const getEventContext = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) return null;

    const userId = await getAuthUserId(ctx);
    let myRegistration = null;
    let isOwner = false;
    if (userId !== null) {
      isOwner = event.ownerId === userId;
      myRegistration = await ctx.db
        .query("registrations")
        .withIndex("by_user_event", (q) =>
          q.eq("userId", userId).eq("eventId", eventId),
        )
        .first();
    }
    return { event, myRegistration, isOwner };
  },
});

// ---------------------------------------------------------------------------
// Organizer mutations
// ---------------------------------------------------------------------------

/** Default empty form schema with a couple of starter fields. */
export function defaultFormSchema() {
  return [
    {
      id: "fullname",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Your full name",
      half: false,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "you@example.com",
      half: true,
    },
    {
      id: "phone",
      label: "Phone",
      type: "phone",
      required: false,
      placeholder: "+91 98765 43210",
      half: true,
    },
  ];
}

export const createEvent = mutation({
  args: {
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    type: eventTypeValidator,
    startDate: v.number(),
    endDate: v.number(),
    venue: v.string(),
    city: v.string(),
    accent: v.string(),
    registrationType: regTypeValidator,
    maxTeamSize: v.number(),
    formSchema: v.array(formFieldValidator),
    subEvents: v.array(subEventValidator),
    rounds: v.array(roundValidator),
    transport: transportValidator,
    certificate: certificateTemplateValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);

    const eventId = await ctx.db.insert("events", {
      ...args,
      ownerId: userId,
      organizerName: user?.name ?? "Organizer",
      regOpen: true,
      status: "published",
      createdAt: Date.now(),
    });
    return eventId;
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    patch: v.object({
      title: v.optional(v.string()),
      tagline: v.optional(v.string()),
      description: v.optional(v.string()),
      type: v.optional(eventTypeValidator),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      venue: v.optional(v.string()),
      city: v.optional(v.string()),
      accent: v.optional(v.string()),
      registrationType: v.optional(regTypeValidator),
      maxTeamSize: v.optional(v.number()),
      formSchema: v.optional(v.array(formFieldValidator)),
      subEvents: v.optional(v.array(subEventValidator)),
      rounds: v.optional(v.array(roundValidator)),
      transport: v.optional(transportValidator),
      certificate: v.optional(certificateTemplateValidator),
      regOpen: v.optional(v.boolean()),
      status: v.optional(
        v.union(v.literal("draft"), v.literal("published"), v.literal("ended")),
      ),
    }),
  },
  handler: async (ctx, { eventId, patch }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (event.ownerId !== userId) throw new Error("Not your event");
    await ctx.db.patch(eventId, patch);
    return eventId;
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (event.ownerId !== userId) throw new Error("Not your event");

    // Remove related records.
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    await Promise.all(registrations.map((r) => ctx.db.delete(r._id)));

    const carpools = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    for (const c of carpools) {
      const seats = await ctx.db
        .query("carpoolSeats")
        .withIndex("by_carpool", (q) => q.eq("carpoolId", c._id))
        .collect();
      await Promise.all(seats.map((s) => ctx.db.delete(s._id)));
      await ctx.db.delete(c._id);
    }

    const photos = await ctx.db
      .query("gallery")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    for (const p of photos) {
      if (p.storageId) await ctx.storage.delete(p.storageId);
      await ctx.db.delete(p._id);
    }

    await ctx.db.delete(eventId);
  },
});

/** Events owned by the signed-in organizer. */
export const myEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const events = await ctx.db
      .query("events")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();
    return events;
  },
});

/** All users that ever registered for an event (used to seed an organizer demo). */
export const registeredUserNames = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const regs = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    const names: string[] = [];
    for (const r of regs) {
      const u = await ctx.db.get(r.userId);
      if (u?.name) names.push(u.name);
    }
    return names;
  },
});

export { getCurrentUser };
