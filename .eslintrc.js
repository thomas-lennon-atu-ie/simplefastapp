module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    // react-specific rules
    'react/react-in-jsx-scope': 'off', // not needed with recent version of react
    'react/jsx-props-no-spreading': 'warn',
    'react/prop-types': 'off', // propTypes are unnecessary for TypeScript

    // hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // typescript rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',

    // import rules for cleaner code
    'import/order': ['warn', {
      'groups': ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
      'newlines-between': 'always',
    }],
    'import/no-unresolved': 'error',

    // accessibility rules
    'jsx-a11y/accessible-emoji': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
};
