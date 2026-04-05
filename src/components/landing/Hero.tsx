import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Info, Chrome, Usb, Cloud, Shield } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "@/assets/logo.png";

const descriptors = [
  "USB-ready",
  "offline-first",
  "zero-knowledge",
  "portable",
  "open source",
  "no install",
  "field-ready",
  "sync-friendly",
];

const useCases = [
  {
    icon: Usb,
    title: "USB drive",
    description: "Plug into any PC, run one script, open Chrome. Unplug — no trace left.",
  },
  {
    icon: Cloud,
    title: "Cloud sync",
    description: "Store your locker in Dropbox or iCloud. Cloud sees only scrambled data.",
  },
  {
    icon: Shield,
    title: "Field work",
    description: "For journalists and researchers. No accounts. No logs. No server.",
  },
];

const trustBadges = ["AES-256-GCM", "PBKDF2 · 600k", "Zero Knowledge", "Open Source"];

export default function Hero({
  onShowHowItWorks,
  onShowNotes,
}: {
  onShowHowItWorks: () => void;
  onShowNotes: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [isChromium, setIsChromium] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % descriptors.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsChromium(
      ua.includes("chrome") ||
        ua.includes("chromium") ||
        ua.includes("edg") ||
        ua.includes("opera") ||
        ua.includes("brave")
    );
  }, []);

  return (
    <section className="h-screen flex flex-col items-center justify-center bg-gray-100 px-6 text-center">
      {/* Logo */}
      <img src={logo} alt="LCKR" className="w-20 h-20 mb-5" />

      {/* Headline */}
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
        Your encrypted locker.
      </h1>

      {/* Rotating descriptor */}
      <div className="h-9 flex items-center justify-center mb-5">
        <AnimatePresence mode="wait">
          <motion.span
            key={descriptors[index]}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-semibold text-blue-600"
          >
            {descriptors[index]}.
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Subheadline */}
      <p className="text-gray-500 text-sm md:text-base mb-7 max-w-md leading-relaxed">
        Carry your encrypted files on a USB drive or sync via Dropbox.
        No installation. No cloud account. No trace left behind.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
        <Button
          size="lg"
          className="flex items-center gap-2 min-w-40"
          disabled={!isChromium}
          onClick={() => isChromium && (window.location.href = "/setup")}
        >
          {isChromium ? <Play size={15} /> : <Chrome size={15} />}
          {isChromium ? "Open LCKR" : "Chrome / Edge / Brave only"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex items-center gap-2"
          onClick={onShowHowItWorks}
        >
          <Info size={15} />
          How it works
        </Button>
        <Button size="lg" variant="blue" onClick={onShowNotes}>
          🎉 v0.2
        </Button>
      </div>

      {/* Trust strip */}
      <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 mb-8">
        {trustBadges.map((badge, i) => (
          <span key={badge} className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{badge}</span>
            {i < trustBadges.length - 1 && (
              <span className="text-gray-300 text-xs select-none">·</span>
            )}
          </span>
        ))}
      </div>

      {/* Use cases — compact horizontal strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-center gap-5 sm:gap-10 max-w-3xl w-full border-t border-gray-200 pt-6">
        {useCases.map(({ icon: Icon, title, description }, i) => (
          <div key={title} className="flex items-start gap-3 text-left flex-1">
            {i > 0 && (
              <div className="hidden sm:block w-px self-stretch bg-gray-200 -ml-5 mr-0" />
            )}
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
