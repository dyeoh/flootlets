# Changelog

## [0.2.1](https://github.com/dyeoh/flootlets/compare/v0.2.0...v0.2.1) (2026-10-09)


### Documentation

* describe flootlets as a general solid component library ([87abfcc](https://github.com/dyeoh/flootlets/commit/87abfcce303d5db729d1e526c47c3c81aff59db3))

## [0.2.0](https://github.com/dyeoh/flootlets/compare/v0.1.0...v0.2.0) (2026-10-09)


### ⚠ BREAKING CHANGES

* flootlets now requires Tailwind CSS v4 in the app. Replace `import 'flootlets/styles.css'` with `@import 'flootlets/theme.css'` after `@import 'tailwindcss'`, plus `@source` pointing at node_modules/flootlets/dist. fl-* class names are replaced by data-slot attributes. Renamed props: Button variant primary -> default, danger -> destructive (now filled), new link; size md -> default, new icon. Badge, Alert and toast() `tone` -> `variant`: accent -> default, neutral -> secondary, info -> default, danger -> destructive. Spinner, Price and Dialog size md -> default; QuantityStepper size md -> default. `cx` is replaced by `cn`. Layout gaps use --gap / --min-item-width; Carousel uses --per-page / --gap.
* **theme:** the --fl-color-*, --fl-shadow-* and palette variables are gone as the way to theme; set the shadcn variables instead. --fl-color-bg -> --background, --fl-color-text -> --foreground, --fl-color-text-muted -> --muted-foreground, --fl-color-surface -> --muted, --fl-color-surface-raised -> --card, --fl-color-border -> --border, --fl-color-border-strong -> --input, --fl-color-accent and --fl-color-accent-text -> --primary, --fl-color-on-accent -> --primary-foreground, --fl-color-focus -> --ring, --fl-color-danger-text -> --destructive, --fl-color-success-text -> --success, --fl-color-warning-text -> --warning, --fl-color-neutral-text/-bg -> --secondary-foreground/--secondary. The -bg tints and accent-hover are now derived from those. --fl-radius-* -> --radius (Tailwind's rounded-* derive from it). The remaining --fl-* scales are internal and will be removed.

### Features

* add alert, toast, dialog and empty state ([dd19f85](https://github.com/dyeoh/flootlets/commit/dd19f859e88c12cc7ce8fb007c760165155d020f))
* add basic components (button, link, badge, spinner, skeleton, price, layout) ([f79fdd4](https://github.com/dyeoh/flootlets/commit/f79fdd4a6e855dd986ab6b90468a618afb50dfe4))
* add form components (field, text fields, select, checkbox, radio, quantity stepper) ([ddef3c3](https://github.com/dyeoh/flootlets/commit/ddef3c38bfaa5fa71a4e7a351c3d5f1728c91f5d))
* add shop components (product card, product image, stock badge, carousel, pagination) ([f501095](https://github.com/dyeoh/flootlets/commit/f5010957b84959a2071f9a7f870d0d814b11c7a0))
* **registry:** publish a shadcn registry ([bac4c37](https://github.com/dyeoh/flootlets/commit/bac4c3738fa286e06e94278f4564d75aa78a8f6f))
* restyle components with tailwind and shadcn variant names ([f9900c4](https://github.com/dyeoh/flootlets/commit/f9900c43d84786b31d630b38394e22cf49107a9c))
* **theme:** adopt shadcn theme variables with tailwind v4 ([c0bafe6](https://github.com/dyeoh/flootlets/commit/c0bafe6771a550f6f6940d51da3e4b6d5c684efb))
* **tokens:** add ink-and-red design tokens with light and dark themes ([425a9d3](https://github.com/dyeoh/flootlets/commit/425a9d327c501cd271423f5afc479eb8f7b2630d))


### Documentation

* add starlight documentation site and github pages deploy ([a85bcf9](https://github.com/dyeoh/flootlets/commit/a85bcf9f8f4a066ea8289f22b7406eca89227a12))
* add the tailwind + registry plan ([f0772a6](https://github.com/dyeoh/flootlets/commit/f0772a68d8f36479e40911081f5c16f024f46869))
