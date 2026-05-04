import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const OFFERS = ["Childcare", "Cooking", "Transportation", "Just being there"];
const FREQUENCIES = [
  "Once a week",
  "Twice a month",
  "Once a month",
  "Flexible - I'll coordinate with my circle",
];

export default function JoinCircle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    neighborhood: "",
    offer_types: [],
    frequency: "",
  });

  const toggleOffer = (offer) =>
    setForm((f) => ({
      ...f,
      offer_types: f.offer_types.includes(offer)
        ? f.offer_types.filter((o) => o !== offer)
        : [...f.offer_types, offer],
    }));

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const updateSelect = (field) => (val) =>
    setForm((f) => ({ ...f, [field]: val }));

  const canSubmit =
    form.name && form.neighborhood && form.offer_types.length > 0 && form.frequency;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userName = localStorage.getItem("bond_user_name") || form.name;
    await base44.entities.Volunteer.create({
      name: form.name,
      neighborhood: form.neighborhood,
      offer_types: form.offer_types,
      frequency: form.frequency,
      user_email: userName,
    });
    navigate("/browse-families");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center gap-4 px-6 md:px-12 py-5">
        <Link to="/choose-circle">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="font-serif text-xl tracking-tight">BOND</span>
      </nav>

      <main className="flex-1 flex items-start justify-center px-6 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
              <Users className="w-3.5 h-3.5" />
              Joining a circle
            </div>
            <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
              Thank you for showing up.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              A few details so we can match you with a nearby family who needs
              your support.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Your first name</Label>
              <Input
                id="name"
                placeholder="e.g. Dana"
                value={form.name}
                onChange={update("name")}
                className="h-12 rounded-xl bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input
                id="neighborhood"
                placeholder="e.g. Ramat Gan, Neve Ofer"
                value={form.neighborhood}
                onChange={update("neighborhood")}
                className="h-12 rounded-xl bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label>What can you offer? <span className="text-muted-foreground font-normal">(choose all that apply)</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {OFFERS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => toggleOffer(o)}
                    className={`h-12 px-4 rounded-xl border text-sm font-medium text-left transition-colors ${
                      form.offer_types.includes(o)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-secondary"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>How often could you realistically show up?</Label>
              <Select
                value={form.frequency}
                onValueChange={updateSelect("frequency")}
              >
                <SelectTrigger className="h-12 rounded-xl bg-card">
                  <SelectValue placeholder="Choose one…" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full h-13 text-base rounded-2xl shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Find a family to support"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            You'll be able to browse nearby families and choose one to commit
            to.
          </p>
        </motion.div>
      </main>
    </div>
  );
}