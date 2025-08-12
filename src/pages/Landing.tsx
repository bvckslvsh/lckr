import { useState } from "react";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Notes from "@/components/landing/Notes";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function Landing() {
  const [view, setView] = useState<"hero" | "howitworks" | "notes">("hero");

  return (
    <div className="relative min-h-screen bg-gray-100 px-4">
      <div className="absolute top-4 right-4 z-50 flex flex-row align-bottom gap-2">
        <a
          href="https://github.com/bvckslvsh/lckr"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="icon">
            <Github className="w-5 h-5" />
          </Button>
        </a>
      </div>

      {view !== "hero" && (
        <Button
          onClick={() => setView("hero")}
          className="absolute top-4 left-4 z-50"
        >
          ← Return
        </Button>
      )}

      <AnimatePresence mode="wait">
        {view === "hero" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Hero
              onShowHowItWorks={() => setView("howitworks")}
              onShowNotes={() => setView("notes")}
            />
          </motion.div>
        )}

        {view === "howitworks" && (
          <motion.div
            key="howitworks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <HowItWorks />
          </motion.div>
        )}

        {view === "notes" && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Notes />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
