/*
 * Button: actions, and with `href` a link that looks like a button (which
 * still navigates without JavaScript). Variants and sizes follow shadcn/ui.
 *
 * Fixes from earlier projects: defaults to type="button" so it never submits
 * a form by accident; `loading` keeps the button focusable and its width
 * stable, blocks clicks and sets aria-busy; there's always a focus ring.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { createMemo, type JSX, Show, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';
import { Spinner } from '../Spinner/Spinner';

export const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap no-underline transition-[color,background-color,border-color,box-shadow] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:not-data-loading:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[svg]:px-2.5',
        lg: 'h-10 px-6 has-[svg]:px-4',
        icon: 'size-9',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

interface ButtonOwnProps extends VariantProps<typeof buttonVariants> {
  /** Shows a spinner, sets aria-busy and ignores clicks, keeping focus and width. */
  loading?: boolean;
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

  // A memo, not a plain function: the click guard reads it outside any reactive
  // root, and `disabled` may be a getter that creates a computation when read
  // (Kobalte passes one when this Button is a dialog's trigger).
  const inert = createMemo(() => Boolean(local.loading || local.disabled));
  const attrs = () => ({
    'data-slot': 'button',
    'data-variant': local.variant ?? 'default',
    'data-size': local.size ?? 'default',
    'data-loading': local.loading ? '' : undefined,
    'aria-busy': local.loading ? true : undefined,
    class: cn(
      buttonVariants({ variant: local.variant, size: local.size, fullWidth: local.fullWidth }),
      local.class,
    ),
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
      {/* While loading, the label stays (keeping the width) but is invisible. */}
      <span data-slot="button-label" class="contents in-data-loading:invisible">
        {local.children}
      </span>
      <Show when={local.loading}>
        <span class="absolute inset-0 grid place-items-center">
          <Spinner decorative size={local.size === 'lg' ? 'default' : 'sm'} />
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
