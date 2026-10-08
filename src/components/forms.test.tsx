// Form components: labelling, errors, keyboard use, native form submission.
import { render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { createSignal } from 'solid-js';
import { describe, expect, test, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/axe';
import { Checkbox } from './Checkbox/Checkbox';
import { QuantityStepper } from './QuantityStepper/QuantityStepper';
import { RadioGroup } from './RadioGroup/RadioGroup';
import { Select } from './Select/Select';
import { TextArea, TextField } from './TextField/TextField';

const submitted = (form: HTMLFormElement) => Object.fromEntries(new FormData(form));

describe('TextField', () => {
  test('is labelled, described and reports errors accessibly', () => {
    render(() => (
      <TextField
        label="Email"
        description="We send your receipt here."
        error="Enter an email address"
        type="email"
      />
    ));
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      /We send your receipt here\.\s*Enter an email address/,
    );
  });

  test('without an error it is valid and shows no message', () => {
    render(() => <TextField label="Name" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText(/Enter/)).toBeNull();
  });

  test('reports typing and submits with its form', async () => {
    const change = vi.fn();
    const { container } = render(() => (
      <form>
        <TextField label="Name" name="name" onChange={change} />
      </form>
    ));
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Siti');
    expect(change).toHaveBeenLastCalledWith('Siti');
    expect(submitted(container.querySelector('form')!)).toEqual({ name: 'Siti' });
  });

  test('a hidden label still names the field', () => {
    render(() => <TextField label="Search products" hideLabel />);
    expect(screen.getByRole('textbox', { name: 'Search products' })).toBeInTheDocument();
  });

  test('TextArea for longer text', () => {
    render(() => <TextArea label="Order notes" name="notes" />);
    expect(screen.getByRole('textbox', { name: 'Order notes' }).tagName).toBe('TEXTAREA');
  });
});

describe('Select', () => {
  const sizes = [
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large', disabled: true },
  ];

  test('opens with the keyboard and picks an option', async () => {
    const change = vi.fn();
    render(() => (
      <Select label="Size" options={sizes} onChange={change} placeholder="Pick a size" />
    ));
    const trigger = screen.getByRole('button', { name: /Size/ });
    expect(trigger).toHaveTextContent('Pick a size');
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Large' })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(screen.getByRole('option', { name: 'Medium' }));
    expect(change).toHaveBeenCalledWith('m');
    await waitFor(() => expect(trigger).toHaveTextContent('Medium'));
  });

  test('controlled value and native form submission', () => {
    const { container } = render(() => (
      <form>
        <Select label="Size" name="size" options={sizes} value="s" />
      </form>
    ));
    expect(screen.getByRole('button', { name: /Size/ })).toHaveTextContent('Small');
    expect(submitted(container.querySelector('form')!)).toEqual({ size: 's' });
  });
});

describe('Checkbox', () => {
  test('toggles from its label and submits when checked', async () => {
    const change = vi.fn();
    const { container } = render(() => (
      <form>
        <Checkbox label="Send me offers" name="offers" onChange={change} />
      </form>
    ));
    const box = screen.getByRole('checkbox', { name: 'Send me offers' });
    expect(box).not.toBeChecked();
    await userEvent.click(screen.getByText('Send me offers'));
    expect(box).toBeChecked();
    expect(change).toHaveBeenCalledWith(true);
    expect(submitted(container.querySelector('form')!)).toEqual({ offers: 'on' });
  });

  test('errors are announced with the checkbox', () => {
    render(() => <Checkbox label="I accept the terms" error="Please accept the terms" required />);
    const box = screen.getByRole('checkbox', { name: 'I accept the terms' });
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription('Please accept the terms');
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: 'delivery', label: 'Delivery', description: 'Pos Laju, 2–4 days' },
    { value: 'pickup', label: 'Pickup' },
  ];

  test('is a labelled group navigated with arrow keys', async () => {
    const change = vi.fn();
    render(() => (
      <RadioGroup
        label="How do you want it?"
        options={options}
        defaultValue="delivery"
        onChange={change}
      />
    ));
    expect(screen.getByRole('radiogroup', { name: 'How do you want it?' })).toBeInTheDocument();
    const delivery = screen.getByRole('radio', { name: 'Delivery' });
    expect(delivery).toBeChecked();
    expect(delivery).toHaveAccessibleDescription('Pos Laju, 2–4 days');
    delivery.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Pickup' })).toBeChecked();
    expect(change).toHaveBeenCalledWith('pickup');
  });
});

describe('QuantityStepper', () => {
  test('is a labelled spinbutton that steps within its limits', async () => {
    const change = vi.fn();
    render(() => <QuantityStepper label="Quantity" defaultValue={2} max={3} onChange={change} />);
    const input = screen.getByRole('spinbutton', { name: 'Quantity' });
    const plus = screen.getByRole('button', { name: 'Increase quantity' });
    const minus = screen.getByRole('button', { name: 'Decrease quantity' });
    expect(input).toHaveValue('2');

    await userEvent.click(plus);
    expect(input).toHaveValue('3');
    expect(change).toHaveBeenLastCalledWith(3);
    expect(plus).toBeDisabled(); // at max: stock left

    await userEvent.click(minus);
    await userEvent.click(minus);
    expect(input).toHaveValue('1');
    expect(minus).toBeDisabled(); // min defaults to 1
  });

  test('announces changes made with the buttons', async () => {
    render(() => <QuantityStepper label="Quantity" defaultValue={1} />);
    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent('Quantity: 2');
  });

  test('arrow keys on the input work like a native spinbutton', async () => {
    render(() => <QuantityStepper label="Quantity" defaultValue={1} max={10} />);
    const input = screen.getByRole('spinbutton', { name: 'Quantity' });
    input.focus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(input).toHaveValue('3');
  });

  test('controlled value, translations and form submission', async () => {
    const [qty, setQty] = createSignal(2);
    const { container } = render(() => (
      <form>
        <QuantityStepper
          label="Kuantiti"
          name="qty"
          value={qty()}
          onChange={setQty}
          labels={{ decrement: 'Kurangkan', increment: 'Tambah' }}
        />
      </form>
    ));
    const input = screen.getByRole('spinbutton', { name: 'Kuantiti' });
    expect(input).toHaveValue('2'); // shows the controlled value, not a default
    await userEvent.click(screen.getByRole('button', { name: 'Tambah' }));
    expect(qty()).toBe(3);
    expect(input).toHaveValue('3');
    setQty(7); // the owner changes it, e.g. the cart was updated elsewhere
    await waitFor(() => expect(input).toHaveValue('7'));
    expect(submitted(container.querySelector('form')!)).toEqual({ qty: '7' });
  });
});

test('form components have no accessibility violations', async () => {
  const { container } = render(() => (
    <form>
      <TextField label="Email" error="Enter an email address" />
      <TextArea label="Notes" description="Anything we should know?" />
      <Select label="Size" options={[{ value: 's', label: 'Small' }]} />
      <Checkbox label="Send me offers" />
      <RadioGroup
        label="Delivery"
        options={[
          { value: 'd', label: 'Delivery' },
          { value: 'p', label: 'Pickup' },
        ]}
      />
      <QuantityStepper label="Quantity" max={5} />
    </form>
  ));
  await expectNoAxeViolations(container);
});
