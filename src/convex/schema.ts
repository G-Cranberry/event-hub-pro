import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Shared validators
// ---------------------------------------------------------------------------

export const MODES = ["participant", "organizer"] as const;
export const modeValidator = v.union(
  v.literal(MODES[0]),
  v.literal(MODES[1]),
);

export const EVENT_TYPES = ["single", "multi", "round"] as const;
export const eventTypeValidator = v.union(
  v.literal(EVENT_TYPES[0]),
  v.literal(EVENT_TYPES[1]),
  v.literal(EVENT_TYPES[2]),
);

export const REG_TYPES = ["individual", "team", "both"] as const;
export const regTypeValidator = v.union(
  v.literal(REG_TYPES[0]),
  v.literal(REG_TYPES[1]),
  v.literal(REG_TYPES[2]),
);

export const PASS_STATUS = ["pending", "attended"] as const;
export const passStatusValidator = v.union(
  v.literal(PASS_STATUS[0]),
  v.literal(PASS_STATUS[1]),
);

export const ROUND_STATUS = ["none", "selected", "eliminated"] as const;
export const roundStatusValidator = v.union(
  v.literal(ROUND_STATUS[0]),
  v.literal(ROUND_STATUS[1]),
  v.literal(ROUND_STATUS[2]),
);

/** A single field in an organizer-designed registration form. */
export const formFieldValidator = v.object({
  id: v.string(),
  label: v.string(),
  type: v.string(), // text | textarea | email | phone | number | date | select | radio | checkbox | file
  required: v.boolean(),
  placeholder: v.optional(v.string()),
  options: v.optional(v.array(v.string())),
  half: v.optional(v.boolean()),
});

export const subEventValidator = v.object({
  id: v.string(),
  label: v.string(),
  date: v.optional(v.number()),
  time: v.optional(v.string()),
});

export const roundValidator = v.object({
  id: v.string(),
  label: v.string(),
});

export const busValidator = v.object({
  route: v.string(),
  from: v.string(),
  to: v.string(),
  departures: v.array(v.string()),
});

export const pickupValidator = v.object({
  name: v.string(),
  time: v.string(),
});

export const transportValidator = v.object({
  buses: v.array(busValidator),
  pickupPoints: v.array(pickupValidator),
});

export const certificateTemplateValidator = v.object({
  enabled: v.boolean(),
  title: v.string(),
  subtitle: v.string(),
  accent: v.string(),
  layout: v.union(v.literal("classic"), v.literal("modern")),
  signature: v.string(),
  note: v.string(),
});

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(v.string()), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Product tables ---------------------------------------------------------

    /** Per-user app profile: roles + which mode they are currently in. */
    profiles: defineTable({
      userId: v.id("users"),
      name: v.optional(v.string()),
      college: v.optional(v.string()),
      isParticipant: v.boolean(),
      isOrganizer: v.boolean(),
      currentMode: modeValidator,
    }).index("by_user", ["userId"]),

    /** Events created by organizers. */
    events: defineTable({
      ownerId: v.id("users"),
      organizerName: v.string(),
      title: v.string(),
      tagline: v.string(),
      description: v.string(),
      type: eventTypeValidator,
      startDate: v.number(),
      endDate: v.number(),
      venue: v.string(),
      city: v.string(),
      accent: v.string(), // brand hex color
      registrationType: regTypeValidator,
      maxTeamSize: v.number(),
      formSchema: v.array(formFieldValidator),
      subEvents: v.array(subEventValidator),
      rounds: v.array(roundValidator),
      transport: transportValidator,
      certificate: certificateTemplateValidator,
      regOpen: v.boolean(),
      status: v.union(v.literal("draft"), v.literal("published"), v.literal("ended")),
      coverStorageId: v.optional(v.id("_storage")),
      createdAt: v.number(),
    }).index("by_owner", ["ownerId"]),

    /** A participant's registration + digital pass for one event. */
    registrations: defineTable({
      eventId: v.id("events"),
      userId: v.id("users"),
      type: v.union(v.literal("individual"), v.literal("team")),
      teamName: v.optional(v.string()),
      teamMembers: v.optional(v.array(v.string())),
      formData: v.any(),
      qrData: v.string(),
      status: passStatusValidator,
      roundStatus: roundStatusValidator,
      subStatus: v.record(v.string(), passStatusValidator),
      createdAt: v.number(),
    })
      .index("by_event", ["eventId"])
      .index("by_user", ["userId"])
      .index("by_user_event", ["userId", "eventId"]),

    /** Carpool offers posted by participants for an event. */
    carpools: defineTable({
      eventId: v.id("events"),
      userId: v.id("users"),
      from: v.string(),
      seats: v.number(),
      time: v.string(),
      notes: v.optional(v.string()),
      contact: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_event", ["eventId"]),

    /** Seats reserved on a carpool by other participants. */
    carpoolSeats: defineTable({
      carpoolId: v.id("carpools"),
      userId: v.id("users"),
      createdAt: v.number(),
    })
      .index("by_carpool", ["carpoolId"])
      .index("by_user", ["userId"]),

    /** Event photo gallery — access restricted to registered participants. */
    gallery: defineTable({
      eventId: v.id("events"),
      storageId: v.optional(v.id("_storage")),
      imageUrl: v.optional(v.string()),
      caption: v.optional(v.string()),
      uploadedBy: v.id("users"),
      uploadedByName: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_event", ["eventId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
