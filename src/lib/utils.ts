import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins class names and resolves Tailwind conflicts, last one winning, as in
 * shadcn/ui: cn('px-4 bg-primary', active && 'bg-accent', props.class).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
