import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List announcements for an event (newest first). */
export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("announcements")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .order("desc")
      .collect();
  },
});

/** List announcements visible to a participant (for an event they registered for). */
export const listForParticipant = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .order("desc")
      .collect();
  },
});

/** Send an announcement. */
export const send = mutation({
  args: {
    eventId: v.id("events"),
    title: v.string(),
    body: v.string(),
    priority: v.union(v.literal("normal"), v.literal("urgent")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("announcements", {
      eventId: args.eventId,
      ownerId: userId,
      title: args.title,
      body: args.body,
      priority: args.priority,
      createdAt: Date.now(),
    });
  },
});

/** Delete an announcement. */
export const remove = mutation({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, { announcementId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const entry = await ctx.db.get(announcementId);
    if (!entry || entry.ownerId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(announcementId);
  },
});
