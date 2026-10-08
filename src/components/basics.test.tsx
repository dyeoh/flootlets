// Small components: Badge, Link, Spinner, Skeleton, VisuallyHidden, layout.
import { render, screen } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { expectNoAxeViolations } from '../test/axe';
import { Badge } from './Badge/Badge';
import { Cluster, Grid, Stack } from './Layout/Layout';
import { Link } from './Link/Link';
import { Skeleton } from './Skeleton/Skeleton';
import { Spinner } from './Spinner/Spinner';
import { VisuallyHidden } from './VisuallyHidden/VisuallyHidden';

describe('Badge', () => {
  test('has a tone and keeps its text', () => {
    render(() => <Badge tone="danger">Sold out</Badge>);
    expect(screen.getByText('Sold out')).toHaveAttribute('data-tone', 'danger');
  });
});

describe('Link', () => {
  test('external links open safely in a new tab and say so', () => {
    render(() => (
      <Link href="https://example.com" external>
        Supplier
      </Link>
    ));
    const link = screen.getByRole('link', { name: 'Supplier (opens in a new tab)' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('Spinner', () => {
  test('is a labelled status', () => {
    render(() => <Spinner label="Loading products" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading products');
  });

  test('decorative spinners are hidden from assistive technology', () => {
    const { container } = render(() => <Spinner decorative />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Skeleton', () => {
  test('is hidden from screen readers and sized as asked', () => {
    const { container } = render(() => <Skeleton width="10rem" height="2rem" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.style.inlineSize).toBe('10rem');
  });
});

describe('VisuallyHidden', () => {
  test('names an icon-only button', () => {
    render(() => (
      <button>
        <VisuallyHidden>Close</VisuallyHidden>
        <span aria-hidden="true">×</span>
      </button>
    ));
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});

describe('Layout', () => {
  test('gaps come from the spacing scale', () => {
    const { container } = render(() => (
      <>
        <Stack gap={6}>a</Stack>
        <Cluster>b</Cluster>
        <Grid minItemWidth="12rem">c</Grid>
      </>
    ));
    const [stack, cluster, grid] = Array.from(container.children) as HTMLElement[];
    expect(stack!.style.getPropertyValue('--fl-gap')).toBe('var(--fl-space-6)');
    expect(cluster!.style.getPropertyValue('--fl-gap')).toBe('var(--fl-space-2)');
    expect(grid!.style.getPropertyValue('--fl-grid-min')).toBe('12rem');
  });
});

test('basics have no accessibility violations', async () => {
  const { container } = render(() => (
    <Stack>
      <Cluster>
        <Badge tone="accent">New</Badge>
        <Badge tone="success">In stock</Badge>
      </Cluster>
      <Link href="/about">About</Link>
      <Spinner />
      <Skeleton />
    </Stack>
  ));
  await expectNoAxeViolations(container);
});
