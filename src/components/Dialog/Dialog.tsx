/*
 * Dialog: a modal window for focused tasks or confirmations ("Remove this
 * item?"). Built on Kobalte's Dialog: focus moves in and is trapped, Escape and
 * clicking outside close it, focus returns to where it was, the page behind
 * doesn't scroll, and it's labelled by its title.
 */
import * as KDialog from '@kobalte/core/dialog';
import { type JSX, Show, splitProps } from 'solid-js';
import { cx } from '../../lib/cx';
import { Button, type ButtonAsButtonProps } from '../Button/Button';

export interface DialogProps {
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
   * A button that opens the dialog, e.g. { children: 'Remove', variant: 'danger' }.
   * Leave it out to open the dialog yourself with `open`.
   */
  trigger?: Omit<ButtonAsButtonProps, 'onClick'>;
  size?: 'sm' | 'md' | 'lg';
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
        <KDialog.Overlay class="fl-dialog__overlay" />
        <div class="fl-dialog__positioner">
          <KDialog.Content class={cx('fl-dialog', local.class)} data-size={local.size ?? 'md'}>
            <header class="fl-dialog__header">
              <KDialog.Title class="fl-dialog__title">{local.title}</KDialog.Title>
              <KDialog.CloseButton
                class="fl-dialog__close"
                aria-label={local.closeLabel ?? 'Close'}
              >
                <span aria-hidden="true">×</span>
              </KDialog.CloseButton>
            </header>
            <Show when={local.description}>
              <KDialog.Description class="fl-dialog__description">
                {local.description}
              </KDialog.Description>
            </Show>
            <Show when={local.children}>
              <div class="fl-dialog__body">{local.children}</div>
            </Show>
            <Show when={local.footer}>
              <footer class="fl-dialog__footer">{local.footer}</footer>
            </Show>
          </KDialog.Content>
        </div>
      </KDialog.Portal>
    </KDialog.Root>
  );
}
