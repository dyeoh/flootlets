// Guards the theme: every colour pair is readable (WCAG AA) in light and dark,
// the theme blocks stay in sync, Tailwind sees every variable, and the colour
// parser behind `bun run check:theme` reads the formats shadcn themes use.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compile } from '@tailwindcss/node';
import { describe, expect, test } from 'vitest';
import {
  check,
  collect,
  DARK_SELECTORS,
  parseColor,
  passes,
  rules,
  themes,
} from '../scripts/check-theme';

const themeCss = readFileSync('src/styles/theme.css', 'utf8');
const { light, dark } = themes(themeCss);
const darkSystem = collect(rules(themeCss), [":root:not(.light, [data-theme='light'])"]);
const darkForced = collect(rules(themeCss), DARK_SELECTORS);

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme', (_name, theme) => {
  test.each(check(theme).map((r) => [r.fg, r.bg, r]))('--%s on --%s', (_fg, _bg, r) => {
    const detail = r.problem ?? `${r.ratio!.toFixed(2)}:1, needs ${r.min}:1`;
    expect(passes(r), detail).toBe(true);
  });
});

test('the system-dark and forced-dark blocks are identical', () => {
  expect([...darkSystem]).toEqual([...darkForced]);
});

test('light and dark define the same colours', () => {
  const colours = (theme: Map<string, string>) =>
    [...theme.keys()].filter((n) => n !== '--radius').sort();
  expect(colours(darkForced)).toEqual(colours(collect(rules(themeCss), [':root'])));
});

test('every colour variable is mapped into Tailwind', () => {
  const mapped = collect(rules(themeCss), ['@theme inline']);
  for (const name of darkForced.keys()) {
    expect(
      mapped.get(`--color-${name.slice(2)}`),
      `@theme inline needs --color-${name.slice(2)}`,
    ).toBe(`var(${name})`);
  }
});

describe('with Tailwind', () => {
  async function build(candidates: string[]): Promise<string> {
    const compiler = await compile(`@import 'tailwindcss';\n@import './src/styles/theme.css';`, {
      base: resolve('.'),
      onDependency: () => {},
    });
    return compiler.build(candidates);
  }

  test('utilities follow the theme variables', async () => {
    const css = await build(['bg-primary', 'text-muted-foreground', 'border-input', 'rounded-lg']);
    expect(css).toMatch(/\.bg-primary\s*\{\s*background-color: var\(--primary\)/);
    expect(css).toMatch(/\.text-muted-foreground\s*\{\s*color: var\(--muted-foreground\)/);
    expect(css).toMatch(/\.border-input\s*\{[^}]*border-color: var\(--input\)/);
    expect(css).toMatch(/\.rounded-lg\s*\{\s*border-radius: var\(--radius\)/);
  });

  test('dark: applies to .dark, data-theme="dark" and the system setting', async () => {
    const css = await build(['dark:bg-card']);
    expect(css).toContain('.dark');
    expect(css).toContain("[data-theme='dark']");
    expect(css).toMatch(
      /@media \(prefers-color-scheme: dark\)[\s\S]*:root:not\(\.light, \[data-theme='light'\]\)/,
    );
  });
});

describe('colour parsing', () => {
  const hex = (value: string) =>
    '#' +
    parseColor(value)!
      .slice(0, 3)
      .map((c) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');

  test.each([
    ['#971c2a', '#971c2a'],
    ['#abc', '#aabbcc'],
    ['rgb(151 28 42)', '#971c2a'],
    ['rgba(151, 28, 42, 0.5)', '#971c2a'],
    ['hsl(222.2 84% 4.9%)', '#020817'],
    ['222.2 84% 4.9%', '#020817'], // shadcn v3 bare triple
    ['oklch(0.577 0.245 27.325)', '#e7000b'], // Tailwind red-600
    ['oklch(0.623 0.214 259.815)', '#2b7fff'], // Tailwind blue-500
    ['oklch(97% 0 0)', '#f5f5f5'],
  ])('%s', (value, expected) => {
    expect(hex(value)).toBe(expected);
  });

  test('reads alpha, so translucent borders are composited before measuring', () => {
    expect(parseColor('oklch(1 0 0 / 10%)')![3]).toBeCloseTo(0.1);
    expect(parseColor('#00000080')![3]).toBeCloseTo(0.5, 2);
  });

  test('checks a pasted shadcn oklch theme', () => {
    const pasted = themes(`
      :root { --background: oklch(1 0 0); --foreground: oklch(0.145 0 0); }
      .dark { --background: oklch(0.145 0 0); --foreground: oklch(0.985 0 0); }
    `);
    for (const theme of [pasted.light, pasted.dark]) {
      const [result] = check(theme, [['foreground', 'background', 4.5]]);
      expect(result!.ratio).toBeGreaterThan(15);
    }
  });
});

function files(dir: string, ext: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return files(path, ext);
    return path.endsWith(ext) ? [path] : [];
  });
}

test('every --fl variable used in a stylesheet is defined', () => {
  // The transitional scales and aliases, plus component-local variables
  // declared in CSS (--fl-button-bg) or set inline by a component (--fl-gap).
  const defined = new Set<string>();
  for (const file of files('src', '.css')) {
    for (const m of readFileSync(file, 'utf8').matchAll(/(--fl-[\w-]+)\s*:/g)) defined.add(m[1]!);
  }
  for (const file of files('src', '.tsx')) {
    for (const m of readFileSync(file, 'utf8').matchAll(/'(--fl-[\w-]+)'\s*:/g)) defined.add(m[1]!);
  }
  for (const file of files('src', '.css')) {
    for (const m of readFileSync(file, 'utf8').matchAll(/var\((--fl-[\w-]+)/g)) {
      expect(defined.has(m[1]!), `${file} uses undefined ${m[1]}`).toBe(true);
    }
  }
});

test('every component stylesheet is included in the bundle', () => {
  const index = readFileSync('src/styles/index.css', 'utf8');
  for (const file of files('src/components', '.css')) {
    const relative = `../${file.slice('src/'.length)}`;
    expect(index, `src/styles/index.css must @import '${relative}'`).toContain(`'${relative}'`);
  }
});
