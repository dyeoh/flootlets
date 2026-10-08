import { render, screen } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { expectNoAxeViolations } from '../../test/axe';
import { Price } from './Price';

const NBSP = ' ';

describe('Price', () => {
  test('formats minor-unit money from the API', () => {
    const { container } = render(() => (
      <Price amount={{ amount: 2920, currency: 'MYR' }} locale="en-MY" />
    ));
    expect(container.textContent).toBe(`RM${NBSP}29.20`);
  });

  test('shows a sale with the original price struck through and labelled', () => {
    const { container } = render(() => (
      <Price
        amount={{ amount: 2500, currency: 'MYR' }}
        compareAt={{ amount: 3500, currency: 'MYR' }}
        locale="en-MY"
      />
    ));
    // Exact text: toHaveTextContent would normalise the no-break space away.
    expect(container.querySelector('s')?.textContent).toBe(`RM${NBSP}35.00`);
    expect(container.querySelector('.fl-price')).toHaveAttribute('data-sale');
    // Read aloud as: "Sale price RM 25.00 Original price RM 35.00".
    expect(container.textContent?.replace(/[ \n]+/g, ' ')).toBe(
      `Sale price RM${NBSP}25.00 Original price RM${NBSP}35.00`,
    );
  });

  test('ignores a compare-at price that is not a discount', () => {
    const { container } = render(() => (
      <Price
        amount={{ amount: 2500, currency: 'MYR' }}
        compareAt={{ amount: 2500, currency: 'MYR' }}
      />
    ));
    expect(container.querySelector('s')).toBeNull();
    expect(screen.queryByText(/Original price/)).toBeNull();
  });

  test('ignores a compare-at price in another currency', () => {
    const { container } = render(() => (
      <Price
        amount={{ amount: 2500, currency: 'MYR' }}
        compareAt={{ amount: 9999, currency: 'USD' }}
      />
    ));
    expect(container.querySelector('s')).toBeNull();
  });

  test('screen-reader labels can be translated', () => {
    render(() => (
      <Price
        amount={{ amount: 2500, currency: 'MYR' }}
        compareAt={{ amount: 3500, currency: 'MYR' }}
        labels={{ current: 'Harga jualan', original: 'Harga asal' }}
      />
    ));
    expect(screen.getByText(/Harga asal/)).toBeInTheDocument();
  });

  test('has no accessibility violations', async () => {
    const { container } = render(() => (
      <Price
        amount={{ amount: 2500, currency: 'MYR' }}
        compareAt={{ amount: 3500, currency: 'MYR' }}
      />
    ));
    await expectNoAxeViolations(container);
  });
});
