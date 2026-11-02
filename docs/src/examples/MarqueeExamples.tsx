import { Marquee } from 'flootlets';

/** Horizontal logo strip with edge fade, pauses on hover. */
export function MarqueeHorizontal() {
  return (
    <Marquee
      variant="fade"
      pauseOnHover
      speed={30}
      gap="3rem"
      class="text-muted-foreground text-sm font-bold"
    >
      <span>KIRIN ICHIBAN</span>
      <span>GUINNESS</span>
      <span>STONE &amp; WOOD</span>
      <span>STEINLAGER</span>
      <span>FOUR PILLARS</span>
      <span>SPEIGHT'S</span>
    </Marquee>
  );
}

/** Horizontal strip scrolling in reverse. */
export function MarqueeReverse() {
  return (
    <Marquee reverse speed={50} gap="2rem" class="text-sm">
      <span>🎉 Grand opening sale</span>
      <span>🚚 Free shipping on orders over MYR 100</span>
      <span>🔥 New arrivals every week</span>
    </Marquee>
  );
}

/** Vertical announcement ticker: a vertical marquee needs a height. */
export function MarqueeVertical() {
  return (
    <Marquee
      orientation="vertical"
      variant="fade"
      speed={20}
      gap="1rem"
      class="h-24 text-sm text-foreground"
    >
      <p>🆕 Kuih Lapis just landed</p>
      <p>📦 Orders ship within 24 hours</p>
      <p>⭐ Rated 4.9 by 2,000+ customers</p>
    </Marquee>
  );
}

export default function MarqueeExamples() {
  return (
    <div class="flex w-full flex-col gap-12">
      <section>
        <h3 class="mb-3 text-sm font-medium text-muted-foreground">Horizontal with fade</h3>
        <MarqueeHorizontal />
      </section>
      <section>
        <h3 class="mb-3 text-sm font-medium text-muted-foreground">Reverse direction</h3>
        <MarqueeReverse />
      </section>
      <section>
        <h3 class="mb-3 text-sm font-medium text-muted-foreground">Vertical ticker</h3>
        <MarqueeVertical />
      </section>
    </div>
  );
}
