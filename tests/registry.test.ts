// Guards the shadcn registry built from registry.json: every component and
// helper is in it, copied files import only through the paths the shadcn CLI
// rewrites, and every dependency points at an item that exists. The registry
// smoke test (bun run registry:smoke) then installs it into a real app.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { buildRegistry, readRegistry } from '../scripts/build-registry';

const URL = 'https://example.test/r';
const registry = readRegistry();
const items = buildRegistry(URL);
const byName = new Map(items.map((item) => [item.name, item]));

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(path) && !/\.test\./.test(path) ? [path] : [];
  });
}

test('every component and helper is a registry item', () => {
  const listed = new Set(registry.items.flatMap((item) => item.files.map((f) => f.path)));
  for (const file of [...sources('src/components'), ...sources('src/lib')]) {
    expect(listed.has(file), `${file} is missing from registry.json`).toBe(true);
  }
});

test('item names are unique, kebab-case and match their files', () => {
  expect(new Set(items.map((i) => i.name)).size).toBe(items.length);
  for (const item of items) {
    expect(item.name).toMatch(/^[a-z]+(-[a-z]+)*$/);
    for (const file of item.files ?? [])
      expect(file.path).toMatch(new RegExp(`/${item.name}\\.tsx?$`));
  }
});

describe.each(items.filter((item) => item.files).map((item) => [item.name, item]))(
  '%s',
  (_name, item) => {
    test('imports only packages and paths the shadcn CLI rewrites', () => {
      for (const file of item.files!) {
        for (const [, specifier] of file.content.matchAll(/from '([^']+)'/g)) {
          expect(specifier, `${file.path} imports ${specifier}`).not.toMatch(/^\./);
          if (specifier!.startsWith('@/')) {
            expect(specifier).toMatch(/^@\/(lib\/utils|registry\/flootlets\/(ui|lib)\/[a-z-]+)$/);
          }
        }
      }
    });

    test('every registry dependency exists, and every package import is a dependency', () => {
      for (const dependency of item.registryDependencies ?? []) {
        expect(dependency.startsWith(`${URL}/`)).toBe(true);
        expect(byName.has(dependency.slice(URL.length + 1).replace(/\.json$/, ''))).toBe(true);
      }
      const packages = new Set(item.dependencies);
      for (const file of item.files!) {
        for (const [, specifier] of file.content.matchAll(/from '([^'.@][^']*|@[^/']+\/[^']+)'/g)) {
          if (specifier!.startsWith('@/') || specifier!.startsWith('solid-js')) continue;
          const name = specifier!.startsWith('@')
            ? specifier!.split('/').slice(0, 2).join('/')
            : specifier!.split('/')[0]!;
          expect(packages.has(name), `${item.name} imports ${name}`).toBe(true);
        }
      }
    });

    test('says which version it was copied from, after the imports', () => {
      // The shadcn CLI drops comments before the first import, so the header goes after them.
      const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
      for (const file of item.files!) {
        const header = file.content.indexOf(`// flootlets ${version}, https://`);
        expect(header).toBeGreaterThan(-1);
        expect(file.content.slice(header)).not.toMatch(/^import /m);
      }
    });
  },
);

test('the theme item carries both themes and the base rules', () => {
  const theme = byName.get('theme')!;
  const colours = (vars: Record<string, string>) =>
    Object.keys(vars)
      .filter((n) => n !== 'radius')
      .sort();
  expect(colours(theme.cssVars!.light!)).toEqual(colours(theme.cssVars!.dark!));
  expect(theme.cssVars!.light!.radius).toBe('0.625rem');
  expect(theme.cssVars!.light!.primary).toMatch(/^oklch\(/);
  expect(theme.cssVars!.theme!['animate-pop-in']).toBeDefined();
  expect(Object.keys(theme.css!)).toContain('@keyframes pop-in');
  expect(JSON.stringify(theme.css!['@layer base'])).toContain('outline');
});
