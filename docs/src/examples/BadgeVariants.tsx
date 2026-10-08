import { Badge } from 'flootlets';

export default function BadgeVariants() {
  return (
    <>
      <Badge>New</Badge>
      <Badge variant="secondary">Pre-order</Badge>
      <Badge variant="outline">Handmade</Badge>
      <Badge variant="success">In stock</Badge>
      <Badge variant="warning">Only 2 left</Badge>
      <Badge variant="destructive">Sold out</Badge>
    </>
  );
}
