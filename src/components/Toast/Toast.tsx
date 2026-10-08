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
import { createSignal, type JSX, onMount, Show } from 'solid-js';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
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
      class="fl-toast"
      data-tone={options.tone ?? 'info'}
      duration={options.duration}
      persistent={options.persistent}
    >
      <div class="fl-toast__body">
        <KToast.Title class="fl-toast__title">{options.title}</KToast.Title>
        <Show when={options.description}>
          <KToast.Description class="fl-toast__description">
            {options.description}
          </KToast.Description>
        </Show>
      </div>
      <KToast.CloseButton class="fl-toast__close" aria-label={options.closeLabel ?? 'Close'}>
        <span aria-hidden="true">×</span>
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
      class="fl-toaster"
      duration={props.duration ?? 5000}
      limit={props.limit ?? 3}
      aria-label={props.label ?? 'Notifications'}
      swipeDirection="right"
    >
      <KToast.List class="fl-toaster__list" />
    </KToast.Region>
  );
}
