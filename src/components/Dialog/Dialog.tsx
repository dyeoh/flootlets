/*
 * Dialog: a modal window for focused tasks or confirmations ("Remove this
 * item?"). Built on Kobalte's Dialog: focus moves in and is trapped, Escape and
 * clicking outside close it, focus returns to where it was, the page behind
 * doesn't scroll, and it's labelled by its title.
 */
import * as KDialog from '@kobalte/core/dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, Show, splitProps } from 'solid-js';
import { closeButtonClass } from '../../lib/classes';
import { XIcon } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button, type ButtonAsButtonProps } from '../Button/Button';

export const dialogVariants = cva(
  'pointer-events-auto grid max-h-[calc(100dvh-2rem)] w-full gap-4 overflow-auto rounded-lg border bg-background p-6 text-foreground shadow-lg data-expanded:animate-pop-in motion-reduce:animate-none',
  {
    variants: {
      size: { sm: 'max-w-sm', default: 'max-w-lg', lg: 'max-w-3xl' },
    },
    defaultVariants: { size: 'default' },
  },
);

export interface DialogProps extends VariantProps<typeof dialogVariants> {
  /** The dialog's heading; also its accessible name. */
  title: string;
  description?: JSX.Element;
  children?: JSX.Element;
  /** Actions at the bottom, e.g. Cancel and Confirm. */
  footer?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * A button that opens the dialog, e.g. { children: 'Remove', variant: 'destructive' }.
   * Leave it out to open the dialog yourself with `open`.
   */
  trigger?: Omit<ButtonAsButtonProps, 'onClick'>;
  /** Close button label, for translation. */
  closeLabel?: string;
  class?: string;
}

export function Dialog(props: DialogProps) {
  const [local] = splitProps(props, [
    'title',
    'description',
    'children',
    'footer',
    'open',
    'defaultOpen',
    'onOpenChange',
    'trigger',
    'size',
    'closeLabel',
    'class',
  ]);
  return (
    <KDialog.Root
      open={local.open}
      defaultOpen={local.defaultOpen}
      onOpenChange={local.onOpenChange}
    >
      <Show when={local.trigger}>
        {(trigger) => <KDialog.Trigger as={Button} {...trigger()} />}
      </Show>
      <KDialog.Portal>
        <KDialog.Overlay
          data-slot="dialog-overlay"
          class="fixed inset-0 z-50 bg-black/50 data-expanded:animate-fade-in motion-reduce:animate-none"
        />
        <div class="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
          <KDialog.Content
            data-slot="dialog"
            data-size={local.size ?? 'default'}
            class={cn(dialogVariants({ size: local.size }), local.class)}
          >
            <header class="flex items-start justify-between gap-4">
              <KDialog.Title class="m-0 text-lg leading-tight font-semibold">
                {local.title}
              </KDialog.Title>
              <KDialog.CloseButton
                class={closeButtonClass}
                aria-label={local.closeLabel ?? 'Close'}
              >
                <XIcon />
              </KDialog.CloseButton>
            </header>
            <Show when={local.description}>
              <KDialog.Description class="-mt-2 text-sm text-muted-foreground">
                {local.description}
              </KDialog.Description>
            </Show>
            <Show when={local.children}>
              <div data-slot="dialog-body">{local.children}</div>
            </Show>
            <Show when={local.footer}>
              <footer
                data-slot="dialog-footer"
                class="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
              >
                {local.footer}
              </footer>
            </Show>
          </KDialog.Content>
        </div>
      </KDialog.Portal>
    </KDialog.Root>
  );
}
