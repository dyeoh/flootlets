import { VisuallyHidden } from 'flootlets';

// Screen readers announce "Remove Kuih Lapis from cart, button"; sighted users see ×.
export default function VisuallyHiddenExample() {
  return (
    <button type="button" class="fl-button" data-variant="ghost" data-size="sm">
      <span aria-hidden="true">×</span>
      <VisuallyHidden>Remove Kuih Lapis from cart</VisuallyHidden>
    </button>
  );
}
