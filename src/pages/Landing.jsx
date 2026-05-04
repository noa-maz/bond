import { base44 } from "@/api/base44Client";
import { Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-end px-6 md:px-12 py-5">
        <span className="font-serif text-xl tracking-tight">BOND</span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <motion.div
          className="max-w-2xl text-center space-y-10"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.18 } } }}
        >
          {/* BOND */}
          <motion.h1
            custom={0}
            variants={fadeUp}
            className="font-serif text-[clamp(5rem,18vw,11rem)] leading-none tracking-tight text-foreground"
          >
            BOND
          </motion.h1>

          {/* Tagline */}
          <motion.p
            custom={1}
            variants={fadeUp}
            className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide"
          >
            Someone in your corner.{" "}
            <span className="text-primary font-medium">For real.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={2}
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-2"
          >
            <Button
              size="lg"
              onClick={() => base44.auth.redirectToLogin("/choose-circle")}
              className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl gap-3 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Users className="w-5 h-5" />
              I'm new here
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => base44.auth.redirectToLogin("/after-login")}
              className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl gap-3 border-2 hover:bg-secondary"
            >
              <Heart className="w-5 h-5" />
              Welcome back
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-20 flex flex-col items-center gap-3"
        >
          <div className="flex -space-x-3">
            {[
              "bg-primary/80",
              "bg-accent/80",
              "bg-chart-2/80",
              "bg-chart-3/80",
              "bg-chart-5/80",
            ].map((bg, i) => (
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