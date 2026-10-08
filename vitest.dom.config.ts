import { defineProject } from 'vitest/config';
import solid from 'vite-plugin-solid';

// Components in a simulated browser: rendering, interaction, axe checks.
export default defineProject({
  plugins: [solid()],
  test: {
    name: 'dom',
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    // solid-js must only be loaded once per test run.
    deps: { optimizer: { web: { include: ['solid-js'] } } },
  },
});
