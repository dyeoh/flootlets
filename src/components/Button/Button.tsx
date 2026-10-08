/*
 * Button: actions, and with `href` a link that looks like a button (which
 * still navigates without JavaScript).
 *
 * Fixes from earlier projects: defaults to type="button" so it never submits
 * a form by accident; `loading` keeps the button focusable and its width
 * stable, blocks clicks and sets aria-busy; there's always a focus ring.
 */
import { type JSX, Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';
import { Spinner } from '../Spinner/Spinner';

interface ButtonOwnProps {
  /** primary: the red brand fill. secondary: solid ink/paper. danger: outlined red, for destructive actions. */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Shows a spinner, sets aria-busy and ignores clicks, keeping focus and width. */
  loading?: boolean;
  fullWidth?: boolean;
}

export type ButtonAsButtonProps = ButtonOwnProps &
  JSX.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
export type ButtonAsLinkProps = ButtonOwnProps &
  JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; disabled?: boolean };
export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props as ButtonAsButtonProps & ButtonAsLinkProps, [
    'variant',
    'size',
    'loading',
    'fullWidth',
    'class',
    'children',
    'onClick',
    'disabled',
    'type',
    'href',
  ]);

  const inert = () => Boolean(local.loading || local.disabled);
  const attrs = () => ({
    class: cx('fl-button', local.class),
    'data-variant': local.variant ?? 'primary',
    'data-size': local.size ?? 'md',
    'data-full-width': local.fullWidth ? '' : undefined,
    'data-loading': local.loading ? '' : undefined,
    'aria-busy': local.loading ? true : undefined,
  });

  // Loading and disabled links keep their focus but stop acting.
  const guard = (event: MouseEvent) => {
    if (inert()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
    return false;
  };

  const content = (
    <>
      <span class="fl-button__label">{local.children}</span>
      <Show when={local.loading}>
        <span class="fl-button__spinner">
          <Spinner decorative size={local.size === 'lg' ? 'md' : 'sm'} />
        </span>
      </Show>
    </>
  );

  return (
    <Show
      when={local.href !== undefined}
      fallback={
        <button
          {...attrs()}
          {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
          type={local.type ?? 'button'}
          // A loading button stays focusable (aria-disabled), so keyboard
          // users don't lose their place; a disabled one is truly disabled.
          disabled={local.disabled && !local.loading}
          aria-disabled={local.loading ? true : undefined}
          onClick={(event) => {
            if (guard(event)) return;
            if (typeof local.onClick === 'function')
              (local.onClick as (e: MouseEvent) => void)(event);
          }}
        >
          {content}
        </button>
      }
    >
      <a
        {...attrs()}
        {...(rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={inert() ? undefined : local.href}
        role={inert() ? 'link' : undefined}
        aria-disabled={inert() ? true : undefined}
        onClick={(event) => {
          if (guard(event)) return;
          if (typeof local.onClick === 'function')
            (local.onClick as (e: MouseEvent) => void)(event);
        }}
      >
        {content}
      </a>
    </Show>
  );
}
