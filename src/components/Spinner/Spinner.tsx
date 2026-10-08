/*
 * Spinner: shows that something is loading. Announced to screen readers as a
 * status unless `decorative` (e.g. inside a button that already says so).
 */
import { type JSX, Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';

export interface SpinnerProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** Text announced to screen readers. Defaults to "Loading". */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Hide it from assistive technology when something else already announces the state. */
  decorative?: boolean;
}

export function Spinner(props: SpinnerProps) {
  const [local, rest] = splitProps(props, ['label', 'size', 'decorative', 'class']);
  return (
    <span
      class={cx('fl-spinner', local.class)}
      data-size={local.size ?? 'md'}
      role={local.decorative ? undefined : 'status'}
      aria-hidden={local.decorative ? 'true' : undefined}
      {...rest}
    >
      <span class="fl-spinner__circle" />
      <Show when={!local.decorative}>
        <span class="fl-visually-hidden">{local.label ?? 'Loading'}</span>
      </Show>
    </span>
  );
}
