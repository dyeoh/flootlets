// Checks a theme's colour pairs against WCAG AA, in light and dark. Works on
// flootlets' own theme.css and on any pasted shadcn or tweakcn theme: colours
// may be hex, rgb(), hsl(), oklch() or shadcn v3's bare "H S% L%" triples.
//
//   bun run check:theme [file.css]   (default: src/styles/theme.css)
//
// tests/theme.test.ts runs the same checks on src/styles/theme.css.
import { readFileSync } from 'node:fs';

export type Theme = Map<string, string>;

export interface CssRule {
  selectors: string[];
  declarations: Theme;
}

/** Every innermost `selector { declarations }` rule, at any nesting depth (inside @layer, @media…). */
export function rules(css: string): CssRule[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: splitTopLevel(m[1]!.trim()),
    declarations: new Map(
      [...m[2]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)].map((d) => [d[1]!, d[2]!.trim()]),
    ),
  }));
}

/** Splits on commas outside parentheses: `:root:not(.a, .b), .c` → two selectors. */
function splitTopLevel(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '(') depth++;
    else if (list[i] === ')') depth--;
    else if (list[i] === ',' && depth === 0) {
      out.push(list.slice(from, i).trim());
      from = i + 1;
    }
  }
  out.push(list.slice(from).trim());
  return out;
}

/** The variables of every rule matching one of `selectors`, later rules winning. */
export function collect(all: CssRule[], selectors: string[]): Theme {
  const out: Theme = new Map();
  for (const rule of all) {
    if (rule.selectors.some((s) => selectors.includes(s.replaceAll('"', "'")))) {
      for (const [name, value] of rule.declarations) out.set(name, value);
    }
  }
  return out;
}

export const LIGHT_SELECTORS = [':root', '.light', "[data-theme='light']", '[data-theme=light]'];
export const DARK_SELECTORS = ['.dark', "[data-theme='dark']", '[data-theme=dark]'];

/** The light and dark themes in a stylesheet; dark inherits whatever it doesn't redefine. */
export function themes(css: string): { light: Theme; dark: Theme } {
  const all = rules(css);
  const light = collect(all, LIGHT_SELECTORS);
  const dark = new Map([...light, ...collect(all, DARK_SELECTORS)]);
  return { light, dark };
}

/** sRGB channels and alpha, all 0–1. */
type Rgba = [r: number, g: number, b: number, a: number];

const clamp = (x: number) => Math.min(1, Math.max(0, x));

function number(token: string, percentOf = 1): number {
  return token.endsWith('%') ? (parseFloat(token) / 100) * percentOf : parseFloat(token);
}

function alpha(token: string | undefined): number {
  return token === undefined
    ? 1
    : clamp(token.endsWith('%') ? parseFloat(token) / 100 : parseFloat(token));
}

/** The components of `fn(a b c / d)` or `fn(a, b, c, d)`. */
function args(inner: string): { parts: string[]; a?: string } {
  const [main, a] = inner.split('/').map((s) => s.trim());
  return { parts: main!.split(/[\s,]+/).filter(Boolean), a };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) =>
    l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

function oklchToRgb(L: number, C: number, H: number): [number, number, number] {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  // Out-of-gamut colours are clamped, as browsers display them on sRGB screens.
  const encode = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  return linear.map((c) => clamp(encode(clamp(c)))) as [number, number, number];
}

/** Parses a CSS colour; undefined if the format isn't supported. */
export function parseColor(value: string): Rgba | undefined {
  const v = value.trim().toLowerCase();
  const hex = v.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let digits = hex[1]!;
    if (digits.length === 3 || digits.length === 4) digits = [...digits].map((d) => d + d).join('');
    if (digits.length !== 6 && digits.length !== 8) return undefined;
    const c = [0, 2, 4, 6].map((i) => parseInt(digits.slice(i, i + 2) || 'ff', 16) / 255);
    return c as Rgba;
  }
  const fn = v.match(/^(rgba?|hsla?|oklch)\((.*)\)$/);
  if (fn) {
    const { parts, a } = args(fn[2]!);
    const [x = '0', y = '0', z = '0', legacyAlpha] = parts;
    if (fn[1]!.startsWith('rgb')) {
      return [
        number(x, 255) / 255,
        number(y, 255) / 255,
        number(z, 255) / 255,
        alpha(a ?? legacyAlpha),
      ];
    }
    if (fn[1]!.startsWith('hsl')) {
      return [...hslToRgb(parseFloat(x), number(y), number(z)), alpha(a ?? legacyAlpha)];
    }
    const H = z === 'none' ? 0 : parseFloat(z);
    return [...oklchToRgb(number(x), number(y, 0.4), H), alpha(a)];
  }
  // shadcn v3 themes store bare HSL triples ("222.2 84% 4.9%") and wrap them in hsl() later.
  const bare = v.match(/^([\d.]+)\s+([\d.]+%)\s+([\d.]+%)$/);
  if (bare) return [...hslToRgb(parseFloat(bare[1]!), number(bare[2]!), number(bare[3]!)), 1];
  return undefined;
}

