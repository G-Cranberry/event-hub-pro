import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";

async function isRegistered(ctx: QueryCtx, eventId: any, userId: any) {
  const reg = await ctx.db
    .query("registrations")
    .withIndex("by_user_event", (q) =>
      q.eq("userId", userId).eq("eventId", eventId),
    )
    .first();
  return reg !== null;
}

export const listForEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    const event = await ctx.db.get(eventId);
    if (!event) return { photos: [], allowed: false };

    const canView =
      userId !== null &&
      (event.ownerId === userId || (await isRegistered(ctx, eventId, userId)));
    if (!canView) return { photos: [], allowed: false };

    const photos = await ctx.db
      .query("gallery")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .order("desc")
      .collect();
    return { photos, allowed: true };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const savePhoto = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { eventId, storageId, caption }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (event.ownerId !== userId) throw new Error("Not your event");
    const user = await ctx.db.get(userId);
    const id = await ctx.db.insert("gallery", {
      eventId,
      storageId,
      caption,
      uploadedBy: userId,
      uploadedByName: user?.name ?? "Organizer",
      createdAt: Date.now(),
    });
    return id;
  },
});

export const savePhotoUrl = mutation({
  args: {
    eventId: v.id("events"),
    imageUrl: v.string(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { eventId, imageUrl, caption }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (event.ownerId !== userId) throw new Error("Not your event");
    const user = await ctx.db.get(userId);
    const id = await ctx.db.insert("gallery", {
      eventId,
      imageUrl,
      caption,
      uploadedBy: userId,
      uploadedByName: user?.name ?? "Organizer",
      createdAt: Date.now(),
    });
    return id;
  },
});

export const deletePhoto = mutation({
  args: { photoId: v.id("gallery") },
  handler: async (ctx, { photoId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const photo = await ctx.db.get(photoId);
    if (!photo) throw new Error("Photo not found");
    const event = await ctx.db.get(photo.eventId);
    if (!event || event.ownerId !== userId) throw new Error("Not your event");
    if (photo.storageId) await ctx.storage.delete(photo.storageId);
    await ctx.db.delete(photoId);
  },
});

/** Resolve storage ids to URLs for a set of photos. */
export const getPhotoUrls = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const userId = await getAuthUserId(ctx);
    const event = await ctx.db.get(eventId);
    if (!event) return [];
    const canView =
      userId !== null &&
      (event.ownerId === userId || (await isRegistered(ctx, eventId, userId)));
    if (!canView) return [];

    const photos = await ctx.db
      .query("gallery")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .order("desc")
      .collect();

    const out = [];
    for (const photo of photos) {
      let url: string | null = null;
      if (photo.storageId) url = await ctx.storage.getUrl(photo.storageId);
      else if (photo.imageUrl) url = photo.imageUrl;
      out.push({ photo, url });
    }
    return out;
  },
});
