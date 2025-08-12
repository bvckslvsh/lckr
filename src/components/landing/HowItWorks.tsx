"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Create your locker",
    description:
      "Choose a folder and set a master password. A secure locker is created locally — nothing goes online.",
    icon: "🗂️",
  },
  {
    title: "Add files",
    description:
      "Add files through the browser — they’ll be encrypted instantly using AES-GCM, powered by Web Crypto.",
    icon: "📁",
  },
  {
    title: "Lock or unlock in one click",
    description:
      "Files are decrypted instantly in your browser. Your master password generates a strong encryption key via PBKDF2.",
    icon: "🔐",
  },
  {
    title: "Export unlocked files",
    description:
      "Export a decrypted copy of any file when needed — no need to unlock the whole locker.",
    icon: "📤",
  },
  {
    title: "Come back anytime",
    description:
      "Open your locker anytime with your master password. No accounts. No tracking.",
    icon: "🔓",
  },
];

export default function HowItWorks() {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < steps.length - 1) setCurrent((prev) => prev + 1);
  };

  const prev = () => {
    if (current > 0) setCurrent((prev) => prev - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-center relative">
      <h2 className="text-3xl font-bold mb-8">How it works</h2>

      <div className="relative h-64 w-full max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center"
          >
            <div className="text-5xl mb-4">{steps[current].icon}</div>
            <h3 className="text-xl font-semibold mb-2">
              {steps[current].title}
            </h3>
            <p className="text-muted-foreground">
              {steps[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex gap-4">
        <Button variant="outline" onClick={prev} disabled={current === 0}>
          ← Back
        </Button>
        <Button onClick={next} disabled={current === steps.length - 1}>
          Next →
        </Button>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Step {current + 1} of {steps.length}
      </div>
    </div>
  );
}
