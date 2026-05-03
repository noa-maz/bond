import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import NeedsSelector from "../components/NeedsSelector";
import { motion } from "framer-motion";

export default function StartCircle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    neighborhood: "",
    number_of_children: "",
    needs: {},
    hardest_lately: "",
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit =
    form.name && form.neighborhood && form.number_of_children;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = await base44.auth.me();
    await base44.entities.Family.create({
      ...form,
      number_of_children: Number(form.number_of_children),
      user_email: user.email,
    });
    navigate("/my-circle");
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Heart className="w-3.5 h-3.5" />
              Starting a circle
            </div>
            <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
              We're here for you.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Tell us a little about yourself so your neighbors can find you and
              form your support circle.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Your first name</Label>
              <Input
                id="name"
                placeholder="e.g. Noa"
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
              <Label htmlFor="children">Number of children</Label>
              <Input
                id="children"
                type="number"
                min="0"
                placeholder="e.g. 3"
                value={form.number_of_children}
                onChange={update("number_of_children")}
                className="h-12 rounded-xl bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label>What kind of help do you need?</Label>
              <NeedsSelector
                value={form.needs}
                onChange={(needs) => setForm((f) => ({ ...f, needs }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hardest">
                What's been hardest lately?{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="hardest"
                placeholder="Share as much or as little as you'd like…"
                value={form.hardest_lately}
                onChange={update("hardest_lately")}
                rows={4}
                className="rounded-xl bg-card resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full h-13 text-base rounded-2xl shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create my circle"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Your information is only shared with verified neighbors in your
            area.
          </p>
        </motion.div>
      </main>
    </div>
  );
}