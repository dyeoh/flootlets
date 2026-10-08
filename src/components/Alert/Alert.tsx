/*
 * Alert: an inline message about the page or a form, e.g. "That item just
 * sold out" from an out_of_stock API error. Errors are announced immediately
 * (role="alert"); other tones politely (role="status").
 */
import { type JSX, Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';

export interface AlertProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: JSX.Element;
  /** Shows a dismiss button. */
  onDismiss?: () => void;
  /** Label for the dismiss button, for translation. */
  dismissLabel?: string;
}

export function Alert(props: AlertProps) {
  const [local, rest] = splitProps(props, [
    'tone',
    'title',
    'onDismiss',
    'dismissLabel',
    'class',
    'children',
  ]);
  const tone = () => local.tone ?? 'info';
  return (
    <div
      class={cx('fl-alert', local.class)}
      data-tone={tone()}
      role={tone() === 'danger' ? 'alert' : 'status'}
      {...rest}
    >
      <div class="fl-alert__body">
        <Show when={local.title}>
          <p class="fl-alert__title">{local.title}</p>
        </Show>
        <div class="fl-alert__content">{local.children}</div>
      </div>
      <Show when={local.onDismiss}>
        <button
          type="button"
          class="fl-alert__dismiss"
          aria-label={local.dismissLabel ?? 'Dismiss'}
          onClick={() => local.onDismiss?.()}
        >
          <span aria-hidden="true">×</span>
        </button>
      </Show>
    </div>
  );
}
