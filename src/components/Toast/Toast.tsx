/*
 * Toasts: short, temporary messages like "Added to cart". Put one <Toaster />
 * in your app, then call toast({ title }) from anywhere. Built on Kobalte's
 * toast: the toaster is a live region, so toasts are announced; hovering or
 * focusing pauses them; they can be swiped or closed away.
 *
 * Toasts disappear, so never put anything there a shopper must act on. Use
 * an Alert for that.
 */
import * as KToast from '@kobalte/core/toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { createSignal, type JSX, onMount, Show } from 'solid-js';
import { closeButtonClass } from '../../lib/classes';
import { XIcon } from '../../lib/icons';

/** A coloured start border marks the variant; the title says what happened. */
export const toastVariants = cva(
  'flex items-start gap-3 rounded-lg border border-s-4 bg-popover p-4 text-sm text-popover-foreground shadow-lg data-closed:animate-fade-out data-opened:animate-pop-in data-[swipe=end]:animate-slide-out-right data-[swipe=move]:translate-x-(--kb-toast-swipe-move-x) motion-reduce:animate-none',
  {
    variants: {
      variant: {
        default: 'border-s-input',
        destructive: 'border-s-destructive',
        success: 'border-s-success',
        warning: 'border-s-warning',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface ToastOptions extends VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
  /** Milliseconds before it hides. Defaults to the Toaster's duration. */
  duration?: number;
  /** Stay until closed. */
  persistent?: boolean;
  /** Close button label, for translation. */
  closeLabel?: string;
}

/** Shows a toast and returns its id (for toast.dismiss). Needs a <Toaster /> on the page. */
export function toast(options: ToastOptions): number {
  return KToast.toaster.show((props) => (
    <KToast.Root
      toastId={props.toastId}
      data-slot="toast"
      data-variant={options.variant ?? 'default'}
      class={toastVariants({ variant: options.variant })}
      duration={options.duration}
      persistent={options.persistent}
    >
      <div class="grid min-w-0 flex-1 gap-1">
        <KToast.Title class="font-medium">{options.title}</KToast.Title>
        <Show when={options.description}>
          <KToast.Description class="text-muted-foreground">
            {options.description}
          </KToast.Description>
        </Show>
      </div>
      <KToast.CloseButton class={closeButtonClass} aria-label={options.closeLabel ?? 'Close'}>
        <XIcon />
      </KToast.CloseButton>
    </KToast.Root>
  ));
}

/** Hides a toast early. */
toast.dismiss = (id: number) => KToast.toaster.dismiss(id);
/** Hides every toast. */
toast.clear = () => KToast.toaster.clear();

export interface ToasterProps {
  /** Milliseconds a toast stays visible. Default 5000. */
  duration?: number;
  /** How many toasts show at once; the rest queue. Default 3. */
  limit?: number;
  /** Name of the region, read by screen readers. */
  label?: string;
  children?: JSX.Element;
}

/**
 * Where toasts appear. Render exactly one, near the end of the page.
 *
 * It mounts only in the browser: Kobalte's toast region can't render on the
 * server, and toasts only ever come from interactions anyway. Server and first
 * browser render are both empty, so hydration always matches; the region then
 * appears straight away, before any toast could be shown.
 */
export function Toaster(props: ToasterProps) {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return (
    <Show when={mounted()}>
      <ToastRegion {...props} />
    </Show>
  );
}

function ToastRegion(props: ToasterProps) {
  return (
    <KToast.Region
      data-slot="toaster"
      duration={props.duration ?? 5000}
      limit={props.limit ?? 3}
      aria-label={props.label ?? 'Notifications'}
      swipeDirection="right"
    >
      <KToast.List class="fixed end-0 bottom-0 z-[100] m-0 flex max-h-screen w-[min(24rem,100vw)] list-none flex-col gap-2 p-4 outline-none" />
    </KToast.Region>
  );
}
