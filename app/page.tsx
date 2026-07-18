'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp01Icon, InformationCircleIcon, Attachment01Icon, Delete02Icon } from 'hugeicons-react';
import ChatMessage, { type ChatMsg, type Source } from '@/components/ChatMessage';
import { useChat } from '@/context/ChatContext';

const SUGGESTIONS = [
  'What are my rights if police arrest me?',
  'Can my employer fire me without notice?',
  'Freedom of expression in Nigeria',
  'Right to remain silent when arrested',
  'Citizenship by birth requirements',
];

export default function HomePage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  
  const { activeThreadId, getActiveThread, createNewThread, syncThread, deleteThread, isLoaded } = useChat();
  const activeThread = getActiveThread();

  // Sync local messages state when switching threads
  useEffect(() => {
    if (activeThread) {
      setMessages(activeThread.messages);
    } else {
      setMessages([]);
    }
  }, [activeThreadId, activeThread]);

  const hasMessages = messages.length > 0;

  const handleDeleteChat = () => {
    if (activeThreadId && confirm('Are you sure you want to delete this chat?')) {
      deleteThread(activeThreadId);
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isStreaming) return;

    // Cancel previous
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInput('');
    setIsStreaming(true);

    // Add user message
    const userMsg: ChatMsg = { role: 'user', content: msg };
    const assistantMsg: ChatMsg = {
      role: 'assistant',
      content: '',
      sources: [],
      isStreaming: true,
      isSearching: true,
      isAnalyzing: false,
    };

    const newMessages = [...messages, userMsg, assistantMsg];
    setMessages(newMessages);

    let threadId = activeThreadId;
    if (!threadId) {
      threadId = createNewThread([userMsg, assistantMsg]);
    }

    try {
      // Build messages array for context
      const allMessages = [...messages.filter(m => m.role === 'user' || (m.role === 'assistant' && m.content)), userMsg]
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            last.content = `Error: ${data.error || 'Something went wrong'}`;
            last.isStreaming = false;
            last.isSearching = false;
            last.isAnalyzing = false;
          }
          if (threadId) syncThread(threadId, updated);
          return updated;
        });
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'sources') {
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const updated = prev.slice(0, -1);
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                  return [...updated, { ...last, sources: event.sources as Source[], isSearching: false, isAnalyzing: true }];
                }
                return prev;
              });
            } else if (event.type === 'status' && event.status === 'analyzing') {
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const updated = prev.slice(0, -1);
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                  return [...updated, { ...last, isSearching: false, isAnalyzing: true }];
                }
                return prev;
              });
            } else if (event.type === 'text') {
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const updated = prev.slice(0, -1);
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                  return [...updated, { ...last, content: last.content + event.content, isAnalyzing: false }];
                }
                return prev;
              });
            } else if (event.type === 'done') {
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const updated = prev.slice(0, -1);
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                  const finalMsgs = [...updated, { ...last, isStreaming: false, isSearching: false, isAnalyzing: false }];
                  if (threadId) syncThread(threadId, finalMsgs);
                  return finalMsgs;
                }
                return prev;
              });
            } else if (event.type === 'error') {
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const updated = prev.slice(0, -1);
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                  const finalMsgs = [...updated, { ...last, content: `Error: ${event.error}`, isStreaming: false, isSearching: false, isAnalyzing: false }];
                  if (threadId) syncThread(threadId, finalMsgs);
                  return finalMsgs;
                }
                return prev;
              });
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant') {
          last.content = 'Connection error. Please try again.';
          last.isStreaming = false;
          last.isSearching = false;
          last.isAnalyzing = false;
        }
        if (threadId) syncThread(threadId, updated);
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
      {/* Header bar with Delete Chat */}
      {hasMessages && (
        <div className="absolute top-4 md:top-6 right-4 md:right-8 z-20">
          <button
            onClick={handleDeleteChat}
            className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-zinc-400 hover:text-red-500 transition-colors bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-200/60 shadow-sm"
          >
            <Delete02Icon size={14} />
            Delete Chat
          </button>
        </div>
      )}

      {/* Scrollable content area */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-4 md:px-8 ${
          !hasMessages ? 'flex flex-col items-center justify-center pt-24 pb-20' : 'pt-20 pb-4'
        }`}
      >
        {/* Empty state — centered heading + input */}
        <AnimatePresence>
          {!hasMessages && (
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              className="text-[2rem] md:text-[2.5rem] text-center font-medium text-zinc-800 mb-8 md:mb-10 tracking-tight leading-tight px-2"
            >
              What legal question do you have?
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Input box — shown centered when no messages */}
        {!hasMessages && (
          <div className="w-full max-w-[760px]">
            <InputBox
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isStreaming={isStreaming}
              textareaRef={textareaRef}
            />

            {/* Suggestions */}
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-3 max-w-[700px] mx-auto">
              {SUGGESTIONS.map((pill) => (
                <button
                  key={pill}
                  onClick={() => handleSend(pill)}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-white border border-zinc-100 rounded-full text-[13px] md:text-sm text-zinc-600 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:bg-zinc-50 active:scale-95 whitespace-nowrap"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {hasMessages && (
          <div className="max-w-[760px] mx-auto flex flex-col gap-6">
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom input — shown at bottom when messages exist */}
      {hasMessages && (
        <div className="px-4 md:px-8 pb-8 pt-2 bg-gradient-to-t from-[#FCFCF9] via-[#FCFCF9] to-transparent">
          <div className="max-w-[760px] mx-auto">
            <InputBox
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isStreaming={isStreaming}
              textareaRef={textareaRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InputBox({
  input,
  setInput,
  onSubmit,
  isStreaming,
  textareaRef,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    
    // Server-side parsing for PDF and DOCX
    if (name.endsWith('.pdf') || name.endsWith('.docx')) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/api/parse-file', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok && data.text) {
          setInput(input + (input.trim() ? '\n\n' : '') + `--- Attached File: ${file.name} ---\n${data.text.slice(0, 5000)}${data.text.length > 5000 ? '\n...[truncated]' : ''}\n------------------------\n`);
        } else {
          alert(data.error || 'Failed to parse file');
        }
      } catch (err) {
        alert('Error connecting to parsing server');
      }
    } else {
      // Local parsing for text-based files
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setInput(input + (input.trim() ? '\n\n' : '') + `--- Attached File: ${file.name} ---\n${text.slice(0, 5000)}${text.length > 5000 ? '\n...[truncated]' : ''}\n------------------------\n`);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = ''; // Reset
  };

  return (
    <div className="w-full bg-white rounded-[20px] md:rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-zinc-100 overflow-hidden flex flex-col transition-shadow focus-within:shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
      <form onSubmit={onSubmit} className="flex flex-col w-full">
        <div className="p-3 md:p-4 flex flex-col gap-3 md:gap-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            placeholder="Ask SabiLex anything..."
            className="w-full resize-none outline-none text-[1.05rem] md:text-[1.1rem] text-zinc-700 placeholder:text-zinc-400 bg-transparent min-h-[56px] md:min-h-[64px] max-h-[160px]"
            rows={2}
          />
          <div className="flex justify-between items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.md,.csv,.json,.pdf,.docx"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-[13px] md:text-sm text-zinc-700 font-medium transition-colors border border-zinc-200/60"
            >
              <Attachment01Icon size={16} className="text-zinc-500" />
              Attach file
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#E8E4D9] hover:bg-[#DCD7C8] flex items-center justify-center transition-colors shadow-sm flex-shrink-0 disabled:opacity-50"
            >
              {isStreaming ? (
                <div className="w-4 h-4 border-2 border-zinc-700/30 border-t-zinc-700 rounded-full animate-spin" />
              ) : (
                <ArrowUp01Icon size={18} className="text-zinc-700 md:w-5 md:h-5" />
              )}
            </button>
          </div>
        </div>
        {/* Input Footer */}
        <div className="bg-[#FAF9F6] px-4 md:px-5 py-2.5 md:py-3 border-t border-zinc-100 flex justify-center text-[11px] md:text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 md:gap-2">
            <InformationCircleIcon size={14} className="flex-shrink-0" />
            <span className="truncate">Grounded in Nigerian constitutional and statutory law</span>
          </div>
        </div>
      </form>
    </div>
  );
}
