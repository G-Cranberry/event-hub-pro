import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Megaphone,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OrgCommunication() {
  const { id = "" } = useParams();
  const announcements = useQuery(api.announcements.listByEvent, { eventId: id as any });
  const event = useQuery(api.events.myEvents);
  const sendAnnouncement = useMutation(api.announcements.send);
  const removeAnnouncement = useMutation(api.announcements.remove);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [busy, setBusy] = useState(false);

  const eventData = event?.find((e) => e._id === id);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) { toast.error("Title and message required"); return; }
    setBusy(true);
    try {
      await sendAnnouncement({ eventId: id as any, title: title.trim(), body: body.trim(), priority });
      toast.success("Announcement sent to all registered participants");
      setTitle(""); setBody(""); setPriority("normal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally { setBusy(false); }
  };

  const handleDelete = async (announcementId: string) => {
    try { await removeAnnouncement({ announcementId: announcementId as any }); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
      <Link to={`/org/events/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/50 transition-colors hover:text-ember">
        <ArrowLeft className="h-3.5 w-3.5" /> Event hub
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">Communication Center</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Announcements</h1>
        <p className="mt-1 text-sm text-foreground/55">Send updates, venue changes, or urgent notices to all registered participants.</p>
      </motion.div>

      {/* Compose form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="orb-card orb-neon-border mt-8 p-6">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-ember" />
          <h2 className="font-display text-lg font-bold text-foreground">New Announcement</h2>
        </div>

        <div className="mt-4 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Subject (e.g., Venue change for Day 2)"
            className="h-10 w-full rounded-lg border border-foreground/12 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:border-ember/60"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here. This will be visible to all registered participants."
            rows={4}
            className="w-full rounded-lg border border-foreground/12 bg-foreground/5 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:border-ember/60 resize-none"
          />
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-foreground/55">Priority:</span>
            <div className="flex gap-2">
              {(["normal", "urgent"] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    priority === p
                      ? p === "urgent" ? "border-red-400 bg-red-400/15 text-red-300" : "border-ember bg-ember/15 text-ember"
                      : "border-foreground/12 bg-foreground/5 text-foreground/50 hover:border-foreground/30"
                  )}>
                  {p === "urgent" && <AlertTriangle className="mr-1 inline h-3 w-3" />}
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Button type="button" disabled={busy || !title.trim() || !body.trim()} onClick={handleSend}
            className="gap-1.5 rounded-full bg-ember font-bold text-[#1a0d02] hover:bg-ember/90">
            <Send className="h-3.5 w-3.5" /> {busy ? "Sending…" : "Send Announcement"}
          </Button>
        </div>
      </motion.div>

      {/* Announcements list */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">Sent Announcements</h2>
        <div className="space-y-3">
          {(announcements ?? []).map((ann, i) => (
            <motion.div key={ann._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn("orb-card overflow-hidden p-0", ann.priority === "urgent" && "border-red-400/30")}>
              <div className="flex items-start gap-3 px-5 py-4">
                <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs",
                  ann.priority === "urgent" ? "border-red-400/40 bg-red-400/10 text-red-300" : "border-ember/40 bg-ember/10 text-ember"
                )}>
                  {ann.priority === "urgent" ? <AlertTriangle className="h-4 w-4" /> : <Megaphone className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{ann.title}</p>
                      <p className="mt-1 text-[11px] text-foreground/45">
                        {new Date(ann.createdAt).toLocaleString()} · {ann.priority === "urgent" ? "Urgent" : "Normal"}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleDelete(ann._id)} className="shrink-0 rounded-md p-1 text-foreground/30 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground/65">{ann.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {(announcements ?? []).length === 0 && (
            <div className="orb-card p-10 text-center text-sm text-foreground/45">No announcements sent yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
