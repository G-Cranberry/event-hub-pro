import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import type { FormField } from "@/lib/orbit";

export type FormValues = Record<string, string | string[] | boolean>;

export function initialValues(schema: FormField[]): FormValues {
  const out: FormValues = {};
  for (const f of schema) {
    if (f.type === "checkbox") out[f.id] = [];
    else out[f.id] = "";
  }
  return out;
}

export function validateSchema(schema: FormField[], values: FormValues) {
  for (const f of schema) {
    if (!f.required) continue;
    const val = values[f.id];
    if (f.type === "checkbox") {
      if (!Array.isArray(val) || val.length === 0) return f.label;
    } else if (typeof val !== "string" || !val.trim()) {
      return f.label;
    }
  }
  return null;
}

export function DynamicForm({
  schema,
  values,
  onChange,
}: {
  schema: FormField[];
  values: FormValues;
  onChange: (values: FormValues) => void;
}) {
  const set = (id: string, value: string | string[] | boolean) =>
    onChange({ ...values, [id]: value });

  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  useEffect(() => {
    // Keep file labels in sync with values
    const next: Record<string, string> = {};
    for (const f of schema) {
      if (f.type === "file" && typeof values[f.id] === "string") {
        next[f.id] = values[f.id] as string;
      }
    }
    setFileNames(next);
  }, [schema, values]);

  const renderField = (field: FormField): ReactNode => {
    const val = values[field.id] ?? "";
    const inputType =
      field.type === "email"
        ? "email"
        : field.type === "phone"
          ? "tel"
          : field.type === "number"
            ? "number"
            : field.type === "date"
              ? "date"
              : "text";

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            value={typeof val === "string" ? val : ""}
            onChange={(e) => set(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="resize-none bg-black/20"
          />
        );
      case "select":
        return (
          <select
            value={typeof val === "string" ? val : ""}
            onChange={(e) => set(field.id, e.target.value)}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-black/20 px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors",
              "focus:border-ember/60 focus:ring-2 focus:ring-ember/20",
              typeof val === "string" && val === "" && "text-white/50",
            )}
          >
            <option value="" disabled className="bg-black">
              {field.placeholder ?? "Choose…"}
            </option>
            {(field.options ?? []).map((opt) => (
              <option key={opt} value={opt} className="bg-black">
                {opt}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="flex flex-wrap gap-2">
            {(field.options ?? []).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => set(field.id, opt)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  val === opt
                    ? "border-ember bg-ember/15 text-ember"
                    : "border-white/15 bg-black/20 text-white/70 hover:border-white/35",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="grid gap-2 sm:grid-cols-2">
            {(field.options ?? []).map((opt) => {
              const arr = Array.isArray(val) ? (val as string[]) : [];
              const checked = arr.includes(opt);
              return (
                <label
                  key={opt}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                    checked
                      ? "border-ember/60 bg-ember/10 text-white"
                      : "border-white/12 bg-black/20 text-white/70 hover:border-white/30",
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#ff5c38]"
                    checked={checked}
                    onChange={(e) => {
                      const nextArr = e.target.checked
                        ? [...arr, opt]
                        : arr.filter((o) => o !== opt);
                      set(field.id, nextArr);
                    }}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        );
      case "file":
        return (
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/25 bg-black/20 px-3 py-2.5 text-sm text-white/70 transition-colors hover:border-ember/50">
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const name = e.target.files?.[0]?.name ?? "";
                set(field.id, name);
                setFileNames((f) => ({ ...f, [field.id]: name }));
              }}
            />
            <span className="truncate">
              {fileNames[field.id] ? (
                <span className="text-ember">📎 {fileNames[field.id]}</span>
              ) : (
                (field.placeholder ?? "Choose a file…")
              )}
            </span>
          </label>
        );
      default:
        return (
          <Input
            type={inputType}
            value={typeof val === "string" ? val : ""}
            onChange={(e) => set(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="bg-black/20"
          />
        );
    }
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {schema.map((field) => (
        <div
          key={field.id}
          className={cn(field.half ? "sm:col-span-1" : "sm:col-span-2")}
        >
          <Label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-white/85">
            {field.label}
            {field.required && <span className="text-ember">*</span>}
          </Label>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}
