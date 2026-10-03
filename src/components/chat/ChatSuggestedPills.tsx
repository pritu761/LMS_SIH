'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatSuggestedPillsProps {
  suggestions: string[];
  onSelect: (query: string) => void;
}

export function ChatSuggestedPills({ suggestions, onSelect }: ChatSuggestedPillsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-[#c59b48]/30 bg-[#c59b48]/10 px-3 py-1 text-[11px] font-medium text-[#0b1e36] dark:text-[#dfb76c] transition-all duration-200 hover:border-[#c59b48] hover:bg-[#c59b48]/25 hover:text-[#0b1e36] dark:hover:text-white hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="h-2.5 w-2.5 text-[#c59b48] group-hover:text-[#0b1e36] dark:text-[#dfb76c] dark:group-hover:text-white transition-colors" />
          <span>{suggestion}</span>
        </button>
      ))}
    </div>
  );
}