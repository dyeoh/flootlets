/*
 * Alert: an inline message about the page or a form, e.g. "That item just
 * sold out" from an out_of_stock API error. Errors are announced immediately
 * (role="alert"); other variants politely (role="status"). Variants follow
 * shadcn/ui, plus success and warning.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, Show, splitProps } from 'solid-js';
import { closeButtonClass } from '../../lib/classes';
import { XIcon } from '../../lib/icons';
import { cn } from '../../lib/utils';

export const alertVariants = cva(
  'group/alert relative flex w-full items-start gap-3 rounded-lg border bg-card px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        default: 'text-card-foreground',
        destructive: 'border-destructive/50 text-destructive',
        success: 'border-success/50 text-success',
        warning: 'border-warning/50 text-warning',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface AlertProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof alertVariants> {
  title?: JSX.Element;
  /** Shows a dismiss button. */
  onDismiss?: () => void;
  /** Label for the dismiss button, for translation. */
  dismissLabel?: string;
}

export function Alert(props: AlertProps) {
  const [local, rest] = splitProps(props, [
    'variant',
    'title',
    'onDismiss',
    'dismissLabel',
    'class',
    'children',
  ]);
  const variant = () => local.variant ?? 'default';
  return (
    <div
      data-slot="alert"
      data-variant={variant()}
      class={cn(alertVariants({ variant: local.variant }), local.class)}
      role={variant() === 'destructive' ? 'alert' : 'status'}
      {...rest}
    >
      <div class="grid min-w-0 flex-1 gap-0.5">
        <Show when={local.title}>
          <p data-slot="alert-title" class="m-0 font-medium tracking-tight">
            {local.title}
          </p>
        </Show>
        <div
          data-slot="alert-description"
          class="grid justify-items-start gap-1 group-data-[variant=default]/alert:text-muted-foreground [&_p]:m-0 [&_p]:leading-relaxed"
        >
          {local.children}
        </div>
      </div>
      <Show when={local.onDismiss}>
        <button
          type="button"
          class={closeButtonClass}
          aria-label={local.dismissLabel ?? 'Dismiss'}
          onClick={() => local.onDismiss?.()}
        >
          <XIcon />
        </button>
      </Show>
    </div>
  );
}
