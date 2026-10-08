import { For, Show } from 'solid-js';
import { Badge, Button, Grid, ProductCard, StockBadge, toast, Toaster } from 'flootlets';
import { placeholder, products } from './placeholder';

export default function ProductCardExample() {
  return (
    <>
      <Grid minItemWidth="12rem" class="w-full">
        <For each={products.slice(0, 3)}>
          {(p) => (
            <ProductCard>
              <ProductCard.Image urls={placeholder(p.name, p.hue)} width={400} height={400} />
              <ProductCard.Badges>
                <StockBadge inStock={p.inStock} />
                <Show when={p.compareAt}>
                  <Badge>Sale</Badge>
                </Show>
              </ProductCard.Badges>
              <ProductCard.Title href={`#${p.slug}`}>{p.name}</ProductCard.Title>
              <ProductCard.Price
                amount={{ amount: p.price, currency: 'MYR' }}
                compareAt={p.compareAt ? { amount: p.compareAt, currency: 'MYR' } : null}
                locale="en-MY"
              />
              <ProductCard.Actions>
                <Button
                  size="sm"
                  disabled={!p.inStock}
                  onClick={() =>
                    toast({ title: 'Added to cart', description: p.name, variant: 'success' })
                  }
                >
                  {p.inStock ? 'Add to cart' : 'Sold out'}
                </Button>
              </ProductCard.Actions>
            </ProductCard>
          )}
        </For>
      </Grid>
      <Toaster />
    </>
  );
}
