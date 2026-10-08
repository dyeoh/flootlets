import { describe, expect, test } from 'vitest';
import { currencyDigits, formatMoney } from './money';

// Intl joins symbol and number with a no-break space, so a price never wraps
// across lines. Written as NBSP here to make that explicit.
const NBSP = '\u00a0';

describe('formatMoney', () => {
  test('uses each currency’s own number of decimals', () => {
    expect(currencyDigits('MYR')).toBe(2);
    expect(currencyDigits('JPY')).toBe(0);
    expect(currencyDigits('BHD')).toBe(3);
    expect(formatMoney({ amount: 2920, currency: 'MYR' }, 'en-MY')).toBe(`RM${NBSP}29.20`);
    expect(formatMoney({ amount: 500, currency: 'JPY' }, 'ja-JP')).toBe('￥500');
    expect(formatMoney({ amount: 1250, currency: 'BHD' }, 'en')).toBe(`BHD${NBSP}1.250`);
  });

  test('formats per locale, not per machine', () => {
    expect(formatMoney({ amount: 123456, currency: 'EUR' }, 'de-DE')).toBe(`1.234,56${NBSP}€`);
    expect(formatMoney({ amount: 123456, currency: 'USD' }, 'en-US')).toBe('$1,234.56');
  });

  test('handles zero and negative amounts (refunds)', () => {
    expect(formatMoney({ amount: 0, currency: 'MYR' }, 'en-MY')).toBe(`RM${NBSP}0.00`);
    expect(formatMoney({ amount: -1050, currency: 'MYR' }, 'en-MY')).toBe(`-RM${NBSP}10.50`);
  });
});
