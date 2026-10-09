# Working on flootlets

This guide is for anyone changing flootlets, human or AI agent: why it's built
this way, the conventions, and the checklist every component has to pass. For
_using_ flootlets, read [README.md](README.md).

Short version: **Tailwind and shadcn/ui conventions, theme variables for every
colour, server-render first, and accessibility isn't optional.**

---

## 1. Design decisions

### SolidJS components, not web components

Browser support stopped being a deciding factor: Declarative Shadow DOM, CSS
`@layer` and JS modules each reach about 96–97% of users worldwide (StatCounter /
caniuse, September 2026). What decides is theming, accessibility and SEO, and
web components lose on all three: Shadow DOM blocks app CSS, ARIA references
can't cross shadow roots, and shadow content is a risk for crawlers. Solid
components render to plain HTML on the server and hydrate only where needed.

### How the package is built

Solid compiles JSX differently for the browser and for server rendering, so a
library that only ships browser-compiled JS breaks SSR. flootlets ships three
four things (see `package.json` exports):

| Output                  | Made by                    | Used by                                                                                    |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| `dist/source/`          | `tsc` with `jsx: preserve` | Solid apps and Astro (the `solid` export condition), which compile it for their own target |
| `dist/browser/index.js` | Vite library build         | apps without Solid tooling                                                                 |
| `dist/types/`           | `tsc`                      | everyone (TypeScript)                                                                      |
| `dist/theme.css`        | copied from `src/styles/`  | everyone: `@import 'flootlets/theme.css'` after Tailwind                                   |

Dependencies (`solid-js`, `@kobalte/core`, `class-variance-authority`, `clsx`,
`tailwind-merge`) are never bundled: apps provide one copy each. Tailwind itself
runs in the app, which points `@source` at `node_modules/flootlets/dist` so the
components' classes are generated.
TypeScript is pinned to 5.9: TypeScript 7 (the native rewrite) has no JS API yet,
which the build tooling relies on.

### Styling: Tailwind v4 with shadcn/ui's conventions

Hand-written CSS per component was reinventing what shadcn/ui already does
well, so components follow it: anyone who knows shadcn can restyle flootlets.

- **Classes live in the component**, built with `cva` (variants) and `cn()`
  (clsx + tailwind-merge, in `src/lib/utils.ts`). The caller's `class` is
  merged last, so it overrides anything. There are no component stylesheets.
- **Variant and size names are shadcn's** (`default`, `destructive`, `outline`,
  `secondary`, `ghost`, `link`; `default`, `sm`, `lg`, `icon`), plus `success`
  and `warning` where a status is needed. Each cva config is exported
  (`buttonVariants`), as in shadcn.
- **Colours are only theme variables** (`bg-primary`, `text-muted-foreground`),
  never Tailwind palette colours (`bg-red-600`) or raw values, so themes work.
  `src/styles/theme.css` defines them and maps them into Tailwind with
  `@theme inline`; dark mode is `.dark`, `data-theme="dark"`, or the system.
- **State styles use Tailwind's variants** on Kobalte's and our data attributes
  (`data-highlighted:`, `data-expanded:`, `aria-invalid:`, `in-data-loading:`),
  and every part carries a `data-slot` (shadcn v4) for CSS targeting.
- **Focus is our global outline** (`:focus-visible` in theme.css, 2px solid
  `--ring`), not shadcn's translucent ring, which is below 3:1. Don't add
  `outline-none` to focusable elements.
- **Write class names whole.** Tailwind finds classes by scanning source text,
  so `bg-${variant}` never works; `tests/classes.test.ts` fails on any class
  that generates no CSS.

### shadcn registry, from the same source

Besides the npm package, flootlets is a shadcn registry: apps can copy a
component's code in with `npx shadcn add <url>` and own it.

- `registry.json` (repo root) lists the items: name, type, title, description,
  source files. `scripts/build-registry.ts` builds `docs/public/r/*.json`,
  served from Pages. It rewrites relative imports to the paths the shadcn CLI
  maps to the app's aliases (`@/lib/utils`, `@/registry/flootlets/ui/x`), works
  out npm and registry dependencies from the imports, adds a
  `// flootlets <version>, <docs>` header after the imports (the CLI drops
  comments before them), and turns `theme.css` into a `registry:theme` item.
- **Imports inside `src/` stay relative** (`../../lib/utils`, `../Button/Button`):
  the build relies on it. `tests/registry.test.ts` checks every source file is
  an item and every dependency resolves.
- `bun run registry:smoke` installs every item into a throwaway Astro + Solid +
  Tailwind app (`tests/registry-smoke/`) with the real, pinned shadcn CLI, then
  typechecks and builds it. CI runs it.

### Accessibility primitives

Interactive components with real keyboard and focus behaviour (select, dialog,
checkbox, radio, toast) are built on Kobalte, which is headless: it provides
behaviour and ARIA, and we provide every style, including the pointer cursor
on hover that browsers don't add to buttons by default (in theme.css).

---

## 2. Conventions

- **One folder per component:** `src/components/Button/` holds `Button.tsx`
  (component and its `buttonVariants`) and `Button.test.tsx`. Export both from
  `src/index.ts`, and add it to `registry.json`.
- **Parts** carry `data-slot="<component>"` / `"<component>-<part>"`; variants and
  state are data attributes (`data-variant`, `data-size`, `data-loading`).
- **Theme variables** use shadcn/ui's names (`--primary`, `--muted-foreground`,
  `--radius`), in `src/styles/theme.css`. The values are shadcn's neutral theme,
  nudged where it misses WCAG AA; restyling for a real site happens there.
