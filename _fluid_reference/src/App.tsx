/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Sparkles,
  Home,
  SquareDashed,
  Wand2,
  Clock,
  Files,
  Calendar,
  Paperclip,
  ArrowUp,
  Info,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home' },
    { icon: SquareDashed, label: 'Templates' },
    { icon: Wand2, label: 'AI Tools' },
    { icon: Clock, label: 'History' },
    { icon: Files, label: 'Files' },
    { icon: Calendar, label: 'Calendar' },
  ];

  return (
    <div className="h-screen w-full bg-[#FCFCF9] flex font-sans overflow-hidden">
      {/* Main App Container */}
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
            {isSidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Logo */}
          <div className={`flex items-center gap-3 mb-12 ${isSidebarExpanded ? 'w-full' : 'justify-center'}`}>
            <div className="bg-black text-white p-2.5 rounded-[14px] shadow-sm flex-shrink-0">
              <Sparkles size={20} fill="white" />
            </div>
            {isSidebarExpanded && <span className="font-semibold text-lg text-zinc-800">Fluid</span>}
          </div>

          {/* Nav Icons */}
          <div className="flex flex-col gap-6 w-full">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 text-zinc-400 hover:text-black cursor-pointer transition-colors ${
                  isSidebarExpanded ? 'w-full px-2' : 'justify-center'
                }`}
              >
                <item.icon size={22} className="flex-shrink-0" />
                {isSidebarExpanded && <span className="font-medium text-[15px]">{item.label}</span>}
              </div>
            ))}
          </div>

          {/* User */}
          <div className={`mt-auto flex items-center gap-3 ${isSidebarExpanded ? 'w-full px-2' : 'justify-center'}`}>
            <img
              src="https://i.pravatar.cc/150?img=11"
              alt="User"
              className="w-8 h-8 rounded-full grayscale opacity-80 hover:opacity-100 transition-opacity cursor-pointer ring-2 ring-transparent hover:ring-zinc-200 flex-shrink-0"
            />
            {isSidebarExpanded && (
              <div className="flex flex-col">
                <span className="font-medium text-sm text-zinc-800 leading-tight">Jane Doe</span>
                <span className="text-xs text-zinc-400">Pro Plan</span>
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
                <Menu size={24} />
              </button>
            </div>
            <div className="hidden md:block flex-1" />

            {/* Pro Banner - hidden on smaller screens */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="bg-white border border-zinc-100 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-zinc-700 cursor-default whitespace-nowrap">
                <Sparkles size={16} />
                <span>Subscribe to a Pro plan for increased message limits</span>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex-1 flex justify-end gap-2 md:gap-3">
              <button className="bg-black text-white px-4 md:px-5 py-2 rounded-full text-[13px] md:text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm">
                Register
              </button>
              <button className="bg-zinc-100/80 hover:bg-zinc-200 text-black px-4 md:px-5 py-2 rounded-full text-[13px] md:text-sm font-medium transition-colors shadow-sm">
                Login
              </button>
            </div>
          </div>

          {/* Center Stage (Scrollable) */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 pt-24 pb-20 overflow-y-auto w-full">
            <h1 className="text-[2rem] md:text-[2.5rem] text-center font-medium text-zinc-800 mb-8 md:mb-10 tracking-tight leading-tight px-2">
              What would you like to create?
            </h1>

            {/* Input Box */}
            <div className="w-full max-w-[760px] bg-white rounded-[20px] md:rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-zinc-100 overflow-hidden flex flex-col transition-shadow focus-within:shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
              <div className="p-3 md:p-4 flex flex-col gap-3 md:gap-4">
                <textarea
                  placeholder="Ask Fluid anything..."
                  className="w-full resize-none outline-none text-[1.05rem] md:text-[1.1rem] text-zinc-700 placeholder:text-zinc-400 bg-transparent min-h-[56px] md:min-h-[64px]"
                  rows={2}
                />
                <div className="flex justify-between items-center">
                  <button className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-[13px] md:text-sm text-zinc-700 font-medium transition-colors border border-zinc-200/60">
                    <Paperclip size={16} className="text-zinc-500" />
                    Attach file
                  </button>
                  <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#E8E4D9] hover:bg-[#DCD7C8] flex items-center justify-center transition-colors shadow-sm flex-shrink-0">
                    <ArrowUp size={18} className="text-zinc-700 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
              {/* Input Footer */}
              <div className="bg-[#FAF9F6] px-4 md:px-5 py-2.5 md:py-3 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-[11px] md:text-xs text-zinc-500">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Info size={14} className="flex-shrink-0" />
                  <span className="truncate">Subscribe to a Pro plan for increased limits</span>
                </div>
                <button className="font-medium text-zinc-700 flex items-center gap-1.5 hover:text-black transition-colors ml-5 sm:ml-0">
                  <span className="w-1.5 h-1.5 rounded-full border border-current opacity-60 inline-block" />
                  Join Fluid Pro
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-3 max-w-[700px]">
              <Suggestion pill="Generate a blog UI" />
              <Suggestion pill="Rewrite my Linkedin bio" />
              <Suggestion pill="Create a slideshow" />
              <Suggestion pill="Synthesise an excel document" />
              <Suggestion pill="Find me the average cost" />
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-6 text-[12px] md:text-[13px] text-zinc-400 bg-gradient-to-t from-[#FCFCF9] to-transparent pt-4 pb-2">
            <a href="#" className="hover:text-zinc-600 transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Suggestion({ pill }: { pill: string }) {
  return (
    <button className="px-4 py-2 md:px-5 md:py-2.5 bg-white border border-zinc-100 rounded-full text-[13px] md:text-sm text-zinc-600 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:bg-zinc-50 active:scale-95 whitespace-nowrap">
      {pill}
    </button>
  );
}
