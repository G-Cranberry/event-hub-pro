import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Filter,
  Search,
  Users,
  X } from
"lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { cn } from "@/lib/utils";



/** Persist column visibility per event in localStorage. */
function useColumnVisibility(eventId, allColumns) {
  const storageKey = `orbit:reg-cols:${eventId}`;
  const [hidden, setHidden] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return new Set(JSON.parse(raw));
    } catch {/* ignore */}
    return new Set(); // all visible by default
  });

  const toggle = (col) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);else
      next.add(col);
      try {localStorage.setItem(storageKey, JSON.stringify([...next]));} catch {/* */}
      return next;
    });
  };

  const visible = allColumns.filter((c) => !hidden.has(c));
  return { visible, hidden, toggle };
}

/** Export registration data as CSV. */
function exportCSV(headers, rows) {
  const escape = (s) => `"${s.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(",")];
  for (const row of rows) {
    csv.push(row.map(escape).join(","));
  }
  const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrgRegistrations() {
  const { id = "" } = useParams();
  const data = useQuery(api.registrations.eventRegistrations, { eventId: id });
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showColPicker, setShowColPicker] = useState(false);

  const event = data?.event ?? null;
  const regs = data?.registrations ?? [];

  // Build column list from event form schema
  const formColumns = useMemo(() => {
    if (!event) return [];
    return event.formSchema.map((f) => f.id);
  }, [event]);

  const formLabels = useMemo(() => {
    if (!event) return {};
    const map = {};
    event.formSchema.forEach((f) => {map[f.id] = f.label;});
    return map;
  }, [event]);

  // All possible columns
  const ALL_COLUMNS = useMemo(() => {
    return ["name", "email", "status", "type", "team", "teamMembers", "date", "qrData", ...formColumns];
  }, [formColumns]);

  const COLUMN_LABELS = {
    name: "Name",
    email: "Email",
    status: "Status",
    type: "Type",
    team: "Team Name",
    teamMembers: "Team Members",
    date: "Registered",
    qrData: "Pass Code",
    ...formLabels
  };

  const { visible, hidden, toggle } = useColumnVisibility(id, ALL_COLUMNS);

  // Filter registrations
  const filtered = useMemo(() => {
    let list = regs;
    if (statusFilter === "pending") list = list.filter((r) => r.registration.status === "pending");
    if (statusFilter === "attended") list = list.filter((r) => r.registration.status === "attended");
    if (search.trim()) {
      const needle = search.toLowerCase();
      list = list.filter((r) =>
      r.participantName.toLowerCase().includes(needle) ||
      r.participantEmail.toLowerCase().includes(needle) ||
      (r.registration.teamName ?? "").toLowerCase().includes(needle) ||
      Object.values(r.registration.formData ?? {}).some((v) => String(v).toLowerCase().includes(needle))
      );
    }
    return list;
  }, [regs, statusFilter, search]);

  // Stats
  const stats = useMemo(() => ({
    total: regs.length,
    attended: regs.filter((r) => r.registration.status === "attended").length,
    pending: regs.filter((r) => r.registration.status === "pending").length
  }), [regs]);

  // Export
  const handleExport = () => {
    const headers = visible.map((c) => COLUMN_LABELS[c] || c);
    const rows = filtered.map((r) => {
      const reg = r.registration;
      return visible.map((col) => {
        if (col === "name") return r.participantName;
        if (col === "email") return r.participantEmail;
        if (col === "status") return reg.status;
        if (col === "type") return reg.type;
        if (col === "team") return reg.teamName ?? "";
        if (col === "teamMembers") return (reg.teamMembers ?? []).join("; ");
        if (col === "date") return new Date(reg.createdAt).toLocaleString();
        if (col === "qrData") return reg.qrData;
        // form data field
        return String(reg.formData?.[col] ?? "");
      });
    });
    exportCSV(headers, rows);
  };

  if (!event) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-5 pt-28">
        <div className="orb-card p-10 text-center text-sm text-foreground/50">Loading registrations…</div>
      </div>);

  }

  return (
    <div className="mx-auto min-h-screen max-w-[1400px] px-5 pb-24 pt-20 sm:pt-24">
      <Link to={`/org/events/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/50 transition-colors hover:text-ember">
        <ArrowLeft className="h-3.5 w-3.5" /> Event hub
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">Live Registrations</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{event.title}</h1>
          <p className="mt-1 text-sm text-foreground/55">Real-time spreadsheet — updates instantly as registrations come in.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-full border border-ember/40 bg-ember/10 px-4 py-2 text-xs font-bold text-ember transition-colors hover:bg-ember/20">
          
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </motion.div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
        { label: "Total", value: stats.total, color: "text-foreground" },
        { label: "Attended", value: stats.attended, color: "text-accent" },
        { label: "Pending", value: stats.pending, color: "text-amber-300" }].
        map(({ label: l, value: v, color }) =>
        <div key={l} className="orb-card p-4">
            <p className={`font-display text-2xl font-bold ${color}`}>{v}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">{l}</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "pending", "attended"].map((s) =>
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              statusFilter === s ?
              "border-ember bg-ember text-[#1a0d02]" :
              "border-foreground/12 bg-foreground/5 text-foreground/60 hover:border-foreground/30"
            )}>
            
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className={cn("text-[10px]", statusFilter === s ? "text-[#1a0d02]/60" : "text-ember")}>
                {s === "all" ? stats.total : s === "attended" ? stats.attended : stats.pending}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColPicker(!showColPicker)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                showColPicker ?
                "border-ember bg-ember/15 text-ember" :
                "border-foreground/12 bg-foreground/5 text-foreground/60 hover:border-foreground/30"
              )}>
              
              <Eye className="h-3.5 w-3.5" /> Columns
            </button>
            {showColPicker &&
            <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-foreground/12 bg-[#15121c] p-3 shadow-xl">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-foreground/45">Toggle columns</p>
                {ALL_COLUMNS.map((col) =>
              <button
                key={col}
                type="button"
                onClick={() => toggle(col)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/5">
                
                    {hidden.has(col) ?
                <EyeOff className="h-3.5 w-3.5 text-foreground/30" /> :

                <Check className="h-3.5 w-3.5 text-ember" />
                }
                    <span className={cn("flex-1", hidden.has(col) ? "text-foreground/35" : "text-foreground/80")}>
                      {COLUMN_LABELS[col] || col}
                    </span>
                  </button>
              )}
              </div>
            }
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-9 w-48 rounded-full border border-foreground/12 bg-foreground/5 pl-8 pr-3 text-xs text-foreground placeholder:text-foreground/35 outline-none transition-colors focus:border-ember/60 sm:w-56" />
            
          </div>
        </div>
      </div>

      {/* ═══ Spreadsheet Table ═══ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mt-6 overflow-x-auto rounded-xl border border-foreground/10">
        <table className="w-full min-w-[800px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-foreground/10 bg-foreground/5">
              {/* Row number header */}
              <th className="w-12 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-foreground/40">#</th>
              {visible.map((col) =>
              <th key={col} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-foreground/45">
                  {COLUMN_LABELS[col] || col}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 &&
            <tr>
                <td colSpan={visible.length + 1} className="px-6 py-16 text-center">
                  <Users className="mx-auto mb-3 h-8 w-8 text-foreground/20" />
                  <p className="font-display text-sm font-bold text-foreground/60">No registrations found</p>
                  <p className="mt-1 text-xs text-foreground/40">
                    {regs.length === 0 ? "Registrations will appear here in real time." : "Try adjusting your search or filter."}
                  </p>
                </td>
              </tr>
            }
            {filtered.map((r, i) => {
              const reg = r.registration;
              const fd = reg.formData ?? {};
              return (
                <tr key={reg._id} className="border-b border-foreground/5 transition-colors hover:bg-foreground/[0.03]">
                  <td className="px-3 py-2.5 text-[10px] text-foreground/30">{i + 1}</td>
                  {visible.map((col) =>
                  <td key={col} className="px-4 py-2.5">
                      {col === "name" &&
                    <span className="font-semibold text-foreground">{r.participantName}</span>
                    }
                      {col === "email" &&
                    <span className="text-foreground/65">{r.participantEmail}</span>
                    }
                      {col === "status" &&
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      reg.status === "attended" ?
                      "bg-accent/15 text-accent" :
                      "bg-amber-400/10 text-amber-300"
                    )}>
                          {reg.status === "attended" && <CheckCircle2 className="h-2.5 w-2.5" />}
                          {reg.status}
                        </span>
                    }
                      {col === "type" &&
                    <span className="text-foreground/55">{reg.type}</span>
                    }
                      {col === "team" &&
                    <span className="text-foreground/55">{reg.teamName ?? "—"}</span>
                    }
                      {col === "teamMembers" &&
                    <span className="text-foreground/55">{(reg.teamMembers ?? []).join(", ") || "—"}</span>
                    }
                      {col === "date" &&
                    <span className="text-foreground/50">{new Date(reg.createdAt).toLocaleDateString()}</span>
                    }
                      {col === "qrData" &&
                    <span className="font-mono text-[10px] text-foreground/40">{reg.qrData.slice(0, 16)}…</span>
                    }
                      {!["name", "email", "status", "type", "team", "teamMembers", "date", "qrData"].includes(col) &&
                    <span className="text-foreground/60">{String(fd[col] ?? "—")}</span>
                    }
                    </td>
                  )}
                </tr>);

            })}
          </tbody>
        </table>
      </motion.div>

      {regs.length > 0 &&
      <p className="mt-4 flex items-center gap-2 text-[11px] text-foreground/35">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
          Live — data updates in real time as participants register. Showing {filtered.length} of {regs.length} registrations.
        </p>
      }
    </div>);

}