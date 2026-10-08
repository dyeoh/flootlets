// Reads the theme variables for both themes straight from the library's
// theme.css, with the same parser and contrast maths as `bun run check:theme`,
// so the docs can never show stale values.
import css from '../../../src/styles/theme.css?raw';
import { contrast as ratio, parseColor, resolve, themes } from '../../../scripts/check-theme';

const { light, dark } = themes(css);

export function contrast(fg: string, bg: string): number | undefined {
  const [f, b] = [parseColor(fg), parseColor(bg)];
  return f && b ? ratio(f, b, b) : undefined;
}

export interface ColorToken {
  name: string;
  light: string;
  dark: string;
}

/** Theme colours with their value in each theme. */
export const colorTokens: ColorToken[] = [...light.keys()]
  .filter((name) => name !== '--radius')
  .map((name) => ({ name, light: resolve(light, name)!, dark: resolve(dark, name)! }));

export const bg = { light: resolve(light, '--background')!, dark: resolve(dark, '--background')! };
export const radius = resolve(light, '--radius')!;
