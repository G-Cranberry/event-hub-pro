import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { QrCode, Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { PassCard } from "@/components/orbit/PassCard";
import { cn } from "@/lib/utils";

type Filter = "all" | "pending" | "attended" | "selected";

export default function Passes() {
  const myRegs = useQuery(api.registrations.myRegistrations);
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const regs = myRegs ?? [];
    return {
      all: regs.length,
      pending: regs.filter((r) => r.registration.status === "pending" && r.registration.roundStatus !== "selected").length,
      attended: regs.filter((r) => r.registration.status === "attended").length,
      selected: regs.filter((r) => r.registration.roundStatus === "selected").length,
    };
  }, [myRegs]);

  const filtered = useMemo(() => {
    const regs = myRegs ?? [];
    switch (filter) {
      case "pending":
        return regs.filter((r) => r.registration.status === "pending" && r.registration.roundStatus !== "selected");
      case "attended":
        return regs.filter((r) => r.registration.status === "attended");
      case "selected":
        return regs.filter((r) => r.registration.roundStatus === "selected");
      default:
        return regs;
    }
  }, [myRegs, filter]);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-24 sm:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
          Wallet
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          My passes
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
          Every event you've registered for lives here — scan QR codes at the door,
          track multi-day check-ins, and watch round results roll in.
        </p>
      </motion.div>

      {/* filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            ["all", "All", counts.all],
            ["pending", "Pending", counts.pending],
            ["attended", "Attended", counts.attended],
            ["selected", "Advanced", counts.selected],
          ] as [Filter, string, number][]
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              filter === key
                ? "border-ember bg-ember text-[#160a04]"
                : "border-white/12 bg-black/25 text-white/60 hover:border-white/30 hover:text-white",
            )}
          >
            {label}
            <span
              className={cn(
                "text-[11px]",
                filter === key ? "text-[#160a04]/70" : "text-ember",
              )}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* passes */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="orb-card mt-10 flex flex-col items-center gap-4 p-14 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-black/30">
            <QrCode className="h-7 w-7 text-white/40" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-white">
              No passes here yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">
              Register for an event and your digital pass will appear in this wallet
              instantly.
            </p>
          </div>
          <Link
            to="/events"
            className="rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-[#160a04] hover:bg-ember/90"
          >
            Browse events
          </Link>
        </motion.div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {filtered.map(({ registration, event }, i) => (
            <motion.div
              key={registration._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
            >
              <PassCard reg={registration} event={event} />
            </motion.div>
          ))}
        </div>
      )}

      <p className="mt-8 flex items-center gap-2 text-[11px] text-white/35">
        <Ticket className="h-3.5 w-3.5" />
        Passes reflect live organizer updates — status changes appear the moment
        you're scanned in.
      </p>
    </div>
  );
}
