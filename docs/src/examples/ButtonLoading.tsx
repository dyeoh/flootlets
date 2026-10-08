import { createSignal } from 'solid-js';
import { Button } from 'flootlets';

// Press it: the button stays focused and keeps its width while busy.
export default function ButtonLoading() {
  const [busy, setBusy] = createSignal(false);
  const pay = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 2000);
  };
  return (
    <Button loading={busy()} onClick={pay}>
      Pay RM 29.20
    </Button>
  );
}
