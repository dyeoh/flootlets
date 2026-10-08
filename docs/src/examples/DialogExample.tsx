import { createSignal } from 'solid-js';
import { Button, Dialog } from 'flootlets';

export default function DialogExample() {
  const [open, setOpen] = createSignal(false);
  return (
    <Dialog
      title="Remove Kuih Lapis?"
      description="It will be taken out of your cart. You can add it again later."
      trigger={{ children: 'Remove from cart', variant: 'danger' }}
      open={open()}
      onOpenChange={setOpen}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Keep it
          </Button>
          <Button onClick={() => setOpen(false)}>Remove</Button>
        </>
      }
    />
  );
}
