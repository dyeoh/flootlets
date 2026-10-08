import { render, screen } from '@solidjs/testing-library';
import { expect, test } from 'vitest';
import { VERSION } from '../index';

test('renders in the dom project', () => {
  render(() => <p>flootlets {VERSION}</p>);
  expect(screen.getByText('flootlets 0.1.0')).toBeInTheDocument();
});
