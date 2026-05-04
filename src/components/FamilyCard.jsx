import { Button } from "@/components/ui/button";
import { Heart, MapPin, Baby } from "lucide-react";

export default function FamilyCard({ family, onCommit, isCommitting, alreadyCommitted, volunteerCount = 0 }) {
  const initials = family.name
    ? family.name.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="bg-card rounded-2xl border p-6 space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-lg flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">{family.name}'s Family</h3>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {family.neighborhood}
            </span>
            <span className="inline-flex items-center gap-1">
              <Baby className="w-3.5 h-3.5" />
              {family.number_of_children} {family.number_of_children === 1 ? "child" : "children"}
            </span>
          </div>
        </div>
        <div className="mt-2">
          {volunteerCount === 0 ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Waiting for support</span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{volunteerCount} neighbor{volunteerCount > 1 ? 's' : ''} committed</span>
          )}
        </div>
      </div>

      {family.hardest_lately && (
        <div className="bg-secondary/50 rounded-xl px-4 py-3">
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "{family.hardest_lately}"
          </p>
        </div>
      )}

      <Button
        onClick={() => onCommit(family.id)}
        disabled={isCommitting || alreadyCommitted}
        className="w-full rounded-xl h-11 gap-2"
      >
        <Heart className="w-4 h-4" />
        {alreadyCommitted ? "Already in your circle" : "Join their circle"}
      </Button>
    </div>
  );
}