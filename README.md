# flootlets

Accessible, themeable [SolidJS](https://www.solidjs.com/) components for shops built on
[gnerkulfloot](https://github.com/dyeoh/gnerkulfloot). Little bits of gnerkulfloot.

- **Plain CSS with design tokens.** Every colour, size and radius is a CSS custom property
  (`--fl-…`), so theming means overriding variables, with no build step and no Tailwind.
- **Never fights your styles.** All flootlets CSS lives in `@layer flootlets.*`, so your own
  CSS wins automatically, whatever its specificity.
- **Server-rendered first.** Works in [Astro](https://astro.build/) and other Solid SSR setups:
  static components ship no JavaScript, and interactive ones hydrate as islands.
- **Accessible by default.** Keyboard support, focus management and ARIA come from
  [Kobalte](https://kobalte.dev/) for interactive pieces; every component is checked with axe.
- **Light and dark** follow the visitor's system setting, or `data-theme="light|dark"`.

> **Status: early.** The project scaffold is in place; components land next. Documentation
> will live at https://dyeoh.github.io/flootlets/.

## Install

```sh
bun add flootlets solid-js        # or npm / pnpm
```

```tsx
import 'flootlets/styles.css'; // once, at the root of your app
```

## Development

You need [Bun](https://bun.sh/) 1.3+.

```sh
bun install          # also installs the commit-msg hook
bun run test         # component tests in jsdom + server-rendering tests
bun run lint         # eslint + prettier
bun run typecheck
bun run build        # dist/: browser bundle, JSX source for Solid apps, types, flootlets.css
bun run commit       # write a commit message interactively (commitizen)
```

Read [AGENTS.md](AGENTS.md) before changing code: it covers the design decisions,
conventions and the accessibility checklist.

## License

MIT
