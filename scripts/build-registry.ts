// Builds the shadcn registry from the same source as the npm package:
// registry.json lists the items, and each item's JSON (docs/public/r/<name>.json,
// served from GitHub Pages) carries its files' code, so apps can copy them in:
//
//   npx shadcn add https://dyeoh.github.io/flootlets/r/button.json
//
// Imports between flootlets files are rewritten to the paths the shadcn CLI
// maps to the app's own aliases (@/lib/utils, @/registry/flootlets/ui/x), and
// npm and registry dependencies are worked out from those imports, so they
// can't drift from the code. The theme item is built from src/styles/theme.css.
//
//   bun scripts/build-registry.ts [--url <base>] [--out <dir>]
//
// --url defaults to the Pages site; the smoke test points it at a local server.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { collect, rules, themes } from './check-theme';

const REGISTRY = 'flootlets';
const PAGES = 'https://dyeoh.github.io/flootlets';

interface SourceFile {
  path: string;
  type: string;
}

interface SourceItem {
  name: string;
  type: 'registry:ui' | 'registry:lib' | 'registry:theme';
  title: string;
  description: string;
  files: SourceFile[];
  meta?: { docs?: string };
}

interface Registry {
  name: string;
  homepage: string;
  items: SourceItem[];
}

/** npm packages the app already has, or that come with every flootlets setup. */
const PROVIDED = new Set(['solid-js', 'tailwindcss']);

export function readRegistry(file = 'registry.json'): Registry {
  return JSON.parse(readFileSync(file, 'utf8')) as Registry;
}

/** The item a source file belongs to, by path. */
function itemForPath(registry: Registry, path: string): SourceItem | undefined {
  return registry.items.find((item) => item.files.some((f) => resolve(f.path) === resolve(path)));
}

/** Where a file lands in the registry: registry/flootlets/ui/button.tsx, registry/flootlets/lib/icons.tsx. */
function targetPath(item: SourceItem, file: SourceFile): string {
  const ext = file.path.match(/\.tsx?$/)![0];
  const folder = item.type === 'registry:ui' ? 'ui' : 'lib';
  return `registry/${REGISTRY}/${folder}/${item.name}${ext}`;
}

/** The import specifier the shadcn CLI rewrites to the app's alias for this item. */
function specifierFor(item: SourceItem): string {
  if (item.name === 'utils') return '@/lib/utils';
  return `@/registry/${REGISTRY}/${item.type === 'registry:ui' ? 'ui' : 'lib'}/${item.name}`;
}

const IMPORT = /(from\s+|import\s+)'([^']+)'/g;

export interface BuiltFile {
  path: string;
  type: string;
  content: string;
}

export interface BuiltItem {
  $schema: string;
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: BuiltFile[];
  cssVars?: Record<string, Record<string, string>>;
  css?: Record<string, unknown>;
  docs?: string;
  meta?: Record<string, string>;
}

/** An npm package name from an import specifier: @kobalte/core/select → @kobalte/core. */
function packageName(specifier: string): string {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!;
}

/**
 * Puts the version header, and the file's opening comment, after the imports:
 * the shadcn CLI drops comments that come before the first import.
 */
function withHeader(content: string, header: string): string {
  const opening = content.match(/^\/\*[\s\S]*?\*\/\n/)?.[0] ?? '';
  const rest = content.slice(opening.length);
  const imports = rest.match(/^(?:import[\s\S]*?from '[^']+';\n)*/)?.[0] ?? '';
  return `${imports}${imports ? '\n' : ''}${header}\n${opening}${rest.slice(imports.length).replace(/^\n/, '')}`;
}

function buildCodeItem(
  registry: Registry,
  item: SourceItem,
  url: string,
  version: string,
): BuiltItem {
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();
  // Every component needs the theme's colours and animations.
  if (item.type === 'registry:ui') registryDependencies.add(`${url}/theme.json`);

  const files = item.files.map((file): BuiltFile => {
    const source = readFileSync(file.path, 'utf8');
    const content = source.replace(IMPORT, (whole, keyword: string, specifier: string) => {
      if (!specifier.startsWith('.')) {
        const name = packageName(specifier);
        if (!PROVIDED.has(name)) dependencies.add(name);
        return whole;
      }
      const target = join(dirname(file.path), specifier);
      const candidates = ['.ts', '.tsx'].map((ext) => target + ext);
      const dependency = candidates.map((c) => itemForPath(registry, c)).find(Boolean);
      if (!dependency) {
        throw new Error(`${file.path}: '${specifier}' isn't a file of any registry item`);
      }
      if (dependency !== item) registryDependencies.add(`${url}/${dependency.name}.json`);
      return `${keyword}'${specifierFor(dependency)}'`;
    });
    const docs = item.meta?.docs ?? `${PAGES}/`;
    return {
      path: targetPath(item, file),
      type: file.type,
      content: withHeader(content, `// flootlets ${version}, ${docs}`),
    };
  });

  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    ...(dependencies.size ? { dependencies: [...dependencies].sort() } : {}),
    ...(registryDependencies.size
      ? { registryDependencies: [...registryDependencies].sort() }
      : {}),
    files,
    meta: { version, ...(item.meta?.docs ? { docs: item.meta.docs } : {}) },
  };
}

