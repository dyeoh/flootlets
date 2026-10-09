/*
 * Price: displays money as { amount, currency } in minor units (the shape
 * most payment APIs, gnerkulfloot's included, return), with an optional struck-through "was" price for sales.
 *
 * Pass the same `locale` everywhere the price renders (server and browser);
 * see formatMoney.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, Show, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';
import { formatMoney, type Money } from '../../lib/money';

/** The current price; a sale turns it the destructive colour. */
export const priceVariants = cva('font-semibold in-data-sale:text-destructive', {
  variants: {
    size: { sm: 'text-sm', default: 'text-base', lg: 'text-2xl' },
  },
  defaultVariants: { size: 'default' },
});

export interface PriceProps
  extends JSX.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof priceVariants> {
  amount: Money;
  /** The original price, shown struck through when higher than `amount`. */
  compareAt?: Money | null;
  /** BCP 47 locale, e.g. "en-MY". Defaults to "en". */
  locale?: string;
  /** Screen-reader labels, for translation. */
  labels?: { current?: string; original?: string };
}

export function Price(props: PriceProps) {
  const [local, rest] = splitProps(props, [
    'amount',
    'compareAt',
    'locale',
    'size',
    'labels',
    'class',
  ]);
  // Only a genuinely higher price in the same currency counts as a discount.
  const was = () => {
    const c = local.compareAt;
    return c && c.currency === local.amount.currency && c.amount > local.amount.amount ? c : null;
  };
  return (
    <span
      data-slot="price"
      class={cn('inline-flex flex-wrap items-baseline gap-2 tabular-nums', local.class)}
      data-sale={was() ? '' : undefined}
      {...rest}
    >
      {/* Spaces between the parts are separate text nodes: screen readers and
          accessible-name computation keep those, but may trim spaces inside a span. */}
      <Show when={was()}>
        <span class="sr-only">{local.labels?.current ?? 'Sale price'}</span>{' '}
      </Show>
      <span data-slot="price-current" class={priceVariants({ size: local.size })}>
        {formatMoney(local.amount, local.locale)}
      </span>
      <Show when={was()}>
        {(original) => (
          <>
            {' '}
            <span class="sr-only">{local.labels?.original ?? 'Original price'}</span>{' '}
            <s data-slot="price-was" class="text-sm text-muted-foreground">
              {formatMoney(original(), local.locale)}
            </s>
          </>
        )}
      </Show>
    </span>
  );
}
