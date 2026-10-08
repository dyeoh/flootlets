/*
 * EmptyState: what to show when there's nothing to show yet, like an empty
 * cart or a search with no results, with a way forward.
 */
import { type JSX, Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';

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
  const Heading = () => {
    const level = local.headingLevel ?? 2;
    if (level === 3) return <h3 class="fl-empty__title">{local.title}</h3>;
    if (level === 4) return <h4 class="fl-empty__title">{local.title}</h4>;
    return <h2 class="fl-empty__title">{local.title}</h2>;
  };
  return (
    <div class={cx('fl-empty', local.class)} {...rest}>
      <Show when={local.icon}>
        <div class="fl-empty__icon" aria-hidden="true">
          {local.icon}
        </div>
      </Show>
      <Heading />
      <Show when={local.description}>
        <p class="fl-empty__description">{local.description}</p>
      </Show>
      <Show when={local.action}>
        <div class="fl-empty__action">{local.action}</div>
      </Show>
    </div>
  );
}
