import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Star, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { cn } from "@/lib/utils";

const BAR_COLORS = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-lime-400", "bg-emerald-400"];
const STAR_LABELS = ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"];

export default function OrgFeedback() {
  const { id = "" } = useParams();
  const summary = useQuery(api.feedback.summary, { eventId: id });
  const feedbackList = useQuery(api.feedback.listByEvent, { eventId: id });
  const event = useQuery(api.events.myEvents);
  const eventData = event?.find((e) => e._id === id);

  const maxBar = useMemo(() => {
    if (!summary) return 1;
    return Math.max(...summary.distribution, 1);
  }, [summary]);

  if (!summary) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-foreground/50">Loading feedback…</div>
      </div>);

  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
      <Link to={`/org/events/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/50 transition-colors hover:text-ember">
        <ArrowLeft className="h-3.5 w-3.5" /> Event hub
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">Feedback</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {eventData?.title || "Event"} — Results
        </h1>
        <p className="mt-1 text-sm text-foreground/55">See what participants thought after the event.</p>
      </motion.div>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="orb-card p-5">
          <Users className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-3xl font-bold text-foreground">{summary.count}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">Responses</p>
        </div>
        <div className="orb-card p-5">
          <Star className="h-5 w-5 text-gold" />
          <p className="mt-3 font-display text-3xl font-bold text-gold">{summary.avg.toFixed(1)}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">Avg Rating</p>
        </div>
        <div className="orb-card p-5 col-span-2 sm:col-span-1">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <p className="mt-3 font-display text-3xl font-bold text-emerald-400">
            {summary.count > 0 ? `${((summary.distribution[3] + summary.distribution[4]) / summary.count * 100).toFixed(0)}%` : "—"}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">Positive (4-5 stars)</p>
        </div>
      </div>

      {/* Rating distribution bar chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="orb-card mt-8 p-6">
        <h2 className="font-display text-lg font-bold text-foreground">Rating Distribution</h2>
        <div className="mt-4 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const idx = star - 1;
            const count = summary.distribution[idx];
            const pct = summary.count > 0 ? count / summary.count * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="w-16 text-right text-xs font-semibold text-foreground/60">{STAR_LABELS[idx]}</span>
                <div className="flex-1 h-7 rounded-full bg-foreground/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.08 }}
                    className={cn("h-full rounded-full", BAR_COLORS[idx])} />
                  
                </div>
                <span className="w-12 text-right text-xs font-bold text-foreground/70">{count}</span>
              </div>);

          })}
        </div>
      </motion.div>

      {/* Recent comments */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">Recent Comments</h2>
        <div className="space-y-3">
          {summary.topComments.map((c, i) =>
          <div key={i} className="orb-card flex gap-3 px-5 py-4">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-foreground/25" />
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) =>
                  <Star key={si} className={cn("h-3 w-3", si < c.rating ? "fill-gold text-gold" : "text-foreground/15")} />
                  )}
                  </div>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-foreground/65">{c.comment}</p>
              </div>
            </div>
          )}
          {summary.topComments.length === 0 &&
          <div className="orb-card p-10 text-center text-sm text-foreground/45">No comments submitted yet.</div>
          }
        </div>
      </motion.div>
    </div>);

}