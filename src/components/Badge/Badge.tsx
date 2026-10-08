/*
 * Badge: a short label such as "New", "Sale" or "Sold out". Colour is never
 * the only signal: the text says what it means.
 */
import { type JSX, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** accent is the solid brand red; the others are tinted status colours. */
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export function Badge(props: BadgeProps) {
  const [local, rest] = splitProps(props, ['tone', 'class']);
  return <span class={cx('fl-badge', local.class)} data-tone={local.tone ?? 'neutral'} {...rest} />;
}
