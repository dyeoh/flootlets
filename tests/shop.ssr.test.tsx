// Shop components render on the server (Astro), links and all, before any JS.
import { For } from 'solid-js';
import { renderToString } from 'solid-js/web';
import { expect, test } from 'vitest';
import { Carousel, Pagination, ProductCard, ProductImage, StockBadge } from '../src';

const urls = { thumb: '/t.webp', large: '/l.webp' };

test('shop components render to HTML on the server', () => {
  const html = renderToString(() => (
    <>
      <Carousel label="New in" itemCount={2}>
        <Carousel.Content>
          <For each={['Kuih Lapis', 'Tudung']}>
            {(name, i) => (
              <Carousel.Item index={i()}>
                <ProductCard>
                  <ProductCard.Image urls={urls} />
                  <ProductCard.Title href={`/products/${i()}`}>{name}</ProductCard.Title>
                  <ProductCard.Price amount={{ amount: 2500, currency: 'MYR' }} locale="en-MY" />
                  <StockBadge inStock />
                </ProductCard>
              </Carousel.Item>
            )}
          </For>
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
        <Carousel.Dots />
      </Carousel>
      <ProductImage urls={urls} alt="Front" width={800} height={800} priority />
      <Pagination page={2} totalPages={5} href={(p) => `?page=${p}`} />
    </>
  ));
  expect(html).toContain('aria-roledescription="carousel"');
  expect(html).toContain('href="/products/1"');
  expect(html).toContain('srcset="/t.webp 400w, /l.webp 800w"');
  expect(html).toContain('href="?page=3"');
  expect(html).toContain('aria-current="page"');
});
