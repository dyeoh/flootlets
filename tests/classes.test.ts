// Tailwind skips class names it doesn't know without a word, so a typo in a
// component (bg-primay, data-[state=open]:…) would ship as missing styles.
// This compiles every class the components use with the real Tailwind and the
// flootlets theme, and fails on any that generates no CSS.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compile } from '@tailwindcss/node';
import { expect, test } from 'vitest';

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(path) && !/\.test\./.test(path) ? [path] : [];
  });
}

// Strings in class positions: class="…", the first argument of cva()/cn(),
// cva variant values (key: '…') and *Class constants.
const CLASS_STRINGS =
  /class="([^"]*)"|(?:cva|cn)\(\s*'([^']*)'|:\s*'([^']*)'|Class\s*=\s*'([^']*)'|Class\s*=\s*\n\s*'([^']*)'/g;

// Only tokens that look like utilities are checked: plain words also turn up
// in those positions (variant names, aria values), and markers like `peer` or
// `group/field` rightly generate nothing by themselves.
const looksLikeUtility = (token: string) => /[-:[]/.test(token) && !token.startsWith('group/');

test('every Tailwind class in the components generates CSS', async () => {
  const compiler = await compile(`@import 'tailwindcss';\n@import './src/styles/theme.css';`, {
    base: resolve('.'),
    onDependency: () => {},
  });
  // build() is cumulative: a new class that compiles makes the output grow.
  let size = compiler.build([]).length;
  const seen = new Set<string>();
  const unknown: string[] = [];
  for (const file of sources('src')) {
    for (const match of readFileSync(file, 'utf8').matchAll(CLASS_STRINGS)) {
      const value = match.slice(1).find((group) => group !== undefined) ?? '';
      for (const token of value.split(/\s+/).filter(looksLikeUtility)) {
        if (seen.has(token)) continue;
        seen.add(token);
        const next = compiler.build([token]).length;
        if (next === size) unknown.push(`${file}: ${token}`);
        size = next;
      }
    }
  }
  expect(seen.size, 'found the components’ classes').toBeGreaterThan(200);
  expect(unknown).toEqual([]);
});

test('components no longer use the old --fl-* variables', () => {
  for (const file of sources('src')) {
    expect(readFileSync(file, 'utf8'), file).not.toMatch(/--fl-/);
  }
});
