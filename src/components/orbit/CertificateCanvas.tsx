import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { certFields, certNumber, fmtDate } from "@/lib/orbit";

type Event = Doc<"events">;
type Reg = Doc<"registrations">;

const W = 1600;
const H = 1131;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function CertificateCanvas({
  event,
  reg,
  width = 720,
  showDownload = true,
}: {
  event: Event;
  reg: Reg;
  width?: number;
  showDownload?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontsReady, setFontsReady] = useState(false);

  const template = event.certificate;
  const fields = certFields(reg, event);
  const accent = template?.accent ?? event.accent;
  const name = fields.name;
  const teamLine =
    reg.type === "team"
      ? `Team ${reg.teamName ?? ""} · ${reg.teamMembers?.length ? `${reg.teamMembers.length + 1} members` : ""}`
      : fields.college || "Participant";

  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) setFontsReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!fontsReady || !template?.enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0b0c11");
    bg.addColorStop(0.55, "#12141c");
    bg.addColorStop(1, "#0b0c11");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Accent glows
    const glow1 = ctx.createRadialGradient(W * 0.18, H * 0.2, 0, W * 0.18, H * 0.2, 700);
    glow1.addColorStop(0, rgba(accent, 0.22));
    glow1.addColorStop(1, "transparent");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    const glow2 = ctx.createRadialGradient(W * 0.85, H * 0.85, 0, W * 0.85, H * 0.85, 650);
    glow2.addColorStop(0, rgba(accent, 0.14));
    glow2.addColorStop(1, "transparent");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    const layout = template.layout ?? "classic";

    if (layout === "modern") {
      // Left accent band
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, 150, H);
      ctx.fillStyle = rgba(accent, 0.15);
      ctx.fillRect(150, 0, 24, H);

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = '600 64px "Space Grotesk", sans-serif';
      ctx.fillText("CERTIFICATE", 260, 240);
      ctx.fillText("OF PARTICIPATION", 260, 324);
      ctx.fillStyle = rgba(accent, 1);
      ctx.fillRect(268, 380, 220, 8);

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = '400 34px "Inter", sans-serif';
      ctx.fillText("presented to", 268, 470);

      ctx.fillStyle = "#ffffff";
      ctx.font = '700 120px "Space Grotesk", sans-serif';
      ctx.fillText(fitName(ctx, name, 120, 1000), 268, 620);

      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = '400 38px "Inter", sans-serif';
      ctx.fillText(teamLine, 268, 700);

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = '500 40px "Space Grotesk", sans-serif';
      ctx.fillText(event.title, 268, 800);

      // Footer
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = '400 28px "Inter", sans-serif';
      ctx.fillText(`Certificate No. ${certNumber(reg._id)}`, 268, 980);
      ctx.fillText(`Issued ${fmtDate(Date.now())}`, 268, 1020);
      ctx.fillStyle = accent;
      ctx.font = '600 30px "Space Grotesk", sans-serif';
      ctx.fillText(template.signature || "Organizer", W - 380, 980);
      ctx.strokeStyle = rgba(accent, 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W - 380, 1000);
      ctx.lineTo(W - 120, 1000);
      ctx.stroke();
    } else {
      // classic centered layout
      ctx.strokeStyle = rgba(accent, 0.7);
      ctx.lineWidth = 3;
      roundedRect(ctx, 60, 60, W - 120, H - 120, 24);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1;
      roundedRect(ctx, 78, 78, W - 156, H - 156, 18);
      ctx.stroke();

      // watermark
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.font = '700 200px "Space Grotesk", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("ORBIT", W / 2, H * 0.62);
      ctx.textAlign = "left";

      ctx.fillStyle = rgba(accent, 1);
      ctx.font = '600 34px "Space Grotesk", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("CERTIFICATE OF PARTICIPATION", W / 2, 230);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = '400 26px "Inter", sans-serif';
      ctx.fillText(template.subtitle || "Official recognition", W / 2, 285);

      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = '400 34px "Inter", sans-serif';
      ctx.fillText("this certifies that", W / 2, 410);

      ctx.fillStyle = "#ffffff";
      ctx.font = '700 118px "Space Grotesk", sans-serif';
      ctx.fillText(fitName(ctx, name, 118, 1100), W / 2, 560);

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = '400 36px "Inter", sans-serif';
      ctx.fillText(teamLine, W / 2, 640);

      ctx.fillStyle = rgba(accent, 0.95);
      ctx.font = '500 42px "Space Grotesk", sans-serif';
      ctx.fillText(event.title, W / 2, 730);

      // footer
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = '400 27px "Inter", sans-serif';
      ctx.fillText(`Certificate No. ${certNumber(reg._id)}`, W / 2, 860);
      ctx.fillText(`Issued ${fmtDate(Date.now())}`, W / 2, 900);

      // signature
      ctx.strokeStyle = rgba(accent, 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 200, 1000);
      ctx.lineTo(W / 2 + 200, 1000);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = '600 30px "Space Grotesk", sans-serif';
      ctx.fillText(template.signature || "Organizer", W / 2, 1045);
      ctx.textAlign = "left";
    }
  }, [fontsReady, template, event, reg, accent, name, teamLine, fields]);

  if (!template?.enabled) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}-certificate-${certNumber(reg._id)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ width: "100%", height: "auto", borderRadius: 12 }}
        className="border border-white/10 shadow-[0_24px_80px_-30px_rgba(0,0,0,0.9)]"
      />
      {showDownload && (
        <Button onClick={handleDownload} variant="outline" className="w-full gap-2 border-ember/40 text-ember hover:bg-ember/10 hover:text-ember">
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
      )}
    </div>
  );
}

function fitName(
  ctx: CanvasRenderingContext2D,
  name: string,
  baseSize: number,
  maxWidth: number,
): string {
  let size = baseSize;
  let text = name;
  if (ctx.measureText(text).width > maxWidth) {
    // shrink font until it fits
    while (size > 40 && ctx.measureText(text).width > maxWidth) {
      size -= 4;
      ctx.font = `700 ${size}px "Space Grotesk", sans-serif`;
    }
    // fall back to truncation
    while (text.length > 2 && ctx.measureText(text).width > maxWidth) {
      text = text.slice(0, -2);
    }
  }
  ctx.font = `700 ${size}px "Space Grotesk", sans-serif`;
  return text;
}
