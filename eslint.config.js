export default defineConfig([
  globalIgnores(['dist']),
  {
    plugins: [
      eslint({
        failOnWarning: false,
        failOnError: false,
        emitWarning: false,
        emitError: false,
      }),
    ],
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    rules: {
      // Disable all warnings
      'no-warning-comments': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
