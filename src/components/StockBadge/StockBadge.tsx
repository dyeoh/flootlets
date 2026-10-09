/*
 * StockBadge: "In stock" or "Sold out" from a boolean, such as the `in_stock`
 * field gnerkulfloot's storefront API returns (exact counts stay private).
 */
import { splitProps } from 'solid-js';
import { Badge, type BadgeProps } from '../Badge/Badge';

export interface StockBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  inStock: boolean;
  /** Text for each state, for translation. */
  labels?: { inStock?: string; soldOut?: string };
}

export function StockBadge(props: StockBadgeProps) {
  const [local, rest] = splitProps(props, ['inStock', 'labels']);
  return (
    <Badge variant={local.inStock ? 'success' : 'destructive'} {...rest}>
      {local.inStock
        ? (local.labels?.inStock ?? 'In stock')
        : (local.labels?.soldOut ?? 'Sold out')}
    </Badge>
  );
}
