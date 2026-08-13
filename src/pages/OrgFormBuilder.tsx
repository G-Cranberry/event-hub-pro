import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Blocks,
  Check,
  Eye,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FIELD_TYPES, type FormField } from "@/lib/orbit";
import { DynamicForm, initialValues } from "@/components/orbit/DynamicForm";
import { cn } from "@/lib/utils";

export default function OrgFormBuilder() {
  const { id = "" } = useParams();
  const event = useQuery(api.events.getEvent, { eventId: id as any });
  const updateEvent = useMutation(api.events.updateEvent);

  const [fields, setFields] = useState<FormField[] | null>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (event && fields === null) {
      setFields(event.formSchema as FormField[]);
    }
  }, [event, fields]);

  const fieldList = fields ?? event?.formSchema ?? [];

  const patch = (index: number, next: Partial<FormField>) => {
    setFields((f) => {
      if (!f) return f;
      const copy = f.map((x, i) => (i === index ? { ...x, ...next } : x));
      return copy;
    });
    setDirty(true);
  };

  const remove = (index: number) => {
    setFields((f) => f?.filter((_, i) => i !== index) ?? null);
    setDirty(true);
  };

  const move = (index: number, dir: -1 | 1) => {
    setFields((f) => {
      if (!f) return f;
      const j = index + dir;
      if (j < 0 || j >= f.length) return f;
      const copy = [...f];
      [copy[index], copy[j]] = [copy[j], copy[index]];
      return copy;
    });
    setDirty(true);
  };

  const addField = () => {
    if (!newLabel.trim()) {
      toast.error("Give the field a label first");
      return;
    }
    const field: FormField = {
      id: `f_${Date.now().toString(36)}`,
      label: newLabel.trim(),
      type: newType,
      required: false,
      placeholder: "",
      options:
        newType === "select" || newType === "radio" || newType === "checkbox"
          ? ["Option 1", "Option 2"]
          : undefined,
      half: false,
    };
    setFields((f) => [...(f ?? []), field]);
    setNewLabel("");
    setDirty(true);
  };

  const save = async () => {
    if (!event || !fields) return;
    setSaving(true);
    try {
      await updateEvent({ eventId: event._id, patch: { formSchema: fields } });
      setDirty(false);
      toast.success("Form saved — live for new registrations");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-white/50">
          Loading form builder…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-20 sm:pt-24">
      <Link
        to={`/org/events/${event._id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-ember"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Event hub
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
            Form builder
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">
            Registration form
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {event.title} — every field here appears on the participant's
            registration page, in this exact order.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreview((p) => !p)}
            className="gap-2 rounded-full border-white/15 text-white hover:border-ember/50 hover:bg-ember/10"
          >
            {preview ? <Blocks className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {preview ? "Edit fields" : "Preview"}
          </Button>
          <Button
            type="button"
            disabled={!dirty || saving}
            onClick={save}
            className="gap-2 rounded-full bg-ember font-bold text-[#160a04] hover:bg-ember/90"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved ✓"}
          </Button>
        </div>
      </motion.div>

      {preview ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="orb-card mt-8 p-6 sm:p-8"
        >
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-widest text-white/45">
            Participant preview
          </p>
          <DynamicForm
            schema={fieldList}
            values={initialValues(fieldList)}
            onChange={() => {}}
          />
        </motion.div>
      ) : (
        <>
          {/* add field */}
          <div className="orb-card mt-8 p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="New field label — e.g. College name"
                className="flex-1 bg-black/20"
                onKeyDown={(e) => e.key === "Enter" && addField()}
              />
              <div className="flex gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
                {FIELD_TYPES.slice(0, 4).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setNewType(t.value)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                      newType === t.value
                        ? "bg-ember text-[#160a04]"
                        : "text-white/55 hover:text-white",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                onClick={addField}
                className="gap-1.5 rounded-full bg-ember font-bold text-[#160a04] hover:bg-ember/90"
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {FIELD_TYPES.slice(4).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setNewType(t.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors",
                    newType === t.value
                      ? "border-ember bg-ember/15 text-ember"
                      : "border-white/12 bg-black/20 text-white/50 hover:border-white/30 hover:text-white/80",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* field list */}
          <div className="mt-6 space-y-3">
            {fieldList.length === 0 && (
              <div className="orb-card p-12 text-center">
                <Blocks className="mx-auto h-8 w-8 text-white/25" />
                <p className="mt-3 font-display text-lg font-bold text-white">
                  No fields yet
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Add your first field above — participants will see it instantly
                  after you save.
                </p>
              </div>
            )}
            {fieldList.map((field, i) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="orb-card p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ember/40 bg-ember/10 font-mono text-xs font-bold text-ember">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Input
                        value={field.label}
                        onChange={(e) => patch(i, { label: e.target.value })}
                        className="h-9 bg-black/20 font-semibold"
                      />
                      {field.required && (
                        <span className="text-ember" title="Required">*</span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-white/40">
                      {
                        FIELD_TYPES.find((t) => t.value === field.type)?.label ??
                          field.type
                      }
                      {" · "}
                      {field.half ? "half-width" : "full-width"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="rounded-md border border-white/10 p-2 text-white/50 hover:text-white disabled:opacity-25"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === fieldList.length - 1}
                      className="rounded-md border border-white/10 p-2 text-white/50 hover:text-white disabled:opacity-25"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="rounded-md border border-white/10 p-2 text-white/50 hover:border-destructive/50 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* field options */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {field.type !== "select" &&
                    field.type !== "radio" &&
                    field.type !== "checkbox" &&
                    field.type !== "file" && (
                      <Input
                        value={field.placeholder ?? ""}
                        onChange={(e) => patch(i, { placeholder: e.target.value })}
                        placeholder="Placeholder text"
                        className="h-9 bg-black/20 text-xs"
                      />
                    )}
                  {(field.type === "select" ||
                    field.type === "radio" ||
                    field.type === "checkbox") && (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        Options (comma separated)
                      </p>
                      <Input
                        value={(field.options ?? []).join(", ")}
                        onChange={(e) =>
                          patch(i, {
                            options: e.target.value
                              .split(",")
                              .map((o) => o.trim())
                              .filter(Boolean),
                          })
                        }
                        className="h-9 bg-black/20 text-xs"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs font-semibold text-white/70">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(v) => patch(i, { required: v })}
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-white/70">
                      <Switch
                        checked={field.half ?? false}
                        onCheckedChange={(v) => patch(i, { half: v })}
                      />
                      Half width
                    </label>
                    <span className="ml-auto flex items-center gap-1 text-[11px] text-white/40">
                      <Check className="h-3 w-3 text-accent" />
                      {i === 0 ? "Starter" : "Field"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
