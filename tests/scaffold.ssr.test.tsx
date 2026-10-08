// Proves the SSR test project renders Solid on the server the way Astro does.
import { renderToString } from 'solid-js/web';
import { expect, test } from 'vitest';

test('renders a component to HTML on the server', () => {
  const html = renderToString(() => <p class="hello">server rendered</p>);
  expect(html).toContain('server rendered');
  expect(html).toContain('class="hello"');
});
