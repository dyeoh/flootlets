import { For } from 'solid-js';
import { Carousel, Cluster, ProductCard } from 'flootlets';
import { placeholder, products } from './placeholder';

export default function CarouselExample() {
  return (
    <Carousel
      label="Recommended for you"
      itemCount={products.length}
      style={{ 'inline-size': '100%' }}
    >
      <Cluster justify="between">
        <strong>Recommended for you</strong>
        <Cluster gap={2}>
          <Carousel.Previous />
          <Carousel.Next />
        </Cluster>
      </Cluster>
      <Carousel.Content>
        <For each={products}>
          {(p, i) => (
            <Carousel.Item index={i()}>
              <ProductCard>
                <ProductCard.Image urls={placeholder(p.name, p.hue)} width={400} height={400} />
                <ProductCard.Title href={`#${p.slug}`}>{p.name}</ProductCard.Title>
                <ProductCard.Price
                  amount={{ amount: p.price, currency: 'MYR' }}
                  locale="en-MY"
                  size="sm"
                />
              </ProductCard>
            </Carousel.Item>
          )}
        </For>
      </Carousel.Content>
      <Carousel.Dots />
    </Carousel>
  );
}
