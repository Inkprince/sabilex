'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ChatMsg } from '@/components/ChatMessage';

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMsg[];
};

type ChatContextType = {
  threads: ChatThread[];
  activeThreadId: string | null;
  isLoaded: boolean;
  setActiveThreadId: (id: string | null) => void;
  createNewThread: (initialMessages: ChatMsg[]) => string;
  addMessage: (threadId: string, message: ChatMsg) => void;
  updateMessage: (threadId: string, messageIndex: number, updater: (msg: ChatMsg) => ChatMsg) => void;
  syncThread: (threadId: string, messages: ChatMsg[]) => void;
  deleteThread: (id: string) => void;
  clearAll: () => void;
  getActiveThread: () => ChatThread | undefined;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sabilex_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        setThreads(parsed);
        // Clean up any streaming states from previous sessions
        setThreads(parsed.map((t: ChatThread) => ({
          ...t,
          messages: t.messages.map(m => ({
            ...m,
            isStreaming: false,
            isSearching: false,
            isAnalyzing: false,
          }))
        })));
        
        const lastActive = localStorage.getItem('sabilex_active_thread');
        if (lastActive && parsed.find((t: ChatThread) => t.id === lastActive)) {
          setActiveThreadId(lastActive);
        } else if (parsed.length > 0) {
          // Default to most recent
          setActiveThreadId(parsed.sort((a: ChatThread, b: ChatThread) => b.updatedAt - a.updatedAt)[0].id);
        }
      } else {
        // Fallback for previous single-chat history format
        const legacy = localStorage.getItem('sabilex_chat_history');
        if (legacy) {
          const parsedMsgs = JSON.parse(legacy);
          if (parsedMsgs.length > 0) {
            const newThread = {
              id: Date.now().toString(),
              title: parsedMsgs[0]?.content?.slice(0, 30) + '...' || 'New Chat',
              updatedAt: Date.now(),
              messages: parsedMsgs,
            };
            setThreads([newThread]);
            setActiveThreadId(newThread.id);
            localStorage.removeItem('sabilex_chat_history');
          }
        }
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when threads change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sabilex_threads', JSON.stringify(threads));
      if (activeThreadId) {
        localStorage.setItem('sabilex_active_thread', activeThreadId);
      } else {
        localStorage.removeItem('sabilex_active_thread');
      }
    }
  }, [threads, activeThreadId, isLoaded]);

  const createNewThread = useCallback((initialMessages: ChatMsg[]) => {
    const id = Date.now().toString();
    const titleMsg = initialMessages.find(m => m.role === 'user')?.content || 'New Chat';
    const newThread: ChatThread = {
      id,
      title: titleMsg.slice(0, 40) + (titleMsg.length > 40 ? '...' : ''),
      updatedAt: Date.now(),
      messages: initialMessages,
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(id);
    return id;
  }, []);

  const addMessage = useCallback((threadId: string, message: ChatMsg) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          updatedAt: Date.now(),
          messages: [...t.messages, message],
        };
      }
      return t;
    }));
  }, []);

  const updateMessage = useCallback((threadId: string, messageIndex: number, updater: (msg: ChatMsg) => ChatMsg) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const newMessages = [...t.messages];
        if (newMessages[messageIndex]) {
          newMessages[messageIndex] = updater(newMessages[messageIndex]);
        }
        return {
          ...t,
          updatedAt: Date.now(),
          messages: newMessages,
        };
      }
      return t;
    }));
  }, []);

  const syncThread = useCallback((threadId: string, messages: ChatMsg[]) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          updatedAt: Date.now(),
          messages,
        };
      }
      return t;
    }));
  }, []);

  const deleteThread = useCallback((id: string) => {
    setThreads(prev => prev.filter(t => t.id !== id));
    if (activeThreadId === id) {
      setActiveThreadId(null);
    }
  }, [activeThreadId]);

  const clearAll = useCallback(() => {
    setThreads([]);
    setActiveThreadId(null);
    localStorage.removeItem('sabilex_threads');
    localStorage.removeItem('sabilex_active_thread');
  }, []);

  const getActiveThread = useCallback(() => {
    return threads.find(t => t.id === activeThreadId);
  }, [threads, activeThreadId]);

  return (
    <ChatContext.Provider value={{
      threads,
      activeThreadId,
      isLoaded,
      setActiveThreadId,
      createNewThread,
      addMessage,
      updateMessage,
      syncThread,
      deleteThread,
      clearAll,
      getActiveThread,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
