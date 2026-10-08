// The bundled stylesheet keeps every rule inside a flootlets layer.
import { expect, test } from 'vitest';
import { bundle } from '../scripts/build-css';

test('bundles imports into their layers', () => {
  const css = bundle('src/styles/index.css');
  expect(css).not.toMatch(/^@import/m);
  expect(css).toMatch(/@layer flootlets\.tokens \{[\s\S]*--primary:/);
  expect(css).toMatch(/@layer flootlets\.tokens \{[\s\S]*cursor: pointer/);
  expect(css).toMatch(/@layer flootlets\.base \{[\s\S]*--fl-color-text: var\(--foreground\)/);
});
