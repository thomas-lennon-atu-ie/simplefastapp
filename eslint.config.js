import pluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginImport from "eslint-plugin-import";
import eslintConfigPrettier from "eslint-config-prettier";
import path from "path";
import globals from "globals";
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
      "eslint.config.js",
        "__mocks__/*",
    "src/__tests__/*",
    "teardownGlobalJest.js",
    "setupGlobalJest.js",
    "setupBeforeEnv.js",
    "jest**",
    "android/**",
    
    ],
  },

  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: [
      "**/__tests__/**",
      "**/__mocks__/**",
      "**/*.test.{ts,tsx,js,jsx}",
      "jest**",
      "setupBeforeEnv.js",
      "setupGlobalJest.js",
      "teardownGlobalJest.js",
      "android/**",
    ],
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
      },
    },
  },
  ...tseslint.configs.recommended,

  {
    files: [
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
      "**/__mocks__/**/*.{ts,tsx,js,jsx}",
      "**/*.test.{ts,tsx,js,jsx}",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2021,
      },
     
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: null, 
      },
    },
  },

  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-props-no-spreading": "warn",
      "react/prop-types": "off",

      ...pluginReactHooks.configs.recommended.rules,

      ...pluginJsxA11y.configs.recommended.rules,
      "jsx-a11y/accessible-emoji": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/no-autofocus": "warn",
    },
  },

  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      import: pluginImport,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: path.resolve(__dirname, "tsconfig.json"),
        },
        node: true,
      },
    },
    rules: {
      ...pluginImport.configs.recommended.rules,
      ...pluginImport.configs.typescript.rules,
      "import/no-unresolved": ["error", { ignore: ["^react-native$"] }],
      "import/namespace": "off",
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
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-named-as-default-member": "off",
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
    "__mocks__/*",
    "src/__tests__/*",
    "teardownGlobalJest.js",
    "setupGlobalJest.js",
    "setupBeforeEnv.js",
    "jest**",
    "android/**",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  {
    files: [
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
      "**/__mocks__/**/*.{ts,tsx,js,jsx}",
      "**/*.test.{ts,tsx,js,jsx}",
      "jest**",
      "setupBeforeEnv.js",
      "setupGlobalJest.js",
      "teardownGlobalJest.js",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "import/no-extraneous-dependencies": "off",

    },
  },

  eslintConfigPrettier
);