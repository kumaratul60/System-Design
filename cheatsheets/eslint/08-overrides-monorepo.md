# 08. Granular Overrides Strategy

> How to configure scoped override blocks for tests, Storybook stories, scripts, and Next.js App Router route files so developers aren't blocked by irrelevant rules.

---

## 1. The Overrides Architecture

```mermaid
flowchart TD
    Base[Base Rules: TypeScript + a11y + Imports]

    Base --> O1["Test Files (*.test.tsx)<br/>Allow devDependencies, disable type-checked unsafe"]
    Base --> O2["Storybook (*.stories.tsx)<br/>Allow anonymous default export, disable i18n literal string"]
    Base --> O3["Next.js App Pages (app/**/page.tsx)<br/>Allow default export required by routing"]
    Base --> O4["Build Scripts (*.config.js)<br/>Allow console, allow require(), disable TypeScript parser"]
```

---

## 2. Configuration Snippet (Overrides Array)

```json
{
  "overrides": [
    {
      "files": ["**/*.stories.@(ts|tsx|js|jsx)"],
      "extends": ["plugin:storybook/recommended"],
      "rules": {
        "import/no-anonymous-default-export": "off",
        "formatjs/no-literal-string-in-jsx": "off"
      }
    },
    {
      "files": ["**/*.{test,spec}.{ts,tsx}"],
      "extends": ["plugin:testing-library/react", "plugin:jest/recommended"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "formatjs/no-literal-string-in-jsx": "off"
      }
    },
    {
      "files": ["app/**/{page,layout,loading,error,not-found}.tsx"],
      "rules": {
        "import/no-default-export": "off"
      }
    },
    {
      "files": ["scripts/**/*.js", "*.config.js", "*.config.mjs"],
      "rules": {
        "no-console": "off",
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ]
}
```
