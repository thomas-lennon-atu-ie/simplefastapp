import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import * as pluginImport from "eslint-plugin-import";
import eslintConfigPrettier from "eslint-config-prettier";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  {
    ignores: [
        "node_modules/",
        "dist/",
        ".expo/",
        "web-build/",
        "babel.config.js", 
        "metro.config.js", 
    ],
  },

  // base recommended configs
  tseslint.configs.base,
  tseslint.configs.eslintRecommended,

  // react specific configs
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { 
        react: pluginReact,
        'react-hooks': pluginReactHooks,
        'jsx-a11y': pluginJsxA11y,
        
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
            project: path.resolve(__dirname, "tsconfig.json"), 
        },
        node: true,
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules, 
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'warn',
      'react/prop-types': 'off',

      ...pluginReactHooks.configs.recommended.rules,

      ...pluginJsxA11y.configs.recommended.rules,
      'jsx-a11y/accessible-emoji': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/no-autofocus': 'warn',

      // Import rules (adjust as needed)
      "import/no-unresolved": ["error", { ignore: ["^react-native$"] }], 
      "import/namespace": ["error", { allowComputed: true }], 
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling"], "index"],
          "newlines-between": "always",
          alphabetize: { order: 'asc', caseInsensitive: true } 
        },
      ],
      
      "import/no-named-as-default-member": "off",
    }
  },

  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parser: tseslint.parser, 
      parserOptions: {
         project: path.resolve(__dirname, "tsconfig.json"), 
         tsconfigRootDir: __dirname,
         ecmaFeatures: { jsx: true }, 
      }
    },
  },


  eslintConfigPrettier,
);