/*
 * EmptyState: what to show when there's nothing to show yet, like an empty
 * cart or a search with no results, with a way forward.
 */
import { type JSX, Show, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { cn } from '../../lib/utils';

export interface EmptyStateProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: JSX.Element;
  description?: JSX.Element;
  /** Decorative illustration or icon; hidden from screen readers. */
  icon?: JSX.Element;
  /** A way forward, e.g. a "Continue shopping" button. */
  action?: JSX.Element;
  /** Heading level for the title, to fit the page outline. Default 2. */
  headingLevel?: 2 | 3 | 4;
}

export function EmptyState(props: EmptyStateProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'description',
    'icon',
    'action',
    'headingLevel',
    'class',
  ]);
  return (
    <div
      data-slot="empty-state"
      class={cn(
        'flex flex-col items-center gap-2 px-6 py-12 text-center text-balance text-foreground',
        local.class,
      )}
      {...rest}
    >
      <Show when={local.icon}>
        <div
          data-slot="empty-state-icon"
          class="mb-2 text-5xl leading-none text-muted-foreground [&_svg:not([class*='size-'])]:size-12"
          aria-hidden="true"
        >
          {local.icon}
        </div>
      </Show>
      <Dynamic component={`h${local.headingLevel ?? 2}`} class="m-0 text-xl font-semibold">
        {local.title}
      </Dynamic>
      <Show when={local.description}>
        <p class="m-0 max-w-[36ch] text-muted-foreground">{local.description}</p>
      </Show>
      <Show when={local.action}>
        <div class="mt-4">{local.action}</div>
      </Show>
    </div>
  );
}
