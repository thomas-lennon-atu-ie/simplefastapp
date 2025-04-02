import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginImport from "eslint-plugin-import";
import eslintConfigPrettier from "eslint-config-prettier";
import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: tseslint.configs.recommended,
});

export default tseslint.config(
  // Global ignores
  {
    ignores: ["node_modules/", "dist/", ".expo/", "web-build/"],
  },

  tseslint.configs.base, // basic ESLint recommended + core TS rules
  tseslint.configs.eslintRecommended, // disables rules handled by TS

  // react specific configs
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'warn',
      'react/prop-types': 'off', // typeScript handles this
    }
  },

  // react hooks config
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: pluginReactHooks.configs.recommended.rules,
  },

  // JSX A11y
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      'jsx-a11y': pluginJsxA11y,
    },
    rules: {
      ...pluginJsxA11y.configs.recommended.rules,
      'jsx-a11y/accessible-emoji': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn', 
      'jsx-a11y/no-autofocus': 'warn',
    }
  },

  ...compat.config({
    plugins: ["import"],
    extends: [
        "plugin:import/recommended",
        "plugin:import/typescript",
    ],
    settings: {
      "import/resolver": {
        typescript: {}, 
        node: true,
      },
    },
    rules: {
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          "newlines-between": "always",
        },
      ],
      "import/no-unresolved": "error", 
    },
  }),

  // typeScript rules
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  },

  // language options
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
         project: true, 
         tsconfigRootDir: __dirname,
      }
    },
  },

  // prettier config 
  eslintConfigPrettier,
);