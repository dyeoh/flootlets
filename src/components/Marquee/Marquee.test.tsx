// Marquee: rendering, props, orientation, accessibility.
import { render } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { expectNoAxeViolations } from '../../test/axe';
import { Marquee } from './Marquee';

describe('Marquee', () => {
  test('renders children and duplicates them for the seamless loop', () => {
    const { container } = render(() => (
      <Marquee>
        <span>Free shipping</span>
      </Marquee>
    ));
    const tracks = container.querySelectorAll('[data-slot="marquee-track"]');
    expect(tracks).toHaveLength(2);
    // Only the first track is visible to assistive technology.
    expect(tracks[0]).not.toHaveAttribute('aria-hidden');
    expect(tracks[1]).toHaveAttribute('aria-hidden', 'true');
  });

  test('repeat controls how many copies are rendered', () => {
    const { container } = render(() => (
      <Marquee repeat={4}>
        <span>Logo</span>
      </Marquee>
    ));
    const tracks = container.querySelectorAll('[data-slot="marquee-track"]');
    expect(tracks).toHaveLength(4);
    // First is not hidden, rest are.
    expect(tracks[0]).not.toHaveAttribute('aria-hidden');
    expect(tracks[1]).toHaveAttribute('aria-hidden', 'true');
    expect(tracks[2]).toHaveAttribute('aria-hidden', 'true');
    expect(tracks[3]).toHaveAttribute('aria-hidden', 'true');
  });

  test('repeat below 2 is clamped to 2', () => {
    const { container } = render(() => (
      <Marquee repeat={1}>
        <span>Logo</span>
      </Marquee>
    ));
    expect(container.querySelectorAll('[data-slot="marquee-track"]')).toHaveLength(2);
  });

  test('defaults to horizontal orientation', () => {
    const { container } = render(() => <Marquee>content</Marquee>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-orientation', 'horizontal');
    expect(root).toHaveClass('flex-row');
    const track = container.querySelector('[data-slot="marquee-track"]') as HTMLElement;
    expect(track).toHaveClass('animate-marquee-x', 'flex-row');
  });

  test('vertical orientation uses the column axis', () => {
    const { container } = render(() => <Marquee orientation="vertical">content</Marquee>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-orientation', 'vertical');
    expect(root).toHaveClass('flex-col', 'h-full');
    const track = container.querySelector('[data-slot="marquee-track"]') as HTMLElement;
    expect(track).toHaveClass('animate-marquee-y', 'flex-col');
  });

  test('reverse flips the animation direction', () => {
    const { container } = render(() => <Marquee reverse>content</Marquee>);
    const track = container.querySelector('[data-slot="marquee-track"]') as HTMLElement;
    expect(track).toHaveClass('[animation-direction:reverse]');
  });

  test('pauseOnHover adds the group-hover pause class', () => {
    const { container } = render(() => <Marquee pauseOnHover>content</Marquee>);
    const track = container.querySelector('[data-slot="marquee-track"]') as HTMLElement;
    expect(track).toHaveClass('group-hover:[animation-play-state:paused]');
  });

  test('the animation always pauses for reduced motion', () => {
    const { container } = render(() => <Marquee>content</Marquee>);
    const track = container.querySelector('[data-slot="marquee-track"]') as HTMLElement;
    expect(track).toHaveClass('motion-reduce:[animation-play-state:paused]');
  });

  test('speed sets the loop duration from the measured track and gap', () => {
    // jsdom has no layout: give each track a width and the root a 16px gap.
    const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(304);
    const real = window.getComputedStyle;
    const styles = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((el) => ({ ...real(el), columnGap: '16px', rowGap: '16px' }));
    try {
      const { container } = render(() => <Marquee speed={80}>content</Marquee>);
      const root = container.firstElementChild as HTMLElement;
      // (304 + 16) px / 80 px/s = 4s per loop.
      expect(root.style.getPropertyValue('--marquee-duration')).toBe('4s');
    } finally {
      width.mockRestore();
      styles.mockRestore();
    }
  });

  test('without a measured size the duration is left to the CSS fallback', () => {
    const { container } = render(() => <Marquee>content</Marquee>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--marquee-duration')).toBe('');
  });

  test('gap is a CSS length shared by the root and every track', () => {
    const { container } = render(() => <Marquee gap="2rem">content</Marquee>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--marquee-gap')).toBe('2rem');
    expect(root).toHaveClass('gap-(--marquee-gap)');
    for (const track of container.querySelectorAll('[data-slot="marquee-track"]')) {
      expect(track).toHaveClass('gap-(--marquee-gap)');
    }
  });

  test('gap defaults to 1rem', () => {
    const { container } = render(() => <Marquee>content</Marquee>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--marquee-gap')).toBe('1rem');
  });

  test('caller style is kept alongside the custom properties', () => {
    const { container } = render(() => <Marquee style={{ 'max-width': '20rem' }}>content</Marquee>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.maxWidth).toBe('20rem');
    expect(root.style.getPropertyValue('--marquee-gap')).toBe('1rem');
  });

  test('fade variant adds the mask on horizontal', () => {
    const { container } = render(() => <Marquee variant="fade">content</Marquee>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-variant', 'fade');
    expect(root.className).toContain('mask-image');
    expect(root.className).toContain('to_right');
  });

  test('fade variant adds the vertical mask on vertical orientation', () => {
    const { container } = render(() => (
      <Marquee variant="fade" orientation="vertical">
        content
      </Marquee>
    ));
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('to_bottom');
  });

  test('caller class is merged last and overrides defaults', () => {
    const { container } = render(() => <Marquee class="bg-primary p-4">content</Marquee>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('bg-primary', 'p-4');
  });

  test('data-slot is set on the root', () => {
    const { container } = render(() => <Marquee>content</Marquee>);
    expect(container.firstElementChild).toHaveAttribute('data-slot', 'marquee');
  });

  test('has no accessibility violations', async () => {
    const { container } = render(() => (
      <Marquee>
        <span>Free shipping on orders over MYR 100</span>
      </Marquee>
    ));
    await expectNoAxeViolations(container);
  });
});
