import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import FamilyCard from "../components/FamilyCard";

const NEED_TYPES = ["Childcare", "Cooking", "Transportation", "Just being there"];
const NEED_KEY_MAP = {
  Childcare: "school_pickup",
  Cooking: "cooking",
  Transportation: "groceries",
  "Just being there": "someone_to_talk",
};

export default function BrowseFamilies() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(null);
  const [volunteer, setVolunteer] = useState(null);
  const [volunteerCountMap, setVolunteerCountMap] = useState({});
  const [areaFilter, setAreaFilter] = useState("");
  const [needFilter, setNeedFilter] = useState([]);
  const [circleFilter, setCircleFilter] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userName = localStorage.getItem("bond_user_name");
    const vols = await base44.entities.Volunteer.filter({ user_email: userName });
    const vol = vols[0];
    setVolunteer(vol);


    const [allFamilies, allVolunteers] = await Promise.all([
      base44.entities.Family.list(),
      base44.entities.Volunteer.list(),
    ]);

    const countMap = {};
    allVolunteers.forEach(v => {
      (v.committed_family_ids || []).forEach(fid => {
        countMap[fid] = (countMap[fid] || 0) + 1;
      });
    });
    setVolunteerCountMap(countMap);

    // Sort by: same neighborhood first, then by volunteer count ascending
    const sorted = [...allFamilies].sort((a, b) => {
      const aMatch = a.neighborhood?.toLowerCase() === vol?.neighborhood?.toLowerCase();
      const bMatch = b.neighborhood?.toLowerCase() === vol?.neighborhood?.toLowerCase();
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return (countMap[a.id] || 0) - (countMap[b.id] || 0);
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

  const filteredFamilies = families.filter(family => {
    if (family.paused) return false;
    if (areaFilter && !family.neighborhood?.toLowerCase().includes(areaFilter.toLowerCase())) return false;
    if (needFilter.length > 0) {
      const hasMatch = needFilter.some(nt => family.needs?.[NEED_KEY_MAP[nt]]?.selected);
      if (!hasMatch) return false;
    }
    if (circleFilter === "Needs support" && (volunteerCountMap[family.id] || 0) !== 0) return false;
    if (circleFilter === "Has some help" && ((volunteerCountMap[family.id] || 0) < 1 || (volunteerCountMap[family.id] || 0) > 2)) return false;
    return true;
  });

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

          {/* Filter bar */}
          <div className="bg-card border rounded-2xl p-4 space-y-3">
            <Input
              placeholder="Filter by area…"
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
              className="h-9 rounded-xl bg-background text-sm"
            />
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Need type</p>
              <div className="flex flex-wrap gap-2">
                {NEED_TYPES.map(nt => (
                  <button
                    key={nt}
                    onClick={() => setNeedFilter(prev => prev.includes(nt) ? prev.filter(x => x !== nt) : [...prev, nt])}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                      needFilter.includes(nt)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-secondary"
                    }`}
                  >
                    {nt}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Circle size</p>
              <div className="flex gap-2">
                {["All", "Needs support", "Has some help"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setCircleFilter(opt)}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                      circleFilter === opt
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-secondary"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredFamilies.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-muted-foreground text-lg">
                {families.length === 0 ? "No families have registered yet." : "No families match your filters."}
              </p>
              <p className="text-sm text-muted-foreground">
                {families.length === 0 ? "Check back soon — new families are joining every day." : "Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFamilies.map((family) => (
                <FamilyCard
                  key={family.id}
                  family={family}
                  onCommit={handleCommit}
                  isCommitting={committing === family.id}
                  alreadyCommitted={volunteer?.committed_family_ids?.includes(family.id)}
                  volunteerCount={volunteerCountMap[family.id] || 0}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}