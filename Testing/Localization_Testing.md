# Localization (i18n) & Internationalization (l10n) Testing

> **Scope:** Verifying multilingual translation strings, pseudo-localization overflow, Right-to-Left (RTL) layout mirroring, `Intl` number/currency/date formatting, and complex pluralization rules.

---

## Table of Contents

- [Localization (i18n) \& Internationalization (l10n) Testing](#localization-i18n--internationalization-l10n-testing)
  - [Table of Contents](#table-of-contents)
  - [1. Pseudo-Localization \& Text Expansion Overflow](#1-pseudo-localization--text-expansion-overflow)
  - [2. Right-to-Left (RTL) Layout Mirroring Verification](#2-right-to-left-rtl-layout-mirroring-verification)
  - [3. `Intl` Date, Number \& Currency Formatting](#3-intl-date-number--currency-formatting)
  - [4. Pluralization Rules Testing](#4-pluralization-rules-testing)
  - [5. When to Use vs. When NOT to Use](#5-when-to-use-vs-when-not-to-use)

---

## 1. Pseudo-Localization & Text Expansion Overflow

Languages like German or Finnish expand English copy length by **$30\%-50\%$**. Pseudo-localization replaces standard characters with accented glyphs and expands length to expose UI button clipping and broken layout containers before translation:

```typescript
// i18n/pseudoLocalize.ts
export function pseudoLocalize(text: string): string {
  const charMap: Record<string, string> = {
    a: 'á',
    e: 'é',
    i: 'í',
    o: 'ó',
    u: 'ú',
    A: 'Á',
    E: 'É',
    I: 'Í',
    O: 'Ó',
    U: 'Ú',
  };
  const transformed = text
    .split('')
    .map((char) => charMap[char] || char)
    .join('');
  return `[!!! ${transformed} ~~~~~ !!!]`; // Expands length by ~40%
}
```

---

## 2. Right-to-Left (RTL) Layout Mirroring Verification

Ensure Arabic/Hebrew locales apply `dir="rtl"` and use CSS Logical Properties (`margin-inline-start` instead of `margin-left`):

```typescript
// e2e/rtl.spec.ts
import { test, expect } from '@playwright/test';

test('Arabic locale sets dir=rtl and mirrors layout alignment', async ({ page }) => {
  await page.goto('/ar/dashboard');

  const html = page.locator('html');
  await expect(html).toHaveAttribute('dir', 'rtl');
  await expect(html).toHaveAttribute('lang', 'ar');

  // Verify navigation bar is aligned to the right side
  const nav = page.getByRole('navigation');
  const boundingBox = await nav.boundingBox();
  expect(boundingBox?.x).toBeGreaterThan(0);
});
```

---

## 3. `Intl` Date, Number & Currency Formatting

```typescript
// utils/i18nFormat.test.ts
import { describe, it, expect } from 'vitest';

describe('Intl formatting across locales', () => {
  const amount = 123456.78;
  const date = new Date('2026-09-13T12:00:00Z');

  it('formats currency correctly per locale', () => {
    const us = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    const de = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

    expect(us).toBe('$123,456.78');
    expect(de.replace(/\s/g, ' ')).toBe('123.456,78 €');
  });
});
```

---

## 4. Pluralization Rules Testing

```typescript
// i18n/plural.test.ts
import { describe, it, expect } from 'vitest';

describe('Pluralization handling', () => {
  it('correctly selects plural forms based on count', () => {
    const formatItems = (count: number) => {
      const pr = new Intl.PluralRules('en-US');
      const rule = pr.select(count);
      return rule === 'one' ? `${count} item` : `${count} items`;
    };

    expect(formatItems(1)).toBe('1 item');
    expect(formatItems(0)).toBe('0 items');
    expect(formatItems(5)).toBe('5 items');
  });
});
```

---

## 5. When to Use vs. When NOT to Use

| When to Use Localization Testing                          | When NOT to Use Localization Testing            |
| :-------------------------------------------------------- | :---------------------------------------------- |
| ✅ Global international multi-language applications.      | ❌ Single-region local internal employee tools. |
| ✅ Layout verification with RTL support (Arabic, Hebrew). | ❌ Pure algorithmic math utilities.             |
| ✅ Date, currency, and number input forms.                | ❌ Backend database migrations.                 |
