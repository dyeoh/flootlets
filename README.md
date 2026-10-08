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

> **Status: early.** Design tokens and the basic components are in; forms, overlays and shop
> components are next.

**Documentation and live examples: https://dyeoh.github.io/flootlets/**

## Components

| Component                  | What it's for                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                   | Actions; with `href`, a link styled as a button. Variants `primary` (brand red), `secondary`, `outline`, `ghost`, `danger`; `loading` keeps focus and width |
| `Link`                     | Inline text links; `external` opens a new tab safely and says so                                                                                            |
| `Price`                    | Money from the gnerkulfloot API (`{ amount, currency }` in minor units), with an optional struck-through `compareAt` price                                  |
| `Badge`                    | Short labels: `neutral`, `accent`, `success`, `warning`, `danger`                                                                                           |
| `Spinner`, `Skeleton`      | Loading states                                                                                                                                              |
| `Stack`, `Cluster`, `Grid` | Layout: column, wrapping row, responsive grid (gaps from the spacing scale)                                                                                 |
| `VisuallyHidden`           | Text for screen readers only                                                                                                                                |

Helpers: `formatMoney(money, locale)`, `currencyDigits(currency)`, `cx(...classes)`.

```tsx
import { Button, Price } from 'flootlets';

<Price amount={{ amount: 2500, currency: 'MYR' }} compareAt={{ amount: 3500, currency: 'MYR' }} locale="en-MY" />
<Button onClick={addToCart}>Add to cart</Button>
```

Always pass the same `locale` on the server and in the browser, so server-rendered prices
hydrate without a mismatch.

## Theming

Every value is a CSS variable. Override the semantic tokens in your own CSS:

```css
:root {
  --fl-color-accent: #0064ff; /* fills: primary buttons, accent badges */
  --fl-color-accent-text: #0050cc; /* links and sale prices */
  --fl-radius-pill: 6px; /* squarer buttons */
}
```

Light and dark follow the visitor's system setting. Set `data-theme="light"` or
`data-theme="dark"` on `<html>` (or any element) to force one. Keep text tokens at 4.5:1
contrast with their backgrounds; flootlets' own tokens are tested for it.

## Install

```sh
bun add flootlets solid-js        # or npm / pnpm
```

```tsx
import 'flootlets/styles.css'; // once, at the root of your app
```

## Troubleshooting

**Astro: "Client-only API called on the server side".** Astro must compile Solid libraries for
the server, and it finds them through your app's dependencies. If a page using a form
component (Select, QuantityStepper…) fails like this, add Kobalte to your app's own
dependencies: `bun add @kobalte/core`.

## Development

You need [Bun](https://bun.sh/) 1.3+.

```sh
bun install          # also installs the commit-msg hook
bun run test         # component tests in jsdom + server-rendering tests
bun run lint         # eslint + prettier
bun run typecheck
bun run build        # dist/: browser bundle, JSX source for Solid apps, types, flootlets.css
bun run commit       # write a commit message interactively (commitizen)
bun run docs:dev     # the docs site at http://localhost:4321/flootlets/, using live source
bun run docs:build   # builds the library, then the docs from what the package ships
```

Read [AGENTS.md](AGENTS.md) before changing code: it covers the design decisions,
conventions and the accessibility checklist.

## License

MIT
