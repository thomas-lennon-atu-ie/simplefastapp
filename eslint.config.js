import pluginReact from "eslint-plugin-react";
import * as tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
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
      
    ],
  },
  
  {
    files: ["**/*.{ts,tsx}"], 
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parser: parser,
      parserOptions: {
        project: path.resolve(__dirname, "tsconfig.json"),
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
      "@typescript-eslint": tseslint,
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
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-props-no-spreading": "warn",
      "react/prop-types": "off",
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginJsxA11y.configs.recommended.rules,
      "jsx-a11y/accessible-emoji": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/no-autofocus": "warn",
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
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "error", 
    },
  },
 
  {
    files: [
        "**/*.js", 
        "__mocks__/**/*.js",
        "jest.config.js",
        "jest.setup.js",
        
    ],
    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.es2021,
        },
        parserOptions: {
            project: null, 
            ecmaVersion: "latest",
            sourceType: "module", 
        },
    },
    plugins: {
        import: pluginImport,
    },
    rules: {
        
        "@typescript-eslint/no-var-requires": "off", 
        "@typescript-eslint/no-require-imports": "off",
        "import/no-unresolved": ["error", { commonjs: true }], 
         "react/prop-types": "off", 
        
    }
  },
  eslintConfigPrettier 
);
