# flootlets: Tailwind + shadcn conventions, shadcn registry, automatic releases

## Context

flootlets (`~/Desktop/Projects/flootlets`, github.com/dyeoh/flootlets) ships 25 SolidJS components as an npm package:

- hand-written CSS per component with `--fl-*` tokens in `@layer flootlets.*`;
- Kobalte for behaviour, Starlight docs on GitHub Pages, 144 tests.

Reviewing the developer experience, the user decided that hand-rolled CSS is reinventing the wheel. Heavy restyling should be as easy as shadcn/ui makes it. Decisions:

- **Tailwind CSS v4 only.** No plain-CSS flavour, no double styling. Classes live in the components via `cva` + `cn()` (clsx + tailwind-merge), as in shadcn.
- **Follow shadcn/ui's naming conventions:** theme variables, the `.dark` class, variant/size names, `cn`, `components/ui` layout.
- **Two ways to consume, from one source:** the npm package (get updates) and a shadcn registry (`npx shadcn add …`, copy and own).
- **Automatic semantic versioning** from the Conventional Commits commitlint already enforces.
- **Scope: flootlets only.** Work continues in a new Claude Code session opened in that repo.

## 1. Theme in shadcn's names (`src/styles/theme.css`, replaces tokens.css/base.css)

- **Variables:**
  - `--background` `--foreground` `--card` `--card-foreground` `--popover` `--popover-foreground`;
  - `--primary` `--primary-foreground` `--secondary` `--secondary-foreground`;
  - `--muted` `--muted-foreground` `--accent` `--accent-foreground`;
  - `--destructive` `--destructive-foreground` `--border` `--input` `--ring` `--radius`;
  - extras in the same pattern: `--success`, `--warning`.
- **Palette:**

  | Variable                               | Light                                    | Dark                                                       |
  | -------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
  | `--primary`                            | brush red `#971c2a` (paper text, 8.35:1) | `#df5363` with ink text, so it works as both fill and text |
  | `--secondary` / `--muted` / `--accent` | neutral greys                            | neutral greys                                              |
  | `--background`                         | paper                                    | ink                                                        |

