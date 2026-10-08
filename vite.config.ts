import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

// Solid and Kobalte are never bundled: apps provide their own single copy.
const external = [/^solid-js(\/.*)?$/, /^@kobalte\/core(\/.*)?$/];

export default defineConfig({
  plugins: [solid()],
  build: {
    // tsc has already written dist/source and dist/types.
    emptyOutDir: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'browser/index.js',
    },
    rollupOptions: { external },
    sourcemap: true,
  },
});
