import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Loader2, Users, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import CircleMember from "../components/CircleMember";

export default function MyCircle() {
  const [family, setFamily] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userName = localStorage.getItem("bond_user_name");
      const families = await base44.entities.Family.filter({
        user_email: userName,
      });
      const fam = families[0];
      setFamily(fam);

      if (fam) {
        const [allVols, familyVisits] = await Promise.all([
          base44.entities.Volunteer.list(),
          base44.entities.Visit.filter({ family_id: fam.id }),
        ]);
        const filteredVols = allVols.filter(v => v.committed_family_ids?.includes(fam.id));
        setVolunteers(filteredVols);
        setVisits(familyVisits);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (volunteerId) => {
    await base44.entities.Volunteer.update(volunteerId, { approved: true });
    setVolunteers((prev) =>
      prev.map((v) => (v.id === volunteerId ? { ...v, approved: true } : v))
    );
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
            {!editing ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-2xl flex-shrink-0">
                    {family.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h1 className="font-serif text-2xl tracking-tight">
                      {family.name}'s Circle
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {family.neighborhood} · {family.number_of_children}{" "}
                      {family.number_of_children === 1 ? "child" : "children"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full self-start"
                    onClick={() => {
                      setEditForm({
                        name: family.name,
                        neighborhood: family.neighborhood,
                        number_of_children: family.number_of_children,
                        hardest_lately: family.hardest_lately || '',
                      });
                      setEditing(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                {family.hardest_lately && (
                  <div className="bg-secondary/50 rounded-xl px-4 py-3">
                    <p className="text-sm text-muted-foreground italic">
                      "{family.hardest_lately}"
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Neighborhood</Label>
                  <Input
                    value={editForm.neighborhood}
                    onChange={e => setEditForm(f => ({ ...f, neighborhood: e.target.value }))}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of children</Label>
                  <Input
                    type="number"
                    value={editForm.number_of_children}
                    onChange={e => setEditForm(f => ({ ...f, number_of_children: Number(e.target.value) }))}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>What's been hardest lately?</Label>
                  <Textarea
                    value={editForm.hardest_lately}
                    onChange={e => setEditForm(f => ({ ...f, hardest_lately: e.target.value }))}
                    className="rounded-xl bg-background"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1"
                    onClick={async () => {
                      await base44.entities.Family.update(family.id, editForm);
                      setFamily(f => ({ ...f, ...editForm }));
                      setEditing(false);
                    }}
                  >
                    Save
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming support */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Upcoming support</h2>
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              const upcoming = visits
                .filter(v => v.date >= today)
                .sort((a, b) => a.date.localeCompare(b.date));
              if (upcoming.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground italic">
                    No visits scheduled yet — your circle will let you know when they're coming.
                  </p>
                );
              }
              return (
                <div className="space-y-2">
                  {upcoming.map(v => (
                    <div key={v.id} className="bg-card rounded-xl border p-4 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        {v.volunteer_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{v.volunteer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(v.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {v.visit_type}
                        </p>
                        {v.note && <p className="text-xs text-muted-foreground mt-0.5 italic">"{v.note}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Pending approval */}
          {volunteers.filter((v) => !v.approved).length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Waiting for your approval
              </h2>
              <div className="space-y-3">
                {volunteers
                  .filter((v) => !v.approved)
                  .map((vol) => (
                    <div
                      key={vol.id}
                      className="flex items-center gap-4 bg-card rounded-xl border border-dashed p-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold flex-shrink-0">
                        {vol.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{vol.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ✨ {vol.offer_types?.join(", ")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApprove(vol.id)}
                        className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Approved circle */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">
                Your circle ({volunteers.filter((v) => v.approved).length})
              </h2>
            </div>

            {volunteers.filter((v) => v.approved).length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <p className="text-muted-foreground">Your circle is forming…</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Volunteers in your area will see your profile and commit to supporting you.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {volunteers
                  .filter((v) => v.approved)
                  .map((vol) => (
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