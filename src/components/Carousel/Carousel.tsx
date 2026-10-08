/*
 * Carousel: a horizontal row of items (e.g. products) that pages left and
 * right, with previous/next buttons and page dots. Built on native CSS
 * scroll-snap, so swiping and trackpad scrolling just work.
 *
 * Ported from qilin-marketplace, keeping fixes that were only found in real
 * browsers:
 * - the page count comes from the track's real scroll width, not the item
 *   count, so a last "page" that can't scroll further never appears;
 * - paging scrolls the track by its own width, and the last page is detected
 *   by distance to the end, since the round-based ratio can come out one short;
 * - resizes resync the active page as well as the page count;
 * - scroll events from our own smooth scroll are ignored until it settles
 *   ('scrollend', with a timer fallback), which stops dots flashing on iOS.
 *
 * Added here: a labelled region announced as a carousel, slides announced as
 * "3 of 8", a keyboard-scrollable track, 24px dot targets with aria-current,
 * and instant (not smooth) scrolling for people who prefer reduced motion.
 */
import {
  createContext,
  createSignal,
  For,
  type JSX,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
} from 'solid-js';
import { cx } from '../../lib/cx';

interface CarouselLabels {
  previous: string;
  next: string;
  /** e.g. (page) => `Go to page ${page}` */
  page: (page: number) => string;
  /** e.g. (index, total) => `${index} of ${total}` */
  slide: (index: number, total: number) => string;
  pages: string;
}

const DEFAULT_LABELS: CarouselLabels = {
  previous: 'Previous',
  next: 'Next',
  page: (page) => `Go to page ${page}`,
  slide: (index, total) => `${index} of ${total}`,
  pages: 'Pages',
};

interface CarouselContextValue {
  contentRef: (el: HTMLDivElement) => void;
  remeasure: () => void;
  itemCount: () => number;
  pageCount: () => number;
  selectedPage: () => number;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollToPage: (page: number) => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  labels: () => CarouselLabels;
}

const CarouselContext = createContext<CarouselContextValue>();

function useCarousel(): CarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('Carousel parts must be rendered inside <Carousel>');
  return context;
}

/** How long to wait after the last scroll event before treating our own smooth scroll as settled. */
const SETTLE_FALLBACK_MS = 150;

export interface CarouselProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Names the carousel for screen readers, e.g. "Recommended for you". */
  label: string;
  /**
   * How many items it holds. Used for "3 of 8" slide labels and as the page
   * count before the track can be measured (first paint, server rendering).
   */
  itemCount: number;
  /** Button and announcement text, for translation. */
  labels?: Partial<CarouselLabels>;
}

