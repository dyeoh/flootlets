/** Steps on Tailwind's spacing scale (multiples of --spacing, 0.25rem by default). */
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

/** A spacing step as a CSS value, e.g. 4 → calc(var(--spacing) * 4), the same as Tailwind's gap-4. */
export function space(step: Space): string {
  return `calc(var(--spacing) * ${step})`;
}
