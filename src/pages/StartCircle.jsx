import { useState, useEffect } from "react";
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
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const userEmail = localStorage.getItem("bond_user_name") || (await base44.auth.me())?.email;
        if (!userEmail) { setChecking(false); return; }
        const [families, volunteers] = await Promise.all([
          base44.entities.Family.filter({ user_email: userEmail }),
          base44.entities.Volunteer.filter({ user_email: userEmail }),
        ]);
        if (families.length > 0) { navigate("/my-circle"); return; }
        if (volunteers.length > 0) { navigate("/volunteer-dashboard"); return; }
      } catch {}
      setChecking(false);
    };
    check();
  }, []);
  const [form, setForm] = useState({
    name: "",
    neighborhood: "",
    phone: "",
    number_of_children: "",
    needs: {},
    hardest_lately: "",
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const childrenError = form.number_of_children !== "" && Number(form.number_of_children) < 1;
  const canSubmit =
    form.name && form.neighborhood && form.number_of_children && Number(form.number_of_children) >= 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let userName = localStorage.getItem("bond_user_name");
    if (!userName) {
      try { const me = await base44.auth.me(); userName = me?.email; } catch {}
    }
    if (!userName) userName = form.name;
    await base44.entities.Family.create({
      ...form,
      number_of_children: Number(form.number_of_children),
      user_email: userName,
    });
    navigate("/my-circle");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Heart className="w-3.5 h-3.5" />
              Starting a circle
            </div>
            <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
              We're here for you.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              You don't have to do this alone. Tell us a little about yourself so the right neighbors can find you.
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
              <Label htmlFor="phone">Phone number <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 050-1234567"
                value={form.phone}
                onChange={update("phone")}
                className="h-12 rounded-xl bg-card"
              />
              <p className="text-xs text-muted-foreground">So your circle can reach you directly.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="children">Number of children</Label>
              <Input
                id="children"
                type="number"
                min="1"
                placeholder="e.g. 3"
                value={form.number_of_children}
                onChange={update("number_of_children")}
                onWheel={e => e.target.blur()}
                className="h-12 rounded-xl bg-card"
              />
              {childrenError && (
                <p className="text-xs text-destructive">Please enter at least 1 child</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>What kind of support would help most?</Label>
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
                placeholder="e.g. Bedtime is the hardest. I'm doing it alone every night."
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