function Root(props: CarouselProps) {
  const [local, rest] = splitProps(props, ['label', 'itemCount', 'labels', 'class', 'children']);

  let container: HTMLDivElement | undefined;
  const [containerWidth, setContainerWidth] = createSignal(0);
  const [scrollWidth, setScrollWidth] = createSignal(0);
  const [selectedPage, setSelectedPage] = createSignal(0);

  // Distinct scroll positions that really exist; falls back to the item count
  // until the track has layout (jsdom and server rendering never do).
  const pageCount = () => {
    const width = containerWidth();
    if (width <= 0) return Math.max(1, local.itemCount);
    return Math.max(1, Math.ceil(scrollWidth() / width));
  };

  // The real scroll position is the source of truth. Within 1px of the end
  // counts as the last page: a short final page would round down one short.
  const updateSelectedPageFromScroll = () => {
    if (!container || container.clientWidth === 0) return;
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    if (maxScrollLeft - Math.abs(container.scrollLeft) <= 1) {
      setSelectedPage(pageCount() - 1);
      return;
    }
    const rawPage = Math.round(Math.abs(container.scrollLeft) / container.clientWidth);
    setSelectedPage(Math.min(Math.max(rawPage, 0), pageCount() - 1));
  };

  let isProgrammaticScroll = false;
  let scrollTicking = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;

  const clearSettleFallback = () => {
    clearTimeout(settleTimer);
    settleTimer = undefined;
  };

  const endProgrammaticScroll = () => {
    isProgrammaticScroll = false;
    clearSettleFallback();
    updateSelectedPageFromScroll();
  };

  // Restarted by every scroll event our own animation produces, so it only
  // has to outlast the gap between frames. Always armed alongside 'scrollend':
  // Safari exposed onscrollend before firing it, so feature detection could
  // leave the guard stuck forever.
  const armSettleFallback = () => {
    clearSettleFallback();
    settleTimer = setTimeout(endProgrammaticScroll, SETTLE_FALLBACK_MS);
  };

  // A resize changes what a page is without moving scrollLeft, so resync the
  // active page too, unless our own animation is mid-flight.
  const recomputeLayout = () => {
    if (!container) return;
    setContainerWidth(container.clientWidth);
    setScrollWidth(container.scrollWidth);
    if (!isProgrammaticScroll) updateSelectedPageFromScroll();
  };

  const handleScroll = () => {
    if (isProgrammaticScroll) {
      // Mid-animation positions can be non-monotonic on iOS; we already know
      // where we're going, so just extend the settle window.
      armSettleFallback();
      return;
    }
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateSelectedPageFromScroll();
      scrollTicking = false;
    });
  };

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Updates the active page straight away rather than waiting for the smooth
  // scroll to finish; swipes are picked up by the scroll listener instead.
  const scrollToPage = (page: number) => {
    if (!container) return;
    const clamped = Math.min(Math.max(page, 0), pageCount() - 1);
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const direction = getComputedStyle(container).direction === 'rtl' ? -1 : 1;
    const target = Math.min(clamped * container.clientWidth, maxScrollLeft) * direction;
    isProgrammaticScroll = true;
    armSettleFallback();
    container.scrollTo({ left: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    setSelectedPage(clamped);
  };

  const context: CarouselContextValue = {
    contentRef: (el) => {
      container = el;
      el.addEventListener('scroll', handleScroll, { passive: true });
      el.addEventListener('scrollend', endProgrammaticScroll);
      const resizeObserver = new ResizeObserver(() => recomputeLayout());
      resizeObserver.observe(el);
      onCleanup(() => {
        el.removeEventListener('scroll', handleScroll);
        el.removeEventListener('scrollend', endProgrammaticScroll);
        resizeObserver.disconnect();
        clearSettleFallback();
      });
    },
    // Item content (late images, async data) changes scrollWidth without
    // resizing the track itself, which the ResizeObserver can't see.
    remeasure: () => queueMicrotask(recomputeLayout),
    itemCount: () => local.itemCount,
    pageCount,
    selectedPage,
    scrollPrev: () => scrollToPage(selectedPage() - 1),
    scrollNext: () => scrollToPage(selectedPage() + 1),
    scrollToPage,
    canScrollPrev: () => selectedPage() > 0,
    canScrollNext: () => selectedPage() < pageCount() - 1,
    labels: () => ({ ...DEFAULT_LABELS, ...local.labels }),
  };

  onMount(recomputeLayout);

  return (
    <CarouselContext.Provider value={context}>
      <section
        class={cx('fl-carousel', local.class)}
        aria-roledescription="carousel"
        aria-label={local.label}
        {...rest}
      >
        {local.children}
      </section>
    </CarouselContext.Provider>
  );
}

function Content(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const { contentRef } = useCarousel();
  const [local, rest] = splitProps(props, ['class']);
  // Focusable so keyboard users can scroll it with the arrow keys.
  return (
    <div ref={contentRef} class={cx('fl-carousel__track', local.class)} tabindex="0" {...rest} />
  );
}

export interface CarouselItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Position in the list, from <For>'s index; used for the "3 of 8" label. */
  index: number;
}

function Item(props: CarouselItemProps) {
  const { remeasure, itemCount, labels } = useCarousel();
  const [local, rest] = splitProps(props, ['index', 'class']);
  return (
    <div
      ref={() => {
        remeasure();
        // Removing an item shrinks scrollWidth without resizing the track.
        onCleanup(remeasure);
      }}
      class={cx('fl-carousel__item', local.class)}
      role="group"
      aria-roledescription="slide"
      aria-label={labels().slide(local.index + 1, itemCount())}
      {...rest}
    />
  );
}

// A component, never a shared JSX constant: Solid JSX creates real DOM nodes,
// so one hoisted <svg> rendered in two buttons would be moved, not copied,
// leaving the first button empty.
function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Previous(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { scrollPrev, canScrollPrev, labels } = useCarousel();
  const [local, rest] = splitProps(props, ['class']);
  return (
    <button
      type="button"
      class={cx('fl-carousel__arrow', 'fl-carousel__arrow--previous', local.class)}
      aria-label={labels().previous}
      disabled={!canScrollPrev()}
      onClick={() => scrollPrev()}
      {...rest}
    >
      <Chevron />
    </button>
  );
}

function Next(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { scrollNext, canScrollNext, labels } = useCarousel();
  const [local, rest] = splitProps(props, ['class']);
  return (
    <button
      type="button"
      class={cx('fl-carousel__arrow', local.class)}
      aria-label={labels().next}
      disabled={!canScrollNext()}
      onClick={() => scrollNext()}
      {...rest}
    >
      <Chevron />
    </button>
  );
}

function Dots(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const { pageCount, selectedPage, scrollToPage, labels } = useCarousel();
  const [local, rest] = splitProps(props, ['class']);
  return (
    <Show when={pageCount() > 1}>
      <div
        class={cx('fl-carousel__dots', local.class)}
        role="group"
        aria-label={labels().pages}
        {...rest}
      >
        <For each={Array.from({ length: pageCount() }, (_, i) => i)}>
          {(page) => (
            <button
              type="button"
              class="fl-carousel__dot"
              aria-label={labels().page(page + 1)}
              aria-current={selectedPage() === page ? 'true' : undefined}
              onClick={() => scrollToPage(page)}
            />
          )}
        </For>
      </div>
    </Show>
  );
}

export const Carousel = Object.assign(Root, { Content, Item, Previous, Next, Dots });
