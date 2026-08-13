import type { Doc } from "@/convex/_generated/dataModel";

export type Mode = "participant" | "organizer";

export type FormField = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  half?: boolean;
};

export type EventDoc = Doc<"events">;
export type RegistrationDoc = Doc<"registrations">;

export const EVENT_TYPES = ["single", "multi", "round"] as const;

export const FIELD_TYPES: { value: string; label: string; hint: string }[] = [
  { value: "text", label: "Short text", hint: "Single line answer" },
  { value: "textarea", label: "Long text", hint: "Multi-line answer" },
  { value: "email", label: "Email", hint: "Email address" },
  { value: "phone", label: "Phone", hint: "Phone number" },
  { value: "number", label: "Number", hint: "Numeric value" },
  { value: "date", label: "Date", hint: "Date picker" },
  { value: "select", label: "Dropdown", hint: "Pick one option" },
  { value: "radio", label: "Choice (radio)", hint: "Pick one option" },
  { value: "checkbox", label: "Checkboxes", hint: "Pick multiple" },
  { value: "file", label: "File name", hint: "Attach a file (name only)" },
];

export const TYPE_LABEL: Record<string, string> = {
  single: "Single-day",
  multi: "Multi-day",
  round: "Round-based",
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending entry",
  attended: "Attended",
  selected: "Advanced",
  eliminated: "Eliminated",
};

export function fmtDate(ts?: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function fmtDateTime(ts?: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtRange(start: number, end: number): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameDay = s.toDateString() === e.toDateString();
  if (sameDay) {
    return `${fmtDate(start)} · ${s.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} – ${e.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
  }
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

export function fmtTimeOfDay(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toDateInput(ts: number): string {
  const d = new Date(ts);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromDateInput(value: string, hour = 10): number {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, hour, 0, 0).getTime();
}

/** Deterministic certificate number derived from a registration id. */
export function certNumber(registrationId: string): string {
  const hex = registrationId.replace(/[^a-z0-9]/gi, "");
  let num = 0;
  for (let i = 0; i < hex.length; i++) {
    num = (num * 31 + hex.charCodeAt(i)) % 900000;
  }
  return `ORB-${String(100000 + num).slice(0, 6)}`;
}

/** Best display name for a registration (form answer → team → fallback). */
export function registrationName(reg: RegistrationDoc): string {
  if (reg.type === "team" && reg.teamName) return reg.teamName;
  const full = (reg.formData as Record<string, unknown> | undefined)?.fullname;
  if (typeof full === "string" && full.trim()) return full.trim();
  const captain = (reg.formData as Record<string, unknown> | undefined)?.captain;
  if (typeof captain === "string" && captain.trim()) return captain.trim();
  return "Attendee";
}

/** Inline background using an event accent color. */
export function accentBg(hex: string, opacity = 1): string {
  return `linear-gradient(135deg, ${hex}cc, ${hex}66)`;
}

export function accentGlow(hex: string): string {
  return `box-shadow: 0 10px 40px -10px ${hex}55`;
}

/** Count days until an event (negative = past). */
export function daysUntil(ts: number): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const day = new Date(ts);
  day.setHours(0, 0, 0, 0);
  return Math.round((day.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

export function isUpcoming(event: EventDoc): boolean {
  return event.endDate > Date.now() && event.status === "published";
}

/** Answers for the participant's registered name inside a certificate. */
export function certFields(reg: RegistrationDoc, event: EventDoc) {
  const data = (reg.formData as Record<string, unknown>) ?? {};
  const firstString = (key: string) => {
    const val = data[key];
    return typeof val === "string" ? val : "";
  };
  const name =
    reg.type === "team" && reg.teamName
      ? reg.teamName
      : firstString("fullname") || firstString("captain") || firstString("name") || "Participant";
  return {
    name,
    team: reg.type === "team" ? reg.teamName : undefined,
    email: firstString("email"),
    college: firstString("college"),
  };
}

/** Wheel nav: how many of the mode's features exist. */
export const WHEEL_DEG = 360;

export function clampScroll(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
