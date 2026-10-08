import { createSignal, Show } from 'solid-js';
import { Alert, Stack } from 'flootlets';

export default function AlertExamples() {
  const [shown, setShown] = createSignal(true);
  return (
    <Stack gap={3} style={{ 'inline-size': '100%' }}>
      <Alert tone="danger" title="Kuih Lapis just sold out">
        Only 1 was left when you checked out. We've updated your cart.
      </Alert>
      <Alert tone="warning">Orders placed after 3pm ship the next working day.</Alert>
      <Alert tone="success">Your details were saved.</Alert>
      <Show when={shown()}>
        <Alert title="Free delivery over RM 100" onDismiss={() => setShown(false)}>
          Applies to West Malaysia.
        </Alert>
      </Show>
    </Stack>
  );
}
