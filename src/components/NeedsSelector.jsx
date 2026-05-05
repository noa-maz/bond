import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

const NEEDS = [
  { key: "school_pickup", label: "School / kindergarten pickup", hasDays: true },
  { key: "cooking", label: "Cooking / meal prep", hasDays: true },
  { key: "household", label: "Household tasks", hasDays: true },
  { key: "groceries", label: "Groceries", hasDays: true },
  { key: "someone_to_talk", label: "Someone to talk to", hasDays: false },
  { key: "other", label: "Other", hasDays: true, hasText: true },
];

export default function NeedsSelector({ value = {}, onChange }) {
  const [openKey, setOpenKey] = useState(null);

  const toggle = (key) => {
    const current = value[key] || { selected: false, days: [], text: "" };
    const isSelected = !current.selected;
    const updated = { ...value, [key]: { ...current, selected: isSelected } };
    onChange(updated);
    setOpenKey(isSelected ? key : null);
  };

  const toggleDay = (key, day) => {
    const current = value[key] || { selected: true, days: [], text: "" };
    const days = current.days.includes(day)
      ? current.days.filter((d) => d !== day)
      : [...current.days, day];
    onChange({ ...value, [key]: { ...current, days } });
  };

  const setText = (key, text) => {
    const current = value[key] || { selected: true, days: [], text: "" };
    onChange({ ...value, [key]: { ...current, text } });
  };

  const handleExpand = (key) => {
    setOpenKey(openKey === key ? null : key);
  };

  return (
    <div className="space-y-2">
      {NEEDS.map((need) => {
        const state = value[need.key] || { selected: false, days: [], text: "" };
        const isSelected = state.selected;
        const isOpen = openKey === need.key;

        return (
          <div
            key={need.key}
            className={`rounded-xl border transition-colors overflow-hidden ${
              isSelected
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            {/* Need row */}
            <button
              type="button"
              onClick={() => {
                if (!isSelected) {
                  toggle(need.key);
                } else {
                  handleExpand(need.key);
                }
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(need.key);
                  }}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span>{need.label}</span>
              </div>
              {isSelected && need.hasDays && (
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Inline note input when selected */}
            {isSelected && (
              <div className="px-4 pb-2">
                <input
                  type="text"
                  maxLength={120}
                  placeholder="anything specific? (optional)"
                  value={state.text || ""}
                  onChange={(e) => setText(need.key, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent border-0 border-b border-muted-foreground/20 focus:border-muted-foreground/50 outline-none text-xs text-muted-foreground placeholder:text-muted-foreground/50 py-1 transition-colors"
                />
              </div>
            )}

            {/* Days summary when collapsed */}
            {isSelected && !isOpen && state.days.length > 0 && (
              <div className="px-4 pb-3 flex flex-wrap gap-1">
                {state.days.map((d) => (
                  <span
                    key={d}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}

            {/* Expanded panel */}
            {isSelected && isOpen && (
              <div className="px-4 pb-4 space-y-3">
                {need.hasText && (
                  <Input
                    placeholder="Describe what you need…"
                    value={state.text || ""}
                    onChange={(e) => setText(need.key, e.target.value)}
                    className="h-10 rounded-lg text-sm bg-background"
                  />
                )}
                {need.hasDays && (
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(need.key, day)}
                        className={`w-12 h-9 rounded-lg text-xs font-semibold border transition-colors ${
                          state.days.includes(day)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-secondary"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}