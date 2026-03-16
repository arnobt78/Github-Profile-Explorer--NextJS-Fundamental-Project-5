import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with clsx and tailwind-merge.
 * Use in components for conditional or composed className.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
