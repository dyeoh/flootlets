// Feedback components render on the server; dialogs render nothing until
// opened, and the toaster mounts only in the browser.
import { renderToString } from 'solid-js/web';
import { expect, test } from 'vitest';
import { Alert, Dialog, EmptyState, Toaster } from '../src';

test('feedback components render to HTML on the server', () => {
  const html = renderToString(() => (
    <>
      <Alert variant="destructive" title="Out of stock">
        Only 1 left.
      </Alert>
      <EmptyState title="Your cart is empty" />
      <Dialog title="Remove?" trigger={{ children: 'Remove' }} />
      <Toaster />
    </>
  ));
  expect(html).toContain('role="alert"');
  expect(html).toContain('Your cart is empty');
  expect(html).toContain('Remove');
  expect(html).not.toContain('role="dialog"');
  expect(html).not.toContain('toaster');
});
