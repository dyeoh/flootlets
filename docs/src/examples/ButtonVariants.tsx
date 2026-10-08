import { Button } from 'flootlets';

export default function ButtonVariants() {
  return (
    <>
      <Button>Add to cart</Button>
      <Button variant="secondary">Save for later</Button>
      <Button variant="outline">View details</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Remove</Button>
    </>
  );
}
