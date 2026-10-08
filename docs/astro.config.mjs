// @ts-check
import { fileURLToPath } from 'node:url';
import solid from '@astrojs/solid-js';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

const repo = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

// In `astro dev`, import the library's source, so edits show up live. In a
// production build, import what the package ships (dist/), so every docs build
// proves Astro can compile and server-render the published components.
const dev = process.argv.includes('dev');
const library = dev
  ? { entry: repo('src/index.ts'), styles: repo('src/styles/index.css') }
  : { entry: repo('dist/source/index.js'), styles: repo('dist/flootlets.css') };

export default defineConfig({
  site: 'https://dyeoh.github.io',
  base: '/flootlets',
  integrations: [
    starlight({
      title: 'flootlets',
      description: 'Accessible, themeable SolidJS components for gnerkulfloot shops.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/dyeoh/flootlets' }],
      editLink: { baseUrl: 'https://github.com/dyeoh/flootlets/edit/main/docs/' },
      customCss: [library.styles, './src/styles/docs.css'],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Getting started', slug: 'index' },
            { label: 'Theming', slug: 'theming' },
            { label: 'Design tokens', slug: 'tokens' },
            { label: 'Accessibility', slug: 'accessibility' },
          ],
        },
        { label: 'Components', items: [{ autogenerate: { directory: 'components' } }] },
      ],
    }),
    solid(),
  ],
  vite: {
    resolve: {
      alias: [
        { find: /^flootlets$/, replacement: library.entry },
        { find: /^flootlets\/styles\.css$/, replacement: library.styles },
      ],
    },
  },
});
