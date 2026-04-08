import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Custom easing from 21st.dev — smooth deceleration curve.
 */
export const EASE_OUT_SMOOTH = [0.4, 0, 0.2, 1] as const;

/**
 * Standard animation durations.
 */
export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const;
