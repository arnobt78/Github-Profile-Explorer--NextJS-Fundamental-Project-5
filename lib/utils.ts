import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with clsx and tailwind-merge.
 * Use in components for conditional or composed className.
 *
 * - clsx: concatenates class names, handles falsy values and arrays.
 * - twMerge: resolves Tailwind conflicts (e.g. "p-2" + "p-4" => "p-4").
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
