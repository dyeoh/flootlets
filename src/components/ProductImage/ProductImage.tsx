/*
 * ProductImage: a product photo served in two sizes, a small "thumb" and a
 * "large" (gnerkulfloot's API serves 400px and 1600px WebPs). The browser picks the
 * smallest that looks sharp (srcset/sizes); width/height reserve the space so
 * the page doesn't jump while it loads; a broken image shows a placeholder.
 */
import { createSignal, type JSX, Show, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

/** An image's two sizes (the `urls` object in gnerkulfloot API responses). */
export interface ImageUrls {
  thumb: string;
  large: string;
}

export interface ProductImageProps extends Omit<
  JSX.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcset'
> {
  urls: ImageUrls;
  /**
   * Describes the photo for people who can't see it ("Red baju kurung, front").
   * Required: pass "" only when the same information is already next to it,
   * like a product name in a card.
   */
  alt: string;
  /** The original image's size from the API; reserves space and refines srcset. */
  width?: number;
  height?: number;
  /** Load straight away (the main image above the fold). Others load lazily. */
  priority?: boolean;
  /** Text shown if the image can't load. Defaults to the alt text. */
  fallback?: JSX.Element;
}

/** The image box; also the empty placeholder ProductCard shows when a product has no photo. */
export const productImageClass = 'block h-auto w-full rounded-md bg-muted object-cover';
export const productImageFallbackClass =
  'grid aspect-square place-items-center p-4 text-center text-sm text-muted-foreground';

const THUMB_MAX = 400;
const LARGE_MAX = 1600;

/** Pixel width of a variant whose longest side is at most `max`. */
function variantWidth(max: number, width?: number, height?: number): number {
  if (!width || !height) return max;
  return Math.min(width, Math.round((width * max) / Math.max(width, height)));
}

export function ProductImage(props: ProductImageProps) {
  const [local, rest] = splitProps(props, [
    'urls',
    'alt',
    'width',
    'height',
    'priority',
    'fallback',
    'class',
    'sizes',
  ]);
  const [failed, setFailed] = createSignal(false);
  const ratio = () =>
    local.width && local.height ? `${local.width} / ${local.height}` : undefined;
  return (
    <Show
      when={!failed()}
      fallback={
        <span
          data-slot="product-image-fallback"
          class={cn(productImageClass, productImageFallbackClass, local.class)}
          role={local.alt ? 'img' : undefined}
          aria-label={local.alt || undefined}
          aria-hidden={local.alt ? undefined : 'true'}
          style={{ 'aspect-ratio': ratio() }}
        >
          <span aria-hidden="true">{local.fallback ?? local.alt}</span>
        </span>
      }
    >
      <img
        data-slot="product-image"
        class={cn(productImageClass, local.class)}
        src={local.urls.large}
        srcset={`${local.urls.thumb} ${variantWidth(THUMB_MAX, local.width, local.height)}w, ${local.urls.large} ${variantWidth(LARGE_MAX, local.width, local.height)}w`}
        sizes={local.sizes ?? '(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw'}
        alt={local.alt}
        width={local.width}
        height={local.height}
        loading={local.priority ? 'eager' : 'lazy'}
        decoding={local.priority ? 'sync' : 'async'}
        fetchpriority={local.priority ? 'high' : undefined}
        onError={() => setFailed(true)}
        {...rest}
      />
    </Show>
  );
}
