import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listForEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    const carpools = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .order("desc")
      .collect();

    const out = [];
    for (const carpool of carpools) {
      const owner = await ctx.db.get(carpool.userId);
      const seats = await ctx.db
        .query("carpoolSeats")
        .withIndex("by_carpool", (q) => q.eq("carpoolId", carpool._id))
        .collect();
      out.push({
        carpool,
        ownerName: owner?.name ?? "Participant",
        taken: seats.length,
        riders: seats.length,
        joined: userId !== null && seats.some((s) => s.userId === userId),
      });
    }
    return out;
  },
});

export const createCarpool = mutation({
  args: {
    eventId: v.id("events"),
    from: v.string(),
    seats: v.number(),
    time: v.string(),
    notes: v.optional(v.string()),
    contact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    if (args.seats < 1) throw new Error("At least 1 seat");
    const id = await ctx.db.insert("carpools", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const joinCarpool = mutation({
  args: { carpoolId: v.id("carpools") },
  handler: async (ctx, { carpoolId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const carpool = await ctx.db.get(carpoolId);
    if (!carpool) throw new Error("Carpool not found");

    const seats = await ctx.db
      .query("carpoolSeats")
      .withIndex("by_carpool", (q) => q.eq("carpoolId", carpoolId))
      .collect();
    if (seats.length >= carpool.seats) throw new Error("No seats left");

    const already = seats.find((s) => s.userId === userId);
    if (already) throw new Error("You already booked this ride");

    await ctx.db.insert("carpoolSeats", {
      carpoolId,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const leaveCarpool = mutation({
  args: { carpoolId: v.id("carpools") },
  handler: async (ctx, { carpoolId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const seat = await ctx.db
      .query("carpoolSeats")
      .withIndex("by_carpool", (q) => q.eq("carpoolId", carpoolId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (seat) await ctx.db.delete(seat._id);
  },
});

export const deleteCarpool = mutation({
  args: { carpoolId: v.id("carpools") },
  handler: async (ctx, { carpoolId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const carpool = await ctx.db.get(carpoolId);
    if (!carpool) throw new Error("Carpool not found");
    if (carpool.userId !== userId) throw new Error("Not your carpool");
    const seats = await ctx.db
      .query("carpoolSeats")
      .withIndex("by_carpool", (q) => q.eq("carpoolId", carpoolId))
      .collect();
    await Promise.all(seats.map((s) => ctx.db.delete(s._id)));
    await ctx.db.delete(carpoolId);
  },
});
