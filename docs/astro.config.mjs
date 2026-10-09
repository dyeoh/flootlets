// @ts-check
import { fileURLToPath } from 'node:url';
import solid from '@astrojs/solid-js';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const repo = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

// In `astro dev`, import the library's source, so edits show up live. In a
// production build, import what the package ships (dist/), so every docs build
// proves Astro can compile and server-render the published components.
const dev = process.argv.includes('dev');
const library = dev
  ? { entry: repo('src/index.ts'), theme: repo('src/styles/theme.css') }
  : { entry: repo('dist/source/index.js'), theme: repo('dist/theme.css') };

export default defineConfig({
  site: 'https://dyeoh.github.io',
  base: '/flootlets',
  integrations: [
    starlight({
      title: 'flootlets',
      description:
        'Accessible, themeable SolidJS components for Astro, Solid SSR and static sites.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/dyeoh/flootlets' }],
      editLink: { baseUrl: 'https://github.com/dyeoh/flootlets/edit/main/docs/' },
      customCss: ['./src/styles/tailwind.css', './src/styles/docs.css'],
      components: { Footer: './src/components/Footer.astro' },
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Getting started', slug: 'index' },
            { label: 'Installation', slug: 'installation' },
            { label: 'Theming', slug: 'theming' },
            { label: 'Theme variables', slug: 'tokens' },
            { label: 'Accessibility', slug: 'accessibility' },
          ],
        },
        { label: 'Components', items: [{ autogenerate: { directory: 'components' } }] },
      ],
    }),
    solid(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        { find: /^flootlets$/, replacement: library.entry },
        { find: /^flootlets\/theme\.css$/, replacement: library.theme },
      ],
    },
  },
});
