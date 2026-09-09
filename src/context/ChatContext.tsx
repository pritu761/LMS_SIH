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
  source?: 'rules' | 'groq' | 'rag' | 'structured' | 'extractive' | 'fallback' | 'guardrail';
  model?: string;
  /** Retrieved citation chunks behind a RAG answer. */
  sources?: Array<{ source: string; section: string | null }>;
  /** Normalized retrieval confidence 0..1 (1 = deterministic answer). */
  confidence?: number;
  /** True when answering in limited mode (extractive / fallback / guardrail). */
  degraded?: boolean;
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
  content: `**Welcome to your Course Navigator!**

I answer from the live curriculum, WMO rubrics and portal policies — with cited sources. I can also pull **your own** progress, cohort or governance facts for your role.

Try asking:
- *"What modules do I need to complete before Velocity Dealiasing?"*
- *"Show my weakest competency domain and suggest next steps"*
- *"When is my next exam?"*
- *"What is the passing threshold for IMTC certification?"*`,
  timestamp: 'Just now',
  suggestedQueries: [
    'What modules do I need to complete before Velocity Dealiasing?',
    'Show my weakest competency domain and suggest next steps',
    'When is my next exam?',
    'What is the passing threshold for IMTC certification?',
  ],
};

const ROLE_SUGGESTIONS: Record<string, string[]> = {
  TRAINEE: [
    'What modules do I need to complete before Velocity Dealiasing?',
    'Show my weakest competency domain and suggest next steps',
    'When is my next exam?',
    'What is the passing threshold for IMTC certification?',
  ],
  TRAINER: [
    'Which trainees in cohort DRSTC-04 scored below 60% in NWP?',
    'Generate a 5-question quiz on dual-pol interpretation (Medium difficulty)',
    'What is the passing threshold for assessments?',
  ],
  ADMIN: [
    'List all stations with readiness below 70% this quarter',
    'How many certificates were issued in August?',
    'Show pending approvals older than 48 hours',
  ],
};

function followUpsFor(role: string): string[] {
  return ROLE_SUGGESTIONS[role] ?? ROLE_SUGGESTIONS['TRAINEE'];
}

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
  // Best-effort role for contextual follow-ups (guests keep defaults).
  const [userRole, setUserRole] = useState<string>('TRAINEE');
  const userRoleRef = React.useRef(userRole);
  userRoleRef.current = userRole;
  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (r) => {
        if (!r.ok) return;
        const d = (await r.json()) as { user?: { role?: string } };
        if (d.user?.role) {
          setUserRole(d.user.role);
          setMessages((prev) => {
            if (prev.length === 1 && prev[0].id === 'msg-init-1') {
              return [{ ...prev[0], suggestedQueries: followUpsFor(d.user?.role ?? 'TRAINEE') }];
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);
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
    // RAG backend (Phase 3.1): role-aware retrieval + grounded generation.
    const response = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        history: history.slice(-6).map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })),
        model: modelPrefRef.current && modelPrefRef.current !== 'auto' ? modelPrefRef.current : undefined,
      }),
    });

    let data: {
      success?: boolean;
      error?: { code?: string; message?: string } | string;
      data?: {
        answer?: string;
        sources?: Array<{ source: string; section: string | null }>;
        confidence?: number;
        degraded?: boolean;
        model?: string;
        blocked?: boolean;
      };
    };
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned status ${response.status}`);
    }

    if (response.status === 401) {
      return {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: 'Please **sign in** with your official Gov ID to use the Course Navigator — it answers from your own progress and role.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQueries: ['What is the passing threshold for IMTC certification?'],
        source: 'guardrail',
        degraded: true,
      };
    }

    if (!response.ok || !data?.success) {
      const message = typeof data?.error === 'string' ? data.error : data?.error?.message;
      throw new Error(message || `Server returned error ${response.status}`);
    }

    const payload = data.data;
    const model = payload?.model ?? 'rag';
    const source: ChatMessage['source'] =
      model === 'structured' ? 'structured' : model === 'guardrail' || model === 'fallback' ? 'guardrail' : model === 'extractive' ? 'extractive' : 'rag';
    return {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: payload?.answer || 'Received response with no content.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQueries: followUpsFor(userRoleRef.current),
      source,
      model: model === 'structured' || model === 'guardrail' || model === 'fallback' ? undefined : model,
      sources: payload?.sources ?? [],
      confidence: payload?.confidence,
      degraded: payload?.degraded,
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
