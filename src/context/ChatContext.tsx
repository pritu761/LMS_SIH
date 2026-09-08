'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MockCourse } from '@/lib/mockData';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  matchedCourses?: MockCourse[];
  suggestedQueries?: string[];
  intent?: string;
  source?: 'rules' | 'groq';
  model?: string;
}

interface ChatContextType {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  modelPref: string;
  setModelPref: (m: string) => void;
  openChat: (initialQuery?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
  toggleMinimize: () => void;
  toggleMaximize: () => void;
  sendMessage: (text: string) => Promise<void>;
  regenerate: () => Promise<void>;
  clearChat: () => void;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-init-1',
  role: 'assistant',
  content: `👋 **Welcome to Capacity Connect AI Course Navigator!**

I can help you search, compare, and discover specialized meteorological modules across **DRSTC, FTC, IMTC, and Modular AI** tracks.

Try asking:
- *"Find courses on Doppler Weather Radar & Cyclone Nowcasting"*
- *"Show HPC and Earth-System Modelling modules"*
- *"What courses does Prof. Vikramaditya Sen teach?"*
- *"Show short masterclasses under 15 hours"*`,
  timestamp: 'Just now',
  suggestedQueries: [
    'Find Doppler Radar courses',
    'Earth-System HPC Modelling on Pratyush',
    'AI/ML Precipitation Nowcasting',
    'Synoptic Meteorology & INSAT-3DS',
  ],
};

const CHAT_STORAGE_KEY = 'capacity-connect-chat-v1';
const MODEL_STORAGE_KEY = 'capacity-connect-chat-model';
export const GROQ_MODEL_OPTIONS = [
  { id: 'auto', label: 'Auto (120B → 20B)' },
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B • Best quality' },
  { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B • Fastest' },
];

function loadStoredMessages(): ChatMessage[] | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    // Validate minimal shape; drop course payloads that fail validation
    return parsed.filter(
      (m: any) => m && typeof m.id === 'string' && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    );
  } catch {
    return null;
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages() || [INITIAL_GREETING]);
  const [modelPref, setModelPrefState] = useState<string>(() => {
    try {
      return localStorage.getItem(MODEL_STORAGE_KEY) || 'auto';
    } catch {
      return 'auto';
    }
  });
  const modelPrefRef = React.useRef(modelPref);
  modelPrefRef.current = modelPref;
  const openRef = React.useRef(isOpen);
  openRef.current = isOpen;
  const minimizedRef = React.useRef(isMinimized);
  minimizedRef.current = isMinimized;

  const setModelPref = useCallback((m: string) => {
    setModelPrefState(m);
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, m);
    } catch { /* private mode */ }
  }, []);

  // Persist conversation across reloads (cap at 50 messages)
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch { /* quota/private mode */ }
  }, [messages]);

  const openChat = useCallback((initialQuery?: string) => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);

    if (initialQuery && initialQuery.trim()) {
      setTimeout(() => {
        handleSendMessage(initialQuery);
      }, 100);
    }
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMaximized(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setUnreadCount(0);
        setIsMinimized(false);
      }
      return !prev;
    });
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const toggleMaximize = useCallback(() => {
    setIsMaximized((prev) => !prev);
  }, []);

  const requestReply = async (userText: string, history: ChatMessage[]): Promise<ChatMessage> => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        model: modelPrefRef.current && modelPrefRef.current !== 'auto' ? modelPrefRef.current : undefined,
      }),
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned status ${response.status}`);
    }

    if (!response.ok || !data?.success) {
      throw new Error(data?.error || `Server returned error ${response.status}`);
    }

    const assistantData = data.data;
    return {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: assistantData?.reply || 'Received response with no content.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      matchedCourses: assistantData?.matchedCourses || [],
      suggestedQueries: assistantData?.suggestedQueries || [],
      intent: assistantData?.intent,
      source: assistantData?.source || 'rules',
      model: assistantData?.model,
    };
  };

  const appendAssistantOrError = (assistantMessage: ChatMessage) => {
    setMessages((prev) => [...prev, assistantMessage]);
    if (!openRef.current || minimizedRef.current) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  const errorMessage = (err: any): ChatMessage => ({
    id: `err-${Date.now()}`,
    role: 'assistant',
    content: `⚠️ *Unable to connect to course indexing service (${err?.message || 'Network error'}). Please try again.*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedQueries: ['Show all courses', 'Search Radar courses'],
  });

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const historySnapshot = messages;
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      appendAssistantOrError(await requestReply(trimmed, historySnapshot));
    } catch (err: any) {
      console.error('Chat error:', err);
      appendAssistantOrError(errorMessage(err));
    } finally {
      setIsTyping(false);
    }
  };

  /** Re-run the last user question without duplicating its bubble. */
  const regenerate = async () => {
    if (isTyping) return;
    const lastUserIdx = [...messages].map((m) => m.role).lastIndexOf('user');
    if (lastUserIdx === -1) return;
    const lastUser = messages[lastUserIdx];
    const historySnapshot = messages.slice(0, lastUserIdx + 1);
    setMessages(historySnapshot);
    setIsTyping(true);
    try {
      appendAssistantOrError(await requestReply(lastUser.content, messages.slice(0, lastUserIdx)));
    } catch (err: any) {
      console.error('Chat regenerate error:', err);
      appendAssistantOrError(errorMessage(err));
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = useCallback(() => {
    setMessages([INITIAL_GREETING]);
    setUnreadCount(0);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        isMinimized,
        isMaximized,
        isTyping,
        messages,
        modelPref,
        setModelPref,
        openChat,
        closeChat,
        toggleChat,
        toggleMinimize,
        toggleMaximize,
        sendMessage: handleSendMessage,
        regenerate,
        clearChat,
        unreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useCourseChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useCourseChat must be used within a ChatProvider');
  }
  return context;
}
