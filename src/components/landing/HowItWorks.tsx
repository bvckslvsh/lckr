"use client";

import { useState } from "react";
import { Globe, Usb, Cloud, ExternalLink, Download, ArrowLeft, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

type Tab = "browser" | "usb" | "cloud";

const tabs: { id: Tab; label: string; icon: React.ElementType; summary: string }[] = [
  {
    id: "browser",
    label: "In Browser",
    icon: Globe,
    summary:
      "Open lckr.tech and start immediately. All encryption runs locally — nothing ever leaves your machine. No download, no account.",
  },
  {
    id: "usb",
    label: "USB Drive",
    icon: Usb,
    summary:
      "Carry LCKR and your encrypted files on a USB stick. Plug into any PC with Chrome, run a script, enter your password — done. Unplug and nothing stays behind.",
  },
  {
    id: "cloud",
    label: "Cloud Sync",
    icon: Cloud,
    summary:
      "Use Dropbox, iCloud, or Google Drive as a transport. Your files are encrypted before they leave your machine — the cloud never sees the original content.",
  },
];

type Step = {
  title: string;
  description: string;
  code?: { label: string; value: string }[];
  action?: { label: string; href: string };
  note?: string;
};

const browserSteps: Step[] = [
  {
    title: "Open lckr.tech in Chrome, Edge, or Brave",
    description:
      "LCKR runs entirely in your browser using the Web Crypto API and File System Access API. No data is sent to any server. No plugins or extensions needed.",
  },
  {
    title: "Create a locker",
    description:
      'Click "Open LCKR" → "Create new locker". Pick any folder on your computer — that folder becomes your locker. Set a master password. It never leaves your device.',
  },
  {
    title: "Drop files in",
    description:
      "Drag and drop files onto the dashboard. Each file is encrypted instantly with AES-GCM 256-bit. The original is replaced by an encrypted .enc copy on disk.",
  },
  {
    title: "Come back anytime",
    description:
      'Click "Open existing locker", select the same folder, enter your password. No account, no sync, no server. Close the tab — the key is gone.',
  },
];

const usbSteps: Step[] = [
  {
    title: "Download LCKR",
    description:
      "Download the latest release from GitHub. The zip contains the app and launcher scripts for Windows and Mac/Linux.",
    action: {
      label: "Download latest release",
      href: "https://github.com/bvckslvsh/lckr/releases",
    },
  },
  {
    title: "Unzip onto your USB drive",
    description: "After extracting, your USB drive should contain:",
    code: [
      { label: "App", value: "dist/" },
      { label: "Windows", value: "start.bat" },
      { label: "Mac / Linux", value: "start.sh" },
    ],
  },
  {
    title: "Create a locker folder on the USB",
    description:
      'On the USB drive, create a new empty folder — e.g. "my-locker". This is where your encrypted files will live. Nothing is copied to the host machine.',
  },
  {
    title: "Plug into any PC and run the launcher",
    description:
      "Python must be installed (pre-installed on macOS and Linux, common on Windows 11). The launcher starts a local server and opens Chrome automatically.",
    code: [
      { label: "Windows", value: "double-click start.bat" },
      { label: "Mac / Linux", value: "./start.sh" },
    ],
    note: "Python not installed? Get it free at python.org — takes under a minute.",
  },
  {
    title: "Open your locker",
    description:
      'Chrome opens at localhost:8080. Click "Open existing locker" → select your locker folder on the USB → enter your password.',
  },
  {
    title: "Unplug and leave no trace",
    description:
      "Close the tab — the key is erased from memory. Unplug the USB. Nothing is written to the host machine.",
  },
];

const cloudSteps: Step[] = [
  {
    title: "Create a folder in your cloud storage",
    description:
      'In Dropbox, iCloud Drive, or Google Drive, create a new empty folder — e.g. "lckr-vault". Make sure it syncs to your local filesystem.',
  },
  {
    title: "Create your locker inside that folder",
    description:
      'Open lckr.tech → "Create new locker" → select the cloud-synced folder. Set your master password. LCKR writes only encrypted files and a small metadata file.',
  },
  {
    title: "Add files — they sync encrypted",
    description:
      "Drop files in. They are encrypted before being written to disk. Your cloud provider syncs only .enc files and never sees the original content.",
  },
  {
    title: "Access from any device",
    description:
      'On another machine, open lckr.tech → "Open existing locker" → select the same cloud-synced folder → enter your password.',
    note: "Wait for the cloud sync to complete before opening the locker on a second device.",
  },
];

const stepsByTab: Record<Tab, Step[]> = {
  browser: browserSteps,
  usb: usbSteps,
  cloud: cloudSteps,
};

function StepTimeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          {/* Number + connector line */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-blue-200 my-1" />
            )}
          </div>

          {/* Content */}
          <div className={i < steps.length - 1 ? "pb-6" : "pb-0"}>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-2">
              {step.description}
            </p>

            {step.code && (
              <div className="bg-gray-950 rounded-lg px-4 py-2.5 mb-2">
                {step.code.map((line) => (
                  <div key={line.label} className="flex items-baseline gap-3">
                    <span className="text-xs text-gray-500 w-24 shrink-0">
                      {line.label}
                    </span>
                    <code className="text-sm text-green-400 font-mono">
                      {line.value}
                    </code>
                  </div>
                ))}
              </div>
            )}

            {step.action && (
              <a
                href={step.action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 mb-2"
              >
                <Download size={13} />
                {step.action.label}
                <ExternalLink size={11} className="opacity-60" />
              </a>
            )}

            {step.note && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                {step.note}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorks({ onReturn }: { onReturn: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("browser");
  const activeTabMeta = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-gray-100 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Left: back + logo + title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onReturn}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="flex items-center gap-2.5 border-l border-gray-200 pl-4">
              <img src={logo} alt="LCKR" className="w-11 h-11" />
              <span className="font-semibold text-gray-900 text-sm">
                How it works
              </span>
            </div>
          </div>

          {/* Right: github */}
          <a
            href="https://github.com/bvckslvsh/lckr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Github size={18} />
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {/* Page title — desktop only */}
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            How it works
          </h1>
          <p className="text-gray-500 text-sm">
            Three ways to use LCKR — pick the one that fits your situation.
          </p>
        </div>

        {/* Mobile: horizontal tabs */}
        <div className="md:hidden mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            How it works
          </h1>
          <div className="flex rounded-xl bg-white shadow-sm p-1 gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: two-column layout */}
        <div className="flex gap-8">
          {/* Left sidebar — desktop only */}
          <aside className="hidden md:flex flex-col gap-1 w-52 shrink-0 pt-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-150 ${
                  activeTab === id
                    ? "bg-white shadow-sm text-blue-600 border border-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                }`}
              >
                <Icon size={15} className={activeTab === id ? "text-blue-600" : "text-gray-400"} />
                {label}
              </button>
            ))}

            {/* Summary — desktop */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "-summary"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <p className="text-xs text-gray-500 leading-relaxed">
                  {activeTabMeta.summary}
                </p>
              </motion.div>
            </AnimatePresence>
          </aside>

          {/* Right: steps */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {/* Summary — mobile only */}
                <div className="md:hidden bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex gap-2.5">
                  <activeTabMeta.icon size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-700">{activeTabMeta.summary}</p>
                </div>

                {/* Steps */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6">
                  <StepTimeline steps={stepsByTab[activeTab]} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
