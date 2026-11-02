/*
 * Marquee: a continuously scrolling strip of content; brand logos, promo text,
 * trust badges or any repeated items. Works horizontally or vertically, with
 * optional edge fading and hover-to-pause. The content is duplicated to create
 * a seamless loop; extra copies can be added with `repeat` for wide viewports
 * or narrow content.
 *
 * The animation pauses automatically when the user prefers reduced motion.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { createSignal, For, type JSX, onCleanup, onMount, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export const marqueeVariants = cva('group relative flex gap-(--marquee-gap) overflow-hidden', {
    variants: {
        orientation: {
            horizontal: 'flex-row',
            // A vertical strip scrolls inside its own box, so it needs a height:
            // it fills a sized parent, or takes one from `class` (`h-24`).
            vertical: 'h-full flex-col',
        },
        variant: {
            default: '',
            fade: '',
        },
    },
    compoundVariants: [
        {
            orientation: 'horizontal',
            variant: 'fade',
            class: '[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        },
        {
            orientation: 'vertical',
            variant: 'fade',
            class: '[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]',
        },
    ],
    defaultVariants: { orientation: 'horizontal', variant: 'default' },
});

export interface MarqueeProps
    extends
    Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof marqueeVariants> {
    /** The content to scroll. Rendered `repeat` times to create a seamless loop. */
    children: JSX.Element;
    /**
     * Scroll toward the start or the end of the axis.
     * `false` (default): left for horizontal, up for vertical.
     * `true`: right for horizontal, down for vertical.
     */
    reverse?: boolean;
    /**
     * Scroll speed in pixels per second (default: 40). The content is measured in
     * the browser, so the speed stays the same however long the content is.
     */
    speed?: number;
    /** Pause the animation when the pointer hovers over the strip (default: false). */
    pauseOnHover?: boolean;
    /**
     * Space between items, and between the end of the content and its next copy,
     * as a CSS length (default: `'1rem'`).
     */
    gap?: string;
    /** How many times to duplicate children to fill the strip (default: 2). Must be ≥ 2. */
    repeat?: number;
}

/**
 * A continuously scrolling strip. Vertical marquees need a height, from a sized
 * parent or `class` (`h-24`).
 */
export function Marquee(props: MarqueeProps) {
    const [local, rest] = splitProps(props, [
        'children',
        'orientation',
        'variant',
        'reverse',
        'speed',
        'pauseOnHover',
        'gap',
        'repeat',
        'class',
        'style',
    ]);

    const orientation = () => local.orientation ?? 'horizontal';
    const speed = () => local.speed ?? 40;
    const repeat = () => Math.max(local.repeat ?? 2, 2);

    // Distance one loop travels: a track's size plus the gap to the next copy.
    // Only known in the browser; until then the CSS falls back to 20s, so the
    // server render and the first browser render match.
    const [distance, setDistance] = createSignal<number>();
    let root!: HTMLDivElement;
    let firstTrack: HTMLDivElement | undefined;

    const measure = () => {
        if (!firstTrack) return;
        const horizontal = orientation() === 'horizontal';
        const styles = getComputedStyle(root);
        const gap = parseFloat(horizontal ? styles.columnGap : styles.rowGap) || 0;
        const size = horizontal ? firstTrack.offsetWidth : firstTrack.offsetHeight;
        setDistance(size > 0 ? size + gap : undefined);
    };

    onMount(() => {
        measure();
        if (typeof ResizeObserver === 'undefined' || !firstTrack) return;
        const observer = new ResizeObserver(measure);
        observer.observe(firstTrack);
        onCleanup(() => observer.disconnect());
    });

    const style = (): JSX.CSSProperties | string => {
        const vars: Record<string, string> = { '--marquee-gap': local.gap ?? '1rem' };
        const d = distance();
        if (d !== undefined && speed() > 0) vars['--marquee-duration'] = `${d / speed()}s`;
        if (typeof local.style === 'string') {
            const declarations = Object.entries(vars).map(([k, v]) => `${k}: ${v}`);
            return [...declarations, local.style].join('; ');
        }
        return { ...vars, ...local.style };
    };

    return (
        <div
            ref={root}
            data-slot="marquee"
            data-orientation={orientation()}
            data-variant={local.variant ?? 'default'}
            class={cn(
                marqueeVariants({ orientation: orientation(), variant: local.variant }),
                local.class,
            )}
            style={style()}
            {...rest}
        >
            <For each={Array.from({ length: repeat() })}>
                {(_, i) => (
                    <div
                        ref={(el) => {
                            if (i() === 0) firstTrack = el;
                        }}
                        data-slot="marquee-track"
                        aria-hidden={i() > 0 ? 'true' : undefined}
                        class={cn(
                            'flex shrink-0 items-center justify-around gap-(--marquee-gap)',
                            orientation() === 'horizontal'
                                ? 'animate-marquee-x flex-row'
                                : 'animate-marquee-y flex-col',
                            local.reverse && '[animation-direction:reverse]',
                            local.pauseOnHover && 'group-hover:[animation-play-state:paused]',
                            'motion-reduce:[animation-play-state:paused]',
                        )}
                    >
                        {local.children}
                    </div>
                )}
            </For>
        </div>
    );
}
