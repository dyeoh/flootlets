import { defineConfig } from 'vitest/config';

// Two test projects, each with its own config file so their Solid compiler
// settings never mix: browser-compiled components vs server-rendered HTML.
export default defineConfig({
  test: { projects: ['./vitest.dom.config.ts', './vitest.ssr.config.ts'] },
});
