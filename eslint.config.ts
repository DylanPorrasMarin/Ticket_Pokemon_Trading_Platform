import eslintPluginTs from '@typescript-eslint/eslint-plugin';
import parserTs from '@typescript-eslint/parser';
import type { Linter } from 'eslint';

type NewType = Linter.Config;

const config: NewType[] = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs as any,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      quotes: ['error', 'single'],
    },
  },
];

export default config;
