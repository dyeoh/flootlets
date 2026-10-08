import { Button } from 'flootlets';

export default function ButtonLinks() {
  return (
    <>
      <Button href="#cart" variant="outline">
        View cart
      </Button>
      <Button href="#checkout" disabled>
        Checkout
      </Button>
    </>
  );
}
