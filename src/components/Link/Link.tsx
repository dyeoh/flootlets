/*
 * Link: an inline text link in the primary colour. `external` opens in a new
 * tab safely and tells screen-reader users it will.
 */
import { type JSX, Show, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Open in a new tab, with rel="noopener noreferrer" and an announced hint. */
  external?: boolean;
}

export function Link(props: LinkProps) {
  const [local, rest] = splitProps(props, ['external', 'class', 'children']);
  return (
    <a
      data-slot="link"
      class={cn(
        'text-primary underline decoration-1 underline-offset-[0.18em] hover:decoration-2',
        local.class,
      )}
      target={local.external ? '_blank' : undefined}
      rel={local.external ? 'noopener noreferrer' : undefined}
      {...rest}
    >
      {local.children}
      <Show when={local.external}>
        {/* The space is its own text node: names computed from text trim each element. */}{' '}
        <span class="sr-only">(opens in a new tab)</span>
      </Show>
    </a>
  );
}
