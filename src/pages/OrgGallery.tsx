import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  Link2,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrgGallery() {
  const { id = "" } = useParams();
  const event = useQuery(api.events.getEvent, { eventId: id as any });
  const photos = useQuery(api.gallery.getPhotoUrls, { eventId: id as any });
  const generateUploadUrl = useMutation(api.gallery.generateUploadUrl);
  const savePhoto = useMutation(api.gallery.savePhoto);
  const savePhotoUrl = useMutation(api.gallery.savePhotoUrl);
  const deletePhoto = useMutation(api.gallery.deletePhoto);

  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!event) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-white/50">
          Loading gallery upload…
        </div>
      </div>
    );
  }

  const photoList = photos?.photos ?? [];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { storageId } = (await res.json()) as { storageId: string };
        await savePhoto({
          eventId: event._id,
          storageId: storageId as any,
          caption: caption.trim() || undefined,
        });
      }
      setCaption("");
      toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setUploading(true);
    try {
      await savePhotoUrl({
        eventId: event._id,
        imageUrl: url.trim(),
        caption: caption.trim() || undefined,
      });
      setUrl("");
      setCaption("");
      toast.success("Photo added from URL");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add URL");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    setBusyId(photoId);
    try {
      await deletePhoto({ photoId: photoId as any });
      toast.success("Photo removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
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
          Gallery upload
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">
          Event photos
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {event.title} — {photoList.length} photo{photoList.length === 1 ? "" : "s"}{" "}
          published. Only registered participants can view them.
        </p>
      </motion.div>

      {/* uploader */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
        className="orb-card mt-8 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
              <ImagePlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Add photos
              </h2>
              <p className="text-xs text-white/45">Upload files or paste an image URL</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setUrlMode((u) => !u)}
            className="gap-1.5 rounded-full border-white/15 text-white hover:border-ember/50 hover:bg-ember/10"
          >
            <Link2 className="h-4 w-4" /> {urlMode ? "Upload files" : "Paste URL"}
          </Button>
        </div>

        <div className="mt-5">
          {urlMode ? (
            <form onSubmit={handleUrl} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…/photo.jpg"
                className="flex-1 bg-black/20"
              />
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="sm:w-56 bg-black/20"
              />
              <Button
                type="submit"
                disabled={uploading || !url.trim()}
                className="gap-2 rounded-xl bg-ember font-bold text-[#160a04] hover:bg-ember/90"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Add
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-6 text-sm text-white/60 transition-colors hover:border-ember/60 hover:bg-ember/5">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-ember" /> Uploading…
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-5 w-5 text-ember" />
                    Click to upload photos (multiple allowed)
                  </>
                )}
              </label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption for these photos (optional)"
                className="sm:w-56 bg-black/20"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* photo grid */}
      <div className="mt-8">
        {photoList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="orb-card flex flex-col items-center gap-3 p-14 text-center"
          >
            <Camera className="h-8 w-8 text-white/25" />
            <p className="font-display text-lg font-bold text-white">No photos published</p>
            <p className="max-w-sm text-sm text-white/50">
              Upload the first frame above — participants see them as soon as you
              add them.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photoList.map(({ photo, url }, i) => (
              <motion.div
                key={photo._id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10"
              >
                {url ? (
                  <img
                    src={url}
                    alt={photo.caption ?? `Photo ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black/30">
                    <Camera className="h-6 w-6 text-white/30" />
                  </div>
                )}
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8">
                    <p className="text-[11px] font-medium text-white/85">{photo.caption}</p>
                  </div>
                )}
                <button
                  type="button"
                  disabled={busyId === photo._id}
                  onClick={() => handleDelete(photo._id)}
                  className="absolute right-2 top-2 rounded-lg border border-white/15 bg-black/60 p-1.5 text-white/60 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:border-destructive/50 hover:text-destructive disabled:opacity-0"
                  title="Delete photo"
                >
                  {busyId === photo._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
