import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { ArrowLeft, Heart, Loader2, MapPin, Baby, CalendarDays, Pencil, Phone } from "lucide-react";

const NEED_LABELS = {
  school_pickup: "School / kindergarten pickup",
  cooking: "Cooking / meal prep",
  household: "Household tasks",
  groceries: "Groceries",
  someone_to_talk: "Someone to talk to",
  other: "Other",
};

const getFamilyNeeds = (needs) => {
  if (!needs || typeof needs !== "object") return [];
  return Object.entries(needs)
    .filter(([, v]) => v?.selected)
    .map(([k, v]) => ({ label: NEED_LABELS[k] || k, note: v?.text || '' }));
};

const formatLastUpdated = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { formatted, isRecent: diffDays <= 7 };
};
import ScheduleVisitForm from "../components/ScheduleVisitForm";

const OFFERS = ["Childcare", "Cooking", "Transportation", "Just being there"];
const FREQUENCIES = [
  "Once a week",
  "Twice a month",
  "Once a month",
  "Flexible - I'll coordinate with my circle",
];
import { motion } from "framer-motion";

const OFFER_EMOJI = {
  Childcare: "👶",
  Cooking: "🍲",
  Transportation: "🚗",
  "Just being there": "💛",
};

export default function VolunteerDashboard() {
  const [volunteer, setVolunteer] = useState(null);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userName = localStorage.getItem("bond_user_name");
    const vols = await base44.entities.Volunteer.filter({
      user_email: userName,
    });
    const vol = vols[0];
    setVolunteer(vol);

    if (vol?.committed_family_ids?.length > 0) {
      const familyIds = vol.committed_family_ids;
      const [familyResults, ...familyVisitArrays] = await Promise.all([
        Promise.all(familyIds.map(id => base44.entities.Family.filter({ id }))),
        ...familyIds.map(id => base44.entities.Visit.filter({ family_id: id })),
      ]);
      setFamilies(familyResults.map(r => r[0]).filter(Boolean));
      setVisits(familyVisitArrays.flat());
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

  if (!volunteer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4">
        <p className="text-muted-foreground">
          You haven't signed up as a volunteer yet.
        </p>
        <Link to="/join-circle">
          <Button>Join a circle</Button>
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
          {/* Volunteer info */}
          <div className="space-y-2">
            {!editing ? (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-3xl tracking-tight flex-1">
                    Hi, {volunteer.name} 👋
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      setEditForm({
                        name: volunteer.name,
                        neighborhood: volunteer.neighborhood,
                        phone: volunteer.phone || '',
                        offer_types: volunteer.offer_types || [],
                        frequency: volunteer.frequency || '',
                      });
                      setEditing(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Showing up matters more than you know.
                </p>
              </>
            ) : (
              <div className="bg-card rounded-2xl border p-5 space-y-4">
                <div className="space-y-2">
                  <Label>Your first name</Label>
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
                  <Label>Phone number <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                  <Input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g. 050-1234567"
                    className="h-11 rounded-xl bg-background"
                  />
                  <p className="text-xs text-muted-foreground">So the family can reach you directly.</p>
                </div>
                <div className="space-y-2">
                  <Label>What can you offer?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {OFFERS.map(o => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setEditForm(f => ({
                          ...f,
                          offer_types: f.offer_types.includes(o)
                            ? f.offer_types.filter(x => x !== o)
                            : [...f.offer_types, o],
                        }))}
                        className={`h-11 px-4 rounded-xl border text-sm font-medium text-left transition-colors ${
                          editForm.offer_types?.includes(o)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-secondary'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>How often can you show up?</Label>
                  <Select
                    value={editForm.frequency}
                    onValueChange={val => setEditForm(f => ({ ...f, frequency: val }))}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue placeholder="Choose one…" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(freq => (
                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1"
                    onClick={async () => {
                      await base44.entities.Volunteer.update(volunteer.id, editForm);
                      setVolunteer(v => ({ ...v, ...editForm }));
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



          {/* Family cards */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              {families.length === 1 ? "Your family" : "Your families"}
            </h2>

            {families.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl border space-y-3">
                <p className="text-muted-foreground">
                  Choose a family to start showing up for.
                </p>
              </div>
            )}

            {families.map((family) => {
              const isApproved = volunteer.approved === true;
              return (
              <div key={family.id} className={`bg-card rounded-2xl border p-6 space-y-4 ${!isApproved ? 'opacity-70' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-2xl flex-shrink-0">
                    {family.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">
                      {family.name}'s Family
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {family.neighborhood}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Baby className="w-3.5 h-3.5" />
                        {family.number_of_children}{" "}
                        {family.number_of_children === 1 ? "child" : "children"}
                      </span>
                    </div>
                    {family.phone && (
                      <a
                        href={`tel:${family.phone}`}
                        className="inline-flex items-center gap-1 mt-1 text-sm text-primary hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {family.phone}
                      </a>
                    )}
                    {getFamilyNeeds(family.needs).length > 0 && (() => {
                      const needs = getFamilyNeeds(family.needs);
                      const lastUpdated = formatLastUpdated(family.updated_date);
                      return (
                        <div className="mt-2 space-y-1">
                          <span className="text-xs text-muted-foreground font-medium">What they need most:</span>
                          <div className="flex flex-wrap gap-2">
                            {needs.map(({ label, note }) => (
                              <div key={label} className="flex flex-col gap-0.5">
                                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">{label}</span>
                                {note && <span className="text-xs text-muted-foreground italic px-1">{note}</span>}
                              </div>
                            ))}
                          </div>
                          {lastUpdated && (
                            <p className={`text-xs ${lastUpdated.isRecent ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              Last updated: {lastUpdated.formatted}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {family.hardest_lately && (
                  <div className="bg-secondary/50 rounded-xl px-4 py-3">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      "{family.hardest_lately}"
                    </p>
                  </div>
                )}

                {isApproved ? (
                  <div className="flex items-center gap-2 text-primary text-sm font-medium pt-1">
                    <Heart className="w-4 h-4 fill-primary" />
                    You chose them. That means everything.
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 inline-block"></span>
                    Waiting to be welcomed in
                  </div>
                )}

                {/* Scheduled visits for this family */}
                {isApproved && visits.filter(v => v.family_id === family.id && v.volunteer_id === volunteer.id).length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your upcoming visits</p>
                    {visits
                      .filter(v => v.family_id === family.id && v.volunteer_id === volunteer.id)
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map(v => (
                        <div key={v.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{new Date(v.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                          <span>·</span>
                          <span>{v.visit_type}</span>
                        </div>
                      ))}
                  </div>
                )}

                {isApproved && (
                  <ScheduleVisitForm
                    familyId={family.id}
                    volunteer={volunteer}
                    existingVisits={visits.filter(v => v.family_id === family.id)}
                    onVisitAdded={v => setVisits(prev => [...prev, v])}
                  />
                )}
              </div>
              );
            })}

            <Link to="/browse-families">
              <Button variant="outline" className="w-full rounded-2xl h-12 gap-2">
                <Heart className="w-4 h-4" />
                Support another family
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}