# Chop Chop

Chop Chop is a mobile-first bill-splitting app for trips and shared expenses. A group can create a trip, invite others with a six-digit access code or link, add expenses, choose how each item is split, and record settlements.

> Project status: working design prototype. The app persists real data in Supabase, but its current public-access model is not suitable for private or sensitive financial information.

## What it does

- Creates a shared trip with a six-digit access code.
- Lets anyone with the code or trip URL join the same workspace.
- Adds and edits participants with generated animal avatars.
- Records expenses with a payer, date, currency, and included participants.
- Splits an item equally, by exact amount, or by percentage.
- Calculates who owes whom independently for each currency.
- Records settlements and shows expenses and settlements in a combined history.
- Copies the trip URL or access code for sharing.

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
| `src/services/database.ts` | All Supabase reads and writes plus database-to-app mapping |
| `src/integrations/supabase/` | Supabase client and generated database types |
| `src/lib/` | Currency data, avatar helpers, split calculations, and utilities |
| `src/types/` | Shared application types |
| `supabase/migrations/` | Database schema and incremental migrations |
| `public/` | Favicons and optimized WebP illustrations |
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

The frontend loads a trip into React state and writes changes directly through `src/services/database.ts`. For the summary, it calculates each participant's net balance per currency, applies recorded settlements, and greedily matches debtors with creditors. Percentage splits use a largest-remainder calculation so the stored amounts add up to the expense total at cent precision.

## Tech stack

- React 18 and TypeScript
- Vite 8 with SWC
- Tailwind CSS 3
- shadcn/ui and Radix UI
- Supabase Postgres
- React Router
- TanStack Query
- React Hook Form and Zod
- date-fns, Lucide icons, and Sonner toasts

## Local development

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm (the examples below use npm 10)

### Run the app

```sh
git clone https://github.com/arashdeepbal/buddy-bill-divider.git
cd buddy-bill-divider
npm install
npm run dev
```

Vite serves the app at [http://localhost:8080](http://localhost:8080).

This repository contains both `package-lock.json` and `bun.lockb`. The examples use npm; if you use Bun instead, avoid updating only one lockfile in a dependency change.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite server on port 8080 |
| `npm run build` | Create a production build in `dist/` |
| `npm run build:dev` | Build using Vite's development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run optimize:images` | Convert PNG files in `public/` to resized WebP files |

There is currently no automated test suite. Use the lint and production-build commands as the minimum pre-commit checks.

## Supabase setup

The checked-in client currently connects to the existing hosted Supabase project using the URL and publishable key in `src/integrations/supabase/client.ts`, so no environment variables are required to run the existing prototype.

To use a different Supabase project:

1. Create a Supabase project.
2. Apply every SQL file in `supabase/migrations/` in filename order, using the Supabase CLI or SQL editor.
3. Update the URL and publishable client key in `src/integrations/supabase/client.ts`, or refactor the client to read your own Vite environment variables.
4. Regenerate `src/integrations/supabase/types.ts` after changing the schema.

The repository's `.env` contains Lovable-generated `VITE_SUPABASE_*` variables, but the current client does not read them. Never put a Supabase `service_role` key or another server secret in this frontend.

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

The original project is also connected to [Lovable](https://lovable.dev/projects/ec840a9c-030b-4e90-84e9-4657190fa5b0).

## Project notes

- `.lovable/plan.md` is an implementation note from a previous Lovable change, not the canonical product specification.
- `src/integrations/supabase/types.ts` is generated and should not be edited manually.
- There is no license file in this repository.
- Notable historical changes are summarized in [CHANGELOG.md](CHANGELOG.md).
