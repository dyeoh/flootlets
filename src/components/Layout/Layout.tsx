/*
 * Layout helpers: Stack (vertical), Cluster (wrapping row) and Grid
 * (responsive columns). Gaps come from the spacing scale.
 */
import { type JSX, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';
import { type Space, space } from '../../lib/space';

interface GapProps {
  /** Spacing step between children, from the --fl-space-* scale. */
  gap?: Space;
}

export interface StackProps extends JSX.HTMLAttributes<HTMLDivElement>, GapProps {
  align?: 'stretch' | 'start' | 'center' | 'end';
}

/** Children in a column, evenly spaced. */
export function Stack(props: StackProps) {
  const [local, rest] = splitProps(props, ['gap', 'align', 'class', 'style']);
  return (
    <div
      class={cx('fl-stack', local.class)}
      data-align={local.align}
      style={{
        '--fl-gap': space(local.gap ?? 4),
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
      {...rest}
    />
  );
}

export interface ClusterProps extends JSX.HTMLAttributes<HTMLDivElement>, GapProps {
  justify?: 'start' | 'center' | 'end' | 'between';
  align?: 'start' | 'center' | 'end' | 'baseline';
}

/** Children in a row that wraps, e.g. buttons or badges. */
export function Cluster(props: ClusterProps) {
  const [local, rest] = splitProps(props, ['gap', 'justify', 'align', 'class', 'style']);
  return (
    <div
      class={cx('fl-cluster', local.class)}
      data-justify={local.justify}
      data-align={local.align}
      style={{
        '--fl-gap': space(local.gap ?? 2),
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
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
      class={cx('fl-grid', local.class)}
      style={{
        '--fl-gap': space(local.gap ?? 4),
        '--fl-grid-min': local.minItemWidth ?? '14rem',
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
      {...rest}
    />
  );
}
