import { Button, EmptyState } from 'flootlets';

export default function EmptyStateExample() {
  return (
    <EmptyState
      icon="🛒"
      title="Your cart is empty"
      description="Have a look around the shop and add something you like."
      action={<Button href="#shop">Continue shopping</Button>}
      class="w-full"
    />
  );
}
