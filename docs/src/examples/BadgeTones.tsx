import { Badge } from 'flootlets';

export default function BadgeTones() {
  return (
    <>
      <Badge>Pre-order</Badge>
      <Badge tone="accent">New</Badge>
      <Badge tone="success">In stock</Badge>
      <Badge tone="warning">Only 2 left</Badge>
      <Badge tone="danger">Sold out</Badge>
    </>
  );
}
