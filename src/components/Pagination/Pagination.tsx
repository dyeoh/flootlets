/*
 * Pagination: move between pages of a list, e.g. product search results.
 *
 * With `href`, pages are real links (?page=2): they work before JavaScript
 * loads and search engines can follow them. With `onPageChange` they're
 * buttons, for lists that page in place.
 *
 * Numbered when `totalPages` is known (current ±1, first and last, with
 * ellipses; logic from qilin/mercury). The gnerkulfloot API returns `has_more`
 * instead of a total, so without `totalPages` it shows Previous / Page N / Next.
 */
import { For, type JSX, Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';

/**
 * The page numbers to show around `current`: current ±1, widened at the ends
 * so there are always up to five. First and last are added by the component.
 */
export function pageWindow(current: number, total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  let start = current - 1;
  let end = current + 1;
  if (start < 2) {
    start = 2;
    end = 4;
  }
  if (end > total - 1) {
    end = total - 1;
    start = total - 3;
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

interface PaginationLabels {
  nav: string;
  previous: string;
  next: string;
  page: (page: number) => string;
}

const DEFAULT_LABELS: PaginationLabels = {
  nav: 'Pagination',
  previous: 'Previous',
  next: 'Next',
  page: (page) => `Page ${page}`,
};

export interface PaginationProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** 1-based. */
  page: number;
  /** Total pages, if known. */
  totalPages?: number;
  /** Without totalPages: whether there's a next page (the API's `has_more`). */
  hasMore?: boolean;
  /** Build each page's URL, e.g. (p) => `?page=${p}`. Pages become links. */
  href?: (page: number) => string;
  /** Called with the new page when pages are buttons (no href). */
  onPageChange?: (page: number) => void;
  /** Text for translation. */
  labels?: Partial<PaginationLabels>;
}

export function Pagination(props: PaginationProps) {
  const [local, rest] = splitProps(props, [
    'page',
    'totalPages',
    'hasMore',
    'href',
    'onPageChange',
    'labels',
    'class',
  ]);
  const labels = () => ({ ...DEFAULT_LABELS, ...local.labels });
  const total = () => local.totalPages;
  const hasNext = () => (total() !== undefined ? local.page < total()! : Boolean(local.hasMore));
  const hasPrev = () => local.page > 1;
  const pages = () => (total() !== undefined ? pageWindow(local.page, total()!) : []);
  const visible = () => (total() !== undefined ? total()! > 1 : hasPrev() || hasNext());

  const PageLink = (p: {
    page: number;
    children: JSX.Element;
    label?: string;
    rel?: string;
    class?: string;
  }) => (
    <Show
      when={local.href}
      fallback={
        <button
          type="button"
          class={cx('fl-pagination__link', p.class)}
          aria-label={p.label}
          onClick={() => local.onPageChange?.(p.page)}
        >
          {p.children}
        </button>
      }
    >
      {(href) => (
        <a
          class={cx('fl-pagination__link', p.class)}
          href={href()(p.page)}
          aria-label={p.label}
          rel={p.rel}
        >
          {p.children}
        </a>
      )}
    </Show>
  );

  const Edge = (p: { page: number; enabled: boolean; text: string; rel: string }) => (
    <li>
      <Show
        when={p.enabled}
        fallback={
          <span class="fl-pagination__link fl-pagination__edge" aria-disabled="true">
            {p.text}
          </span>
        }
      >
        <PageLink page={p.page} rel={p.rel} class="fl-pagination__edge">
          {p.text}
        </PageLink>
      </Show>
    </li>
  );

  const Numbered = (p: { page: number }) => (
    <li>
      <Show
        when={p.page !== local.page}
        fallback={
          <span class="fl-pagination__link" aria-current="page" aria-label={labels().page(p.page)}>
            {p.page}
          </span>
        }
      >
        <PageLink page={p.page} label={labels().page(p.page)}>
          {p.page}
        </PageLink>
      </Show>
    </li>
  );

  const Ellipsis = () => (
    <li class="fl-pagination__ellipsis" aria-hidden="true">
      …
    </li>
  );

  return (
    <Show when={visible()}>
      <nav class={cx('fl-pagination', local.class)} aria-label={labels().nav} {...rest}>
        <ul class="fl-pagination__list">
          <Edge page={local.page - 1} enabled={hasPrev()} text={labels().previous} rel="prev" />
          <Show
            when={total() !== undefined}
            fallback={
              <li>
                <span class="fl-pagination__link" aria-current="page">
                  {labels().page(local.page)}
                </span>
              </li>
            }
          >
            <Show when={pages()[0]! > 1}>
              <Numbered page={1} />
            </Show>
            <Show when={pages()[0]! > 2}>
              <Ellipsis />
            </Show>
            <For each={pages()}>{(p) => <Numbered page={p} />}</For>
            <Show when={pages()[pages().length - 1]! < total()! - 1}>
              <Ellipsis />
            </Show>
            <Show when={pages()[pages().length - 1]! < total()!}>
              <Numbered page={total()!} />
            </Show>
          </Show>
          <Edge page={local.page + 1} enabled={hasNext()} text={labels().next} rel="next" />
        </ul>
      </nav>
    </Show>
  );
}
