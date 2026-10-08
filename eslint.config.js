import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import solidTypescript from 'eslint-plugin-solid/configs/typescript';

export default [
  { ignores: ['dist/**', 'docs/dist/**', 'docs/.astro/**', 'node_modules/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { ...solidTypescript.plugins, '@typescript-eslint': tsPlugin },
    rules: {
      ...solidTypescript.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Tests read signals in assertions on purpose, outside any reactive scope.
    files: ['**/*.test.{ts,tsx}'],
    rules: { 'solid/reactivity': 'off' },
  },
];
