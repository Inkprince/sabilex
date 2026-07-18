'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp01Icon, InformationCircleIcon, Search01Icon } from 'hugeicons-react';
import Link from 'next/link';

type SearchResult = {
  id: string;
  title: string;
  source: string;
  chapter: string;
  category: string;
  sections: string;
  snippet: string;
  score: number;
};

const SUGGESTIONS = [
  'Right to remain silent',
  'Freedom of expression',
  'Wrongful dismissal',
  'Citizenship by birth',
  'Police arrest rights',
];

function highlightTerms(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    i % 2 !== 0 ? <mark key={i} className="bg-yellow-100 text-zinc-900 px-0.5 rounded-sm">{part}</mark> : part
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (text?: string) => {
    const q = (text ?? query).trim();
    if (!q || isLoading) return;
    if (text) setQuery(text);

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Search failed (${res.status})`);
        setResults([]);
      } else {
        setResults(data.results ?? []);
      }
    } catch {
      setError('Network error — please check your connection.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className={`flex-1 flex flex-col items-center px-4 md:px-8 pt-24 pb-20 overflow-y-auto w-full ${!hasSearched ? 'justify-center' : ''}`}>
      <AnimatePresence>
        {!hasSearched && (
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            className="text-[2rem] md:text-[2.5rem] text-center font-medium text-zinc-800 mb-8 md:mb-10 tracking-tight leading-tight px-2"
          >
            Search Nigerian law
          </motion.h1>
        )}
      </AnimatePresence>

      <motion.div layout className="w-full max-w-[760px] flex flex-col items-center">
        {/* Search input */}
        <div className="w-full bg-white rounded-[20px] md:rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-zinc-100 overflow-hidden flex flex-col transition-shadow focus-within:shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            <div className="p-3 md:p-4 flex flex-col gap-3 md:gap-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Search for constitutional provisions, rights, statutes..."
                className="w-full resize-none outline-none text-[1.05rem] md:text-[1.1rem] text-zinc-700 placeholder:text-zinc-400 bg-transparent min-h-[48px] md:min-h-[56px]"
                rows={1}
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-zinc-50 rounded-full text-[13px] md:text-sm text-zinc-500 font-medium border border-zinc-200/60 cursor-default">
                  <Search01Icon size={16} />
                  Upstash Vector Search
                </div>
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#E8E4D9] hover:bg-[#DCD7C8] flex items-center justify-center transition-colors shadow-sm flex-shrink-0 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-zinc-700/30 border-t-zinc-700 rounded-full animate-spin" />
                  ) : (
                    <ArrowUp01Icon size={18} className="text-zinc-700" />
                  )}
                </button>
              </div>
            </div>
            <div className="bg-[#FAF9F6] px-4 md:px-5 py-2.5 md:py-3 border-t border-zinc-100 flex justify-between items-center text-[11px] md:text-xs text-zinc-500">
              <div className="flex items-center gap-1.5 md:gap-2">
                <InformationCircleIcon size={14} className="flex-shrink-0" />
                <span className="truncate">Direct semantic search — no AI processing</span>
              </div>
              <Link href="/" className="font-medium text-zinc-700 hover:text-black transition-colors">
                Try AI Advisor →
              </Link>
            </div>
          </form>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {!hasSearched && (
            <motion.div
              exit={{ opacity: 0, height: 0, margin: 0, transition: { duration: 0.2 } }}
              className="mt-6 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-3"
            >
              {SUGGESTIONS.map((pill) => (
                <button
                  key={pill}
                  onClick={() => handleSearch(pill)}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-white border border-zinc-100 rounded-full text-[13px] md:text-sm text-zinc-600 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:bg-zinc-50 active:scale-95 whitespace-nowrap"
                >
                  {pill}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-6"
          >
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl p-4 mb-4">
                <p className="font-medium text-sm flex items-center gap-2">
                  <InformationCircleIcon size={16} />
                  {error}
                </p>
              </div>
            )}

            {!isLoading && !error && results.length === 0 && (
              <div className="text-center py-16 border border-dashed border-zinc-200 rounded-2xl">
                <p className="text-3xl mb-3">🔎</p>
                <p className="text-zinc-700 font-medium mb-1">No results found</p>
                <p className="text-zinc-400 text-sm">
                  Try different keywords, or <Link href="/" className="text-zinc-700 underline">ask the AI Advisor</Link>
                </p>
              </div>
            )}

            {!isLoading && !error && results.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center px-1 mb-1">
                  <p className="text-[13px] font-medium text-zinc-600">{results.length} results</p>
                  <p className="text-[11px] text-zinc-400">Ranked by semantic relevance</p>
                </div>
                {results.map((r, i) => (
                  <div
                    key={r.id}
                    className="bg-white border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl p-4 md:p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            r.category === 'constitution' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {r.category === 'constitution' ? '📜 Constitution' : '⚡ Statute'}
                          </span>
                          {r.chapter && <span className="text-[11px] text-zinc-400">{r.chapter}</span>}
                        </div>
                        <h3 className="font-semibold text-[15px] text-zinc-900 leading-snug">{r.title}</h3>
                      </div>
                      <span className="text-[11px] font-medium text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg flex-shrink-0">
                        #{i + 1}
                      </span>
                    </div>

                    <p className="text-[12px] text-zinc-400 italic mb-3">
                      {r.source}{r.sections && <span> · {r.sections}</span>}
                    </p>

                    <div className="h-px bg-zinc-100 mb-3" />

                    <p className="text-[13px] text-zinc-600 leading-relaxed">
                      {highlightTerms(r.snippet.slice(0, 300) + (r.snippet.length > 300 ? '…' : ''), query)}
                    </p>

                    {/* Score bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-zinc-100 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-zinc-400 h-full rounded-full transition-all"
                          style={{ width: `${Math.round(r.score * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-zinc-400">{Math.round(r.score * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
