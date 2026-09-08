# 05. Internationalization & i18n (`@formatjs`)

> Enforcing message quality, preventing hardcoded English strings in JSX, and automating translation IDs.

---

## 1. Why Lint for i18n in Enterprise Web Apps?

Hardcoded strings in JSX make internationalization nearly impossible later and frequently break assistive technologies by embedding un-translated technical strings.

---

## 2. Core Rule Matrix

| Rule Name                           |     Severity     | Purpose                                                                                          |
| :---------------------------------- | :--------------: | :----------------------------------------------------------------------------------------------- |
| `formatjs/no-literal-string-in-jsx` | `warn` / `error` | Flags raw strings in JSX that are not wrapped in `<FormattedMessage>` or `intl.formatMessage()`. |
| `formatjs/enforce-default-message`  |     `error`      | Mandates that a fallback English default message is always provided.                             |
| `formatjs/enforce-placeholders`     |     `error`      | Verifies that message placeholders match arguments passed to formatting functions.               |
| `formatjs/enforce-id`               |     `error`      | Automates translation ID generation using SHA-512 content hashes.                                |
| `formatjs/no-multiple-whitespaces`  |     `error`      | Prevents unnecessary spaces that corrupt translation memory engines.                             |

---

## 3. Configuration Snippet

```json
{
  "plugins": ["formatjs"],
  "rules": {
    "formatjs/no-literal-string-in-jsx": [
      "warn",
      {
        "exclude": ["&nbsp;", "&copy;", "&middot;", "-", "|", "/", ":"]
      }
    ],
    "formatjs/enforce-default-message": ["error", "literal"],
    "formatjs/enforce-placeholders": "error",
    "formatjs/enforce-id": [
      "error",
      {
        "idInterpolationPattern": "[sha512:contenthash:base64:6]"
      }
    ],
    "formatjs/no-multiple-whitespaces": "error",
    "formatjs/no-camel-case": "warn"
  }
}
```
