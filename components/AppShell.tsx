'use client';

import { useState } from 'react';
import {
  Search01Icon,
  Book02Icon,
  AiChat02Icon,
  Menu01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Message02Icon,
  Add01Icon,
  SparklesIcon,
} from 'hugeicons-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useChat } from '@/context/ChatContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { threads, activeThreadId, setActiveThreadId } = useChat();

  const navItems = [
    { icon: AiChat02Icon, label: 'AI Advisor', href: '/' },
    { icon: Search01Icon, label: 'Search', href: '/search' },
    { icon: Book02Icon, label: 'Browse Law', href: '/constitution' },
  ];

  return (
    <div className="h-screen w-full bg-[#FCFCF9] flex font-sans overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full h-full flex relative"
      >
        {/* Mobile Menu Overlay */}
        {isMobileOpen && (
          <div
            className="absolute inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            absolute md:relative z-50 h-full bg-[#FCFCF9] flex flex-col py-6 border-r border-zinc-100 transition-all duration-300 ease-in-out flex-shrink-0
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${isSidebarExpanded ? 'w-[220px] px-6' : 'w-[80px] px-0 items-center'}
          `}
        >
          {/* Desktop Expand/Collapse Toggle */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden md:flex absolute -right-3.5 top-8 bg-white border border-zinc-200 rounded-full p-1 shadow-sm hover:bg-zinc-50 z-50 text-zinc-400 hover:text-black transition-colors"
          >
            {isSidebarExpanded ? <ArrowLeft02Icon size={16} /> : <ArrowRight02Icon size={16} />}
          </button>

          {/* Logo & New Chat */}
          <div className={`flex flex-col gap-6 mb-8 ${isSidebarExpanded ? 'w-full px-2' : 'items-center'}`}>
            <div className={`flex items-center gap-3 ${isSidebarExpanded ? 'w-full' : 'justify-center'}`}>
              <div className="bg-black text-white p-2.5 rounded-[14px] shadow-sm flex-shrink-0">
                <SparklesIcon size={20} fill="white" />
              </div>
              {isSidebarExpanded && <span className="font-semibold text-lg text-zinc-800">SabiLex</span>}
            </div>

            {/* New Chat Button */}
            <button
              onClick={() => {
                setActiveThreadId(null);
                if (pathname !== '/') router.push('/');
                setIsMobileOpen(false);
              }}
              className={`flex items-center gap-3 bg-white border border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300 transition-all rounded-xl py-2 ${isSidebarExpanded ? 'px-3 w-full justify-start' : 'w-10 justify-center'} text-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.02)] group`}
            >
              <Add01Icon size={18} className="text-zinc-500 group-hover:text-black transition-colors flex-shrink-0" />
              {isSidebarExpanded && <span className="text-[14px] font-medium">New Chat</span>}
            </button>
          </div>

          {/* Nav Icons */}
          <div className="flex flex-col gap-6 w-full">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href && (item.href !== '/' || activeThreadId === null);
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => {
                    if (item.href === '/') setActiveThreadId(null);
                    setIsMobileOpen(false);
                  }}
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${
                    isSidebarExpanded ? 'w-full px-2' : 'justify-center'
                  } ${isActive ? 'text-black' : 'text-zinc-400 hover:text-black'}`}
                >
                  <item.icon size={22} className="flex-shrink-0" />
                  {isSidebarExpanded && <span className={`font-medium text-[15px] ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Recent History */}
          <div className="flex-1 overflow-y-auto w-full mt-8 no-scrollbar">
            {isSidebarExpanded && threads.length > 0 && (
              <div className="px-2 mb-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Recent</span>
              </div>
            )}
            <div className="flex flex-col gap-1 w-full">
              {threads.map(thread => {
                const isActive = pathname === '/' && activeThreadId === thread.id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      if (pathname !== '/') router.push('/');
                      setIsMobileOpen(false);
                    }}
                    className={`flex items-center gap-4 py-2 cursor-pointer transition-all ${
                      isSidebarExpanded ? 'w-full px-2 rounded-lg' : 'justify-center'
                    } ${isActive ? (isSidebarExpanded ? 'bg-zinc-100 text-black' : 'text-black') : 'text-zinc-500 hover:text-black hover:bg-zinc-50/50'}`}
                  >
                    <Message02Icon size={18} className="flex-shrink-0" />
                    {isSidebarExpanded && (
                      <span className={`text-[13px] truncate ${isActive ? 'font-medium' : ''}`}>
                        {thread.title}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User */}
          <div className={`mt-auto flex items-center gap-3 ${isSidebarExpanded ? 'w-full px-2' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-sm ring-2 ring-transparent hover:ring-zinc-200 transition-all cursor-pointer flex-shrink-0">
              S
            </div>
            {isSidebarExpanded && (
              <div className="flex flex-col">
                <span className="font-medium text-sm text-zinc-800 leading-tight">SabiLex</span>
                <span className="text-xs text-zinc-400">Hackathon Demo</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 md:px-8 py-4 md:py-6 z-10 bg-gradient-to-b from-[#FCFCF9] via-[#FCFCF9] to-transparent">
            {/* Mobile menu button */}
            <div className="flex-1 flex md:hidden">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 -ml-2 text-zinc-600 hover:text-black bg-white/50 backdrop-blur-sm rounded-full"
              >
                <Menu01Icon size={24} />
              </button>
            </div>
            <div className="hidden md:block flex-1" />

            {/* Pro Banner */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="bg-white border border-zinc-100 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-zinc-700 cursor-default whitespace-nowrap">
                <SparklesIcon size={16} />
                <span>AI-powered Nigerian legal assistant</span>
              </div>
            </div>

            {/* Empty space to balance flex layout since auth is removed */}
            <div className="flex-1" />
          </div>

          {/* Center Stage */}
          {children}

          {/* Footer */}
          <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-6 text-[12px] md:text-[13px] text-zinc-400 bg-gradient-to-t from-[#FCFCF9] to-transparent pt-4 pb-2 pointer-events-none">
            <span className="pointer-events-auto hover:text-zinc-600 transition-colors">SabiLex ⚖️ Not legal advice</span>
            <span className="pointer-events-auto hover:text-zinc-600 transition-colors">Privacy Policy</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
