/** The spacing scale steps that exist as --fl-space-* tokens. */
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

/** A spacing step as a CSS value, e.g. 4 → var(--fl-space-4). */
export function space(step: Space): string {
  return `var(--fl-space-${step})`;
}
