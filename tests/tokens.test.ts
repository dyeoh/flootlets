// Guards the design tokens: theme blocks stay in sync, every text/background
// pairing is readable (WCAG AA) in light and dark, and no stylesheet uses a
// token that doesn't exist.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const tokensCss = readFileSync('src/styles/tokens.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The declarations inside the first `{…}` block that follows `selector`. */
function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`selector not found: ${selector}`);
  let i = css.indexOf('{', start) + 1;
  const from = i;
  for (let depth = 1; depth > 0; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') depth--;
  }
  return css.slice(from, i - 1);
}

function declarations(body: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of body.matchAll(/(--fl-[\w-]+)\s*:\s*([^;]+);/g)) out.set(m[1]!, m[2]!.trim());
  return out;
}

const root = declarations(block(tokensCss, ':root {'));
const darkSystem = declarations(block(tokensCss, ":root:not([data-theme='light'])"));
const darkForced = declarations(block(tokensCss, "[data-theme='dark'] {"));
const lightForced = declarations(block(tokensCss, "[data-theme='light'] {"));
const lightDefault = new Map([...root].filter(([name]) => lightForced.has(name)));

/** A theme's colour for a token, following var() references down to a hex value. */
function resolve(theme: Map<string, string>, name: string): string {
  const value = theme.get(name) ?? root.get(name);
  if (!value) throw new Error(`undefined token ${name}`);
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

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const TEXT = 4.5; // WCAG AA, normal text
const UI = 3; // WCAG AA, large text and UI parts (borders of inputs, focus rings)

const pairs: [fg: string, bg: string, min: number][] = [
  ...['bg', 'surface', 'surface-raised'].flatMap((bg): [string, string, number][] => [
    ['text', bg, TEXT],
    ['text-muted', bg, TEXT],
    ['accent-text', bg, TEXT],
    ['danger-text', bg, TEXT],
    ['success-text', bg, TEXT],
    ['warning-text', bg, TEXT],
    ['focus', bg, UI],
    ['border-strong', bg, UI],
  ]),
  ['on-accent', 'accent', TEXT],
  ['on-accent', 'accent-hover', TEXT],
  ['danger-text', 'danger-bg', TEXT],
  ['success-text', 'success-bg', TEXT],
  ['warning-text', 'warning-bg', TEXT],
  ['neutral-text', 'neutral-bg', TEXT],
];

describe.each([
  ['light', lightDefault],
  ['dark', darkForced],
])('%s theme', (_name, theme) => {
  test.each(pairs)('--fl-color-%s on --fl-color-%s', (fg, bg, min) => {
    const ratio = contrast(resolve(theme, `--fl-color-${fg}`), resolve(theme, `--fl-color-${bg}`));
    expect(ratio, `${ratio.toFixed(2)}:1, needs ${min}:1`).toBeGreaterThanOrEqual(min);
  });
});

test('the system-dark and data-theme="dark" blocks are identical', () => {
  expect([...darkSystem]).toEqual([...darkForced]);
});

test('the default light theme and data-theme="light" are identical', () => {
  expect([...lightDefault]).toEqual([...lightForced]);
});

test('both themes define the same semantic tokens', () => {
  expect([...darkForced.keys()].sort()).toEqual([...lightForced.keys()].sort());
});

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return path.endsWith('.css') ? [path] : [];
  });
}

test('every token used in a stylesheet is defined', () => {
  const defined = new Set([...root.keys(), ...darkForced.keys()]);
  for (const file of cssFiles('src')) {
    for (const m of readFileSync(file, 'utf8').matchAll(/var\((--fl-[\w-]+)/g)) {
      expect(defined.has(m[1]!), `${file} uses undefined ${m[1]}`).toBe(true);
    }
  }
});

test('every component stylesheet is included in the bundle', () => {
  const index = readFileSync('src/styles/index.css', 'utf8');
  for (const file of cssFiles('src/components').filter(() => true)) {
    const relative = `../${file.slice('src/'.length)}`;
    expect(index, `src/styles/index.css must @import '${relative}'`).toContain(`'${relative}'`);
  }
});
