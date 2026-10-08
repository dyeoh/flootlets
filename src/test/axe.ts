// Runs axe-core accessibility checks against rendered markup in tests.
import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Fails the test on any axe violation. Colour contrast is skipped because
 * jsdom can't compute colours; tests/tokens.test.ts checks every token pair.
 */
export async function expectNoAxeViolations(container: Element): Promise<void> {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  const messages = result.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.html).join(', ')})`,
  );
  expect(messages).toEqual([]);
}
