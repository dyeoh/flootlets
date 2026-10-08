// Checks the package.json exports map resolves to files that exist, for each
// way an app can import flootlets. Run after `bun run build`. Node resolves the
// package by name from inside itself (self-reference), honouring conditions.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cases: [label: string, conditions: string[], specifier: string, expected: string][] = [
  ['Solid apps / Astro (solid condition)', ['solid'], 'flootlets', 'dist/source/index.js'],
  ['other bundlers (default)', [], 'flootlets', 'dist/browser/index.js'],
  ['stylesheet', [], 'flootlets/styles.css', 'dist/flootlets.css'],
];

let failed = false;
for (const [label, conditions, specifier, expected] of cases) {
  const url = execFileSync(
    'node',
    [
      ...conditions.map((c) => `--conditions=${c}`),
      '--input-type=module',
      '-e',
      `console.log(import.meta.resolve(${JSON.stringify(specifier)}))`,
    ],
    { encoding: 'utf8' },
  ).trim();
  const path = fileURLToPath(url);
  const ok = path.endsWith(expected) && existsSync(path);
  console.log(`${ok ? '✓' : '✗'} ${label}: ${specifier} → ${path}`);
  failed ||= !ok;
}
if (failed) process.exit(1);
