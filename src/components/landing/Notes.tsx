const notes = [
  {
    version: "v0.1",
    date: "AUG 2025",
    notes: [
      "Initial release with core encryption features.",
      "I’m excited to share the first public beta release of LCKR! I’d really appreciate any feedback at <b><a href=\"mailto:bvckslvsh@gmail.com\">bvckslvsh@gmail.com</a></b>. <br> Contributions to the <u><i><a href='https://github.com/bvckslvsh/lckr' target='_blank'>repository</a></i></u> are also very welcome — feel free to open issues or submit pull requests.",
      "Currently, I’m working on a standalone client for users with non-Chromium-based browsers and those who want extra security.",
      "<b><i>Stay tuned!</i></b>",
    ],
  },
];

export default function Notes() {
  return (
    <div className="flex justify-center min-h-screen py-12 px-4">
      <div className="max-w-3xl w-full">
        <h2 className="text-4xl font-extrabold mb-12 leading-tight text-gray-900">
          Notes
        </h2>

        <div className="space-y-12">
          {notes.map(({ version, date, notes }, idx) => (
            <section key={idx}>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 leading-snug">
                {version} — {date}
              </h3>
              <ul className="list-none space-y-2 text-gray-700 text-lg leading-relaxed">
                {notes.map((note, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: note }} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
