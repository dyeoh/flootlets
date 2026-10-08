/*
 * Skeleton: a placeholder shape while content loads. Hidden from screen
 * readers; mark the loading region with aria-busy instead.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export const skeletonVariants = cva(
  'block w-full animate-pulse bg-accent motion-reduce:animate-none',
  {
    variants: {
      shape: {
        rect: 'h-4 rounded-md',
        text: 'my-[0.35em] h-[0.8em] rounded-sm',
        circle: 'aspect-square rounded-full',
      },
    },
    defaultVariants: { shape: 'rect' },
  },
);

export interface SkeletonProps
  extends JSX.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof skeletonVariants> {
  /** Any CSS length. Defaults to the full width. */
  width?: string;
  /** Any CSS length. Defaults to one line of text. */
  height?: string;
}

export function Skeleton(props: SkeletonProps) {
  const [local, rest] = splitProps(props, ['width', 'height', 'shape', 'class', 'style']);
  return (
    <span
      data-slot="skeleton"
      class={cn(skeletonVariants({ shape: local.shape }), local.class)}
      aria-hidden="true"
      style={{
        'inline-size': local.width,
        'block-size': local.height,
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
      {...rest}
    />
  );
}
