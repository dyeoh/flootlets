/*
 * Spinner: shows that something is loading. Announced to screen readers as a
 * status unless `decorative` (e.g. inside a button that already says so).
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, Show, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export const spinnerVariants = cva('inline-flex shrink-0 align-middle', {
  variants: {
    size: { sm: 'size-4', default: 'size-5', lg: 'size-8' },
  },
  defaultVariants: { size: 'default' },
});

export interface SpinnerProps
  extends JSX.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof spinnerVariants> {
  /** Text announced to screen readers. Defaults to "Loading". */
  label?: string;
  /** Hide it from assistive technology when something else already announces the state. */
  decorative?: boolean;
}

export function Spinner(props: SpinnerProps) {
  const [local, rest] = splitProps(props, ['label', 'size', 'decorative', 'class']);
  return (
    <span
      data-slot="spinner"
      class={cn(spinnerVariants({ size: local.size }), local.class)}
      role={local.decorative ? undefined : 'status'}
      aria-hidden={local.decorative ? 'true' : undefined}
      {...rest}
    >
      {/* A slow pulse instead of spinning for people who prefer reduced motion. */}
      <span class="size-full animate-spin rounded-full border-2 border-current border-e-transparent motion-reduce:animate-pulse motion-reduce:border-e-current" />
      <Show when={!local.decorative}>
        <span class="sr-only">{local.label ?? 'Loading'}</span>
      </Show>
    </span>
  );
}
