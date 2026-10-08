import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { expectNoAxeViolations } from '../../test/axe';
import { Button } from './Button';

describe('Button', () => {
  test('is a type="button" by default, so it never submits a form by accident', () => {
    const submit = vi.fn((e: Event) => e.preventDefault());
    render(() => (
      <form onSubmit={submit}>
        <Button>Add to cart</Button>
      </form>
    ));
    const button = screen.getByRole('button', { name: 'Add to cart' });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(submit).not.toHaveBeenCalled();
  });

  test('can still submit when asked to', () => {
    render(() => <Button type="submit">Place order</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  test('calls onClick', () => {
    const click = vi.fn();
    render(() => <Button onClick={click}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalledOnce();
  });

  test('loading: busy, ignores clicks, but stays focusable', () => {
    const click = vi.fn();
    render(() => (
      <Button loading onClick={click}>
        Paying
      </Button>
    ));
    const button = screen.getByRole('button', { name: 'Paying' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
    button.focus();
    expect(button).toHaveFocus();
  });

  test('disabled buttons are disabled', () => {
    render(() => <Button disabled>Sold out</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('with href it is a real link', () => {
    render(() => <Button href="/cart">View cart</Button>);
    const link = screen.getByRole('link', { name: 'View cart' });
    expect(link).toHaveAttribute('href', '/cart');
    expect(link).not.toHaveAttribute('type');
  });

  test('a disabled link button stops navigating but stays announced', () => {
    const click = vi.fn();
    render(() => (
      <Button href="/checkout" disabled onClick={click}>
        Checkout
      </Button>
    ));
    const link = screen.getByRole('link', { name: 'Checkout' });
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(link);
    expect(click).not.toHaveBeenCalled();
  });

  test('variants, sizes and extra classes', () => {
    render(() => (
      <Button variant="danger" size="sm" class="mine">
        Remove
      </Button>
    ));
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'danger');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveClass('fl-button', 'mine');
  });

  test('has no accessibility violations', async () => {
    const { container } = render(() => (
      <div>
        <Button>Primary</Button>
        <Button loading>Loading</Button>
        <Button href="/x">Link</Button>
        <Button href="/y" disabled>
          Disabled link
        </Button>
      </div>
    ));
    await expectNoAxeViolations(container);
  });
});
