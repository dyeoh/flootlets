// Every component a file exports must be reachable from the package entry;
// a component that exists but isn't exported is invisible to apps.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import * as flootlets from '../src';

test('every exported component and helper is exported from src/index.ts', () => {
  const missing: string[] = [];
  const dirs = readdirSync('src/components').filter((d) =>
    statSync(join('src/components', d)).isDirectory(),
  );
  for (const dir of dirs) {
    for (const file of readdirSync(join('src/components', dir)).filter(
      (f) => /\.tsx?$/.test(f) && !f.includes('.test.'),
    )) {
      const source = readFileSync(join('src/components', dir, file), 'utf8');
      for (const m of source.matchAll(/^export function (\w+)/gm)) {
        if (!(m[1]! in flootlets)) missing.push(`${m[1]} (${dir}/${file})`);
      }
    }
  }
  expect(missing).toEqual([]);
});
