import { Link } from "react-router-dom";
import { Heart, Users, ArrowRight } from "lucide-react";
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
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <span className="font-serif text-2xl tracking-tight text-foreground">
          BOND
        </span>
        <div className="flex gap-3">
          <Link to="/start-circle">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Start a circle
            </Button>
          </Link>
          <Link to="/join-circle">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Join a circle
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <motion.div
          className="max-w-2xl text-center space-y-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {/* Badge */}
          <motion.div custom={0} variants={fadeUp} className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Heart className="w-3.5 h-3.5" />
              Community support for reserve-duty families
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight text-foreground"
          >
            Someone in your corner.{" "}
            <span className="text-primary">Week after week.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed"
          >
            BOND connects reserve-duty military wives in Israel with committed
            local volunteers. Not once — but consistently.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Link to="/start-circle" className="flex-1 sm:flex-initial">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl gap-3 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Users className="w-5 h-5" />
                I'm starting a circle
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/join-circle" className="flex-1 sm:flex-initial">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl gap-3 border-2 hover:bg-secondary"
              >
                <Heart className="w-5 h-5" />
                I'm joining a circle
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          custom={5}
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
          <p className="text-sm text-muted-foreground">
            Neighbors helping neighbors, one family at a time
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-muted-foreground border-t">
        BOND © {new Date().getFullYear()} — Built with love for our communities
      </footer>
    </div>
  );
}