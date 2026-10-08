/**
 * Money as the gnerkulfloot API sends it: an integer amount in the currency's
 * minor units (sen, cents; whole yen for JPY) plus an ISO 4217 code.
 * RM29.20 is { amount: 2920, currency: 'MYR' }.
 */
export interface Money {
  amount: number;
  currency: string;
}

const formatters = new Map<string, Intl.NumberFormat>();

/**
 * A cached currency formatter. Formatters are slow to create, and product
 * grids format hundreds of prices.
 */
function formatter(locale: string, currency: string): Intl.NumberFormat {
  const key = `${locale}|${currency}`;
  let nf = formatters.get(key);
  if (!nf) {
    nf = new Intl.NumberFormat(locale, { style: 'currency', currency });
    formatters.set(key, nf);
  }
  return nf;
}

/** How many decimal places a currency uses: 2 for MYR, 0 for JPY, 3 for BHD. */
export function currencyDigits(currency: string): number {
  return formatter('en', currency).resolvedOptions().maximumFractionDigits ?? 2;
}

/**
 * Formats minor-unit money for display: formatMoney({ amount: 2920, currency:
 * 'MYR' }, 'en-MY') → "RM 29.20".
 *
 * Always pass the same locale on the server and in the browser; a locale taken
 * from the environment would differ between them and break hydration.
 */
export function formatMoney(money: Money, locale = 'en'): string {
  const nf = formatter(locale, money.currency);
  const digits = nf.resolvedOptions().maximumFractionDigits ?? 2;
  return nf.format(money.amount / 10 ** digits);
}
