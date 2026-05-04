import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import FamilyCard from "../components/FamilyCard";

export default function BrowseFamilies() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(null);
  const [volunteer, setVolunteer] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userName = localStorage.getItem("bond_user_name");
    const vols = await base44.entities.Volunteer.filter({ user_email: userName });
    const vol = vols[0];
    setVolunteer(vol);


    const allFamilies = await base44.entities.Family.list();
    // Show families in the same neighborhood first
    const sorted = [...allFamilies].sort((a, b) => {
      const aMatch = a.neighborhood?.toLowerCase() === vol?.neighborhood?.toLowerCase();
      const bMatch = b.neighborhood?.toLowerCase() === vol?.neighborhood?.toLowerCase();
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
    setFamilies(sorted);
    setLoading(false);
  };

  const handleCommit = async (familyId) => {
    setCommitting(familyId);
    await base44.entities.Volunteer.update(volunteer.id, {
      committed_family_ids: [...(volunteer.committed_family_ids || []), familyId],
    });
    setVolunteer((prev) => ({
      ...prev,
      committed_family_ids: [...(prev.committed_family_ids || []), familyId],
    }));
    setCommitting(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center gap-4 px-6 md:px-12 py-5">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate(volunteer?.committed_family_ids?.length > 0 ? "/volunteer-dashboard" : "/join-circle")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-serif text-xl tracking-tight">BOND</span>
      </nav>

      <main className="flex-1 px-6 md:px-12 py-8 max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
              <Search className="w-3.5 h-3.5" />
              Families near you
            </div>
            <h1 className="font-serif text-3xl tracking-tight">
              Choose a family to support
            </h1>
            <p className="text-muted-foreground">
              Browse families in your area and commit to one. This is an ongoing
              commitment — not a one-time thing.
            </p>
          </div>

          {families.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-muted-foreground text-lg">
                No families have registered yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Check back soon — new families are joining every day.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {families.map((family) => (
                <FamilyCard
                  key={family.id}
                  family={family}
                  onCommit={handleCommit}
                  isCommitting={committing === family.id}
                  alreadyCommitted={volunteer?.committed_family_ids?.includes(family.id)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}