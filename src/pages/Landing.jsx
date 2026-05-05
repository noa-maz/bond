import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Landing() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(() => sessionStorage.getItem('bond_demo_open') === 'true');
  const [demoProfiles, setDemoProfiles] = useState([]);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (showDemo) loadDemo();
  }, []);

  const loadDemo = async () => {
    if (demoProfiles.length > 0) { setShowDemo(true); sessionStorage.setItem('bond_demo_open', 'true'); return; }
    setDemoLoading(true);
    const [families, volunteers] = await Promise.all([
      base44.entities.Family.list(),
      base44.entities.Volunteer.list(),
    ]);
    const profiles = [
      ...families.filter(f => f.user_email && !f.user_email.includes('@')).map(f => ({ ...f, role: 'Family' })),
      ...volunteers.filter(v => v.user_email && !v.user_email.includes('@')).map(v => ({ ...v, role: 'Volunteer' })),
    ];
    setDemoProfiles(profiles);
    setDemoLoading(false);
    setShowDemo(true);
  };

  const enterAsDemo = async (profile) => {
    localStorage.setItem('bond_user_name', profile.user_email);
    const families = await base44.entities.Family.filter({ user_email: profile.user_email });
    if (families.length > 0) { navigate('/my-circle'); return; }
    const volunteers = await base44.entities.Volunteer.filter({ user_email: profile.user_email });
    if (volunteers.length > 0) { navigate('/volunteer-dashboard'); return; }
    navigate('/choose-circle');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-end px-6 md:px-12 py-5">
        <span className="font-serif text-xl tracking-tight">BOND</span>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <motion.div
          className="max-w-2xl w-full text-center space-y-10"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.18 } } }}
        >
          <motion.h1
            custom={0}
            variants={fadeUp}
            className="font-serif text-[clamp(5rem,18vw,11rem)] leading-none tracking-tight text-foreground"
          >
            BOND
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeUp}
            className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide"
          >
            Someone in your corner.{" "}
            <span className="text-primary font-medium">For real.</span>
          </motion.p>

          <motion.div custom={2} variants={fadeUp} className="max-w-sm mx-auto space-y-6">
            <Button
              onClick={() => base44.auth.redirectToLogin('/after-login')}
              className="h-12 px-8 rounded-xl gap-2"
            >
              Enter BOND
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="space-y-3">
              <button
                onClick={() => { if (showDemo) { setShowDemo(false); sessionStorage.setItem('bond_demo_open', 'false'); } else { loadDemo(); sessionStorage.setItem('bond_demo_open', 'true'); } }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
              >
                Want to explore first? Try a demo account.
                <ChevronDown className={`w-3 h-3 transition-transform ${showDemo ? 'rotate-180' : ''}`} />
              </button>

              {showDemo && (
                <div className="grid grid-cols-2 gap-2 text-left">
                  {demoLoading && <p className="col-span-2 text-xs text-muted-foreground text-center py-2">Loading…</p>}
                  {demoProfiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => enterAsDemo(profile)}
                      className="bg-card border rounded-xl p-3 text-left hover:border-primary/40 hover:bg-secondary/50 transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold capitalize truncate">{profile.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                          profile.role === 'Family'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/20 text-accent-foreground'
                        }`}>{profile.role}</span>
                      </div>
                      {profile.role === 'Family' ? (
                        <p className="text-[11px] text-muted-foreground">{profile.neighborhood} · {profile.number_of_children} {profile.number_of_children === 1 ? 'child' : 'children'}</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground truncate">{(profile.offer_types || []).join(', ')}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-20 flex flex-col items-center gap-3"
        >
          <div className="flex -space-x-3">
            {["bg-primary/80", "bg-accent/80", "bg-chart-2/80", "bg-chart-3/80", "bg-chart-5/80"].map((bg, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full ${bg} border-2 border-background flex items-center justify-center text-white text-xs font-semibold`}
              >
                {["R", "N", "S", "M", "A"][i]}
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="text-center py-6 text-sm text-muted-foreground border-t">
        BOND © {new Date().getFullYear()} — Built with love for our communities
      </footer>
    </div>
  );
}