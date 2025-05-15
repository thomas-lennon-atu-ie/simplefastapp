import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import jestPlugin from "eslint-plugin-jest";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import rnA11yPlugin from "eslint-plugin-react-native-a11y";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,


  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },


  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/export": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],
    },
  },


  {
    files: [
      "**/*.test.js",
      "**/*.test.jsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__tests__/**/*",
    ],
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
  },

  {
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
      "react-native-a11y": rnA11yPlugin,
    },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
      ...rnA11yPlugin.configs.recommended.rules,
 
    },
  },


  {
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off", 
      semi: ["error", "always"],
      quotes: ["error", "single", { allowTemplateLiterals: true }],
      indent: ["error", 2, { SwitchCase: 1 }],
      "comma-dangle": ["error", "always-multiline"],
    },
  },


  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },


  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
  },

  
  {
    files: [
      "**/__tests__/**/*",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.test.js",
      "**/*.test.jsx",
      "**/jest.setup.js",
      "**/jest.config.js",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
