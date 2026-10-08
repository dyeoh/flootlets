/*
 * VisuallyHidden: text for screen readers only, e.g. "Original price" before
 * a struck-through price, or a label for an icon-only button.
 */
import { type JSX, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';

export type VisuallyHiddenProps = JSX.HTMLAttributes<HTMLSpanElement>;

/** Renders its children for assistive technology without showing them. */
export function VisuallyHidden(props: VisuallyHiddenProps) {
  const [local, rest] = splitProps(props, ['class']);
  return <span class={cx('fl-visually-hidden', local.class)} {...rest} />;
}
