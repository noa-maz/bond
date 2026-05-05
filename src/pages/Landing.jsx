import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

          <motion.div custom={2} variants={fadeUp} className="max-w-sm mx-auto">
            <Button
              onClick={() => base44.auth.redirectToLogin('/after-login')}
              className="h-12 px-8 rounded-xl gap-2"
            >
              Enter BOND
              <ArrowRight className="w-4 h-4" />
            </Button>
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