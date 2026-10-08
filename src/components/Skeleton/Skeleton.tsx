/*
 * Skeleton: a placeholder shape while content loads. Hidden from screen
 * readers; mark the loading region with aria-busy instead.
 */
import { type JSX, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';

export interface SkeletonProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** Any CSS length. Defaults to the full width. */
  width?: string;
  /** Any CSS length. Defaults to one line of text. */
  height?: string;
  shape?: 'rect' | 'text' | 'circle';
}

export function Skeleton(props: SkeletonProps) {
  const [local, rest] = splitProps(props, ['width', 'height', 'shape', 'class', 'style']);
  return (
    <span
      class={cx('fl-skeleton', local.class)}
      data-shape={local.shape ?? 'rect'}
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
