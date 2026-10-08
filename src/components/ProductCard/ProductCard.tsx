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
import { cx } from '../../lib/cx';
import { Price, type PriceProps } from '../Price/Price';
import { type ImageUrls, ProductImage, type ProductImageProps } from '../ProductImage/ProductImage';

export type ProductCardProps = JSX.HTMLAttributes<HTMLElement>;

function Root(props: ProductCardProps) {
  const [local, rest] = splitProps(props, ['class']);
  return <article class={cx('fl-product-card', local.class)} {...rest} />;
}

export interface ProductCardImageProps extends Omit<ProductImageProps, 'alt' | 'urls'> {
  urls?: ImageUrls | null;
  /** Usually leave empty: the title next to it already names the product. */
  alt?: string;
}

function Image(props: ProductCardImageProps) {
  const [local, rest] = splitProps(props, ['urls', 'alt']);
  return (
    <div class="fl-product-card__media">
      {local.urls ? (
        <ProductImage urls={local.urls} alt={local.alt ?? ''} {...rest} />
      ) : (
        <span class="fl-product-image fl-product-image--fallback" aria-hidden="true" />
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
      class={cx('fl-product-card__title', local.class)}
      {...rest}
    >
      <a class="fl-product-card__link" href={local.href}>
        {local.children}
      </a>
    </Dynamic>
  );
}

function CardPrice(props: PriceProps) {
  const [local, rest] = splitProps(props, ['class']);
  return <Price class={cx('fl-product-card__price', local.class)} {...rest} />;
}

function Badges(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class']);
  return <div class={cx('fl-product-card__badges', local.class)} {...rest} />;
}

/** Buttons and controls; kept clickable above the card-wide link. */
function Actions(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class']);
  return <div class={cx('fl-product-card__actions', local.class)} {...rest} />;
}

export const ProductCard = Object.assign(Root, { Image, Title, Price: CardPrice, Badges, Actions });
