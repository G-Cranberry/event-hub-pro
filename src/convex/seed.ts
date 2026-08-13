import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";
import { defaultFormSchema } from "./events";

const DAY = 24 * 60 * 60 * 1000;

/** Deterministic abstract "photo" as an SVG data URI, themed on the event accent. */
function artDataUri(accent: string, seed: number): string {
  const s = (n: number) => (seed * 37 + n * 17) % 100;
  const cx1 = 200 + s(1) * 3;
  const cy1 = 150 + s(2) * 2;
  const cx2 = 600 - s(3) * 3;
  const cy2 = 480 - s(4) * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#0b0c11"/>
  <circle cx="${cx1}" cy="${cy1}" r="${180 + s(5)}" fill="${accent}" opacity="0.55" filter="blur(60px)"/>
  <circle cx="${cx2}" cy="${cy2}" r="${220 + s(6)}" fill="${accent}" opacity="0.35" filter="blur(80px)"/>
  <circle cx="400" cy="${300 + s(7)}" r="${90 + s(8)}" fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-width="2"/>
  <path d="M0 ${500 + s(9)} Q 200 ${420 + s(10)} 400 ${470 + s(11)} T 800 ${440 + s(12)} V 600 H 0 Z" fill="${accent}" opacity="0.18"/>
  <text x="40" y="70" font-family="monospace" font-size="22" fill="${accent}" opacity="0.8" letter-spacing="6">ORBIT · ${String(seed + 1).padStart(2, "0")}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Create (idempotently) the synthetic club organizer used by seeded events. */
async function ensureClubUser(ctx: MutationCtx) {
  const existing = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", "club@orbit.demo"))
    .first();
  if (existing) return existing._id;

  const id = await ctx.db.insert("users", {
    name: "Orbit Campus Club",
    email: "club@orbit.demo",
  });
  await ctx.db.insert("profiles", {
    userId: id,
    name: "Orbit Campus Club",
    isParticipant: false,
    isOrganizer: true,
    currentMode: "organizer",
  });
  return id;
}

async function seedGallery(
  ctx: MutationCtx,
  eventId: any,
  clubUserId: any,
  accent: string,
  count: number,
) {
  const existing = await ctx.db
    .query("gallery")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .first();
  if (existing) return;
  for (let i = 0; i < count; i++) {
    await ctx.db.insert("gallery", {
      eventId,
      imageUrl: artDataUri(accent, i),
      caption: `Frame ${String(i + 1).padStart(2, "0")} — ${new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
      uploadedBy: clubUserId,
      uploadedByName: "Orbit Campus Club",
      createdAt: Date.now() - (count - i) * DAY,
    });
  }
}

export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const clubUserId = await ensureClubUser(ctx);
    const now = Date.now();

    // Guard: only seed if no events exist yet.
    const anyEvent = await ctx.db.query("events").first();
    if (anyEvent) return { seeded: false };

    const accent = (c: string) => c;
    const cert = (title: string, subtitle: string, accentColor: string) => ({
      enabled: true,
      title,
      subtitle,
      accent: accentColor,
      layout: "classic" as const,
      signature: "Orbit Campus Club",
      note: "Issued by the organizing team · Orbiting since day one",
    });
    const transport = (city: string) => ({
      buses: [
        {
          route: "Campus → Venue",
          from: "Main Gate",
          to: city,
          departures: ["07:00", "07:45", "08:30"],
        },
        {
          route: "Metro Station → Venue",
          from: "City Metro Hub",
          to: city,
          departures: ["07:15", "08:00", "08:45", "09:30"],
        },
      ],
      pickupPoints: [
        { name: "Main Gate", time: "07:00" },
        { name: "Library Circle", time: "07:20" },
        { name: "Hostel Block C", time: "07:40" },
      ],
    });

    // 1 — Single-day tech talk (individual registration)
    await ctx.db.insert("events", {
      ownerId: clubUserId,
      organizerName: "Orbit Campus Club",
      title: "Beyond the Monolith",
      tagline: "An evening of systems thinking with the city's best engineers",
      description:
        "A single-evening keynote and fireside on scaling software past the monolith: event-driven design, observability, and the human side of migrations. Bring a notebook and tough questions.",
      type: "single",
      startDate: now + 3 * DAY,
      endDate: now + 3 * DAY + 4 * 60 * 60 * 1000,
      venue: "Auditorium A, Innovation Park",
      city: "Bengaluru",
      accent: "#ff5c38",
      registrationType: "individual",
      maxTeamSize: 1,
      formSchema: [
        ...defaultFormSchema(),
        {
          id: "college",
          label: "College / University",
          type: "text",
          required: true,
          placeholder: "Where do you study?",
          half: true,
        },
        {
          id: "year",
          label: "Year of study",
          type: "select",
          required: true,
          options: ["1st", "2nd", "3rd", "4th", "Postgrad", "Working professional"],
          half: true,
        },
        {
          id: "diet",
          label: "Dietary preference",
          type: "radio",
          required: false,
          options: ["Vegetarian", "Vegan", "Non-vegetarian"],
        },
      ],
      subEvents: [],
      rounds: [],
      transport: transport("Bengaluru"),
      certificate: cert("Beyond the Monolith", "Speaker session · attendance", accent("#ff5c38")),
      regOpen: true,
      status: "published",
      createdAt: now - 2 * DAY,
    });

    // 2 — Multi-day fest (both individual & team)
    const festId = await ctx.db.insert("events", {
      ownerId: clubUserId,
      organizerName: "Orbit Campus Club",
      title: "Aarambh Fest",
      tagline: "Two days. Twelve stages. One festival of everything.",
      description:
        "The flagship multi-day cultural & tech festival. Day one is workshops and exhibitions; day two is performances, gaming arena and the closing concert. Your single pass tracks both days.",
      type: "multi",
      startDate: now + 7 * DAY,
      endDate: now + 8 * DAY + 8 * 60 * 60 * 1000,
      venue: "University Grounds & Main Auditorium",
      city: "Pune",
      accent: "#7c5cff",
      registrationType: "both",
      maxTeamSize: 6,
      formSchema: [
        ...defaultFormSchema(),
        {
          id: "interests",
          label: "What are you here for?",
          type: "checkbox",
          required: false,
          options: ["Workshops", "Performances", "Gaming arena", "Food stalls", "Concert"],
        },
        {
          id: "tshirt",
          label: "T-shirt size",
          type: "select",
          required: true,
          options: ["S", "M", "L", "XL", "XXL"],
          half: true,
        },
      ],
      subEvents: [
        { id: "day1", label: "Day 1 · Workshops & Exhibitions", date: now + 7 * DAY, time: "09:00 – 20:00" },
        { id: "day2", label: "Day 2 · Performances & Concert", date: now + 8 * DAY, time: "10:00 – 23:00" },
      ],
      rounds: [],
      transport: transport("Pune"),
      certificate: cert("Aarambh Fest 2026", "Festival participation", accent("#7c5cff")),
      regOpen: true,
      status: "published",
      createdAt: now - 5 * DAY,
    });
    await seedGallery(ctx, festId, clubUserId, "#7c5cff", 6);

    // 3 — Round-based hackathon (team only)
    await ctx.db.insert("events", {
      ownerId: clubUserId,
      organizerName: "Orbit Campus Club",
      title: "Hack the Cosmos",
      tagline: "36-hour hackathon. 4 rounds. One planet of ideas.",
      description:
        "Teams of up to four build through elimination rounds: idea pitch, prototype, integration, and the final demo in front of founders. Passes turn green when your team advances — keep yours glowing.",
      type: "round",
      startDate: now + 12 * DAY,
      endDate: now + 13 * DAY + 12 * 60 * 60 * 1000,
      venue: "Innovation Park, Block C",
      city: "Hyderabad",
      accent: "#ffb547",
      registrationType: "team",
      maxTeamSize: 4,
      formSchema: [
        {
          id: "captain",
          label: "Team captain (you)",
          type: "text",
          required: true,
          placeholder: "Your full name",
          half: true,
        },
        {
          id: "stack",
          label: "Primary tech stack",
          type: "select",
          required: true,
          options: ["Web", "Mobile", "AI/ML", "Hardware/IoT", "Blockchain", "Other"],
          half: true,
        },
        {
          id: "idea",
          label: "One-line idea (optional)",
          type: "textarea",
          required: false,
          placeholder: "What might your team build?",
        },
      ],
      subEvents: [],
      rounds: [
        { id: "r1", label: "Round 1 · Idea pitch" },
        { id: "r2", label: "Round 2 · Prototype" },
        { id: "r3", label: "Round 3 · Integration" },
        { id: "r4", label: "Round 4 · Final demo" },
      ],
      transport: transport("Hyderabad"),
      certificate: cert("Hack the Cosmos", "Hackathon participation", accent("#ffb547")),
      regOpen: true,
      status: "published",
      createdAt: now - 8 * DAY,
    });

    // 4 — Team-based college fest (team registration)
    await ctx.db.insert("events", {
      ownerId: clubUserId,
      organizerName: "Orbit Campus Club",
      title: "Code & Canvas",
      tagline: "Design × engineering sprint for cross-disciplinary teams",
      description:
        "Teams of 2–5 blend designers and developers for a weekend sprint: pick a theme, build a working product and a pitch deck, demo to judges from product studios.",
      type: "single",
      startDate: now + 20 * DAY,
      endDate: now + 21 * DAY + 6 * 60 * 60 * 1000,
      venue: "Design Studio, North Campus",
      city: "Mumbai",
      accent: "#2dd4bf",
      registrationType: "team",
      maxTeamSize: 5,
      formSchema: [
        {
          id: "captain",
          label: "Team captain",
          type: "text",
          required: true,
          placeholder: "Captain's name",
          half: true,
        },
        {
          id: "skills",
          label: "Team strengths",
          type: "checkbox",
          required: true,
          options: ["UI/UX", "Frontend", "Backend", "AI", "Product thinking", "Marketing"],
        },
      ],
      subEvents: [],
      rounds: [],
      transport: transport("Mumbai"),
      certificate: cert("Code & Canvas", "Team sprint · participation", accent("#2dd4bf")),
      regOpen: true,
      status: "published",
      createdAt: now - 1 * DAY,
    });

    // 5 — Past event (ended) with full gallery
    const pastId = await ctx.db.insert("events", {
      ownerId: clubUserId,
      organizerName: "Orbit Campus Club",
      title: "Hack the Cosmos 2025",
      tagline: "Last year's cosmic hackathon — memories in the archive",
      description:
        "The first edition of our flagship hackathon. 214 hackers, 51 teams, 4 wild rounds and a whole lot of instant noodles.",
      type: "round",
      startDate: now - 40 * DAY,
      endDate: now - 38 * DAY,
      venue: "Innovation Park, Block C",
      city: "Hyderabad",
      accent: "#ff5c38",
      registrationType: "team",
      maxTeamSize: 4,
      formSchema: defaultFormSchema(),
      subEvents: [],
      rounds: [
        { id: "r1", label: "Round 1 · Idea pitch" },
        { id: "r2", label: "Round 2 · Prototype" },
        { id: "r3", label: "Round 3 · Integration" },
      ],
      transport: { buses: [], pickupPoints: [] },
      certificate: cert("Hack the Cosmos 2025", "Hackathon participation", accent("#ff5c38")),
      regOpen: false,
      status: "ended",
      createdAt: now - 60 * DAY,
    });
    await seedGallery(ctx, pastId, clubUserId, "#ff5c38", 8);

    return { seeded: true };
  },
});

/**
 * Create a fully-formed sample event owned by the signed-in organizer,
 * so the organizer tools (scanner, live dashboard, cert designer, gallery)
 * have something to work with instantly.
 */
export const createSampleEvent = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    const now = Date.now();

    const eventId = await ctx.db.insert("events", {
      ownerId: userId,
      organizerName: user?.name ?? "My Club",
      title: "My First Orbit Event",
      tagline: "Your starter event — edit everything from the organizer tools",
      description:
        "This sample event was created so you can try every organizer tool immediately: open the live dashboard, scan your own pass from the wallet, design a certificate, and upload a gallery.",
      type: "multi",
      startDate: now + 5 * DAY,
      endDate: now + 6 * DAY + 6 * 60 * 60 * 1000,
      venue: "Main Auditorium",
      city: "Your City",
      accent: "#ff5c38",
      registrationType: "both",
      maxTeamSize: 4,
      formSchema: [
        ...defaultFormSchema(),
        {
          id: "college",
          label: "College / University",
          type: "text",
          required: false,
          placeholder: "Where do you study?",
          half: true,
        },
        {
          id: "shirt",
          label: "T-shirt size",
          type: "select",
          required: false,
          options: ["S", "M", "L", "XL"],
          half: true,
        },
      ],
      subEvents: [
        { id: "day1", label: "Day 1 · Opening & Workshops", date: now + 5 * DAY, time: "09:00 – 18:00" },
        { id: "day2", label: "Day 2 · Finale", date: now + 6 * DAY, time: "10:00 – 20:00" },
      ],
      rounds: [],
      transport: {
        buses: [
          {
            route: "Campus → Venue",
            from: "Main Gate",
            to: "Your City",
            departures: ["08:30", "09:00"],
          },
        ],
        pickupPoints: [
          { name: "Main Gate", time: "08:30" },
          { name: "Hostel Block A", time: "08:45" },
        ],
      },
      certificate: {
        enabled: true,
        title: "My First Orbit Event",
        subtitle: "Participation certificate",
        accent: "#ff5c38",
        layout: "classic",
        signature: user?.name ?? "Organizer",
        note: "Issued by the organizing team",
      },
      regOpen: true,
      status: "published",
      createdAt: now,
    });
    return eventId;
  },
});
