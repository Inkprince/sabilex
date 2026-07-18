'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown01Icon, ArrowUp01Icon, SparklesIcon, Search01Icon, CheckmarkCircle02Icon } from 'hugeicons-react';

export type Source = {
  id: string;
  title: string;
  source: string;
  chapter: string;
  sections: string;
  snippet: string;
  category: string;
  score: number;
};

export type ChatMsg = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
  isSearching?: boolean;
  isAnalyzing?: boolean;
};

import ReactMarkdown from 'react-markdown';

function MarkdownRenderer({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        h2: ({ ...props }) => <h2 className="text-[15px] font-semibold text-zinc-800 mt-5 mb-2 flex items-center gap-2" {...props} />,
        h3: ({ ...props }) => <h3 className="text-[14px] font-semibold text-zinc-800 mt-4 mb-2" {...props} />,
        p: ({ ...props }) => <p className="text-zinc-700 text-[14px] leading-relaxed my-2" {...props} />,
        strong: ({ ...props }) => <strong className="font-semibold text-zinc-900" {...props} />,
        em: ({ ...props }) => <em className="text-zinc-600 italic" {...props} />,
        blockquote: ({ ...props }) => <blockquote className="border-l-2 border-zinc-300 my-2 py-1 pl-3 text-zinc-600 italic text-[14px] leading-relaxed bg-zinc-50/50 rounded-r-lg" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc pl-5 my-2 text-zinc-700 text-[14px] leading-relaxed space-y-1" {...props} />,
        ol: ({ ...props }) => <ol className="list-decimal pl-5 my-2 text-zinc-700 text-[14px] leading-relaxed space-y-1" {...props} />,
        li: ({ ...props }) => <li className="" {...props} />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function SourcesCollapsible({ sources }: { sources: Source[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources.length) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-700 transition-colors group"
      >
        <div className="w-5 h-5 rounded-md bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
          <Search01Icon size={12} />
        </div>
        <span>{sources.length} sources found</span>
        {isOpen ? <ArrowUp01Icon size={14} /> : <ArrowDown01Icon size={14} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex flex-col gap-1.5">
              {sources.map((s, i) => (
                <div key={s.id} className="flex items-start gap-3 p-2.5 bg-zinc-50/80 rounded-xl border border-zinc-100/80 text-[13px]">
                  <span className="text-zinc-400 font-medium min-w-[18px] mt-0.5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-700 truncate">{s.title}</p>
                    <p className="text-zinc-400 text-[11px] mt-0.5 truncate">{s.source} {s.sections && `· ${s.sections}`}</p>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                    {Math.round(s.score * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReasoningSteps({ msg }: { msg: ChatMsg }) {
  return (
    <div className="flex flex-col gap-2 mb-3">
      {/* Step 1: Searching */}
      <div className="flex items-center gap-2.5 text-[13px]">
        {msg.isSearching ? (
          <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin flex-shrink-0" />
        ) : (
          <CheckmarkCircle02Icon size={16} className="text-emerald-500 flex-shrink-0" />
        )}
        <span className={msg.isSearching ? 'text-zinc-600' : 'text-zinc-400'}>
          Searching Nigerian legal database...
        </span>
      </div>

      {/* Step 2: Analyzing */}
      {(msg.isAnalyzing || msg.content || (!msg.isSearching && msg.sources)) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 text-[13px]"
        >
          {msg.isAnalyzing && !msg.content ? (
            <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin flex-shrink-0" />
          ) : msg.content ? (
            <CheckmarkCircle02Icon size={16} className="text-emerald-500 flex-shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-zinc-200 flex-shrink-0" />
          )}
          <span className={msg.isAnalyzing && !msg.content ? 'text-zinc-600' : msg.content ? 'text-zinc-400' : 'text-zinc-300'}>
            Analyzing your constitutional rights...
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default function ChatMessage({ msg }: { msg: ChatMsg }) {
  if (msg.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] md:max-w-[70%] bg-zinc-100 rounded-[20px] rounded-br-[6px] px-4 py-3 text-[15px] text-zinc-800 leading-relaxed">
          {msg.content}
        </div>
      </motion.div>
    );
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 items-start"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-[10px] bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
        <SparklesIcon size={14} className="text-white" fill="white" />
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 max-w-full overflow-hidden">
        {/* Reasoning Steps */}
        {(msg.isSearching || msg.isAnalyzing || msg.isStreaming) && (
          <ReasoningSteps msg={msg} />
        )}

        {/* Sources */}
        {msg.sources && msg.sources.length > 0 && !msg.isSearching && (
          <SourcesCollapsible sources={msg.sources} />
        )}

        {/* Response text */}
        {msg.content && (
          <div className="bg-white rounded-2xl rounded-tl-[6px] border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] px-4 py-3.5">
            <MarkdownRenderer text={msg.content} />
            {msg.isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="inline-block w-1.5 h-4 bg-zinc-400 ml-0.5 align-middle rounded-sm"
              />
            )}
          </div>
        )}

        {/* Loading state before any text */}
        {!msg.content && (msg.isSearching || msg.isAnalyzing) && (
          <div className="h-4" />
        )}
      </div>
    </motion.div>
  );
}
