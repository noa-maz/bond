import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2, Users, Pencil, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import CircleMember from "../components/CircleMember";
import NeedsSelector from "../components/NeedsSelector";

export default function MyCircle() {
  const [family, setFamily] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userName = localStorage.getItem("bond_user_name");
      const isDemoUser = userName && !userName.includes('@');
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
        const filteredVols = allVols.filter(v =>
          v.committed_family_ids?.includes(fam.id) &&
          (isDemoUser ? v.is_demo === true : !v.is_demo)
        );
        setVolunteers(filteredVols);
        setVisits(familyVisits);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vol) => {
    await base44.functions.invoke('approveVolunteer', { volunteer_id: vol.id, family_id: family.id });
    setVolunteers((prev) =>
      prev.map((v) => (v.id === vol.id ? { ...v, approved_family_ids: [...(v.approved_family_ids || []), family.id] } : v))
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
        <span className="font-serif text-xl tracking-tight flex-1">BOND</span>
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg gap-1.5"
          onClick={() => { localStorage.removeItem("bond_user_name"); base44.auth.logout("/"); }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </Button>
      </nav>

      <main className="flex-1 px-6 md:px-12 py-8 max-w-2xl mx-auto w-full">
        {/* Paused banner */}
        {family?.paused && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800">Your circle is paused. Resume anytime.</p>
            <button
              onClick={async () => {
                await base44.entities.Family.update(family.id, { paused: false, pause_reason: '' });
                setFamily(f => ({ ...f, paused: false, pause_reason: '' }));
              }}
              className="text-sm font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900 whitespace-nowrap"
            >
              Resume my circle
            </button>
          </div>
        )}
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
                        phone: family.phone || '',
                        number_of_children: family.number_of_children,
                        hardest_lately: family.hardest_lately || '',
                        needs: family.needs || {},
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
                  <Label>Phone number <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of children</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editForm.number_of_children}
                    onChange={e => setEditForm(f => ({ ...f, number_of_children: parseInt(e.target.value, 10) || 0 }))}
                    onWheel={e => e.target.blur()}
                    className="h-11 rounded-xl bg-background"
                  />
                  {(editForm.number_of_children === '' || Number(editForm.number_of_children) < 1) && editForm.number_of_children !== undefined && (
                    <p className="text-xs text-destructive">Please enter at least 1 child</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>What does your family need help with?</Label>
                  <NeedsSelector
                    value={editForm.needs || {}}
                    onChange={needs => setEditForm(f => ({ ...f, needs }))}
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
                    disabled={!editForm.number_of_children || Number(editForm.number_of_children) < 1}
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
                  {upcoming.map(v => {
                    const isApproved = volunteers.some(vol => vol.id === v.volunteer_id && vol.approved_family_ids?.includes(family.id));
                    return (
                      <div key={v.id} className={`bg-card rounded-xl border p-4 flex items-start gap-3 ${!isApproved ? 'opacity-60' : ''}`}>
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                          {v.volunteer_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{v.volunteer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(v.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {v.visit_type}
                          </p>
                          {!isApproved && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                              Pending — will be confirmed once they join your circle.
                            </span>
                          )}
                          {v.note && <p className="text-xs text-muted-foreground mt-0.5 italic">"{v.note}"</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Pending approval */}
          {volunteers.filter((v) => !v.approved_family_ids?.includes(family.id)).length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Someone wants to join your circle
              </h2>
              <div className="space-y-3">
                  {volunteers
                    .filter((v) => !v.approved_family_ids?.includes(family.id))
                    .map((vol) => (
                      <div
                        key={vol.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card rounded-xl border border-dashed p-4"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold flex-shrink-0">
                            {vol.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{vol.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ✨ {vol.offer_types?.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleApprove(vol)}
                            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors sm:whitespace-nowrap"
                          >
                            Welcome them in
                          </button>
                          <button
                            onClick={async () => {
                              await base44.functions.invoke('rejectVolunteer', { volunteer_id: vol.id, family_id: family.id });
                              setVolunteers(prev => prev.filter(v => v.id !== vol.id));
                            }}
                            className="px-4 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors sm:whitespace-nowrap"
                          >
                            Not the right fit
                          </button>
                        </div>
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
                Your circle ({volunteers.filter((v) => v.approved_family_ids?.includes(family.id)).length} approved)
              </h2>
            </div>

            {volunteers.filter((v) => v.approved_family_ids?.includes(family.id)).length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <p className="text-muted-foreground">Your circle is on its way.</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Neighbors who want to show up will find you here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {volunteers
                  .filter((v) => v.approved_family_ids?.includes(family.id))
                  .map((vol) => (
                    <CircleMember key={vol.id} volunteer={vol} />
                  ))}
              </div>
            )}
          </div>
          {/* Pause button */}
          {!family?.paused && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setShowPauseOverlay(true)}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline underline-offset-2 transition-colors"
              >
                Pause my circle
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Pause overlay */}
      {showPauseOverlay && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 px-4 pb-8 sm:pb-0">
          <div className="bg-background rounded-2xl border p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-serif text-xl">Why are you pausing?</h3>
            <p className="text-sm text-muted-foreground">No worries — your circle will still be here when you're back.</p>
            <div className="space-y-2">
              {[
                "My partner is home for now 🏠",
                "We're away for a bit ✈️",
                "Just need a break",
              ].map(reason => (
                <button
                  key={reason}
                  onClick={async () => {
                    await base44.entities.Family.update(family.id, { paused: true, pause_reason: reason });
                    setFamily(f => ({ ...f, paused: true, pause_reason: reason }));
                    setShowPauseOverlay(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl border bg-card hover:bg-secondary transition-colors text-sm"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPauseOverlay(false)}
              className="w-full text-center text-xs text-muted-foreground/60 hover:text-muted-foreground pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}