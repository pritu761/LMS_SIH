'use client';

import React, { useState } from 'react';
import { Star, X, CheckCircle, Sparkles, Send } from 'lucide-react';

interface FeedbackModalProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}

export function FeedbackModal({ courseId, courseTitle, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback commentary on course quality and delivery.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/trainee/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, rating, comment }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Review Published!</h3>
            <p className="text-sm text-slate-300">
              Thank you for contributing to institutional capacity evaluation and trainer benchmarking.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Course Feedback & Evaluation
                </span>
              </div>
              <h3 className="text-xl font-bold text-white leading-snug">{courseTitle}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your qualitative review directly impacts the faculty&apos;s competency matching index.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* 5-Star Rating Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Overall Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-600 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-semibold text-slate-400 ml-2">
                  {rating === 5 && 'Outstanding / Masterclass'}
                  {rating === 4 && 'Very Good / Thorough'}
                  {rating === 3 && 'Average / Meets Standard'}
                  {rating <= 2 && 'Needs Improvement'}
                </span>
              </div>
            </div>

            {/* Qualitative Feedback Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Qualitative Review & Suggestions
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Detail key takeaways, practical applicability, lecture clarity, and suggestions for module expansion..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{loading ? 'Submitting...' : 'Submit Evaluation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
