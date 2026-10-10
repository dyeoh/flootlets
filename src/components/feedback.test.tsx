// Alert, Toast, Dialog and EmptyState.
import { render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { createSignal } from 'solid-js';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/axe';
import { Alert } from './Alert/Alert';
import { Button } from './Button/Button';
import { Dialog } from './Dialog/Dialog';
import { EmptyState } from './EmptyState/EmptyState';
import { toast, Toaster } from './Toast/Toast';

describe('Alert', () => {
  test('errors interrupt, other messages wait their turn', () => {
    render(() => (
      <>
        <Alert variant="destructive" title="Out of stock">
          Only 1 left.
        </Alert>
        <Alert variant="success">Saved.</Alert>
      </>
    ));
    expect(screen.getByRole('alert')).toHaveTextContent('Out of stock');
    expect(screen.getByRole('status')).toHaveTextContent('Saved.');
  });

  test('can be dismissed', async () => {
    const dismiss = vi.fn();
    render(() => <Alert onDismiss={dismiss}>Hello</Alert>);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(dismiss).toHaveBeenCalledOnce();
  });
});

describe('Dialog', () => {
  test('opens from its trigger, traps focus, closes on Escape and restores focus', async () => {
    render(() => (
      <Dialog
        title="Remove Kuih Lapis?"
        description="It will be taken out of your cart."
        trigger={{ children: 'Remove', variant: 'destructive' }}
        footer={<Button>Keep it</Button>}
      />
    ));
    const trigger = screen.getByRole('button', { name: 'Remove' });
    await userEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Remove Kuih Lapis?' });
    expect(dialog).toHaveAccessibleDescription('It will be taken out of your cart.');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    // Tab keeps cycling inside the dialog.
    for (let i = 0; i < 4; i++) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  test("opening from its trigger doesn't create computations outside a root", async () => {
    // Kobalte passes the trigger's `disabled` as a getter; reading it from the
    // Button's click handler used to create an unowned computation each click.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(() => <Dialog title="Mark paid?" trigger={{ children: 'Mark as paid' }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Mark as paid' }));
    await screen.findByRole('dialog', { name: 'Mark paid?' });
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('outside a `createRoot`'));
    warn.mockRestore();
  });

  test('can be controlled without a trigger and closed with its close button', async () => {
    const [open, setOpen] = createSignal(true);
    render(() => (
      <Dialog title="Delivery details" open={open()} onOpenChange={setOpen} closeLabel="Tutup" />
    ));
    expect(await screen.findByRole('dialog', { name: 'Delivery details' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    expect(open()).toBe(false);
  });

  test('has no accessibility violations when open', async () => {
    render(() => <Dialog title="Size guide" defaultOpen description="Measurements in cm." />);
    await screen.findByRole('dialog');
    await expectNoAxeViolations(document.body);
  });
});

describe('Toast', () => {
  afterEach(() => toast.clear());

  test('shows in the announced notifications region and can be closed', async () => {
    render(() => <Toaster />);
    toast({ title: 'Added to cart', description: 'Kuih Lapis × 2', variant: 'success' });
    const region = screen.getByRole('region', { name: /Notifications/ });
    const message = await screen.findByText('Added to cart');
    expect(region.contains(message)).toBe(true);
    expect(screen.getByText('Kuih Lapis × 2')).toBeInTheDocument();
    // Kobalte renders each toast as an announced status.
    expect(message.closest('[role="status"]')).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByText('Added to cart')).toBeNull());
  });

  test('toast.dismiss removes a specific toast', async () => {
    render(() => <Toaster />);
    const id = toast({ title: 'Saving…', persistent: true });
    await screen.findByText('Saving…');
    toast.dismiss(id);
    await waitFor(() => expect(screen.queryByText('Saving…')).toBeNull());
  });
});

describe('EmptyState', () => {
  test('a heading, a hint and a way forward', async () => {
    const { container } = render(() => (
      <EmptyState
        title="Your cart is empty"
        description="Browse the shop and add something you like."
        icon="🛒"
        action={<Button href="/shop">Continue shopping</Button>}
        headingLevel={3}
      />
    ));
    expect(
      screen.getByRole('heading', { level: 3, name: 'Your cart is empty' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute(
      'href',
      '/shop',
    );
    expect(container.querySelector('[data-slot=empty-state-icon]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expectNoAxeViolations(container);
  });
});
