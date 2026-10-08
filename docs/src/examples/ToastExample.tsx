import { Button, Cluster, toast, Toaster } from 'flootlets';

// <Toaster /> once per app (here, once per example); toast() from anywhere.
export default function ToastExample() {
  return (
    <>
      <Cluster>
        <Button
          onClick={() =>
            toast({ title: 'Added to cart', description: 'Kuih Lapis × 2', variant: 'success' })
          }
        >
          Add to cart
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: 'Could not update your cart',
              description: 'Please try again.',
              variant: 'destructive',
            })
          }
        >
          Show an error
        </Button>
      </Cluster>
      <Toaster />
    </>
  );
}
