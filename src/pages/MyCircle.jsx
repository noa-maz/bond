import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import CircleMember from "../components/CircleMember";

export default function MyCircle() {
  const [family, setFamily] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const families = await base44.entities.Family.filter({
      user_email: user.email,
    });
    const fam = families[0];
    setFamily(fam);

    if (fam) {
      const allVols = await base44.entities.Volunteer.filter({
        committed_family_id: fam.id,
      });
      setVolunteers(allVols);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4">
        <p className="text-muted-foreground">
          You haven't created a circle yet.
        </p>
        <Link to="/start-circle">
          <Button>Start your circle</Button>
        </Link>
      </div>
    );
  }

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

      <main className="flex-1 px-6 md:px-12 py-8 max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Profile summary */}
          <div className="bg-card rounded-2xl border p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-2xl">
                {family.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-serif text-2xl tracking-tight">
                  {family.name}'s Circle
                </h1>
                <p className="text-sm text-muted-foreground">
                  {family.neighborhood} · {family.number_of_children}{" "}
                  {family.number_of_children === 1 ? "child" : "children"}
                </p>
              </div>
            </div>
            {family.hardest_lately && (
              <div className="bg-secondary/50 rounded-xl px-4 py-3">
                <p className="text-sm text-muted-foreground italic">
                  "{family.hardest_lately}"
                </p>
              </div>
            )}
          </div>

          {/* Volunteers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">
                Your circle ({volunteers.length})
              </h2>
            </div>

            {volunteers.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Your circle is forming…
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Volunteers in your area will see your profile and commit to
                  supporting you.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {volunteers.map((vol) => (
                  <CircleMember key={vol.id} volunteer={vol} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}