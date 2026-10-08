# flootlets

Accessible, themeable [SolidJS](https://www.solidjs.com/) components for shops built on
[gnerkulfloot](https://github.com/dyeoh/gnerkulfloot). Little bits of gnerkulfloot.

- **Tailwind CSS v4 and shadcn/ui conventions.** Components are styled with Tailwind classes
  (`cva` + `cn()`), shadcn's variant names and its theme variables (`--primary`,
  `--muted-foreground`, `--radius`…), so any shadcn or tweakcn theme drops in.
- **Your classes win.** The `class` you pass is merged last with tailwind-merge, so
  `class="rounded-full"` replaces the component's radius instead of fighting it.
- **Server-rendered first.** Works in [Astro](https://astro.build/) and other Solid SSR setups:
  static components ship no JavaScript, and interactive ones hydrate as islands.
- **Accessible by default.** Keyboard support, focus management and ARIA come from
  [Kobalte](https://kobalte.dev/) for interactive pieces; every component is checked with axe.
- **Light and dark** follow the visitor's system setting, or `.dark` / `data-theme="dark"`.

> **Status:** all planned components are in: basics, forms, feedback and overlays, and shop
> components. Pre-1.0, so props may still change between minor versions.

**Documentation and live examples: https://dyeoh.github.io/flootlets/**

## Components

| Component                                                   | What it's for                                                                                                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                                    | Actions; with `href`, a link styled as a button. Variants `primary` (brand red), `secondary`, `outline`, `ghost`, `danger`; `loading` keeps focus and width |
| `Link`                                                      | Inline text links; `external` opens a new tab safely and says so                                                                                            |
| `Price`                                                     | Money from the gnerkulfloot API (`{ amount, currency }` in minor units), with an optional struck-through `compareAt` price                                  |
| `Badge`                                                     | Short labels: `neutral`, `accent`, `success`, `warning`, `danger`                                                                                           |
| `Spinner`, `Skeleton`                                       | Loading states                                                                                                                                              |
| `Stack`, `Cluster`, `Grid`                                  | Layout: column, wrapping row, responsive grid (gaps from the spacing scale)                                                                                 |
| `VisuallyHidden`                                            | Text for screen readers only                                                                                                                                |
| `TextField`, `TextArea`, `Select`, `Checkbox`, `RadioGroup` | Form controls with `label`, `description` and `error` wired for screen readers                                                                              |
| `QuantityStepper`                                           | Choose a quantity within stock limits; arrow keys and typing work                                                                                           |
| `Alert`                                                     | Inline messages (errors are announced straight away)                                                                                                        |
| `toast()` + `Toaster`                                       | Short, temporary messages like "Added to cart"                                                                                                              |
| `Dialog`                                                    | Modal confirmations with focus trapping and return                                                                                                          |
| `EmptyState`                                                | An empty cart or no search results, with a way forward                                                                                                      |
| `ProductCard`, `ProductImage`, `StockBadge`                 | Products in grids and carousels, using the gnerkulfloot API's image URLs                                                                                    |
| `Carousel`                                                  | A row of items that pages left and right, built on scroll-snap                                                                                              |
| `Pagination`                                                | Page links (or buttons), numbered or "has more" style                                                                                                       |

Helpers: `formatMoney(money, locale)`, `currencyDigits(currency)`, `cx(...classes)`.

```tsx
import { Button, Price } from 'flootlets';

<Price amount={{ amount: 2500, currency: 'MYR' }} compareAt={{ amount: 3500, currency: 'MYR' }} locale="en-MY" />
<Button onClick={addToCart}>Add to cart</Button>
```

Always pass the same `locale` on the server and in the browser, so server-rendered prices
hydrate without a mismatch.

## Theming

Colours and radius are shadcn/ui theme variables; the defaults are shadcn's neutral theme. Override variables in your own CSS, or paste in any shadcn or tweakcn theme:

```css
:root {
  --primary: #0064ff; /* buttons, links, sale prices */
  --ring: #0064ff;
  --radius: 0.375rem; /* squarer corners */
}
```

Light and dark follow the visitor's system setting. Put `class="dark"` or `data-theme="dark"`
(or `light`) on `<html>`, or any element, to force one. Keep colours used as text at 4.5:1
contrast with their backgrounds; `bun run check:theme theme.css` checks every pair, and
flootlets' own theme is tested for it.

## Install

flootlets needs Tailwind CSS v4 in your app.

```sh
bun add flootlets solid-js        # or npm / pnpm
```

In your main CSS file, after Tailwind, import the theme and let Tailwind see the components'
classes (the `@source` path is relative to this file):

```css
@import 'tailwindcss';
@import 'flootlets/theme.css';
@source '../node_modules/flootlets/dist';
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
bun run build        # dist/: browser bundle, JSX source for Solid apps, types, theme.css
bun run commit       # write a commit message interactively (commitizen)
bun run docs:dev     # the docs site at http://localhost:4321/flootlets/, using live source
bun run docs:build   # builds the library, then the docs from what the package ships
```

Read [AGENTS.md](AGENTS.md) before changing code: it covers the design decisions,
conventions and the accessibility checklist.

## License

MIT
