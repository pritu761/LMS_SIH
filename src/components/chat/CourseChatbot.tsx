'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Bot,
  User,
  Compass,
  Copy,
  Check,
  ChevronDown,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { useCourseChat, ChatMessage } from '@/context/ChatContext';
import { ChatCourseCard } from '@/components/chat/ChatCourseCard';
import { ChatSuggestedPills } from '@/components/chat/ChatSuggestedPills';

/**
 * Simple, fast inline Markdown renderer for bot responses
 */
function MarkdownView({ content }: { content: string }) {
  // Render tables, bold, lists, code
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const parseInline = (text: string): React.ReactNode => {
    // Links: [text](url), Bold: **text**, Italic: *text*, Code: `code`
    const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const [, linkText, linkHref] = linkMatch;
          return (
            <Link
              key={i}
              href={linkHref}
              className="text-rose-600 dark:text-[#ff758c] font-semibold underline underline-offset-2 hover:text-rose-700 dark:hover:text-white transition-colors"
            >
              {linkText}
            </Link>
          );
        }
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={i} className="italic text-slate-600 dark:text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="rounded bg-slate-900/[0.06] dark:bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-cyan-700 dark:text-cyan-300 border border-slate-900/10 dark:border-white/10"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const flushTable = (keyIndex: number) => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const rows = tableRows.slice(1).filter((r) => !r.every((c) => c.includes('---')));

      renderedElements.push(
        <div key={`table-${keyIndex}`} className="my-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                {header.map((col, cIdx) => (
                  <th key={cIdx} className="p-2 font-semibold text-cyan-700 dark:text-cyan-300 text-xs">
                    {parseInline(col.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-100 dark:hover:bg-white/[0.02]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                      {parseInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table line
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(index);
    }

    // Empty line
    if (!trimmed) {
      renderedElements.push(<div key={index} className="h-2" />);
      return;
    }

    // Bullet point
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <div key={index} className="flex items-start gap-2 text-[13px] text-slate-700 dark:text-slate-300 my-1 ml-1">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-1.5 flex-shrink-0" />
          <span className="leading-relaxed">{parseInline(trimmed.slice(2))}</span>
        </div>
      );
      return;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\.\s/)?.[1];
      const rest = trimmed.replace(/^\d+\.\s/, '');
      renderedElements.push(
        <div key={index} className="flex items-start gap-2 text-[13px] text-slate-700 dark:text-slate-300 my-1 ml-1">
          <span className="font-bold text-cyan-700 dark:text-cyan-400 text-xs min-w-[14px] tabular-nums">{num}.</span>
          <span className="leading-relaxed">{parseInline(rest)}</span>
        </div>
      );
      return;
    }

    // Heading (e.g. ## or ###)
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h4 key={index} className="text-[13px] font-bold text-cyan-700 dark:text-cyan-300 mt-2 mb-1">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      renderedElements.push(
        <h3 key={index} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
          {parseInline(trimmed.replace(/^#+\s/, ''))}
        </h3>
      );
      return;
    }

    // Normal paragraph
    renderedElements.push(
      <p key={index} className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed my-1">
        {parseInline(trimmed)}
      </p>
    );
  });

  if (inTable) {
    flushTable(lines.length);
  }

  return <div className="space-y-0.5">{renderedElements}</div>;
}

