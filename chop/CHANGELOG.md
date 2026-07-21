# Changelog

This file summarizes notable project changes from the Git history. The repository does not currently use version tags, so entries are grouped by date rather than release number.

## Unreleased

### Added

- Added a device-local recent-trips list limited to the five most recently opened trips.
- Added expense editing, history search and filters, incremental history loading, settlement undo, and clearer destructive confirmations.
- Added trip-access onboarding with share/copy actions and access/privacy guidance.
- Added Vitest coverage for currency formatting, split allocation, and multi-currency debt grouping.
- Added PWA metadata, icons, improved route loading/error states, and optimized app illustrations.

### Changed

- Added a scroll-responsive trip header that keeps the full trip context at the top and condenses into a glass material header while scrolling.
- Reworked first-run participant onboarding around confirmable participant rows and a simplified finish action.
- Moved Bill, Participants, and empty Summary/History primary actions into consistent floating pills above the bottom navigation.
- Grouped all currencies owed between the same two participants into one summary card with independent settlement actions.
- Preserved the most recently used currency, payer, and shared participants when adding another expense.
- Centralized trip workspace loading and mutations in `useTripWorkspace` and centralized short-lived, deduplicated toast behavior.
- Improved mobile sheet spacing, safe-area handling, tab-header spacing, semantic headings, focus behavior, and empty states.
- Updated deployment and local-development documentation for the portfolio repository's `/chop/` subpath.

### Removed

- Removed the obsolete component-tagging integration, its planning artifact, and related documentation.
- Removed unreachable starter UI components, their unused dependencies, legacy toast/mobile hooks, unused CSS and assets, and redundant component exports.
- Removed the Bun lockfile and standardized the project and deployment workflow on npm.

### Fixed

- Removed shadows from History cards while retaining their borders.
- Made percentage allocation and displayed currency precision respect the selected currency's minor units.
- Added collision retries when generating six-digit trip access codes.
- Kept direct `/chop/bill/:eventId` routes, the legacy edit route, and the not-found experience working under the configured base path.
- Made strict TypeScript checking pass for resolved currency precision.
- Grouped History entries by the viewer's local calendar date instead of the timestamp's UTC date.
- Allowed participants who paid existing expenses to be removed by safely detaching payer and split references before deletion, without changing the database schema.
- Removed a deleted trip's device-local recent shortcut immediately.
- Remembered each trip's last selected add-expense split mode on the current device across saves, tab changes, and reloads.

### Verification

- Passed ESLint, strict TypeScript checking, 21 Vitest tests, the Vite production build, the production dependency audit, and production-preview checks for landing, deep-link, manifest, and hashed-asset routes.
- Exercised landing validation, trip creation/joining, participant onboarding and management, all three split modes, multi-currency summary, settlements and undo, expense edit/cancel/delete, history search/filter/pagination, trip rename, copy actions, recent trips, error states, and trip deletion in the local app.

### Documentation

- Replaced the generic starter README with product, architecture, setup, data-model, and security documentation.
- Added this changelog to establish a lightweight record for future changes.

## 2026-04-28

### Added

- Restored percentage-based splitting using the existing `person_splits` JSON model.
- Added cent-accurate percentage allocation using a largest-remainder calculation.
- Added an image-optimization script and replaced large PNG illustrations with WebP assets.

### Changed

- Refined bill entry, participant forms, expense history, toasts, and empty states for mobile use.
- Persisted exact per-person share amounts so summaries and history can display non-equal splits.

## 2026-04-27

### Changed

- Introduced the five-section mobile trip navigation for bills, summaries, participants, history, and trip actions.
- Moved participant and trip editing into mobile-friendly sheets and subpages.
- Added first-run participant onboarding, loading skeletons, confirmation sheets, and settlement-history polish.
- Unified the visual system around a centered 700 px app column, white page backgrounds, blue actions, consistent spacing, and safe-area-aware bottom navigation.

## 2025-06

### Added

- Connected the app to Supabase and added persisted events, participants, bill items, shares, and individual settlements.
- Added shareable event access codes and trip URLs.
- Added multi-currency bill entry and equal, amount, and percentage split modes.

## 2025-03

### Added

- Created the initial Vite, React, TypeScript, shadcn/ui, and Tailwind application.
- Added the first responsive bill-splitting interface.
