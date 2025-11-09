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


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config Biome preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `npx ultracite fix`
- **Check for issues**: `npx ultracite check`
- **Diagnose setup**: `npx ultracite doctor`

Biome (the underlying engine) provides extremely fast Rust-based linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `npx ultracite fix` before committing to ensure compliance.
