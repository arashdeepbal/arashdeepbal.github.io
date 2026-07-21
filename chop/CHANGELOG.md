# Changelog

This file summarizes notable project changes from the Git history. The repository does not currently use version tags, so entries are grouped by date rather than release number.

## Unreleased

### Documentation

- Replaced the generic Lovable starter README with product, architecture, setup, data-model, and security documentation.
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
