# Bucket H — Branding, Admin Fixes & Mobile UX Design

**Date:** 2026-05-02  
**Status:** Approved  
**Scope:** Live site fixes, branding editability, mobile UX, source map cleanup

---

## Overview

Fixes urgent live-site issues and makes branding/contact info editable by admin without a deploy. Builds on existing `SiteSettings` in `ContentModule` and existing `/admin/settings` page.

---

## 1. SiteSettings Extensions (Backend)

### New fields on `SiteSettings` entity

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `phone` | `varchar` nullable | `null` | Display in footer/header/contact |
| `email` | `varchar` nullable | `null` | Display in footer/header/contact |
| `logoUrl` | `varchar` nullable | `null` | R2/CDN URL of uploaded logo image |
| `primaryColor` | `varchar` nullable | `#C8A96E` | Hex color for site primary color |

### Changes required

- `apps/api/src/content/site-settings.entity.ts` — add 4 columns
- `apps/api/src/content/dto/update-site-settings.input.ts` — add 4 optional fields
- `apps/api/src/content/content.resolver.ts` — no change needed (fields auto-exposed)
- Migration: `AddBrandingFieldsToSiteSettings` — `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS ...` for each field
- Logo upload: reuse existing `/api/upload` endpoint pattern (same as receipt uploads); store returned URL in `logoUrl`

---

## 2. Frontend Branding Consumption

### Data source

`siteSettings` GraphQL query already available in the app. Add `phone`, `email`, `logoUrl`, `primaryColor` to the query selection set.

### Replacements

| Location | What changes |
|----------|-------------|
| `MainLayout` header | `<img src={logoUrl}>` replaces hardcoded logo; falls back to `siteName` text (existing SiteSettings field) if `logoUrl` is null |
| Footer component | `phone` and `email` replace hardcoded strings |
| Contact page | `phone` and `email` from SiteSettings |
| `App.tsx` | `useEffect` injects `primaryColor` as `--color-primary` CSS variable on `document.documentElement` |

### CSS variable injection

```tsx
// App.tsx
useEffect(() => {
  if (settings?.primaryColor) {
    document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
  }
}, [settings?.primaryColor]);
```

Tailwind config extended with `primary: 'var(--color-primary)'` so `bg-primary`, `text-primary` classes work.

### Logo upload in admin settings

- `/admin/settings` gets a "Upload Logo" file input
- On change: POST `multipart/form-data` to `/api/upload/logo` (new endpoint, same pattern as receipt upload)
- Response URL saved via `updateSiteSettings` mutation

---

## 3. Mobile UX

### 3.1 Mobile Navigation

- `MainLayout` header: add `useState(false)` for drawer open/close
- Hamburger icon (3 lines SVG) visible on `md:hidden`
- Slide-in drawer: fixed overlay, `translate-x` transition, contains all nav links
- Close triggers: link click, outside tap (click on overlay backdrop)
- Desktop nav unchanged

### 3.2 Product Grid Responsiveness

- All product grid containers: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- `ProductCard` images: `aspect-[4/5] object-cover` to prevent layout shift
- Card min-width removed (was causing overflow on small screens)

### 3.3 Checkout Flow

- All form field rows: `flex flex-col sm:flex-row` 
- Payment method selector buttons: `min-h-[44px]` tap target
- Delivery address textarea: full width on mobile
- Order summary sidebar: stacked below form on mobile (`flex flex-col lg:flex-row`)

---

## 4. Source Map Fix

**File:** `apps/web/vite.config.ts`

```ts
build: {
  sourcemap: false,
}
```

Eliminates browser console errors on production:
- `installHook.js.Map` (React DevTools source map)
- `react_devtools_backend_compact.js.Map`

These only appear in production builds where DevTools injects scripts but source maps aren't served.

---

## Data Flow

```
Admin edits /admin/settings
  → updateSiteSettings mutation
  → SiteSettings row updated in DB
  → Frontend siteSettings query refetches
  → CSS variable + logo + contact info update live
```

---

## Error Handling

- `logoUrl` null: header falls back to `<span>{siteName}</span>`
- `phone`/`email` null: footer/contact hides those elements (no empty strings shown)
- `primaryColor` null: CSS variable not set, Tailwind fallback color used

---

## Migration

```
apps/api/src/migrations/TIMESTAMP-AddBrandingFieldsToSiteSettings.ts
```

Adds `phone`, `email`, `logoUrl`, `primaryColor` columns to `site_settings` table using `IF NOT EXISTS` guards.

---

## Out of Scope

- Full theme engine (font control, spacing tokens) — not needed yet
- Config-file branding — DB-driven is strictly better
- Admin login production issue — env/infrastructure problem, not a code fix
