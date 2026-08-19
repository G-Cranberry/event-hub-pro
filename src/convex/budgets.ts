import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List budget entries for an event. */
export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("budgets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
  },
});

/** Add an expense entry. */
export const addExpense = mutation({
  args: {
    eventId: v.id("events"),
    label: v.string(),
    amount: v.number(),
    category: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("budgets", {
      eventId: args.eventId,
      ownerId: userId,
      type: "expense",
      label: args.label,
      amount: args.amount,
      category: args.category,
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

/** Add a sponsor contribution. */
export const addSponsor = mutation({
  args: {
    eventId: v.id("events"),
    sponsorName: v.string(),
    amount: v.number(),
    label: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("budgets", {
      eventId: args.eventId,
      ownerId: userId,
      type: "sponsor",
      label: args.label,
      amount: args.amount,
      sponsorName: args.sponsorName,
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

/** Delete a budget entry. */
export const remove = mutation({
  args: { entryId: v.id("budgets") },
  handler: async (ctx, { entryId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const entry = await ctx.db.get(entryId);
    if (!entry || entry.ownerId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(entryId);
  },
});
