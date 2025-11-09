# Repository Guidelines

## Project Structure & Module Organization
The dashboard uses the Next.js App Router (`app/`) where `layout.tsx` wires providers/theme and `page.tsx` renders the primary dashboard view. Global theming and Tailwind layers live in `app/globals.css`. Shared UI is split between `components/` (feature widgets such as `project-card.tsx`) and `components/ui/` (atoms generated through `components.json` + shadcn; import via `@/components/...`). Cross-cutting helpers belong in `lib/` (for example `lib/utils.ts` exposes the `cn` Tailwind merge helper). Static assets and JSON seeds should go into `public/`. Keep configuration at the root (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`) so agents can reason about build tooling quickly.

## Build, Test, and Development Commands
- `npm run dev` – starts Next.js with hot reload on http://localhost:3000 for iterative UI work.
- `npm run build` – compiles the production bundle; run before pushing to catch type- and route-level issues.
- `npm run start` – serves the output of `next build`; use when smoke-testing the optimized bundle.
- `npm run lint` – runs ESLint with the Next.js Core Web Vitals preset; required before every PR.

## Coding Style & Naming Conventions
TypeScript is strict (see `tsconfig.json`), so prefer typed props and discriminated unions over `any`. Export React components as PascalCase from kebab-case files (`project-card.tsx`) to match the existing pattern. Use functional components, hooks, and the shared `cn` helper for Tailwind class composition; avoid inline hex colors when CSS variables already describe the palette in `app/globals.css`. Keep imports relative to the repo root via the `@/*` alias, and re-export UI primitives from `components/ui` when possible.

## Testing Guidelines
Automated tests are not yet wired up—add Vitest + React Testing Library co-located under `__tests__` folders or `*.test.tsx` files that mirror the component path. Until the test runner is introduced, rely on `npm run lint` plus manual verification in `npm run start`. When adding tests, cover card aggregation logic, dialog flows, and any data-mapping utilities, and enforce >80% coverage for new modules.

## Commit & Pull Request Guidelines
Commits follow Conventional Commits (`feat: ...` already exists in history), so continue using `feat|fix|chore|refactor(scope): message`. Keep diffs focused (one feature or fix per commit) and include context on data changes (e.g., "sync KPI palette with globals.css tokens"). Every PR must reference an issue or short problem statement, list the key commands you ran (`npm run lint`, `npm run build`), and attach screenshots or recordings for UI-altering work. Request review only after CI-equivalent checks pass locally.

## Environment & Configuration Tips
Create a `.env.local` for any API keys or secrets; Next.js automatically loads it. When adding new runtime flags, also document them in `README.md` and guard access via `process.env?.` checks inside server components only. Update `next.config.ts` if you introduce remote images or rewrites so deployments stay deterministic.
