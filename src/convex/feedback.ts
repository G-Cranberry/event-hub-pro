import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Submit feedback for an event. */
export const submit = mutation({
  args: {
    eventId: v.id("events"),
    rating: v.number(),
    comment: v.optional(v.string()),
    categories: v.optional(v.record(v.string(), v.number())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // Check if already submitted
    const existing = await ctx.db
      .query("feedback")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", args.eventId)
      )
      .first();
    if (existing) throw new Error("You have already submitted feedback for this event");
    return await ctx.db.insert("feedback", {
      eventId: args.eventId,
      userId,
      rating: args.rating,
      comment: args.comment,
      categories: args.categories,
      createdAt: Date.now(),
    });
  },
});

/** List all feedback for an event (organizer view). */
export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("feedback")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
  },
});

/** Summary stats for an event's feedback. */
export const summary = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const entries = await ctx.db
      .query("feedback")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    if (entries.length === 0)
      return { count: 0, avg: 0, distribution: [0, 0, 0, 0, 0], topComments: [] };
    const total = entries.reduce((s, e) => s + e.rating, 0);
    const dist = [0, 0, 0, 0, 0];
    entries.forEach((e) => {
      const idx = Math.min(Math.max(Math.round(e.rating) - 1, 0), 4);
      dist[idx]++;
    });
    const topComments = entries
      .filter((e) => e.comment && e.comment.trim())
      .slice(0, 10)
      .map((e) => ({ rating: e.rating, comment: e.comment! }));
    return { count: entries.length, avg: total / entries.length, distribution: dist, topComments };
  },
});

/** Check if a user has already submitted feedback. */
export const hasSubmitted = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const existing = await ctx.db
      .query("feedback")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .first();
    return !!existing;
  },
});
