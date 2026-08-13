import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Award, CalendarDays, Lock, Ticket } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CertificateCanvas } from "@/components/orbit/CertificateCanvas";
import { fmtDate } from "@/lib/orbit";

export default function Certificates() {
  const myRegs = useQuery(api.registrations.myRegistrations);
  const [openId, setOpenId] = useState<string | null>(null);

  const eligible =
    (myRegs ?? []).filter(
      (r) =>
        r.event.certificate?.enabled &&
        (r.event.status === "ended" || r.registration.status === "attended"),
    );

  const upcoming = (myRegs ?? []).filter(
    (r) => r.event.certificate?.enabled && !eligible.includes(r),
  );

  const selected = (myRegs ?? []).find((r) => r.registration._id === openId);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-24 sm:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
          Recognition
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Certificates
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
          Certificates unlock after you attend an event. Download them as high-res
          PNGs, straight from the organizer's design.
        </p>
      </motion.div>

      {eligible.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {eligible.map(({ registration, event }, i) => (
            <motion.button
              key={registration._id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
              onClick={() => setOpenId(registration._id)}
              className="orb-card group overflow-hidden text-left"
            >
              <div
                className="relative flex h-40 items-center justify-center overflow-hidden"
                style={{ ["--cover-accent" as string]: event.accent }}
              >
                <div className="orb-cover absolute inset-0" />
                <Award className="relative h-12 w-12 text-white/90 drop-shadow" />
              </div>
              <div className="p-4">
                <p className="font-display text-sm font-bold text-white">{event.title}</p>
                <p className="mt-0.5 text-[11px] text-white/45">
                  {event.certificate.subtitle}
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-ember">
                  View & download →
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {eligible.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="orb-card mt-8 flex flex-col items-center gap-4 p-14 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-black/30">
            <Award className="h-7 w-7 text-white/40" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-white">
              No certificates yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">
              Attend an event that offers certificates and it will appear here,
              ready to download.
            </p>
          </div>
          <Link
            to="/events"
            className="rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-[#160a04] hover:bg-ember/90"
          >
            Find an event
          </Link>
        </motion.div>
      )}

      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-10"
        >
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-white/45">
            Unlock by attending
          </h2>
          <div className="mt-3 space-y-2">
            {upcoming.map(({ registration, event }) => (
              <div
                key={registration._id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-black/30">
                    <Lock className="h-4 w-4 text-white/40" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{event.title}</p>
                    <p className="flex items-center gap-1 text-[11px] text-white/40">
                      <CalendarDays className="h-3 w-3" /> {fmtDate(event.startDate)}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  <Ticket className="h-3 w-3" /> On your pass
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent className="max-w-3xl border-white/15 bg-[#0d0e13]">
          <DialogTitle className="sr-only">Certificate preview</DialogTitle>
          {selected && (
            <div className="p-1 sm:p-2">
              <p className="mb-3 text-center font-display text-lg font-bold text-white">
                {selected.event.title}
              </p>
              <CertificateCanvas event={selected.event} reg={selected.registration} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
