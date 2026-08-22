import { api } from "@/convex/_generated/api";

import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Palette, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CertificateCanvas } from "@/components/orbit/CertificateCanvas";
import { cn } from "@/lib/utils";

const ACCENTS = ["#ff5c38", "#7c5cff", "#ffb547", "#2dd4bf", "#4cc9f0", "#f72585"];



/** A fake registration so the designer always has something to preview. */
function previewRegistration() {
  return {
    _id: "preview_reg_000000",
    _creationTime: Date.now(),
    eventId: "events_preview",
    userId: "users_preview",
    type: "individual",
    teamName: undefined,
    teamMembers: undefined,
    formData: { fullname: "Aarav Mehta", email: "aarav@orbit.demo", college: "Stellar Institute of Technology" },
    qrData: "preview",
    status: "pending",
    roundStatus: "none",
    subStatus: {},
    createdAt: Date.now()
  };
}

export default function OrgCertificate() {
  const { id = "" } = useParams();
  const event = useQuery(api.events.getEvent, { eventId: id });
  const updateEvent = useMutation(api.events.updateEvent);

  const [template, setTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (event && template === null) {
      setTemplate({
        ...event.certificate,
        accent: event.certificate.accent || event.accent
      });
    }
  }, [event, template]);

  if (!event) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-white/50">
          Loading certificate designer…
        </div>
      </div>);

  }

  const t = template ?? event.certificate;

  const patch = (next) => {
    setTemplate((prev) => ({ ...(prev ?? event.certificate), ...next }));
    setDirty(true);
  };

  const save = async () => {
    if (!template) return;
    setSaving(true);
    try {
      await updateEvent({ eventId: event._id, patch: { certificate: template } });
      setDirty(false);
      toast.success("Certificate template saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
      <Link
        to={`/org/events/${event._id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-ember">
        
        <ArrowLeft className="h-3.5 w-3.5" /> Event hub
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
            Certificate designer
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">
            Certificate template
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Participants download this design once they attend {event.title}.
          </p>
        </div>
        <Button
          type="button"
          disabled={!dirty || saving}
          onClick={save}
          className="gap-2 rounded-full bg-ember font-bold text-[#160a04] hover:bg-ember/90">
          
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : dirty ? "Save template" : "Saved ✓"}
        </Button>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        {/* controls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="space-y-5">
          
          <div className="orb-card p-5">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Certificates enabled</p>
                <p className="text-[11px] text-white/45">
                  Show this certificate in participant wallets
                </p>
              </div>
              <Switch checked={t.enabled} onCheckedChange={(v) => patch({ enabled: v })} />
            </label>
          </div>

          <div className="orb-card space-y-4 p-5">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-white/70">Title</Label>
              <Input
                value={t.title}
                onChange={(e) => patch({ title: e.target.value })}
                className="bg-black/20" />
              
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-white/70">Subtitle</Label>
              <Input
                value={t.subtitle}
                onChange={(e) => patch({ subtitle: e.target.value })}
                className="bg-black/20" />
              
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-white/70">Signature line</Label>
              <Input
                value={t.signature}
                onChange={(e) => patch({ signature: e.target.value })}
                className="bg-black/20" />
              
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-white/70">Footer note</Label>
              <Textarea
                value={t.note}
                onChange={(e) => patch({ note: e.target.value })}
                rows={2}
                className="resize-none bg-black/20" />
              
            </div>
          </div>

          <div className="orb-card space-y-4 p-5">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-white/70">Layout</Label>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
                {["classic", "modern"].map((l) =>
                <button
                  key={l}
                  type="button"
                  onClick={() => patch({ layout: l })}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors",
                    t.layout === l ?
                    "bg-ember text-[#160a04]" :
                    "text-white/55 hover:text-white"
                  )}>
                  
                    {l}
                  </button>
                )}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-white/70">Accent</Label>
              <div className="flex flex-wrap gap-2.5">
                {ACCENTS.map((c) =>
                <button
                  key={c}
                  type="button"
                  onClick={() => patch({ accent: c })}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform",
                    t.accent === c ?
                    "scale-110 border-white" :
                    "border-transparent hover:scale-105"
                  )}
                  style={{ background: c }}
                  aria-label={`Accent ${c}`} />

                )}
              </div>
            </div>
          </div>

          <p className="flex items-center gap-2 px-1 text-[11px] text-white/40">
            <Palette className="h-3.5 w-3.5 text-ember" />
            The preview renders with a sample name — real participants see their own.
          </p>
        </motion.div>

        {/* preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}>
          
          {t.enabled ?
          <CertificateCanvas
            event={{ ...event, certificate: t }}
            reg={previewRegistration()}
            showDownload={false} /> :


          <div className="orb-card flex h-64 flex-col items-center justify-center gap-3 p-8 text-center">
              <Sparkles className="h-8 w-8 text-white/25" />
              <p className="font-display text-lg font-bold text-white">
                Certificates are disabled
              </p>
              <p className="max-w-xs text-sm text-white/45">
                Flip the switch above to enable this certificate for your
                participants.
              </p>
            </div>
          }
        </motion.div>
      </div>
    </div>);

}