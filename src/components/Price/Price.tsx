/*
 * Price: displays money from the gnerkulfloot API ({ amount, currency } in
 * minor units), with an optional struck-through "was" price for sales.
 *
 * Pass the same `locale` everywhere the price renders (server and browser);
 * see formatMoney.
 */
import { type JSX, Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';
import { formatMoney, type Money } from '../../lib/money';

export interface PriceProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  amount: Money;
  /** The original price, shown struck through when higher than `amount`. */
  compareAt?: Money | null;
  /** BCP 47 locale, e.g. "en-MY". Defaults to "en". */
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
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
      class={cx('fl-price', local.class)}
      data-size={local.size ?? 'md'}
      data-sale={was() ? '' : undefined}
      {...rest}
    >
      {/* Spaces between the parts are separate text nodes: screen readers and
          accessible-name computation keep those, but may trim spaces inside a span. */}
      <Show when={was()}>
        <span class="fl-visually-hidden">{local.labels?.current ?? 'Sale price'}</span>{' '}
      </Show>
      <span class="fl-price__current">{formatMoney(local.amount, local.locale)}</span>
      <Show when={was()}>
        {(original) => (
          <>
            {' '}
            <span class="fl-visually-hidden">
              {local.labels?.original ?? 'Original price'}
            </span>{' '}
            <s class="fl-price__was">{formatMoney(original(), local.locale)}</s>
          </>
        )}
      </Show>
    </span>
  );
}