export function CourseChatbot() {
  const {
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
    sendMessage,
    clearChat,
    unreadCount,
  } = useCourseChat();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Setup Web Speech API for voice search
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          sendMessage(transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [sendMessage]);

  // Read response aloud if TTS enabled
  useEffect(() => {
    if (ttsEnabled && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop prior speech
        // Clean markdown characters for smooth speech
        const speechText = lastMsg.content
          .replace(/[#*`_~]/g, '')
          .replace(/\|.*\|/g, '')
          .slice(0, 300);
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, ttsEnabled]);

  const handleVoiceToggle = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;
    const text = input;
    setInput('');
    sendMessage(text);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Action Button (FAB) Trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              type="button"
              onClick={toggleChat}
              aria-label="Open Course AI Assistant"
              className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0b1e36] via-[#122c4d] to-[#c59b48] p-[1.5px] shadow-2xl shadow-[#0b1e36]/40 transition-all duration-300 hover:scale-110 hover:shadow-[#c59b48]/40 active:scale-95"
            >
              {/* Outer subtle glow ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#0b1e36] to-[#c59b48] opacity-40 blur-md group-hover:opacity-75 transition duration-500 animate-pulse" />

              <div className="relative flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-slate-950/90 backdrop-blur-sm">
                <Bot className="h-6 w-6 text-[#c59b48] transition-transform duration-300 group-hover:scale-110" />
                <Sparkles className="absolute top-2 right-2 h-2.5 w-2.5 text-amber-400 animate-pulse" />
              </div>

              {/* Unread Message Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#c59b48] gold-ink text-[10px] font-black ring-2 ring-black animate-bounce tabular-nums">
                  {unreadCount}
                </span>
              )}

              {/* Floating Tooltip */}
              <div className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-black/90 px-3 py-1.5 text-xs font-semibold text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-md">
                Ask Course Navigator AI
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chatbot Floating Window / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: isMaximized ? '92vw' : '420px',
              height: isMinimized ? '60px' : isMaximized ? '88vh' : '620px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed z-50 flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
              isMaximized
                ? 'inset-x-0 bottom-6 mx-auto max-w-6xl'
                : 'bottom-6 right-6 max-h-[85vh] max-w-[95vw]'
            }`}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/10 bg-white dark:bg-slate-900/80 px-4 py-3.5 backdrop-blur-xl select-none">
              {/* Electric subtle gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0b1e36] via-[#c59b48] to-[#dfb76c]" />

              <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0b1e36] to-[#c59b48] p-[1px]">
                  <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-black">
                    <Bot className="h-4 w-4 text-[#c59b48]" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-black" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                      MausamBot <span className="text-[#9a7224] dark:text-[#c59b48]">AI Navigator</span>
                    </h3>
                    <span className="rounded-full bg-[#c59b48]/15 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-[#9a7224] dark:text-[#dfb76c] border border-[#c59b48]/30">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Course Intelligence
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                {/* Voice Audio Readout Toggle */}
                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  title={ttsEnabled ? 'Mute AI Voice' : 'Enable Voice Readout'}
                  className={`rounded-lg p-1.5 transition-colors ${
                    ttsEnabled ? 'bg-[#c59b48]/20 text-[#dfb76c]' : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                {/* Clear Conversation */}
                <button
                  type="button"
                  onClick={clearChat}
                  title="Clear Chat History"
                  className="rounded-lg p-1.5 hover:bg-white/5 hover:text-slate-900 dark:text-white transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Minimize Button */}
                <button
                  type="button"
                  onClick={toggleMinimize}
                  title={isMinimized ? 'Expand Chat' : 'Minimize'}
                  className="rounded-lg p-1.5 hover:bg-white/5 hover:text-slate-900 dark:text-white transition-colors"
                >
                  {isMinimized ? <ChevronDown className="h-4 w-4 rotate-180" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {/* Maximize / Popout Button */}
                <button
                  type="button"
                  onClick={toggleMaximize}
                  title={isMaximized ? 'Standard View' : 'Full Screen'}
                  className="hidden sm:inline-flex rounded-lg p-1.5 hover:bg-white/5 hover:text-slate-900 dark:text-white transition-colors"
                >
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={closeChat}
                  title="Close Assistant"
                  className="rounded-lg p-1.5 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Body (Hidden when minimized) */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                  {/* Messages list */}
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        {!isUser && (
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0b1e36] to-[#c59b48] p-[1px] mt-0.5">
                            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-black">
                              <Bot className="h-3.5 w-3.5 text-[#c59b48]" />
                            </div>
                          </div>
                        )}

                        <div
                          className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 transition-all ${
                            isUser
                              ? 'bg-gradient-to-r from-[#0b1e36] to-[#122c4d] border border-[#c59b48]/40 text-white shadow-md shadow-[#0b1e36]/20 rounded-tr-none'
                              : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-200 rounded-tl-none backdrop-blur-md shadow-sm'
                          }`}
                        >
                          {/* Markdown or plain message */}
                          {isUser ? (
                            <p className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <MarkdownView content={msg.content} />
                          )}

                          {/* Matched Rich Course Cards */}
                          {msg.matchedCourses && msg.matchedCourses.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {msg.matchedCourses.map((c) => (
                                <ChatCourseCard key={c.id} course={c} />
                              ))}
                            </div>
                          )}

                          {/* Suggested follow-up prompt pills */}
                          {msg.suggestedQueries && msg.suggestedQueries.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/10">
                              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                Related Inquiries:
                              </span>
                              <ChatSuggestedPills
                                suggestions={msg.suggestedQueries}
                                onSelect={(q) => sendMessage(q)}
                              />
                            </div>
                          )}

                          {/* Timestamp & Copy Action */}
                          <div
                            className={`mt-1.5 flex items-center justify-between gap-2 text-[10px] tabular-nums ${
                              isUser ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {!isUser && (
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-600 dark:text-slate-300 flex items-center gap-1"
                                title="Copy response"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-2.5 w-2.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {isUser && (
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-[1px] mt-0.5 border border-white/10">
                            <User className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing / Loading Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2.5 animate-fade-in">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-[#c59b48]/20 border border-[#c59b48]/30 p-[1px]">
                        <Bot className="h-3.5 w-3.5 text-[#c59b48]" />
                      </div>
                      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 px-4 py-3 text-[13px] text-slate-600 dark:text-slate-400 rounded-tl-none flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c59b48] animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c59b48] animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c59b48] animate-bounce" />
                        <span className="ml-1 text-xs text-[#9a7224] dark:text-[#dfb76c] font-medium">
                          Searching course catalog and syllabus...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form & Quick Controls */}
                <div className="border-t border-white/10 bg-white dark:bg-slate-950/90 p-3 backdrop-blur-xl">
                  {/* Speech recognition active notice */}
                  {isRecording && (
                    <div className="mb-2 flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-1.5 text-xs text-red-700 dark:text-red-300 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Listening for course search...
                      </span>
                      <button
                        type="button"
                        onClick={handleVoiceToggle}
                        className="text-[10px] font-bold uppercase underline"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about Radar, NWP, HPC, AI/ML courses..."
                      disabled={isTyping}
                      className="chat-text-input w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 pl-4 pr-20 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#c59b48] focus:outline-none focus:ring-1 focus:ring-[#c59b48] disabled:opacity-50 transition-all shadow-inner"
                    />

                    {/* Speech to text mic button */}
                    <button
                      type="button"
                      onClick={handleVoiceToggle}
                      title={isRecording ? 'Stop Recording' : 'Search by Voice'}
                      className={`absolute right-10 top-1/2 -translate-y-1/2 rounded-xl p-1.5 transition-all ${
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/50 text-[#c59b48] shadow-md shadow-[#0b1e36]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-500 px-1">
                    <span>Press Enter to send</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-[#c59b48]" />
                      Mission Mausam Assistant
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}