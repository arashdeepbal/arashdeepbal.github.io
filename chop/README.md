# Chop Chop

Chop Chop is a mobile-first bill-splitting app for trips and shared expenses. A group can create a trip, invite others with a six-digit access code or link, add expenses, choose how each item is split, and record settlements.

> Project status: working design prototype. The app persists real data in Supabase, but its current public-access model is not suitable for private or sensitive financial information.

## What it does

- Creates a shared trip with a six-digit access code.
- Lets anyone with the code or trip URL join the same workspace.
- Adds, edits, and removes participants with generated animal avatars.
- Adds, edits, and deletes expenses with a payer, date, currency, and included participants.
- Splits an item equally, by exact amount, or by percentage.
- Calculates who owes whom independently for each currency.
- Groups multiple currencies owed between the same two people into one summary card.
- Records settlements and shows expenses and settlements in a combined history.
- Searches and filters longer histories by entry type, participant, currency, and date.
- Remembers up to five recently opened trips on the current device.
- Shares or copies the trip URL and access code.

Currency values are kept separate; the app does not convert between currencies or fetch exchange rates.

## Product flow

1. Create a trip on the landing page, or join one with its six-digit code.
2. Add at least one participant during first-run onboarding.
3. Add bill items and choose the payer and split method.
4. Review the computed transfers in **Summary**.
5. Mark transfers as settled and review the complete timeline in **History**.

The trip workspace has five sections: **Bill**, **Summary**, **Participants**, **History**, and **More**.

## How the app is structured

| Area | Responsibility |
| --- | --- |
| `src/pages/` | Route-level landing, trip, and not-found screens |
| `src/components/` | Bill, participant, summary, history, navigation, and sheet UI |
| `src/components/ui/` | Reusable shadcn/Radix UI primitives |
| `src/hooks/use-trip-workspace.ts` | Trip loading, local workspace state, and persisted mutations |
| `src/services/database.ts` | All Supabase reads and writes plus database-to-app mapping |
| `src/integrations/supabase/` | Supabase client and generated database types |
| `src/lib/` | Currency data, avatar helpers, split/debt calculations, sharing, recent trips, and utilities |
| `src/lib/*.test.ts` | Vitest unit coverage for amount formatting and split/debt calculations |
| `src/types/` | Shared application types |
| `supabase/migrations/` | Database schema and incremental migrations |
| `public/` | Favicons, PWA assets, and PNG/WebP illustrations |
| `scripts/optimize-images.mjs` | Converts source PNG illustrations in `public/` to WebP |

### Routes

| Route | Purpose |
| --- | --- |
| `/` | Create a new trip or join an existing one |
| `/bill/:eventId` | Open a trip workspace |
| `/bill/:eventId/edit` | Legacy URL that redirects to the trip workspace |
| `*` | Not-found page |

### Data model

- `events` stores the trip name and uses the access code as its ID.
- `participants` belong to an event.
- `bill_items` stores an expense, its payer, currency, and optional exact per-person amounts in `person_splits` JSON.
- `bill_item_shares` links each bill item to its included participants.
- `individual_settlements` records a payment from one participant to another.

The frontend loads a trip into React state and writes changes directly through `src/services/database.ts`. For the summary, it calculates each participant's net balance per currency, applies recorded settlements, and greedily matches debtors with creditors. Percentage splits use a largest-remainder calculation so the stored amounts add up to the expense total at the selected currency's precision.

`person_splits` stores the resulting per-person amounts, not the original UI split mode. Reopening a saved custom or percentage allocation therefore presents the persisted values as **By amount**. The add-expense form remembers its last selected split mode separately on the current device for each trip.

## Tech stack

- React 18 and TypeScript
- Vite 8
- Tailwind CSS 3
- shadcn/ui and Radix UI
- Supabase Postgres
- React Router
- date-fns, Lucide icons, and Sonner toasts

## Local development

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm (the examples below use npm 10)

### Run the app

```sh
git clone https://github.com/arashdeepbal/arashdeepbal.github.io.git
cd arashdeepbal.github.io/chop
npm ci
npm run dev
```

Vite serves the app at [http://localhost:8080](http://localhost:8080).

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite server on port 8080 |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm test` | Run the Vitest unit suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run optimize:images` | Convert PNG files in `public/` to resized WebP files |

Use lint, unit tests, strict TypeScript checking, and the production build as the pre-commit baseline:

```sh
npm run lint
npm test
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

As of the July 22, 2026 sanity run, lint, all 21 unit tests, strict TypeScript checking, the production build, the production preview routes, and `npm audit --omit=dev` pass.

## Supabase setup

The checked-in client currently connects to the existing hosted Supabase project using the URL and publishable key in `src/integrations/supabase/client.ts`, so no environment variables are required to run the existing prototype.

To use a different Supabase project:

1. Create a Supabase project.
2. Apply every SQL file in `supabase/migrations/` in filename order, using the Supabase CLI or SQL editor.
3. Update the URL and publishable client key in `src/integrations/supabase/client.ts`, or refactor the client to read your own Vite environment variables.
4. Regenerate `src/integrations/supabase/types.ts` after changing the schema.

Never put a Supabase `service_role` key or another server secret in this frontend.

### Access and privacy warning

The migrations enable Row Level Security but define public `FOR ALL` policies on every table. There is no user authentication or trip-level authorization. Anyone who can query the Supabase project can read or change trip data; knowing the six-digit access code is not an enforced security boundary.

Before treating this as a production app, add authentication and restrictive policies that authorize access per trip. Until then, use only disposable, non-sensitive data.

## Deployment

This copy is configured for the portfolio site's `/chop/` subpath. From the portfolio repository root, run:

```sh
npm --prefix chop ci
npm run build:chop
```

The production build is written to `chop/dist/`. The repository's GitHub Pages workflow combines that build with the parent portfolio only inside its deployment artifact, so the repository keeps a single `chop/` source folder. GitHub Pages serves it at [https://arashbal.com/chop/](https://arashbal.com/chop/). The portfolio's root `404.html` redirects direct visits to nested app routes back into React Router, so shared `/chop/bill/:eventId` links work on GitHub Pages.

## Ideas for future exploration

These are deferred concepts rather than planned changes. The current bottom navigation remains the intended experience for now.

### Platform-aware bottom navigation

- Explore an optional light Liquid Glass treatment on iOS while retaining the current navigation on Android and unsupported or unidentified platforms.
- Keep one shared navigation component and interaction model; only its visual treatment should vary by platform.
- Preserve Chop's blue active state, existing icons, labels, semantics, and touch-target sizes.
- For the iOS treatment, use native light label tones, balanced top and bottom insets, and a tight 2–3 px gap between each icon and label.
- Apply the glass treatment only when iOS and `backdrop-filter` support are both detected. The existing navigation should remain the default and fallback.
- Before implementation, validate browser and installed-PWA safe areas, reduced-transparency and reduced-motion preferences, older-device performance, and the spacing between the navigation and floating primary actions.
- Dark mode is outside the initial exploration and can be considered separately later.

The exploratory comparison is available in [Figma](https://www.figma.com/design/RNUO7c1mvqXkasbCpmcJOs?node-id=1-2).

## Project notes

- `src/integrations/supabase/types.ts` is generated and should not be edited manually.
- There is no license file in this repository.
- Notable historical changes are summarized in [CHANGELOG.md](CHANGELOG.md).
