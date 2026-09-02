import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple className values with tailwind-merge for conflict resolution.
 * Combines clsx for conditional class handling with twMerge for Tailwind deduplication.
 * @param inputs - Array of class values (strings, objects, arrays) to merge
 * @returns Merged and deduplicated className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a duration in seconds to MM:SS format.
 * @param seconds - Duration in seconds
 * @returns Formatted string in MM:SS format with zero-padding
 */
export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats an ISO date string to a human-readable short format (e.g., "Jan 15, 2024").
 * @param dateString - ISO date string to format
 * @returns Formatted date string or 'N/A' if input is undefined/null
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
