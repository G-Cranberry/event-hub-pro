import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Keyboard,
  RefreshCw,
  ScanLine,
  Ticket,
  UserX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ScanResult = {
  registration: import("@/convex/_generated/dataModel").Doc<"registrations">;
  participantName: string;
  participantEmail: string;
} | null;

export default function OrgScanner() {
  const { id = "" } = useParams();
  const event = useQuery(api.events.getEvent, { eventId: id as any });
  const lookup = useMutation(api.registrations.lookupByQrData);
  const markAttended = useMutation(api.registrations.markAttended);
  const markRound = useMutation(api.registrations.markRound);

  const [scanning, setScanning] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const resultRef = useRef(result);
  resultRef.current = result;

  // Start/stop camera scanner.
  useEffect(() => {
    if (!cameraOn || !id) return;
    let alive = true;

    const scanner = new Html5Qrcode("orbit-scanner-view");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          if (!alive) return;
          void handleScan(decoded);
        },
        () => {},
      )
      .then(() => {
        if (alive) setScanning(true);
      })
      .catch((err) => {
        console.error("Camera start failed:", err);
        if (alive) {
          setCameraOn(false);
          toast.error("Camera unavailable — use manual entry instead");
        }
      });

    return () => {
      alive = false;
      setScanning(false);
      const sc = scannerRef.current;
      scannerRef.current = null;
      if (sc && sc.isScanning) {
        sc.stop()
          .then(() => sc.clear())
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn, id]);

  const handleScan = async (raw: string) => {
    const qrData = raw.trim();
    // Debounce identical scans (camera fires repeatedly).
    if (lastScan === qrData) return;
    setLastScan(qrData);
    setLookupError(null);

    try {
      const found = await lookup({ qrData, eventId: id as any });
      if (!found) {
        setResult(null);
        setLookupError("No match — this pass doesn't belong to this event.");
        return;
      }
      setResult(found);
      // Small feedback: flash the scanner border via key change is implicit.
    } catch (err) {
      setResult(null);
      setLookupError(err instanceof Error ? err.message : "Lookup failed");
    }
  };

  const handleManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manual.trim()) return;
    setResult(null);
    setLookupError(null);
    try {
      const found = await lookup({ qrData: manual.trim(), eventId: id as any });
      if (!found) {
        setLookupError("No match — check the code and event.");
        return;
      }
      setResult(found);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Lookup failed");
    }
  };

  const toggleCheckIn = async () => {
    if (!result) return;
    setBusy(true);
    try {
      await markAttended({ registrationId: result.registration._id });
      const found = await lookup({ qrData: result.registration.qrData, eventId: id as any });
      if (found) setResult(found);
      toast.success(
        result.registration.status === "attended"
          ? "Marked as pending"
          : "Checked in ✓",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setBusy(false);
    }
  };

  const setRound = async (status: "selected" | "eliminated" | "none") => {
    if (!result) return;
    setBusy(true);
    try {
      await markRound({ registrationId: result.registration._id, roundStatus: status });
      const found = await lookup({ qrData: result.registration.qrData, eventId: id as any });
      if (found) setResult(found);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (!event) {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-white/50">
          Loading scanner…
        </div>
      </div>
    );
  }

  const isRound = event.type === "round";
  const reg = result?.registration;

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-5 pb-24 pt-20 sm:pt-24">
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
        className="mt-4"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
          Door control
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">
          QR scanner
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {event.title} — point the camera at a participant's pass to check them in.
        </p>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* scanner pane */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="orb-card overflow-hidden"
        >
          {cameraOn ? (
            <div className="relative">
              <div id="orbit-scanner-view" className="w-full" />
              {scanning && (
                <div className="pointer-events-none absolute inset-x-6 top-4">
                  <div className="orb-scan h-0.5 w-full rounded-full bg-ember shadow-[0_0_16px_2px_rgba(255,92,56,0.8)]" style={{ animation: "orb-scan 2.2s ease-in-out infinite" }} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 p-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-ember/40 bg-ember/10">
                <ScanLine className="h-7 w-7 text-ember" />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-white">
                  Camera is off
                </p>
                <p className="mt-1 max-w-sm text-sm text-white/50">
                  Turn on the camera to scan passes, or paste a pass code manually
                  below.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setCameraOn(true)}
                className="gap-2 rounded-full bg-ember font-bold text-[#160a04] hover:bg-ember/90"
              >
                <ScanLine className="h-4 w-4" /> Start camera
              </Button>
            </div>
          )}

          {/* manual entry */}
          <div className="border-t border-white/8 bg-black/20 p-4">
            <form onSubmit={handleManual} className="flex gap-2">
              <Input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Or paste a pass code…"
                className="bg-black/30 font-mono text-xs"
              />
              <Button
                type="submit"
                variant="outline"
                className="shrink-0 gap-1.5 border-ember/40 text-ember hover:bg-ember/10 hover:text-ember"
              >
                <Keyboard className="h-4 w-4" /> Look up
              </Button>
            </form>
          </div>
        </motion.div>

        {/* result pane */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {lookupError && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {lookupError}
            </div>
          )}

          {result && reg ? (
            <div className="orb-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                  Pass found
                </p>
                <Badge
                  className={
                    reg.status === "attended"
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : reg.roundStatus === "selected"
                        ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-400"
                        : "border-amber-400/40 bg-amber-400/10 text-amber-300"
                  }
                >
                  {reg.status === "attended"
                    ? "Attended ✓"
                    : reg.roundStatus === "selected"
                      ? "Advanced ✦"
                      : "Pending"}
                </Badge>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold",
                    reg.status === "attended"
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-white/15 bg-black/30 text-white",
                  )}
                >
                  {result.participantName.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-bold text-white">
                    {result.participantName}
                  </p>
                  <p className="truncate text-xs text-white/45">{result.participantEmail}</p>
                </div>
              </div>

              {reg.type === "team" && reg.teamName && (
                <p className="mt-3 rounded-lg border border-white/8 bg-black/25 px-3 py-2 text-xs text-white/60">
                  Team <span className="font-bold text-white">{reg.teamName}</span>
                  {reg.teamMembers?.length
                    ? ` · ${reg.teamMembers.length + 1} members`
                    : ""}
                </p>
              )}

              <Button
                type="button"
                disabled={busy}
                onClick={toggleCheckIn}
                className={cn(
                  "mt-4 h-11 w-full gap-2 rounded-xl font-bold",
                  reg.status === "attended"
                    ? "border border-white/15 bg-black/30 text-white/70 hover:bg-black/50"
                    : "bg-ember text-[#160a04] hover:bg-ember/90",
                )}
              >
                {reg.status === "attended" ? (
                  <>
                    <RefreshCw className="h-4 w-4" /> Mark as pending
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Check in
                  </>
                )}
              </Button>

              {isRound && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                    Round status
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {(
                      [
                        ["none", "Reset", "text-white/60"],
                        ["selected", "Advance ✦", "text-emerald-400"],
                        ["eliminated", "Eliminate", "text-red-300"],
                      ] as const
                    ).map(([value, label, cls]) => (
                      <button
                        key={value}
                        type="button"
                        disabled={busy}
                        onClick={() => setRound(value)}
                        className={cn(
                          "rounded-lg border px-2 py-2 text-[11px] font-bold transition-colors",
                          reg.roundStatus === value
                            ? cn("border-current bg-current/10", cls)
                            : "border-white/12 bg-black/25 text-white/55 hover:border-white/30",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-3 text-[10px] text-white/35">
                <Ticket className="h-3 w-3" />
                <span className="truncate font-mono">{reg.qrData}</span>
              </div>
            </div>
          ) : (
            <div className="orb-card flex flex-col items-center gap-3 p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30">
                <UserX className="h-6 w-6 text-white/30" />
              </span>
              <p className="font-display text-lg font-bold text-white">Awaiting scan</p>
              <p className="text-sm text-white/45">
                Scan a pass or look up a code — the participant's details and
                check-in actions appear here.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
