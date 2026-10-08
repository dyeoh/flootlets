// The bundled stylesheet keeps every rule inside a flootlets layer.
import { expect, test } from 'vitest';
import { bundle } from '../scripts/build-css';

test('bundles imports into their layers', () => {
  const css = bundle('src/styles/index.css');
  expect(css).not.toContain('@import');
  expect(css).toMatch(/@layer flootlets\.tokens \{[\s\S]*--fl-color-text/);
  expect(css).toMatch(/@layer flootlets\.base \{[\s\S]*cursor: pointer/);
});
