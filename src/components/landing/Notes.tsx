import { ArrowLeft, Github } from "lucide-react";
import logo from "@/assets/logo.png";

const notes = [
  {
    version: "v0.2",
    date: "APR 2026",
    notes: [
      "USB-first release — LCKR is now a portable encrypted drive you can carry in your pocket.",
      "Added <b>USB launcher scripts</b> (<code>start.bat</code> / <code>start.sh</code>) — run LCKR offline on any PC with Chrome. No installation required.",
      "Upgraded PBKDF2 key derivation from 100,000 to <b>600,000 iterations</b> — significantly stronger resistance against brute-force attacks. Existing lockers continue to work.",
      "Repositioned around three use cases: USB drive, cloud sync (Dropbox / iCloud), and field work for journalists and researchers.",
      "Fixed password error UX — weak password now shows a clear blocking error instead of an ambiguous warning.",
      "Improved delete dialog with an honest note about OS-level (non-cryptographic) file removal.",
    ],
  },
  {
    version: "v0.1",
    date: "AUG 2025",
    notes: [
      "Initial release with core encryption features.",
      "I'm excited to share the first public beta release of LCKR! I'd really appreciate any feedback at <b><a href=\"mailto:bvckslvsh@gmail.com\">bvckslvsh@gmail.com</a></b>. <br> Contributions to the <u><i><a href='https://github.com/bvckslvsh/lckr' target='_blank'>repository</a></i></u> are also very welcome — feel free to open issues or submit pull requests.",
      "Currently, I'm working on a standalone client for users with non-Chromium-based browsers and those who want extra security.",
      "<b><i>Stay tuned!</i></b>",
    ],
  },
];

export default function Notes({ onReturn }: { onReturn: () => void }) {
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
                Release notes
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

      <div className="max-w-3xl mx-auto w-full px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Release notes
        </h1>

        <div className="space-y-10">
          {notes.map(({ version, date, notes: items }, idx) => (
            <section key={idx}>
              <div className="flex items-baseline gap-3 mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {version}
                </h2>
                <span className="text-xs font-mono text-gray-400">{date}</span>
              </div>
              <ul className="space-y-2">
                {items.map((note, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-gray-600 leading-relaxed"
                  >
                    <span className="text-blue-400 mt-1 shrink-0">–</span>
                    <span dangerouslySetInnerHTML={{ __html: note }} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