- **Dark mode:**
  - `.dark` class (the shadcn/next-themes convention) plus `[data-theme="dark"]` (Starlight's picker), using Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *, [data-theme=dark], [data-theme=dark] *))`;
  - falls back to `prefers-color-scheme` when neither is set to light, so "follow the system" still works.
- **`@theme inline` maps the variables into Tailwind,** exactly as shadcn does: `--color-primary: var(--primary)`, `--radius-lg: var(--radius)`, etc. Classes like `bg-primary text-primary-foreground` then follow the theme.
- **Base rules** in `@layer base`:
  - pointer cursor on buttons and ARIA widgets (Kobalte is headless);
  - `not-allowed` when disabled;
  - the focus ring from `--ring`.
- **The old `--fl-*` spacing/type/motion scales are dropped;** Tailwind's own scales replace them.
- **Contrast tests** (`tests/theme.test.ts`):
  - every `x` / `x-foreground` pair and text on background/card/muted at ≥ 4.5:1, and `--ring` / `--input` at ≥ 3:1, in light and dark;
  - parses hex **and oklch**, since shadcn themes use oklch;
  - `bun run check:theme <file.css>` checks any pasted shadcn/tweakcn theme.

## 2. Components restyled with Tailwind

- **`src/lib/utils.ts`:** `cn()` = `twMerge(clsx(...))`. Replaces `cx`.
- **Each component gets a cva config** next to it (e.g. `buttonVariants`), as in shadcn:
  - Tailwind state variants replace data-attribute CSS (`data-[loading]:`, `aria-[invalid=true]:`, `data-[highlighted]:`, `data-[expanded]:`);
  - the `class` prop is merged last, so callers override anything.
- **shadcn variant names:**
  - Button `variant`: `default | destructive | outline | secondary | ghost | link`; `size`: `default | sm | lg | icon`;
  - Badge: `default | secondary | destructive | outline` + `success | warning`.
- **Component CSS files are deleted.** The few things utilities can't express (Carousel scroll-snap/scrollbar hiding, keyframes) go in `theme.css` under `@layer components` / `@theme` keyframes.
- **Behaviour, accessibility and server rendering are unchanged.** The existing tests stay the safety net; only style assertions (classes) are updated. Keep:
  - the Carousel geometry regression tests;
  - the export guard;
  - axe checks;
  - the SSR suite.
- **Representative files:** `src/components/Button/Button.tsx`, `src/components/Carousel/Carousel.tsx`, `src/lib/utils.ts`, `src/styles/theme.css`, `tests/theme.test.ts`.

## 3. Packaging and registry from one source

- **npm package:**
  - ships the components plus `flootlets/theme.css`;
  - apps import it after `@import "tailwindcss"` and add `@source "../node_modules/flootlets/dist"`, so Tailwind sees the library's classes;
  - `scripts/check-exports.ts` is kept.
- **shadcn registry:**
  - `registry.json` at the repo root: `theme` (`registry:theme`, the variables in shadcn's `cssVars` format), `utils` (`registry:lib`, `cn`), and one `registry:ui` per component;
  - each component item lists its npm `dependencies` (`@kobalte/core`, `class-variance-authority`, `tailwind-merge`, `clsx`) and `registryDependencies` (e.g. button → spinner, utils, theme);
  - built into `docs/public/r/*.json` and served from Pages: `npx shadcn add https://dyeoh.github.io/flootlets/r/button.json`;
  - each copied file carries a version header: `// flootlets <version>, <docs url>`.
- **Registry smoke test in CI** (`tests/registry-smoke/`): a throwaway Astro + Solid + Tailwind v4 app installs every item, typechecks, and server-renders a page with Button / Select / Carousel. It also confirms what the shadcn CLI needs in a Solid project (`components.json`, aliases).
- **Docs:**
  - the Starlight site moves to Tailwind (Starlight's Tailwind integration);
  - new "Installation" page: npm vs copy-in, `components.json`, the `@source` line;
  - "Theming" is rewritten (paste a shadcn/tweakcn theme, `.dark`);
  - every component page shows both install commands.

## 4. Automatic semantic versioning (release-please)

- **`.github/workflows/release.yml`:** release-please maintains a Release PR on every push to `main`. It bumps `package.json`, updates `CHANGELOG.md` from Conventional Commits, and proposes the next version.
- **Merging that PR** tags `vX.Y.Z` and creates a GitHub Release. A publish job then builds and runs `npm publish --provenance`.
- **Pre-1.0 config** (`release-please-config.json`):
  - `bump-minor-pre-major` (breaking → 0.x+1);
  - `bump-patch-for-minor-pre-major` (feat → patch);
  - changelog sections: Features, Bug Fixes, Documentation, Performance.
- **npm trusted publishing** (GitHub OIDC), so no token is stored. One-time user step: link the repo on npmjs.com, or add an `NPM_TOKEN` secret.
- **The released version** feeds the registry headers and the docs footer.

## 5. Session handoff (first thing to do on approval)

- **No `CLAUDE.md` or symlink.** Claude Code ≥ 2.1.277 reads `AGENTS.md` automatically when there's no `CLAUDE.md`; the user has 2.1.293, and flootlets has only `AGENTS.md`. Don't add a `CLAUDE.md` or `CLAUDE.local.md`: either would stop `AGENTS.md` loading.
- **Copy this plan into the repo** as `docs/plans/tailwind-registry.md` and commit it. A new session (`cd ~/Desktop/Projects/flootlets && claude`) then starts with: "Implement docs/plans/tailwind-registry.md".
- **Update AGENTS.md's design and CSS sections** for Tailwind + shadcn conventions during step 2, so later sessions follow the new approach.

## Commits (commitizen style)

1. `docs: add the tailwind + registry plan`
2. `feat(theme)!: adopt shadcn theme variables with tailwind v4` (BREAKING CHANGE: `--fl-*` removed, rename table)
3. `feat!: restyle components with tailwind and shadcn variant names`, split by group if large (basics, forms, feedback, shop)
4. `feat(registry): publish a shadcn registry`, with docs and the smoke test
5. `ci: automate releases with release-please and npm trusted publishing`

## Verification

- `bun run lint && bun run typecheck && bun run test`: behaviour, axe and SSR suites pass; theme contrast passes in light and dark.
- `bun run check:theme` on a pasted shadcn oklch theme reports its pairs.
- `bun run docs:build`: every page renders with Tailwind styles, and the registry JSON is served at `/r/*.json`.
- Registry smoke app: installs all items, typechecks, `astro build` succeeds.
- **Releases:**
  - a `fix:` commit makes release-please open a PR for the next patch with its changelog;
  - merging it tags the release, creates a GitHub Release and publishes to npm;
  - a `feat!:` commit proposes 0.(x+1).0.
