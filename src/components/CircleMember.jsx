import { CalendarDays } from "lucide-react";

const OFFER_EMOJI = {
  Childcare: "👶",
  Cooking: "🍲",
  Transportation: "🚗",
  "Just being there": "💛",
};

export default function CircleMember({ volunteer }) {
  return (
    <div className="flex items-center gap-4 bg-card rounded-xl border p-4">
      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground font-semibold flex-shrink-0">
        {volunteer.name?.charAt(0).toUpperCase() || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{volunteer.name}</p>
        <div className="flex flex-wrap gap-2 mt-0.5 text-sm text-muted-foreground">
          <span>
            {OFFER_EMOJI[volunteer.offer_type] || "✨"} {volunteer.offer_type}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {volunteer.available_day}s
          </span>
        </div>
      </div>
    </div>
  );
}