/*
 * Layout helpers: Stack (vertical), Cluster (wrapping row) and Grid
 * (responsive columns). Gaps are steps on Tailwind's spacing scale; a gap-*
 * class passed in `class` overrides them.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';
import { type Space, space } from '../../lib/space';

interface GapProps {
  /** Spacing step between children: gap={4} is Tailwind's gap-4 (1rem). */
  gap?: Space;
}

const style = (vars: JSX.CSSProperties, own: JSX.HTMLAttributes<HTMLDivElement>['style']) => ({
  ...vars,
  ...(typeof own === 'object' ? own : {}),
});

export const stackVariants = cva('flex flex-col gap-(--gap)', {
  variants: {
    align: { stretch: '', start: 'items-start', center: 'items-center', end: 'items-end' },
  },
});

export interface StackProps
  extends JSX.HTMLAttributes<HTMLDivElement>, GapProps, VariantProps<typeof stackVariants> {}

/** Children in a column, evenly spaced. */
export function Stack(props: StackProps) {
  const [local, rest] = splitProps(props, ['gap', 'align', 'class', 'style']);
  return (
    <div
      data-slot="stack"
      class={cn(stackVariants({ align: local.align }), local.class)}
      style={style({ '--gap': space(local.gap ?? 4) }, local.style)}
      {...rest}
    />
  );
}

export const clusterVariants = cva('flex flex-wrap gap-(--gap)', {
  variants: {
    justify: {
      start: '',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
    },
  },
  defaultVariants: { align: 'center' },
});

export interface ClusterProps
  extends JSX.HTMLAttributes<HTMLDivElement>, GapProps, VariantProps<typeof clusterVariants> {}

/** Children in a row that wraps, e.g. buttons or badges. */
export function Cluster(props: ClusterProps) {
  const [local, rest] = splitProps(props, ['gap', 'justify', 'align', 'class', 'style']);
  return (
    <div
      data-slot="cluster"
      class={cn(clusterVariants({ justify: local.justify, align: local.align }), local.class)}
      style={style({ '--gap': space(local.gap ?? 2) }, local.style)}
      {...rest}
    />
  );
}

export interface GridProps extends JSX.HTMLAttributes<HTMLDivElement>, GapProps {
  /**
   * Minimum column width (any CSS length). As many columns as fit, so a grid
   * adapts to its container rather than to fixed screen breakpoints.
   */
  minItemWidth?: string;
}

/** Responsive grid, e.g. of product cards. */
export function Grid(props: GridProps) {
  const [local, rest] = splitProps(props, ['gap', 'minItemWidth', 'class', 'style']);
  return (
    <div
      data-slot="grid"
      // min() keeps one column from overflowing a container narrower than the minimum.
      class={cn(
        'grid grid-cols-[repeat(auto-fill,minmax(min(var(--min-item-width),100%),1fr))] gap-(--gap)',
        local.class,
      )}
      style={style(
        { '--gap': space(local.gap ?? 4), '--min-item-width': local.minItemWidth ?? '14rem' },
        local.style,
      )}
      {...rest}
    />
  );
}
