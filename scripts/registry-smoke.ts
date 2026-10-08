// Registry smoke test: installs every registry item into a throwaway Astro +
// Solid + Tailwind v4 app with the real shadcn CLI, then typechecks it and
// builds it (which server-renders a page with Button, Select and Carousel).
// It proves the copied code works outside this repo: imports rewritten to the
// app's aliases, dependencies installed, the theme written into its CSS.
//
//   bun run registry:smoke [--keep]
//
// The registry is built for, and served from, a local URL. Needs network
// access for npm installs. --keep leaves the app in place to inspect.
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { buildRegistry, readRegistry } from './build-registry';

/** Pinned, so a CLI release can't change what the test checks without us noticing. */
const SHADCN = 'shadcn@4.21.4';
const keep = process.argv.includes('--keep');

// Async, so the registry server below keeps answering while the CLI runs.
function run(cmd: string[], cwd: string): Promise<void> {
  console.log(`\n$ ${cmd.join(' ')}`);
  return new Promise((done, fail) => {
    const child = spawn(cmd[0]!, cmd.slice(1), { cwd, stdio: ['ignore', 'inherit', 'inherit'] });
    child.on('error', fail);
    child.on('exit', (code) =>
      code === 0 ? done() : fail(new Error(`failed (${code}): ${cmd.join(' ')}`)),
    );
  });
}

// Serves the registry, built for this server's URL, at /r/<name>.json.
let items: ReturnType<typeof buildRegistry> = [];
const server = createServer((request, response) => {
  const name = (request.url ?? '').replace(/^\/r\//, '').replace(/\.json$/, '');
  const item = items.find((i) => i.name === name);
  response.writeHead(item ? 200 : 404, { 'content-type': 'application/json' });
  response.end(item ? JSON.stringify(item) : '{}');
});
await new Promise<void>((listening) => server.listen(0, '127.0.0.1', listening));
const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/r`;
items = buildRegistry(url);

const app = mkdtempSync(join(tmpdir(), 'flootlets-registry-smoke-'));
try {
  cpSync(resolve('tests/registry-smoke'), app, { recursive: true });
  await run(['bun', 'install'], app);
  const names = readRegistry().items.map((item) => `${url}/${item.name}.json`);
  await run(['bunx', '--bun', SHADCN, 'add', ...names, '--yes', '--overwrite'], app);

  // What a developer would check first: files landed where the aliases say,
  // with imports pointing at the app's own paths.
  for (const file of ['src/components/ui/button.tsx', 'src/lib/utils.ts', 'src/lib/icons.tsx']) {
    if (!existsSync(join(app, file))) throw new Error(`${file} wasn't created`);
  }
  const select = readFileSync(join(app, 'src/components/ui/select.tsx'), 'utf8');
  if (select.includes('@/registry/')) throw new Error('select.tsx still imports @/registry/…');
  if (!select.includes('// flootlets ')) throw new Error('select.tsx lost its version header');
  const css = readFileSync(join(app, 'src/styles/global.css'), 'utf8');
  for (const needle of [
    '--primary:',
    '--success:',
    '--color-success',
    '@keyframes pop-in',
    '--radius: 0.625rem',
  ]) {
    if (!css.includes(needle)) throw new Error(`global.css is missing ${needle}`);
  }

  await run(['bunx', 'tsc', '--noEmit'], app);
  await run(['bunx', 'astro', 'build'], app);
  const html = readFileSync(join(app, 'dist/index.html'), 'utf8');
  for (const slot of ['button', 'select', 'carousel']) {
    if (!html.includes(`data-slot="${slot}"`)) throw new Error(`the page has no ${slot}`);
  }
  console.log(`\n✓ every registry item installs, typechecks and server-renders (${app})`);
} finally {
  server.close();
  if (!keep) rmSync(app, { recursive: true, force: true });
}
