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
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function JoinCircle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    neighborhood: "",
    offer_type: "",
    available_day: "",
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const updateSelect = (field) => (val) =>
    setForm((f) => ({ ...f, [field]: val }));

  const canSubmit =
    form.name && form.neighborhood && form.offer_type && form.available_day;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = await base44.auth.me();
    await base44.entities.Volunteer.create({
      ...form,
      user_email: user.email,
    });
    navigate("/browse-families");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center gap-4 px-6 md:px-12 py-5">
        <Link to="/">
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
              <Label>What can you offer?</Label>
              <Select
                value={form.offer_type}
                onValueChange={updateSelect("offer_type")}
              >
                <SelectTrigger className="h-12 rounded-xl bg-card">
                  <SelectValue placeholder="Choose one…" />
                </SelectTrigger>
                <SelectContent>
                  {OFFERS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Which day works best?</Label>
              <Select
                value={form.available_day}
                onValueChange={updateSelect("available_day")}
              >
                <SelectTrigger className="h-12 rounded-xl bg-card">
                  <SelectValue placeholder="Choose a day…" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
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