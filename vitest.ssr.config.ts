import { defineProject } from 'vitest/config';
import solid from 'vite-plugin-solid';

// Components rendered to HTML on the server, the way Astro does it: JSX
// compiled in SSR mode and solid-js resolved to its server build.
export default defineProject({
  plugins: [solid({ ssr: true, solid: { generate: 'ssr', hydratable: true } })],
  ssr: { resolve: { conditions: ['solid', 'node'], externalConditions: ['solid', 'node'] } },
  test: {
    name: 'ssr',
    environment: 'node',
    include: ['tests/**/*.ssr.test.tsx'],
    server: { deps: { inline: [/solid-js/, /@kobalte/] } },
  },
});
