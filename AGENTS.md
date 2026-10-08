# Working on flootlets

This guide is for anyone changing flootlets, human or AI agent: why it's built
this way, the conventions, and the checklist every component has to pass. For
_using_ flootlets, read [README.md](README.md).

Short version: **plain CSS in layers, tokens for every value, server-render
first, and accessibility isn't optional.**

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
things (see `package.json` exports):

| Output                  | Made by                    | Used by                                                                                    |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| `dist/source/`          | `tsc` with `jsx: preserve` | Solid apps and Astro (the `solid` export condition), which compile it for their own target |
| `dist/browser/index.js` | Vite library build         | apps without Solid tooling                                                                 |
| `dist/types/`           | `tsc`                      | everyone (TypeScript)                                                                      |
| `dist/flootlets.css`    | `scripts/build-css.ts`     | everyone: `import 'flootlets/styles.css'`                                                  |

`solid-js` and `@kobalte/core` are never bundled: apps provide one copy each.
TypeScript is pinned to 5.9: TypeScript 7 (the native rewrite) has no JS API yet,
which the build tooling relies on.

### CSS: tokens and cascade layers

- Every value comes from a token (`var(--fl-…)`). No raw colours or magic
  numbers in component CSS.
- Everything is inside `@layer flootlets.*` (order: `reset`, `tokens`, `base`,
  `components`). App styles outside any layer always win, so apps override
  without `!important` or specificity tricks.
- Selectors use `:where()` where possible to keep specificity at zero.
- Variants and state are data attributes (`data-variant="primary"`,
  `data-loading`), not class combinations.

### Accessibility primitives

Interactive components with real keyboard and focus behaviour (select, dialog,
checkbox, radio, toast) are built on Kobalte, which is headless: it provides
behaviour and ARIA, and we provide every style, including the pointer cursor
on hover that browsers don't add to buttons by default.

---

## 2. Conventions

- **One folder per component:** `src/components/Button/` holds `Button.tsx`,
  `Button.css` and `Button.test.tsx`. Export it from `src/index.ts`, and add
  its CSS to `src/styles/index.css` with `layer(flootlets.components)`.
- **Class names** are `fl-<component>` and `fl-<component>__<part>`.
- **Theme variables** use shadcn/ui's names (`--primary`, `--muted-foreground`, `--radius`), in
  `src/styles/theme.css`. The remaining `--fl-*` scales and aliases in `legacy.css` are
  transitional: don't use them in new code.
- **Props:** forward unknown props to the root element (`splitProps`), accept
  `class`, and never require a wrapper div for styling.
- **Money** is `{ amount, currency }` in minor units, the same shape the
  gnerkulfloot API returns. Format it with the shared helper, never by hand.
- **Never hoist JSX into a shared constant** (`const ICON = <svg>…</svg>`). Solid
  JSX creates real DOM nodes, so rendering one constant in two places _moves_
  the node and leaves the first place empty. Make it a component (`<Chevron />`).
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
- `tests/theme.test.ts` checks contrast, theme blocks and the Tailwind mapping (`bun run
check:theme <file>` runs the contrast check on any theme);
  `tests/exports.test.ts` checks every component is exported from the package
  entry (a missing export once slipped through unnoticed).
- Regression tests for browser-only bugs (like the Carousel's) simulate the
  geometry jsdom lacks. Check such a test fails with the fix removed.
- `bun run lint` fails on any warning: eslint-plugin-solid's warnings are real
  reactivity bugs.

## 5. Documentation site

`docs/` is an Astro + Starlight site, deployed to GitHub Pages
(https://dyeoh.github.io/flootlets/) by `.github/workflows/docs.yml` on every push to `main`.

- **Every component gets a page** in `docs/src/content/docs/components/`, in the same commit as
  the component: live examples, props, accessibility notes and its classes, data attributes and
  variables.
- **Examples are real Solid files** in `docs/src/examples/`. A page imports each one twice: once
  to render it, once with `?raw` to show its code. The code on the page is always the code that
  runs.
- **Only interactive examples get `client:*`.** Static ones are server-rendered with no
  JavaScript, as they would be in a storefront.
- **Dev vs build:** `astro dev` aliases `flootlets` to `src/` for live editing; `astro build`
  aliases it to `dist/` (the code the package ships), so every docs build is an end-to-end check
  that Astro can compile and server-render the published components.
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
- **Scopes:** `theme`, `base`, `build`, `docs`, `ci`, or the component (`button`, `price`, `dialog`…).
- **Breaking changes** (renamed tokens, props or classes) get `!` after the
  type/scope and a `BREAKING CHANGE:` footer.

Before committing: `bun run lint && bun run typecheck && bun run test && bun run docs:build`.
CI runs the same, plus `check:exports` and commitlint on pull requests.
