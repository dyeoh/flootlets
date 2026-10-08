/*
 * ProductCard: a product in a grid or carousel. Compound, so shops arrange the
 * parts they need:
 *
 *   <ProductCard>
 *     <ProductCard.Image urls={p.thumbnail} />
 *     <ProductCard.Badges><StockBadge inStock={p.in_stock} /></ProductCard.Badges>
 *     <ProductCard.Title href={`/products/${p.slug}`}>{p.name}</ProductCard.Title>
 *     <ProductCard.Price amount={p.price_from} compareAt={p.compare_at} locale="en-MY" />
 *     <ProductCard.Actions><Button>Add to cart</Button></ProductCard.Actions>
 *   </ProductCard>
 *
 * The whole card is clickable through the title's link (its hit area is
 * stretched over the card), while screen readers hear one link with the
 * product name, not a card full of nested links. Actions sit above it, so
 * their own buttons still work. Presentational only: it fetches nothing.
 */
import { type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { cn } from '../../lib/utils';
import { Price, type PriceProps } from '../Price/Price';
import {
  type ImageUrls,
  ProductImage,
  productImageClass,
  productImageFallbackClass,
  type ProductImageProps,
} from '../ProductImage/ProductImage';

export type ProductCardProps = JSX.HTMLAttributes<HTMLElement>;

function Root(props: ProductCardProps) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <article
      data-slot="product-card"
      class={cn(
        // Where :has() works, the title link's focus ring outlines the whole
        // card (and the link drops its own). Elsewhere the link keeps its ring,
        // so focus is never invisible.
        'group/card relative flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-3 text-card-foreground transition-[border-color,box-shadow] hover:border-input hover:shadow-md has-[[data-slot=product-card-link]:focus-visible]:outline-2 has-[[data-slot=product-card-link]:focus-visible]:outline-offset-2 has-[[data-slot=product-card-link]:focus-visible]:outline-ring motion-reduce:transition-none',
        local.class,
      )}
      {...rest}
    />
  );
}

export interface ProductCardImageProps extends Omit<ProductImageProps, 'alt' | 'urls'> {
  urls?: ImageUrls | null;
  /** Usually leave empty: the title next to it already names the product. */
  alt?: string;
}

function Image(props: ProductCardImageProps) {
  const [local, rest] = splitProps(props, ['urls', 'alt', 'class']);
  const image =
    'aspect-square transition-transform duration-300 group-hover/card:scale-[1.03] motion-reduce:transition-none';
  return (
    <div data-slot="product-card-media" class="order-first overflow-hidden rounded-md">
      {local.urls ? (
        <ProductImage
          urls={local.urls}
          alt={local.alt ?? ''}
          class={cn(image, local.class)}
          {...rest}
        />
      ) : (
        <span
          data-slot="product-image-fallback"
          class={cn(productImageClass, productImageFallbackClass, local.class)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export interface ProductCardTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  /** The product page. The whole card links here. */
  href: string;
  /** Heading level, to fit the page outline. Default 3. */
  level?: 2 | 3 | 4;
}

function Title(props: ProductCardTitleProps) {
  const [local, rest] = splitProps(props, ['href', 'level', 'class', 'children']);
  return (
    <Dynamic
      component={`h${local.level ?? 3}`}
      data-slot="product-card-title"
      class={cn('m-0 text-base leading-tight font-semibold', local.class)}
      {...rest}
    >
      {/* The link's hit area is stretched over the whole card. */}
      <a
        data-slot="product-card-link"
        class="text-inherit no-underline after:absolute after:inset-0 after:z-0 after:rounded-[inherit] supports-[selector(:has(*))]:focus-visible:outline-none"
        href={local.href}
      >
        {local.children}
      </a>
    </Dynamic>
  );
}

function CardPrice(props: PriceProps) {
  const [local, rest] = splitProps(props, ['class']);
  return <Price data-slot="product-card-price" class={local.class} {...rest} />;
}

function Badges(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <div
      data-slot="product-card-badges"
      class={cn('flex flex-wrap gap-1', local.class)}
      {...rest}
    />
  );
}

/** Buttons and controls; kept clickable above the card-wide link. */
function Actions(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <div
      data-slot="product-card-actions"
      class={cn(
        // Narrow cards: buttons shrink and their labels truncate rather than overflow.
        'relative z-10 mt-auto flex flex-wrap gap-2 pt-2 *:data-[slot=button]:min-w-0 *:data-[slot=button]:flex-auto [&_[data-slot=button-label]]:block [&_[data-slot=button-label]]:truncate',
        local.class,
      )}
      {...rest}
    />
  );
}

export const ProductCard = Object.assign(Root, { Image, Title, Price: CardPrice, Badges, Actions });
