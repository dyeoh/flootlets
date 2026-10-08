// ProductImage, StockBadge, ProductCard, Carousel and Pagination.
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { For } from 'solid-js';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/axe';
import { Button } from './Button/Button';
import { Carousel } from './Carousel/Carousel';
import { Pagination, pageWindow } from './Pagination/Pagination';
import { ProductCard } from './ProductCard/ProductCard';
import { ProductImage } from './ProductImage/ProductImage';
import { StockBadge } from './StockBadge/StockBadge';

const urls = { thumb: '/media/images/abc/thumb.webp', large: '/media/images/abc/large.webp' };

describe('ProductImage', () => {
  test('serves the right size and reserves its space', () => {
    render(() => (
      <ProductImage urls={urls} alt="Red baju kurung, front" width={2400} height={1600} />
    ));
    const img = screen.getByRole('img', { name: 'Red baju kurung, front' });
    // Variants keep the aspect ratio: 400px and 1600px on the longest side.
    expect(img).toHaveAttribute('srcset', `${urls.thumb} 400w, ${urls.large} 1600w`);
    expect(img).toHaveAttribute('width', '2400');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('small originals are described at their real width', () => {
    render(() => <ProductImage urls={urls} alt="x" width={300} height={600} />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'srcset',
      `${urls.thumb} 200w, ${urls.large} 300w`,
    );
  });

  test('priority images load straight away', () => {
    render(() => <ProductImage urls={urls} alt="Hero" priority />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
  });

  test('a broken image becomes a labelled placeholder', () => {
    render(() => <ProductImage urls={urls} alt="Kuih lapis" />);
    fireEvent.error(screen.getByRole('img'));
    const placeholder = screen.getByRole('img', { name: 'Kuih lapis' });
    expect(placeholder.tagName).toBe('SPAN');
  });
});

describe('StockBadge', () => {
  test('says it in words, translatable', () => {
    render(() => (
      <>
        <StockBadge inStock />
        <StockBadge inStock={false} labels={{ soldOut: 'Habis dijual' }} />
      </>
    ));
    expect(screen.getByText('In stock')).toHaveAttribute('data-variant', 'success');
    expect(screen.getByText('Habis dijual')).toHaveAttribute('data-variant', 'destructive');
  });
});

describe('ProductCard', () => {
  const card = () => (
    <ProductCard>
      <ProductCard.Image urls={urls} />
      <ProductCard.Badges>
        <StockBadge inStock />
      </ProductCard.Badges>
      <ProductCard.Title href="/products/kuih-lapis">Kuih Lapis</ProductCard.Title>
      <ProductCard.Price
        amount={{ amount: 2500, currency: 'MYR' }}
        compareAt={{ amount: 3500, currency: 'MYR' }}
        locale="en-MY"
      />
      <ProductCard.Actions>
        <Button size="sm">Add to cart</Button>
      </ProductCard.Actions>
    </ProductCard>
  );

  test('one link named after the product, plus its own actions', () => {
    render(card);
    expect(screen.getByRole('article')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Kuih Lapis');
    expect(links[0]).toHaveAttribute('href', '/products/kuih-lapis');
    expect(screen.getByRole('heading', { level: 3, name: 'Kuih Lapis' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
  });

  test('the photo is decorative next to the name (no duplicate announcement)', () => {
    const { container } = render(card);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  test('a product without photos still lays out', () => {
    const { container } = render(() => (
      <ProductCard>
        <ProductCard.Image urls={null} />
        <ProductCard.Title href="/p">No photo</ProductCard.Title>
      </ProductCard>
    ));
    expect(container.querySelector('[data-slot=product-image-fallback]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  test('has no accessibility violations', async () => {
    const { container } = render(card);
    await expectNoAxeViolations(container);
  });
});

describe('Pagination', () => {
  test('page window: current ±1, widened at the ends', () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(1, 10)).toEqual([2, 3, 4]);
    expect(pageWindow(5, 10)).toEqual([4, 5, 6]);
    expect(pageWindow(10, 10)).toEqual([7, 8, 9]);
  });

  test('numbered links with the current page marked', () => {
    render(() => <Pagination page={5} totalPages={10} href={(p) => `?page=${p}`} />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '?page=4');
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('rel', 'prev');
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '?page=6');
    expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute('href', '?page=1');
    expect(screen.getByRole('link', { name: 'Page 10' })).toBeInTheDocument();
    const current = screen.getByText('5');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current.tagName).toBe('SPAN'); // not a link to the page you're on
    // Gaps in the numbering, shown as an ellipsis and hidden from screen readers.
    expect(nav.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(2);
  });

  test('ends: no previous on page 1, no next on the last page', () => {
    render(() => <Pagination page={1} totalPages={3} href={(p) => `?page=${p}`} />);
    expect(screen.queryByRole('link', { name: 'Previous' })).toBeNull();
    expect(screen.getByText('Previous')).toHaveAttribute('aria-disabled', 'true');
  });

  test('API-style paging without a total: previous / page N / next', () => {
    render(() => <Pagination page={2} hasMore href={(p) => `?page=${p}`} />);
    expect(screen.getByText('Page 2')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '?page=3');
    expect(screen.queryByRole('link', { name: 'Page 1' })).toBeNull();
  });

  test('buttons when paging in place', async () => {
    const change = vi.fn();
    render(() => <Pagination page={1} totalPages={4} onPageChange={change} />);
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(change).toHaveBeenCalledWith(3);
  });

  test('hidden when there is only one page', () => {
    const { container } = render(() => (
      <Pagination page={1} totalPages={1} href={(p) => `?page=${p}`} />
    ));
    expect(container).toBeEmptyDOMElement();
  });

  test('has no accessibility violations', async () => {
    const { container } = render(() => (
      <Pagination page={3} totalPages={9} href={(p) => `?page=${p}`} />
    ));
    await expectNoAxeViolations(container);
  });
});

/**
 * Simulates real layout, which jsdom lacks: the track's visible and scrollable
 * widths, its scroll position, and a ResizeObserver we can fire on demand.
 */
function simulateLayout() {
  let resize = () => {};
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const geometry = { clientWidth: 0, scrollWidth: 0, scrollLeft: 0 };
  const attach = (track: HTMLElement) => {
    for (const key of ['clientWidth', 'scrollWidth', 'scrollLeft'] as const) {
      Object.defineProperty(track, key, {
        configurable: true,
        get: () => geometry[key],
        set: (v: number) => (geometry[key] = v),
      });
    }
    track.scrollTo = ((opts: ScrollToOptions) => {
      geometry.scrollLeft = opts.left ?? 0;
    }) as HTMLElement['scrollTo'];
  };
  return { geometry, attach, resize: () => resize() };
}

describe('Carousel', () => {
  const items = ['Kuih Lapis', 'Tudung', 'Baju Kurung', 'Kerepek', 'Dodol'];
  const carousel = () => (
    <Carousel label="Recommended for you" itemCount={items.length}>
      <Carousel.Content>
        <For each={items}>{(name, i) => <Carousel.Item index={i()}>{name}</Carousel.Item>}</For>
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Dots />
    </Carousel>
  );
  const dots = () => screen.getAllByRole('button', { name: /Go to page/ });
  const currentDot = () => dots().findIndex((d) => d.getAttribute('aria-current') === 'true') + 1;
  const track = () => document.querySelector('[data-slot=carousel-content]') as HTMLElement;

  afterEach(() => vi.unstubAllGlobals());

  test('a labelled carousel of numbered slides, with a keyboard-scrollable track', () => {
    render(carousel);
    const region = screen.getByRole('region', { name: 'Recommended for you' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getByRole('group', { name: '3 of 5' })).toHaveTextContent('Baju Kurung');
    expect(track()).toHaveAttribute('tabindex', '0');
  });

  test('before layout there is one page per item; buttons follow the current page', async () => {
    render(carousel);
    const prev = screen.getByRole('button', { name: 'Previous' });
    expect(prev).toBeDisabled();
    expect(dots()).toHaveLength(5);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(prev).toBeEnabled();
    expect(currentDot()).toBe(2);
  });

  test('page count comes from the real scroll width, not the item count', () => {
    const layout = simulateLayout();
    render(carousel);
    layout.attach(track());
    // 5 items, 2 per 624px screen: only 3 distinct scroll positions exist.
    Object.assign(layout.geometry, { clientWidth: 624, scrollWidth: 624 * 2 + 212 });
    layout.resize();
    expect(dots()).toHaveLength(3);
  });

  test('swiping to the very end selects the last page, even when it is short', async () => {
    const layout = simulateLayout();
    render(carousel);
    layout.attach(track());
    // A last page only 250px wide: 250/976 rounds down to page 1 without the end check.
    Object.assign(layout.geometry, { clientWidth: 976, scrollWidth: 976 + 250 });
    layout.resize();
    expect(dots()).toHaveLength(2);
    layout.geometry.scrollLeft = 250;
    track().dispatchEvent(new Event('scroll'));
    await waitFor(() => expect(currentDot()).toBe(2));
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  test('a resize resyncs the current page, not just the page count', async () => {
    const layout = simulateLayout();
    render(carousel);
    layout.attach(track());
    Object.assign(layout.geometry, { clientWidth: 976, scrollWidth: 976 + 250, scrollLeft: 250 });
    layout.resize();
    expect(currentDot()).toBe(2);
    // The window narrows: same scroll position, but pages are now 400px wide.
    Object.assign(layout.geometry, { clientWidth: 400 });
    layout.resize();
    expect(dots()).toHaveLength(4);
    expect(currentDot()).toBe(2); // 250 / 400 rounds to the 2nd page
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  test('scroll events from our own smooth scroll do not move the dots (iOS flicker)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame'] });
    try {
      const layout = simulateLayout();
      render(carousel);
      layout.attach(track());
      Object.assign(layout.geometry, { clientWidth: 400, scrollWidth: 1200 });
      layout.resize();
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      expect(currentDot()).toBe(2);
      // Mid-animation, WebKit can report a position that rounds to the old page.
      layout.geometry.scrollLeft = 120;
      track().dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(16);
      expect(currentDot()).toBe(2);
      // Once settled, the real position is the source of truth again.
      layout.geometry.scrollLeft = 400;
      vi.advanceTimersByTime(200);
      expect(currentDot()).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  test('has no accessibility violations', async () => {
    const { container } = render(carousel);
    await expectNoAxeViolations(container);
  });
});
