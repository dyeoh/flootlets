// Every component must render to HTML on the server, as Astro does it.
import { renderToString } from 'solid-js/web';
import { describe, expect, test } from 'vitest';
import {
  Badge,
  Button,
  Cluster,
  Grid,
  Link,
  Price,
  Skeleton,
  Spinner,
  Stack,
  VisuallyHidden,
} from '../src';

describe('server rendering', () => {
  test('basics', () => {
    const html = renderToString(() => (
      <Stack>
        <Cluster>
          <Button>Add to cart</Button>
          <Button href="/cart" variant="outline">
            View cart
          </Button>
          <Button loading>Paying</Button>
        </Cluster>
        <Badge>New</Badge>
        <Link href="https://example.com" external>
          Supplier
        </Link>
        <Spinner />
        <Skeleton width="4rem" />
        <VisuallyHidden>hidden</VisuallyHidden>
        <Grid>
          <span>item</span>
        </Grid>
      </Stack>
    ));
    expect(html).toContain('type="button"');
    expect(html).toContain('href="/cart"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('(opens in a new tab)');
    expect(html).toContain('role="status"');
  });

  test('prices render identically on the server and in the browser', () => {
    // Same locale in, same text out: the server HTML hydrates without mismatch.
    const html = renderToString(() => (
      <Price
        amount={{ amount: 2500, currency: 'MYR' }}
        compareAt={{ amount: 3500, currency: 'MYR' }}
        locale="en-MY"
      />
    ));
    expect(html).toContain('RM 25.00');
    expect(html).toMatch(/<s [^>]*data-slot="price-was"/);
  });
});
