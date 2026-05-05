import { Link } from "react-router-dom";
import { Heart, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ChooseCircle() {
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
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          className="max-w-md w-full text-center space-y-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div custom={0} variants={fadeUp} className="space-y-2">
            <h1 className="font-serif text-4xl tracking-tight">Welcome to BOND</h1>
            <p className="text-muted-foreground">What brings you here?</p>
            <p className="text-sm text-muted-foreground text-center">BOND connects families managing reserve duty with neighbors who commit to showing up - not once, but over time.</p>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Link to="/start-circle">
                <Button
                  size="lg"
                  className="w-full h-14 px-8 text-base rounded-2xl gap-3 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  <Users className="w-5 h-5" />
                  I'm starting a circle
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">My partner is away and I could use a steady hand nearby</p>
            </div>
            <div className="space-y-1.5">
              <Link to="/join-circle">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-14 px-8 text-base rounded-2xl gap-3 border-2 hover:bg-secondary"
                >
                  <Heart className="w-5 h-5" />
                  I'm joining a circle
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">I want to show up for someone in my community</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}