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
}

interface ChatContextType {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  openChat: (initialQuery?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
  toggleMinimize: () => void;
  toggleMaximize: () => void;
  sendMessage: (text: string) => Promise<void>;
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
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestedQueries: [
    'Find Doppler Radar courses',
    'Earth-System HPC Modelling on Pratyush',
    'AI/ML Precipitation Nowcasting',
    'Synoptic Meteorology & INSAT-3DS',
  ],
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);

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

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
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

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: assistantData?.reply || 'Received response with no content.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedCourses: assistantData?.matchedCourses || [],
        suggestedQueries: assistantData?.suggestedQueries || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!isOpen || isMinimized) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ *Unable to connect to course indexing service (${err?.message || 'Network error'}). Please try again.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQueries: ['Show all courses', 'Search Radar courses'],
      };
      setMessages((prev) => [...prev, errorMessage]);
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
        openChat,
        closeChat,
        toggleChat,
        toggleMinimize,
        toggleMaximize,
        sendMessage: handleSendMessage,
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
