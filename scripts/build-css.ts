// Bundles src/styles/index.css into dist/flootlets.css by inlining its
// `@import "…" layer(…);` lines, so apps load one file instead of a chain of
// requests. Imports keep their layer by being wrapped in `@layer name { … }`.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const IMPORT = /^@import\s+["']([^"']+)["'](?:\s+layer\(([\w.-]+)\))?\s*;\s*$/gm;

export function bundle(file: string, seen = new Set<string>()): string {
  const path = resolve(file);
  if (seen.has(path)) throw new Error(`circular CSS import: ${path}`);
  seen.add(path);
  const css = readFileSync(path, 'utf8');
  return css.replace(IMPORT, (_line, target: string, layer?: string) => {
    const inner = bundle(resolve(dirname(path), target), seen).trim();
    return layer ? `@layer ${layer} {\n${inner}\n}` : inner;
  });
}

if (import.meta.main) {
  mkdirSync('dist', { recursive: true });
  writeFileSync('dist/flootlets.css', bundle('src/styles/index.css'));
  console.log('wrote dist/flootlets.css');
}
