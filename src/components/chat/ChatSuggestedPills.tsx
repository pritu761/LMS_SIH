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
          className="group inline-flex items-center gap-1.5 rounded-full border border-[#e0234e]/30 bg-[#e0234e]/10 px-3 py-1 text-[11px] font-medium text-[#ff4d6d] transition-all duration-200 hover:border-[#e0234e] hover:bg-[#e0234e]/25 hover:text-white hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="h-2.5 w-2.5 text-[#ff4d6d] group-hover:text-white transition-colors" />
          <span>{suggestion}</span>
        </button>
      ))}
    </div>
  );
}
