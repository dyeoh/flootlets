// Reads the semantic colour tokens for both themes straight from the
// library's tokens.css, so the docs can never show stale values.
import css from '../../../src/styles/tokens.css?raw';

const source = css.replace(/\/\*[\s\S]*?\*\//g, '');

function block(selector: string): string {
  const start = source.indexOf(selector);
  let i = source.indexOf('{', start) + 1;
  const from = i;
  for (let depth = 1; depth > 0; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
  }
  return source.slice(from, i - 1);
}

function declarations(body: string): Map<string, string> {
  return new Map(
    [...body.matchAll(/(--fl-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]),
  );
}

const root = declarations(block(':root {'));
const light = declarations(block("[data-theme='light'] {"));
const dark = declarations(block("[data-theme='dark'] {"));

function resolve(theme: Map<string, string>, name: string): string {
  const value = theme.get(name) ?? root.get(name) ?? '';
  const ref = value.match(/^var\((--fl-[\w-]+)\)$/);
  return ref ? resolve(theme, ref[1]!) : value;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

export interface ColorToken {
  name: string;
  light: string;
  dark: string;
}

/** Semantic colour tokens with their resolved hex value in each theme. */
export const colorTokens: ColorToken[] = [...light.keys()]
  .filter((name) => name.startsWith('--fl-color-'))
  .map((name) => ({ name, light: resolve(light, name), dark: resolve(dark, name) }));

/** Palette primitives (the raw colours). */
export const palette = [...root.entries()]
  .filter(([name, value]) => /^#[0-9a-f]{6}$/i.test(value) && !name.startsWith('--fl-color-'))
  .map(([name, value]) => ({ name, value }));

export const bg = { light: resolve(light, '--fl-color-bg'), dark: resolve(dark, '--fl-color-bg') };