/** A variable's value, following var() references within the theme. */
export function resolve(theme: Theme, name: string, seen = new Set<string>()): string | undefined {
  if (seen.has(name)) return undefined;
  seen.add(name);
  const value = theme.get(name);
  const ref = value?.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve(theme, ref[1]!, seen) : value;
}

/** A translucent colour composited over an opaque one, the way the browser paints it. */
function over([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function luminance([r, g, b]: Rgba): number {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio; translucent colours are composited over the page background first. */
export function contrast(fg: Rgba, bg: Rgba, page: Rgba): number {
  const back = bg[3] < 1 ? over(bg, page) : bg;
  const front = fg[3] < 1 ? over(fg, back) : fg;
  const [hi, lo] = [luminance(front), luminance(back)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

export const TEXT = 4.5; // WCAG AA, normal text
export const UI = 3; // WCAG AA, large text and UI parts (input borders, focus rings)

export type Pair = [fg: string, bg: string, min: number];

const SURFACES = ['background', 'card', 'muted'];

/** Every pair a theme must keep readable. */
export const PAIRS: Pair[] = [
  // Each colour with its -foreground: buttons, badges, popovers.
  ['foreground', 'background', TEXT],
  ...[
    'card',
    'popover',
    'primary',
    'secondary',
    'muted',
    'accent',
    'destructive',
    'success',
    'warning',
  ].map((name): Pair => [`${name}-foreground`, name, TEXT]),
  // Colours that are also used as text on the page: muted text, links, errors.
  ...SURFACES.flatMap((bg) =>
    ['muted-foreground', 'primary', 'destructive', 'success', 'warning'].map((fg): Pair => [
      fg,
      bg,
      TEXT,
    ]),
  ),
  // Focus rings and input borders.
  ...SURFACES.flatMap((bg) => ['ring', 'input'].map((fg): Pair => [fg, bg, UI])),
];

export interface Result {
  fg: string;
  bg: string;
  min: number;
  /** undefined when a variable is missing or its colour can't be parsed. */
  ratio?: number;
  problem?: string;
}

export function check(theme: Theme, pairs: Pair[] = PAIRS): Result[] {
  const page = parseColor(resolve(theme, '--background') ?? '#ffffff') ?? [1, 1, 1, 1];
  return pairs.map(([fg, bg, min]) => {
    const values = [fg, bg].map((name) => resolve(theme, `--${name}`));
    const colors = values.map((value) => (value === undefined ? undefined : parseColor(value)));
    const missing = [fg, bg].filter((_, i) => values[i] === undefined);
    if (missing.length) return { fg, bg, min, problem: `--${missing.join(', --')} not defined` };
    const unparsed = [fg, bg].filter((_, i) => colors[i] === undefined);
    if (unparsed.length) return { fg, bg, min, problem: `can't parse --${unparsed.join(', --')}` };
    return { fg, bg, min, ratio: contrast(colors[0]!, colors[1]!, page) };
  });
}

export const passes = (r: Result) => r.ratio !== undefined && r.ratio >= r.min;

if (import.meta.main) {
  const file = process.argv[2] ?? 'src/styles/theme.css';
  let failures = 0;
  for (const [name, theme] of Object.entries(themes(readFileSync(file, 'utf8')))) {
    console.log(`\n${name}`);
    for (const r of check(theme)) {
      const ok = passes(r);
      if (!ok) failures++;
      const status = ok ? 'pass' : r.ratio === undefined ? 'MISS' : 'FAIL';
      const detail =
        r.ratio === undefined ? r.problem : `${r.ratio.toFixed(2)}:1 (needs ${r.min}:1)`;
      console.log(`  ${status}  --${r.fg} on --${r.bg}: ${detail}`);
    }
  }
  console.log(
    failures
      ? `\n${failures} pair(s) missing or below WCAG AA in ${file}`
      : `\nall pairs pass in ${file}`,
  );
  process.exit(failures ? 1 : 0);
}
