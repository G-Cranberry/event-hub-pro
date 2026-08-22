import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Lock, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { fmtDate } from "@/lib/orbit";

export default function Gallery() {
  const { id = "" } = useParams();
  const event = useQuery(api.events.getEvent, { eventId: id });
  const photos = useQuery(api.gallery.getPhotoUrls, { eventId: id });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (id) sessionStorage.setItem("orbit:lastEvent", id);
  }, [id]);

  if (!event) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-white/50">
          Loading gallery…
        </div>
      </div>);

  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
      <Link
        to={`/events/${event._id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-ember">
        
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {event.title}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4">
        
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">
          Memories
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">
          Photo gallery
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {event.title} · {fmtDate(event.startDate)} — uploaded by {event.organizerName}
        </p>
      </motion.div>

      {photos === undefined ?
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) =>
        <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/5" />
        )}
        </div> :
      !photos.allowed ?
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="orb-card mt-10 flex flex-col items-center gap-4 p-14 text-center">
        
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-black/30">
            <Lock className="h-7 w-7 text-white/40" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-white">
              This gallery is for participants
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">
              Register for {event.title} to unlock photos from the event day.
            </p>
          </div>
          <Button
          asChild
          className="gap-2 rounded-full bg-ember font-bold text-[#160a04] hover:bg-ember/90">
          
            <Link to={`/events/${event._id}`}>
              <Ticket className="h-4 w-4" /> Register now
            </Link>
          </Button>
        </motion.div> :
      photos.photos.length === 0 ?
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="orb-card mt-10 flex flex-col items-center gap-3 p-14 text-center">
        
          <Camera className="h-8 w-8 text-white/25" />
          <p className="font-display text-lg font-bold text-white">No photos yet</p>
          <p className="max-w-sm text-sm text-white/50">
            The organizer hasn't uploaded any frames yet. Check back after the event.
          </p>
        </motion.div> :

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.photos.map(({ photo, url }, i) =>
        <motion.button
          key={photo._id}
          type="button"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
          onClick={() => url && setSelected(url)}
          className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
          
              {url ?
          <img
            src={url}
            alt={photo.caption ?? `Photo ${i + 1}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> :


          <div className="flex h-full w-full items-center justify-center bg-black/30">
                  <Camera className="h-6 w-6 text-white/30" />
                </div>
          }
              {photo.caption &&
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8 text-left">
                  <p className="text-[11px] font-medium text-white/85">{photo.caption}</p>
                </div>
          }
            </motion.button>
        )}
        </div>
      }

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl border-white/15 bg-[#0d0e13] p-2 sm:p-3">
          <DialogTitle className="sr-only">Photo preview</DialogTitle>
          {selected &&
          <img
            src={selected}
            alt="Event photo"
            className="max-h-[78vh] w-full rounded-xl object-contain" />

          }
        </DialogContent>
      </Dialog>
    </div>);

}