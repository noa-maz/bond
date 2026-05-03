import { Button } from "@/components/ui/button";
import { Heart, MapPin, Baby } from "lucide-react";

export default function FamilyCard({ family, onCommit, isCommitting }) {
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
        disabled={isCommitting}
        className="w-full rounded-xl h-11 gap-2"
      >
        <Heart className="w-4 h-4" />
        Commit to this family
      </Button>
    </div>
  );
}