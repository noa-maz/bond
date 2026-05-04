import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPlus, Loader2, AlertTriangle } from "lucide-react";

const VISIT_TYPES = [
  { label: "Childcare 👶", value: "Childcare" },
  { label: "Cooking 🍲", value: "Cooking" },
  { label: "Transportation 🚗", value: "Transportation" },
  { label: "Just being there 💛", value: "Just being there" },
  { label: "Other", value: "Other" },
];

export default function ScheduleVisitForm({ familyId, volunteer, existingVisits = [], onVisitAdded }) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [date, setDate] = useState("");
  const [visitType, setVisitType] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const conflict = date && existingVisits.some(v => v.date === date && v.volunteer_id !== volunteer.id);
  const canSubmit = date && visitType;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const visit = await base44.entities.Visit.create({
      family_id: familyId,
      volunteer_id: volunteer.id,
      volunteer_name: volunteer.name,
      date,
      visit_type: visitType,
      note: note || undefined,
    });
    onVisitAdded(visit);
    setDate("");
    setVisitType("");
    setNote("");
    setLoading(false);
    setOpen(false);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  if (confirmed) {
    return (
      <p className="text-sm text-primary font-medium mt-2">You're in. ❤️ They'll be glad you're coming.</p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-primary font-medium hover:underline mt-2"
      >
        <CalendarPlus className="w-4 h-4" />
        Schedule a visit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 bg-secondary/40 rounded-xl p-4">
      <div className="space-y-1">
        <Label className="text-xs">Date</Label>
        <Input
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={e => setDate(e.target.value)}
          className="h-10 rounded-lg bg-card"
        />
        {conflict && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Someone is already visiting that day — you can still join or pick another date.
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Type of visit</Label>
        <div className="flex flex-wrap gap-2">
          {VISIT_TYPES.map(vt => (
            <button
              key={vt.value}
              type="button"
              onClick={() => setVisitType(vt.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                visitType === vt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-secondary"
              }`}
            >
              {vt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Anything you'd like them to know…"
          className="rounded-lg bg-card text-sm"
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!canSubmit || loading} size="sm" className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm visit"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}