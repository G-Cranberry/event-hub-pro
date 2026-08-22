import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Minus,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trash2 } from
"lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";



const CATEGORIES = ["Venue", "Catering", "Prizes", "Marketing", "Equipment", "Staff", "Misc"];

export default function OrgBudget() {
  const { id = "" } = useParams();
  const entries = useQuery(api.budgets.listByEvent, { eventId: id });
  const addExpense = useMutation(api.budgets.addExpense);
  const addSponsor = useMutation(api.budgets.addSponsor);
  const removeEntry = useMutation(api.budgets.remove);

  const [tab, setTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Misc");
  const [sponsorName, setSponsorName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    if (!entries) return { totalExpenses: 0, totalSponsors: 0, balance: 0, expenseCount: 0, sponsorCount: 0, byCategory: {} };
    const expenses = entries.filter((e) => e.type === "expense");
    const sponsors = entries.filter((e) => e.type === "sponsor");
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalSponsors = sponsors.reduce((s, e) => s + e.amount, 0);
    const byCategory = {};
    expenses.forEach((e) => {
      const cat = e.category || "Misc";
      byCategory[cat] = (byCategory[cat] || 0) + e.amount;
    });
    return { totalExpenses, totalSponsors, balance: totalSponsors - totalExpenses, expenseCount: expenses.length, sponsorCount: sponsors.length, byCategory };
  }, [entries]);

  const handleSubmit = async () => {
    if (!label.trim() || !amount.trim()) {toast.error("Label and amount required");return;}
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {toast.error("Enter a valid amount");return;}
    setBusy(true);
    try {
      if (showForm === "expense") {
        await addExpense({ eventId: id, label: label.trim(), amount: num, category, note: note.trim() || undefined });
        toast.success("Expense logged");
      } else {
        if (!sponsorName.trim()) {toast.error("Sponsor name required");setBusy(false);return;}
        await addSponsor({ eventId: id, label: label.trim(), amount: num, sponsorName: sponsorName.trim(), note: note.trim() || undefined });
        toast.success("Sponsor contribution added");
      }
      setLabel("");setAmount("");setSponsorName("");setNote("");setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {setBusy(false);}
  };

  const handleDelete = async (entryId) => {
    try {await removeEntry({ entryId: entryId });toast.success("Removed");} catch {toast.error("Failed");}
  };

  const maxCatAmount = Math.max(...Object.values(stats.byCategory), 1);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-20 sm:pt-24">
      <Link to={`/org/events/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/50 transition-colors hover:text-ember">
        <ArrowLeft className="h-3.5 w-3.5" /> Event hub
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember">Budget &amp; Sponsors</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Financial Tracker</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={() => {setShowForm("expense");setTab("expenses");}} className="gap-1.5 rounded-full bg-ember text-xs font-bold text-[#1a0d02] hover:bg-ember/90">
            <Plus className="h-3.5 w-3.5" /> Expense
          </Button>
          <Button type="button" onClick={() => {setShowForm("sponsor");setTab("sponsors");}} className="gap-1.5 rounded-full border border-accent/40 bg-accent/10 text-xs font-bold text-accent hover:bg-accent/20">
            <Plus className="h-3.5 w-3.5" /> Sponsor
          </Button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
        { label: "Balance", value: `$${stats.balance.toLocaleString()}`, icon: DollarSign, color: stats.balance >= 0 ? "text-emerald-400" : "text-red-300" },
        { label: "Sponsors", value: `$${stats.totalSponsors.toLocaleString()}`, icon: TrendingUp, color: "text-accent" },
        { label: "Expenses", value: `$${stats.totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-ember" },
        { label: "Entries", value: stats.expenseCount + stats.sponsorCount, icon: Sparkles, color: "text-gold" }].
        map(({ label: l, value: v, icon: Icon, color }) =>
        <div key={l} className="orb-card p-4">
            <Icon className={`h-5 w-5 ${color}`} />
            <p className={`mt-3 font-display text-2xl font-bold ${color}`}>{v}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">{l}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2">
        {["overview", "expenses", "sponsors"].map((t) =>
        <button key={t} type="button" onClick={() => {setTab(t);setShowForm(false);}}
        className={cn("rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
        tab === t ? "border-ember bg-ember text-[#1a0d02]" : "border-foreground/12 bg-foreground/5 text-foreground/60 hover:border-foreground/30"
        )}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm &&
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="orb-card mt-6 p-6">
          <h3 className="font-display text-lg font-bold text-foreground">{showForm === "expense" ? "Log Expense" : "Add Sponsor Contribution"}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g., Venue deposit)" className="h-10 rounded-lg border border-foreground/12 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:border-ember/60" />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount ($)" className="h-10 rounded-lg border border-foreground/12 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:border-ember/60" />
            {showForm === "expense" &&
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-lg border border-foreground/12 bg-foreground/5 px-3 text-sm text-foreground outline-none focus:border-ember/60">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
          }
            {showForm === "sponsor" &&
          <input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Sponsor name" className="h-10 rounded-lg border border-foreground/12 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:border-ember/60" />
          }
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="h-10 rounded-lg border border-foreground/12 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:border-ember/60" />
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" disabled={busy} onClick={handleSubmit} className="rounded-full bg-ember text-xs font-bold text-[#1a0d02] hover:bg-ember/90">
              {busy ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-foreground/60">Cancel</Button>
          </div>
        </motion.div>
      }

      {/* Overview tab — category bar chart */}
      {tab === "overview" &&
      <div className="mt-6 space-y-3">
          {Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) =>
        <div key={cat} className="orb-card flex items-center gap-4 p-4">
              <span className="w-24 text-xs font-semibold text-foreground/60">{cat}</span>
              <div className="flex-1 h-6 rounded-full bg-foreground/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-ember to-gold transition-all duration-500" style={{ width: `${amount / maxCatAmount * 100}%` }} />
              </div>
              <span className="w-20 text-right font-display text-sm font-bold text-foreground">${amount.toLocaleString()}</span>
            </div>
        )}
          {Object.keys(stats.byCategory).length === 0 &&
        <div className="orb-card p-10 text-center text-sm text-foreground/45">No expenses logged yet.</div>
        }
        </div>
      }

      {/* Expenses / Sponsors list */}
      {tab !== "overview" &&
      <div className="mt-6 space-y-2">
          {(entries ?? []).filter((e) => tab === "expenses" ? e.type === "expense" : e.type === "sponsor").map((entry) =>
        <div key={entry._id} className="orb-card flex items-center gap-3 px-4 py-3">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
          entry.type === "expense" ? "border-ember/40 bg-ember/10 text-ember" : "border-accent/40 bg-accent/10 text-accent"
          )}>
                {entry.type === "expense" ? <Minus className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{entry.label}</p>
                <p className="text-[11px] text-foreground/45">
                  {entry.type === "sponsor" && entry.sponsorName ? `${entry.sponsorName} · ` : ""}
                  {entry.category ? `${entry.category} · ` : ""}
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={cn("font-display text-lg font-bold", entry.type === "expense" ? "text-ember" : "text-accent")}>
                {entry.type === "expense" ? "-" : "+"}${entry.amount.toLocaleString()}
              </span>
              <button type="button" onClick={() => handleDelete(entry._id)} className="shrink-0 rounded-md p-1 text-foreground/30 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
        )}
          {(entries ?? []).filter((e) => tab === "expenses" ? e.type === "expense" : e.type === "sponsor").length === 0 &&
        <div className="orb-card p-10 text-center text-sm text-foreground/45">
              {tab === "expenses" ? "No expenses yet. Click + Expense to log one." : "No sponsors yet. Click + Sponsor to add one."}
            </div>
        }
        </div>
      }
    </div>);

}