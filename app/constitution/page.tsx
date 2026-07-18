import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Nigerian Law — SabiLex',
  description: 'Browse the Nigerian Constitution chapter by chapter.',
};

const CHAPTERS = [
  {
    id: 'chapter-i',
    label: 'Chapter I',
    title: 'General Provisions',
    icon: '🏛️',
    sections: 'Sections 1–12',
    desc: 'Supremacy of the Constitution, federal structure, legislative and executive powers, local government system, and treaties.',
    highlights: [
      { sec: 'S.1', text: 'The Constitution is supreme over all authorities and persons' },
      { sec: 'S.4', text: 'Legislative power vested in National Assembly' },
      { sec: 'S.5', text: 'Executive power vested in the President' },
      { sec: 'S.6', text: 'Judicial power vested in the courts' },
      { sec: 'S.10', text: 'No State religion may be adopted' },
    ],
  },
  {
    id: 'chapter-ii',
    label: 'Chapter II',
    title: 'Fundamental Objectives',
    icon: '🎯',
    sections: 'Sections 13–24',
    desc: 'Directive principles of state policy — democracy, social justice, economic rights, education, environment, and citizens\' duties.',
    highlights: [
      { sec: 'S.14', text: 'Nigeria based on democracy and social justice' },
      { sec: 'S.17', text: 'Equal rights and equal pay for equal work' },
      { sec: 'S.18', text: 'Equal educational opportunities for all' },
      { sec: 'S.22', text: 'Freedom of the press guaranteed' },
      { sec: 'S.24', text: 'Duties of every citizen' },
    ],
  },
  {
    id: 'chapter-iii',
    label: 'Chapter III',
    title: 'Citizenship',
    icon: '🇳🇬',
    sections: 'Sections 25–32',
    desc: 'Who is a Nigerian citizen, citizenship by birth, registration and naturalisation, dual citizenship, and renunciation.',
    highlights: [
      { sec: 'S.25', text: 'Citizenship by birth — persons born in Nigeria' },
      { sec: 'S.26', text: 'Citizenship by registration' },
      { sec: 'S.27', text: 'Naturalisation — 15-year residency requirement' },
      { sec: 'S.28', text: 'Dual citizenship rules' },
      { sec: 'S.29', text: 'Renunciation of citizenship' },
    ],
  },
  {
    id: 'chapter-iv',
    label: 'Chapter IV',
    title: 'Fundamental Rights',
    icon: '⚖️',
    sections: 'Sections 33–46',
    desc: 'The core bill of rights — life, dignity, personal liberty, fair hearing, privacy, expression, assembly, movement, and non-discrimination.',
    highlights: [
      { sec: 'S.33', text: 'Right to life' },
      { sec: 'S.34', text: 'Right to dignity — no torture or slavery' },
      { sec: 'S.35', text: 'Right to personal liberty — must be charged within 24-48 hours' },
      { sec: 'S.36', text: 'Right to fair hearing — presumed innocent until proven guilty' },
      { sec: 'S.37', text: 'Right to privacy of home and communications' },
      { sec: 'S.39', text: 'Freedom of expression and press' },
      { sec: 'S.42', text: 'Freedom from discrimination (sex, ethnicity, religion)' },
      { sec: 'S.46', text: 'High Court jurisdiction to enforce rights + Legal Aid' },
    ],
  },
];

const STATUTES = [
  {
    id: 'labour-act',
    label: 'Labour Act',
    title: 'Labour Act (Cap L1)',
    icon: '💼',
    desc: 'Employment contracts, wage protection, termination procedures, notice periods, and prohibition of forced labour.',
    highlights: [
      { sec: 'S.3', text: 'Written contract required within 3 months of engagement' },
      { sec: 'S.7', text: 'Minimum notice periods for dismissal (1 week to 1 month)' },
      { sec: 'S.9', text: 'Contracts less favourable than Act are void' },
      { sec: 'S.13', text: 'Wages must be paid in naira' },
      { sec: 'S.73', text: 'Prohibition of forced or compulsory labour' },
    ],
  },
  {
    id: 'acja-police',
    label: 'ACJA / Police Act',
    title: 'ACJA 2015 & Police Act 2020',
    icon: '👮',
    desc: 'Rights of arrested persons, detention limits, bail, right to counsel, prohibition of torture, and police duties.',
    highlights: [
      { sec: 'ACJA S.6', text: 'Right to remain silent and right to counsel upon arrest' },
      { sec: 'ACJA S.10', text: 'Must be charged within 24–48 hours or released on bail' },
      { sec: 'ACJA S.16', text: 'Bail must be reasonable — refusal of appropriate bail is unlawful' },
      { sec: 'Police S.24', text: 'Prohibition of torture, bribery, and degrading treatment by police' },
      { sec: 'Police S.25', text: 'Police duty to protect life and property' },
    ],
  },
];

export default function ConstitutionPage() {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 pb-20 w-full">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[1.8rem] md:text-[2.2rem] font-medium text-zinc-800 mb-3 tracking-tight leading-tight">
            Browse Nigerian Law
          </h1>
          <p className="text-zinc-500 text-[15px] leading-relaxed max-w-[560px]">
            Explore the documents indexed by SabiLex. Every AI response cites these exact sources.
          </p>
        </div>

        {/* Constitution */}
        <section className="mb-12">
          <h2 className="font-semibold text-[15px] text-zinc-800 mb-5">
            📜 Constitution of the Federal Republic of Nigeria, 1999
          </h2>

          <div className="flex flex-col gap-3">
            {CHAPTERS.map((ch) => (
              <div key={ch.id} className="bg-white border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-xl flex-shrink-0">
                    {ch.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{ch.label}</span>
                      <span className="text-[11px] text-zinc-400">· {ch.sections}</span>
                    </div>
                    <h3 className="font-semibold text-[15px] text-zinc-900 mb-1.5">{ch.title}</h3>
                    <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">{ch.desc}</p>

                    <div className="flex flex-col gap-1.5">
                      {ch.highlights.map((h) => (
                        <div key={h.sec} className="flex items-start gap-2.5 p-2 bg-zinc-50/60 rounded-lg text-[13px]">
                          <span className="font-semibold text-[11px] text-zinc-400 min-w-[32px] mt-0.5">{h.sec}</span>
                          <span className="text-zinc-600 leading-relaxed">{h.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Statutes */}
        <section className="mb-12">
          <h2 className="font-semibold text-[15px] text-zinc-800 mb-5">
            ⚡ Nigerian Statutes
          </h2>
          <div className="flex flex-col gap-3">
            {STATUTES.map((s) => (
              <div key={s.id} className="bg-white border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-xl flex-shrink-0">
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1.5">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{s.label}</span>
                    </div>
                    <h3 className="font-semibold text-[15px] text-zinc-900 mb-1.5">{s.title}</h3>
                    <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">{s.desc}</p>
                    <div className="flex flex-col gap-1.5">
                      {s.highlights.map((h) => (
                        <div key={h.sec} className="flex items-start gap-2.5 p-2 bg-zinc-50/60 rounded-lg text-[13px]">
                          <span className="font-semibold text-[11px] text-emerald-600 min-w-[56px] mt-0.5">{h.sec}</span>
                          <span className="text-zinc-600 leading-relaxed">{h.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="text-center p-4 border border-dashed border-zinc-200 rounded-2xl">
          <p className="text-[12px] text-zinc-400 leading-relaxed">
            All documents are sourced from official Nigerian legal texts and indexed in Upstash Vector.
          </p>
        </div>
      </div>
    </div>
  );
}
