import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export type GlassToggleOption<T extends string> = {
  key: T;
  label: string;
  desc?: string;
  icon: LucideIcon;
  activeColor?: string;
};

/**
 * Glassmorphism toggle — frosted-glass pill with a sliding highlight
 * that matches the ORBIT dark/ember/gold theme.
 */
export function GlassToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: [GlassToggleOption<T>, GlassToggleOption<T>];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}) {
  const [left, right] = options;
  const isRight = value === right.key;

  return (
    <div
      className={cn("orb-glass-toggle", className)}
      role="radiogroup"
      aria-label={options.map((o) => o.label).join(" / ")}
    >
      {/* sliding pill */}
      <span
        className={cn(
          "orb-glass-toggle__pill",
          isRight && "orb-glass-toggle__pill--organizer",
        )}
        style={
          isRight
            ? { boxShadow: `0 0 20px -4px ${right.activeColor ?? "oklch(0.8 0.13 78 / 0.35)"}` }
            : { boxShadow: `0 0 20px -4px ${left.activeColor ?? "oklch(0.74 0.16 50 / 0.3)"}` }
        }
      />

      {options.map((opt) => {
        const active = value === opt.key;
        const Icon = opt.icon;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.key)}
            className={cn(
              "orb-glass-toggle__option",
              active && "orb-glass-toggle__option--active",
            )}
            style={active ? { color: opt.activeColor } : undefined}
          >
            <Icon />
            <span>
              <span className="block leading-tight">{opt.label}</span>
              {opt.desc && (
                <span className="orb-glass-toggle__desc">{opt.desc}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
