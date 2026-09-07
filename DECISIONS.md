# Decisions

## Architecture & trade-offs

### Shape of the application

I chose an npm-workspace monorepo with separate `api` and `web` applications. This keeps the deployment boundary explicit while making the one-day exercise easy to install and operate from a single lockfile. NestJS modules divide the backend by capability (`auth`, `catalogue`, `movies`, and `watchlist`) so controllers remain transport-focused and business/database work stays in services.

PostgreSQL and Prisma model movies, directors, and genres relationally rather than embedding text arrays. Explicit join tables make many-to-many relationships, director credit order, uniqueness, and future metadata straightforward. Watchlist membership uses a composite primary key, making repeated adds naturally idempotent. UUIDs avoid exposing sequential internal identifiers, while human-readable slugs support clean detail URLs.

The React client uses TanStack Query for server-state caching and invalidation, React Hook Form plus Zod for forms, and URL search parameters for catalogue state. Search and filters therefore survive reloads and produce shareable URLs. CSS Modules keep component styles local; a small global stylesheet holds design tokens, reset rules, and deliberately shared utilities.

### Pagination and search

The UI uses infinite scrolling, backed by an offset/limit API. Offset pagination is simple to understand, inspect, and demonstrate, and is entirely adequate for 200 seeded rows. The API returns `total` and `nextOffset`, while the client deduplicates in-flight page requests.

For a large or frequently changing production catalogue I would switch the scrolling path to cursor/keyset pagination using the active sort field plus a unique ID. Offset queries become slower at deep pages and concurrent inserts can cause duplicates or skipped records. I would also move broad text search from case-insensitive SQL matching to PostgreSQL full-text/trigram indexes or a dedicated search service, depending on scale and ranking needs.

### Authentication and authorization

Passwords are hashed with Argon2. A global Nest guard requires authentication by default; public routes opt out explicitly, and a second guard enforces the `ADMIN` role on movie mutations. The browser receives a short-lived JWT in an HTTP-only, same-site cookie, keeping tokens out of JavaScript-accessible storage.

The main deliberate shortcut is session lifetime: access expires after 15 minutes and the user signs in again. The schema reserves an `auth_sessions` table for refresh-token rotation, but that flow is not wired into this take-home. In production I would implement hashed, rotating refresh tokens with reuse detection and revocation; add login throttling and account recovery/verification; use HTTPS-only secure cookies; define a CSRF strategy appropriate to the deployment topology; and put secrets in a managed secret store. I would also remove the unused session model until refresh support is scheduled if the team prefers a stricter no-speculative-schema policy.

### Data and API

DTO validation rejects unknown fields and constrains lengths, arrays, UUIDs, ratings, runtime, and URLs. Swagger exposes the API contract. The seed uses fictional deterministic data so the repository has no licensing or third-party API dependency, and it creates exactly the requested 200 movies. In local development an explicit seed resets application data; the Docker initializer only seeds an empty catalogue so normal restarts do not erase user changes.

The health endpoint currently reports process health rather than database readiness. A production deployment would add separate liveness and readiness endpoints, structured logging with request IDs, metrics/tracing, centralized error reporting, database backup/restore procedures, and graceful shutdown. I would also generate and share API types with the client rather than maintaining handwritten response interfaces.

### Docker and deployment

Docker Compose runs PostgreSQL, a one-shot migration/initial-seed container, NestJS, and an Nginx-served React build. Nginx proxies API and Swagger traffic, so the production-like browser path is same-origin. Service health/dependency conditions prevent the API from racing migrations and prevent the web service from advertising readiness before the API is healthy.

For clarity and reliable review, the API runtime image retains the workspace dependencies needed by the one-shot migration/seed service. In production I would create separate migration and minimal API image targets, prune development dependencies, run as a non-root user, pin images by digest, add container security scanning, and deploy migrations as a controlled release job. The checked-in Compose secrets are local-only and must be overridden outside development.

### Testing scope

The repository includes a Nest unit test, a Supertest application test, a React component test, and a real-database smoke suite. The smoke suite covers the highest-risk integration paths: search/filter/pagination, cookie authentication, role rejection, admin CRUD, and watchlist behavior. Within a one-day limit I favored one broad integration check over many mocked service tests.

With more time I would add isolated service tests for failure paths and transaction behavior, frontend tests for filter URL state and form validation, Playwright coverage for member/admin journeys, automated accessibility checks, and CI with a disposable PostgreSQL service. I would also test responsive layouts across real browser engines and add visual regression coverage.

## AI usage

I used OpenAI Codex as a pair-programming tool for architecture discussion, scaffolding, repetitive TypeScript/CSS work, test execution, and browser-assisted debugging. I reviewed the generated code, chose the architecture and trade-offs, ran the application against PostgreSQL, and kept responsibility for every submitted change.

Concrete areas where AI helped:

- compared pagination approaches and implemented an offset-backed infinite-query flow;
- scaffolded NestJS modules, Prisma relations, DTO validation, and React pages;
- generated deterministic seed data and a real-API smoke script;
- refactored the initial shared stylesheet into CSS Modules;
- exercised authentication and catalogue flows in the browser and traced runtime failures;
- drafted Docker and project documentation, which I reviewed against the actual commands and code.

AI output was not accepted unchanged. Examples of corrections and rewrites include:

- Early catalogue and watchlist code did not have the same module/controller structure as the rest of the backend. I split it into explicit NestJS modules for consistency and readability.
- A browser/API hostname mismatch (`localhost` versus `127.0.0.1`) caused cookie/CORS sign-in failure. The generated happy-path implementation missed that integration detail; I diagnosed it in the running browser and aligned the configured origins and API URL.
- The first infinite-query implementation could request the same page twice during observer activity. I changed the fetching behavior and verified that result pages were not duplicated.
- A detail lookup initially treated every route value like a UUID before falling back to a slug. I rewrote the query path so human-readable slug routes work correctly.
- Docker seeding initially risked resetting data on every Compose start. I added an empty-database guard for container initialization while retaining an explicit deterministic reset seed for development.
- An invalid poster URL originally caused the browser to show raw alternative text in the image area. I added a reusable poster component that detects image-loading failures and displays a styled Reelhouse fallback, then clarified the URL guidance in the admin form.

The main limitation of AI in this exercise was that locally plausible code was not always operationally correct when browser origins, cookies, query lifecycles, routing values, and container startup ordering interacted. Running the real stack, inspecting failures, and simplifying inconsistent output mattered more than generating additional surface area.
