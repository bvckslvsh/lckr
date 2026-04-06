import { useState } from "react";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Notes from "@/components/landing/Notes";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, Monitor } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Landing() {
  const [view, setView] = useState<"hero" | "howitworks" | "notes">("hero");

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Mobile not supported */}
      <div className="md:hidden flex flex-col items-center justify-center min-h-screen px-8 text-center gap-6">
        <img src={logo} alt="LCKR" className="w-14 h-14 opacity-90" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">LCKR</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            LCKR requires access to your file system and is not supported on mobile browsers.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
          <Monitor className="w-4 h-4 shrink-0 text-gray-400" />
          <span>Open on a desktop with Chrome, Edge, or Brave</span>
        </div>
        <a
          href="https://github.com/bvckslvsh/lckr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          github.com/bvckslvsh/lckr
        </a>
      </div>
      {/* Desktop content */}
      <div className="hidden md:block">

      {/* GitHub button — only on hero */}
      {view === "hero" && (
        <div className="absolute top-4 right-4 z-50">
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
            <HowItWorks onReturn={() => setView("hero")} />
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
            <Notes onReturn={() => setView("hero")} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
