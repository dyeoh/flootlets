import { Button, VisuallyHidden } from 'flootlets';

// Screen readers announce "Remove Kuih Lapis from cart, button"; sighted users see ×.
export default function VisuallyHiddenExample() {
  return (
    <Button variant="ghost" size="icon">
      <span aria-hidden="true">×</span>
      <VisuallyHidden>Remove Kuih Lapis from cart</VisuallyHidden>
    </Button>
  );
}
