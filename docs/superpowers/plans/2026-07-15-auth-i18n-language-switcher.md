# Auth i18n Language Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dynamic Spanish/English translations to the auth screens with an auth-only language switcher.

**Architecture:** Keep route scope controlled by placing the switcher in `app/(auth)/layout.tsx`. Initialize `i18next` from a small client provider rendered by the root layout, and keep translation resources in JSON files plus a typed helper module for tests and imports.

**Tech Stack:** Next.js App Router, React 19, i18next, react-i18next, lucide-animated, Vitest.

## Global Constraints

- Read local Next.js docs before code changes; relevant docs reviewed: layouts/pages, internationalization, and `use client`.
- Spanish (`es`) is default and fallback language.
- The switcher appears only in `/login`, `/registro`, and `/recuperacion`.
- The switcher uses `LanguagesIcon` from `lucide-animated` and calls `i18n.changeLanguage("es" | "en")`.
- Menus must work with hover, focus/click, keyboard-visible focus, and mobile tap.

---

### Task 1: Translation Resources and i18n Helpers

**Files:**
- Create: `public/locales/es.json`
- Create: `public/locales/en.json`
- Create: `lib/i18n/resources.ts`
- Create: `lib/i18n/resources.test.ts`

**Interfaces:**
- Produces: `defaultLanguage: "es"`, `supportedLanguages: ["es", "en"]`, `resources`, `getInitialLanguage(storage?: Storage): "es" | "en"`, `persistLanguage(language, storage?)`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { defaultLanguage, getInitialLanguage, resources, supportedLanguages } from "./resources";

describe("i18n resources", () => {
  it("uses Spanish as the default language", () => {
    expect(defaultLanguage).toBe("es");
    expect(supportedLanguages).toEqual(["es", "en"]);
  });

  it("keeps English and Spanish translation keys in sync", () => {
    expect(Object.keys(resources.en.translation).sort()).toEqual(
      Object.keys(resources.es.translation).sort(),
    );
  });

  it("reads only supported persisted languages", () => {
    const storage = { getItem: () => "en" } as Storage;
    const invalidStorage = { getItem: () => "fr" } as Storage;

    expect(getInitialLanguage(storage)).toBe("en");
    expect(getInitialLanguage(invalidStorage)).toBe("es");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/i18n/resources.test.ts`

Expected: fail because `lib/i18n/resources.ts` does not exist.

- [ ] **Step 3: Add JSON resources and helper module**

Create Spanish JSON with current app copy and English JSON with equivalent translations. Export both from `resources.ts`, plus storage helpers.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/i18n/resources.test.ts`

Expected: pass.

### Task 2: Provider and Auth-Only Language Switcher

**Files:**
- Create: `app/i18n-provider.tsx`
- Create: `app/(auth)/language-switcher.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/(auth)/layout.tsx`

**Interfaces:**
- Consumes: `resources`, `defaultLanguage`, `getInitialLanguage`, `persistLanguage`.
- Produces: `I18nProvider({ children })`, `LanguageSwitcher()`.

- [ ] **Step 1: Write failing tests**

Add render-level or helper-level tests proving the switcher labels come from translation keys and the language options are `Español` and `Ingles`.

- [ ] **Step 2: Run tests to verify they fail**

Run the new focused test.

- [ ] **Step 3: Implement provider and selector**

Wrap root layout children in `I18nProvider`. Add `LanguageSwitcher` to auth layout after `HomeLink`. Use `LanguagesIcon` on the right, hover/focus/click open states, and upward menu placement.

- [ ] **Step 4: Run focused tests**

Run focused i18n/switcher tests.

### Task 3: Translate Auth UI and Feedback Messages

**Files:**
- Modify: `app/auth-brand-panel.tsx`
- Modify: `app/auth-home-link.tsx`
- Modify: `app/(auth)/login/login-form.tsx`
- Modify: `app/(auth)/registro/register-form.tsx`
- Modify: `app/(auth)/recuperacion/recovery-form.tsx`
- Modify: `lib/auth/password-requirements.ts`
- Modify: `lib/auth/registration-feedback.ts`
- Modify: related tests

**Interfaces:**
- Consumes: `useTranslation()` with keys from `auth.*`, `common.*`, `validation.*`, `password.*`, `language.*`.
- Produces: dynamic UI text in Spanish/English.

- [ ] **Step 1: Write failing tests**

Update focused tests for password requirement translation keys and registration feedback key handling.

- [ ] **Step 2: Run tests to verify they fail**

Run the focused tests.

- [ ] **Step 3: Replace literals with `t(...)`**

Use `useTranslation()` in client components. For server-returned messages that appear in auth UI, return stable keys or translate known values at the client boundary.

- [ ] **Step 4: Run focused tests and full verification**

Run: `npm test`, `npm run lint`, `npm run build`.

Expected: all pass.
