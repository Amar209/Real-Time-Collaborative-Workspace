import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Curated vibrant colors for live multiplayer cursors and user avatars
export const USER_COLORS = [
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#eab308", // Yellow
  "#14b8a6", // Teal
  "#f43f5e", // Rose
  "#6366f1", // Indigo
];

export function getRandomColor(seed?: string): string {
  if (!seed) {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}
