# 06. Code Quality, Imports & Performance Linting

> Eliminating circular dependencies, enforcing clean import boundaries, and preventing massive barrel files from hurting build times.

---

## 1. Preventing Circular Dependencies (`import/no-cycle`)

Circular dependencies occur when Module A imports Module B, which imports Module A. This leads to elusive runtime errors where modules evaluate to `undefined` on page load.

```mermaid
flowchart LR
    A[Button.tsx] -->|Imports| B[ThemeContext.tsx]
    B -->|Imports| C[Icon.tsx]
    C -->|Accidentally imports| A

    style C stroke:#f43f5e,stroke-width:2px
    style A stroke:#f43f5e,stroke-width:2px
```

- **The Rule:** `"import/no-cycle": ["error", { "maxDepth": 5 }]`

---

## 2. Preventing Barrel Files (`barrel-files/avoid-barrel-files`)

Re-exporting hundreds of components from a single `index.ts` creates severe bundle bloat and slows down Next.js / Vite development cold-starts by forcing the bundler to parse all modules.

```typescript
// ❌ BAD: Barrel import loads all 150 components in the design system
import { Button } from '@/components';

// ✅ GOOD: Direct modular import
import { Button } from '@/components/Button';
```

---

## 3. Configuration Snippet

```json
{
  "plugins": ["import", "unicorn", "barrel-files"],
  "rules": {
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", ["parent", "sibling"], "index", "object", "type"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ],
    "import/no-duplicates": "error",
    "import/no-cycle": ["error", { "maxDepth": 5 }],
    "import/no-self-import": "error",
    "barrel-files/avoid-barrel-files": "warn",
    "unicorn/prefer-node-protocol": "error",
    "unicorn/no-useless-spread": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```
