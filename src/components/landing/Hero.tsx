import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Info, Chrome } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const descriptors = [
  "client-side",
  "offline",
  "zero-knowledge",
  "local-first",
  "no logs",
  "no cookies",
  "minimalist",
  "open source",
];

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
    const isChromiumBased =
      ua.includes("chrome") ||
      ua.includes("chromium") ||
      ua.includes("edg") ||
      ua.includes("opera") ||
      ua.includes("brave");

    setIsChromium(isChromiumBased);
  }, []);

  const handleTryClick = () => {
    if (isChromium) {
      window.location.href = "/setup";
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-center relative">
      <h1 className="text-3xl md:text-5xl font-bold mb-8 flex flex-wrap justify-center items-center gap-2">
        <span>LCKR is a</span>

        <span className="relative inline-block">
          <AnimatePresence mode="wait">
            <motion.span
              key={descriptors[index]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="inline-block text-blue-600"
            >
              {" " + descriptors[index] + " "}
            </motion.span>
          </AnimatePresence>
        </span>

        <span>encryption tool</span>
      </h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          className="flex items-center gap-2"
          disabled={!isChromium}
          onClick={handleTryClick}
        >
          {isChromium ? <Play size={18} /> : <Chrome size={18} />}
          {!isChromium
            ? "Only Chromium-based desktop browsers supported"
            : "Run"}
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={onShowHowItWorks}
        >
          <Info size={18} />
          How it works?
        </Button>
        <Button
          variant="blue"
          className="flex items-center gap-2"
          onClick={() => onShowNotes()}
        >
          🎉 v0.1
        </Button>
      </div>
    </section>
  );
}