/** Declarations of a CSS block body as { property: value }, without nested blocks. */
function declarations(body: string): Record<string, string> {
  const flat = body.replace(/\{[^{}]*\}/g, '');
  return Object.fromEntries(
    [...flat.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]),
  );
}

/** The body of the block that starts at `from` (the index of its `{`). */
function blockAt(css: string, from: number): string {
  let i = from + 1;
  for (let depth = 1; depth > 0; i++) depth += css[i] === '{' ? 1 : css[i] === '}' ? -1 : 0;
  return css.slice(from + 1, i - 1);
}

/** Each `selector { … }` directly inside a block body, in order. */
function children(body: string): [selector: string, body: string][] {
  const out: [string, string][] = [];
  let i = 0;
  while (i < body.length) {
    const open = body.indexOf('{', i);
    if (open < 0) break;
    const selector = body
      .slice(i, open)
      .replace(/[\s\S]*;/, '')
      .trim();
    const inner = blockAt(body, open);
    out.push([selector.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')'), inner]);
    i = open + inner.length + 2;
  }
  return out;
}

/**
 * The theme as a shadcn registry:theme item: colours and radius as cssVars
 * (the CLI writes them to the app's :root and .dark and maps them into
 * Tailwind), the animations as theme variables and @keyframes, and the base
 * rules (pointer cursor, focus ring) as css.
 */
function buildThemeItem(item: SourceItem, version: string): BuiltItem {
  const source = readFileSync(item.files[0]!.path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const { light } = themes(source);
  const strip = (theme: Map<string, string>) =>
    Object.fromEntries([...theme].map(([name, value]) => [name.slice(2), value]));
  const lightVars = strip(light);
  const darkVars = strip(collect(rules(source), ['.dark']));

  const themeBody = blockAt(source, source.indexOf('{', source.indexOf('@theme inline')));
  const animations = Object.fromEntries(
    Object.entries(declarations(themeBody))
      .filter(([name]) => name.startsWith('--animate-'))
      .map(([name, value]) => [name.slice(2), value]),
  );
  const css: Record<string, unknown> = {};
  for (const [selector, body] of children(themeBody)) {
    if (!selector.startsWith('@keyframes')) continue;
    css[selector] = Object.fromEntries(children(body).map(([step, d]) => [step, declarations(d)]));
  }

  // The second `@layer base` block holds the rules (the first, the variables).
  const lastBase = source.lastIndexOf('@layer base');
  const baseRules = children(blockAt(source, source.indexOf('{', lastBase)));
  css['@layer base'] = Object.fromEntries(
    baseRules.map(([selector, body]) => [selector, declarations(body)]),
  );

  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    // radius goes with the light colours, as in shadcn's own themes, so it lands in :root.
    cssVars: { theme: animations, light: lightVars, dark: darkVars },
    css,
    meta: { version, ...(item.meta?.docs ? { docs: item.meta.docs } : {}) },
  };
}

export function buildRegistry(url = `${PAGES}/r`): BuiltItem[] {
  const registry = readRegistry();
  const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
  return registry.items.map((item) =>
    item.type === 'registry:theme'
      ? buildThemeItem(item, version)
      : buildCodeItem(registry, item, url, version),
  );
}

if (import.meta.main) {
  const arg = (flag: string) => {
    const i = process.argv.indexOf(flag);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  const url = (arg('--url') ?? `${PAGES}/r`).replace(/\/$/, '');
  const out = arg('--out') ?? 'docs/public/r';
  const registry = readRegistry();
  const items = buildRegistry(url);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const item of items) {
    writeFileSync(join(out, `${item.name}.json`), JSON.stringify(item, null, 2) + '\n');
  }
  // The index, as `shadcn build` writes it: items without their file contents.
  const index = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: registry.name,
    homepage: registry.homepage,
    items: items.map(({ $schema: _schema, files, ...rest }) => ({
      ...rest,
      ...(files ? { files: files.map(({ content: _content, ...f }) => f) } : {}),
    })),
  };
  writeFileSync(join(out, 'registry.json'), JSON.stringify(index, null, 2) + '\n');
  console.log(`wrote ${items.length} items to ${relative('.', out) || basename(out)} for ${url}`);
}