- **Icons** are the components in `src/lib/icons.tsx` (lucide's shapes), sized
  with `size-*` or the parent's `[&_svg]` rules.
- **Props:** forward unknown props to the root element (`splitProps`), accept
  `class`, and never require a wrapper div for styling.
- **Money** is `{ amount, currency }` in minor units, the same shape the
  gnerkulfloot API returns. Format it with the shared helper, never by hand.
- **Never hoist JSX into a shared constant** (`const ICON = <svg>…</svg>`). Solid
  JSX creates real DOM nodes, so rendering one constant in two places _moves_
  the node and leaves the first place empty. Make it a component (`<CheckIcon />`).
- **Reactive props:** never pick between elements with an early `return` based on
  a prop (it runs once); use `<Show>`, `<Dynamic>` or JSX expressions.
- **Browser-only code** (Kobalte parts that can't server-render, `window`, layout
  reads) runs in `onMount` or behind a mounted signal, so the server render and
  the first browser render match. See `Toaster`.

## 3. Accessibility checklist (every component)

- Works with keyboard only; focus is always visible (`:focus-visible` ring).
- Names: every control has an accessible name; icon-only buttons need `aria-label`.
- Errors and descriptions are linked with `aria-describedby`; invalid fields set `aria-invalid`.
- Buttons default to `type="button"` so they never submit forms by accident.
- Changes that happen without a page load (added to cart, errors) are announced
  through a live region.
- Colour contrast meets WCAG AA (4.5:1 for text, 3:1 for large text and UI) in
  light **and** dark; the contrast test enforces this for theme pairs.
- Motion respects `prefers-reduced-motion`.
- Tests: an axe check of the default render, plus keyboard interaction tests for
  anything interactive.

## 4. Tests

- `src/**/*.test.tsx` runs in jsdom (the `dom` project): rendering, interaction, axe.
- `tests/**/*.ssr.test.tsx` runs in Node with Solid's server build (the `ssr`
  project): every component must render to HTML on the server, as in Astro.
- The two projects have separate config files so their Solid compiler settings
  never mix.
- `tests/theme.test.ts` checks contrast, theme blocks and the Tailwind mapping
  (`bun run check:theme <file>` runs the contrast check on any theme);
  `tests/classes.test.ts` compiles every class the components use and fails on
  any Tailwind doesn't know; `tests/exports.test.ts` checks every component is
  exported from the package entry (a missing export once slipped through
  unnoticed).
- Regression tests for browser-only bugs (like the Carousel's) simulate the
  geometry jsdom lacks. Check such a test fails with the fix removed.
- `bun run lint` fails on any warning: eslint-plugin-solid's warnings are real
  reactivity bugs.

## 5. Documentation site

`docs/` is an Astro + Starlight site, deployed to GitHub Pages
(https://dyeoh.github.io/flootlets/) by `.github/workflows/docs.yml` on every push to `main`.

- **Every component gets a page** in `docs/src/content/docs/components/`, in the same commit as
  the component: both install commands (`<Install items={[…]} />`), live examples, props,
  accessibility notes and its variants, `data-slot` parts and data attributes.
- **Examples are real Solid files** in `docs/src/examples/`. A page imports each one twice: once
  to render it, once with `?raw` to show its code. The code on the page is always the code that
  runs.
- **Only interactive examples get `client:*`.** Static ones are server-rendered with no
  JavaScript, as they would be in a storefront.
- **Dev vs build:** `astro dev` aliases `flootlets` to `src/` for live editing; `astro build`
  aliases it to `dist/` (the code the package ships), so every docs build is an end-to-end check
  that Astro can compile and server-render the published components.
- **Tailwind** comes in through Starlight's Tailwind integration (`docs/src/styles/tailwind.css`),
  plus Tailwind's preflight in the lowest layer, since the components expect it.
- Starlight's theme picker sets `data-theme` on `<html>`, which the theme already follows.

## 6. Doc style

- A short comment block at the top of each component file: what it is and when
  to use it.
- JSDoc on every exported component and prop: what it does and why, not how.
- Comments explain intent and invariants, not the code line by line.
- Changes to behaviour or props update the docs page in the same commit.

## 7. Commits

Conventional Commits, the format commitizen produces: run `bun run commit`, or
write it by hand. A `commit-msg` hook (commitlint) rejects anything else.

```
<type>(<scope>): <imperative lowercase summary>

<body: why>
```

- **Types:** `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
- **Scopes:** `theme`, `registry`, `build`, `docs`, `ci`, or the component (`button`, `price`, `dialog`…).
- **Breaking changes** (renamed variables, props or classes) get `!` after the
  type/scope and a `BREAKING CHANGE:` footer.
- **Body lines never start with `word:`**: commitlint and release-please read
  that as the start of a footer, and the rest of the body is misread.

Before committing: `bun run lint && bun run typecheck && bun run test && bun run docs:build`.
CI runs the same, plus `check:exports`, the registry smoke test and commitlint on pull requests.

## 8. Releases

Versions come from the commits; nobody edits `version` by hand.
`.github/workflows/release.yml` runs release-please on every push to `main`. It
keeps a Release PR open with the next version, the `package.json` bump and the
`CHANGELOG.md` entry. Merging it tags `vX.Y.Z`, creates a GitHub Release and
publishes to npm through trusted publishing (GitHub OIDC, with provenance; the
trusted publisher on npmjs.com needs direct publish allowed, not just stage).
If publishing fails, fix it and run the Release workflow by hand (Run
workflow) to publish the version on `main`.

Before 1.0 (`release-please-config.json`): a breaking change bumps the minor
version (0.2.0 → 0.3.0), and `feat` and `fix` bump the patch. `docs` changes are
listed in the changelog; `refactor`, `test`, `build`, `ci` and `chore` are
not. The version also goes into the docs footer and every registry file's
header.
