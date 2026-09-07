# Reelhouse — Speedlane Movie Library

Reelhouse is a responsive full-stack movie catalogue built for the Speedlane Senior/Lead Software Engineer code challenge. Visitors can search and filter 200 seeded movies, members can maintain a personal watchlist, and administrators can create, edit, and delete catalogue records.

## Stack

- React 19, React Router, TanStack Query, React Hook Form, Zod, CSS Modules
- NestJS 11, Swagger/OpenAPI, class-validator
- PostgreSQL 17 and Prisma 6
- TypeScript throughout
- npm workspaces and Docker Compose
- Vitest, Testing Library, Jest, Supertest, and a real-database API smoke suite

## Quick start with Docker

The only prerequisite is Docker Desktop. From the repository root, run:

```bash
docker compose up --build
```

Open:

- Application: http://localhost:5173
- API: http://localhost:3000/api/v1
- Interactive API documentation: http://localhost:3000/docs

Compose starts PostgreSQL, applies the committed Prisma migrations, seeds the database when it is empty, starts NestJS, and serves the production React build through Nginx. Subsequent starts preserve database data and skip seeding when movies already exist.

Stop the stack with `docker compose down`. To also discard the database volume and recreate the sample data on the next start, run `docker compose down --volumes`.

### Demo accounts

| Role          | Email                   | Password        |
| ------------- | ----------------------- | --------------- |
| Administrator | `admin@reelhouse.test`  | `Reelhouse123!` |
| Member        | `member@reelhouse.test` | `Reelhouse123!` |

The administrator can manage movies. The member can browse and use the watchlist but receives `403 Forbidden` for catalogue mutations.

## Local development

Prerequisites:

- Node.js 22+
- npm 10+
- Docker Desktop (for PostgreSQL)

Install and prepare the project:

```bash
cp .env.example .env
npm install
docker compose up -d database
npm run db:deploy -w @speedlane/api
npm run db:seed -w @speedlane/api
```

Start both development servers:

```bash
npm run dev
```

The web app runs at http://localhost:5173 and the API at http://localhost:3000. PostgreSQL is intentionally exposed on host port `55432` to avoid common collisions with a locally installed PostgreSQL server.

The development seed is deterministic and resets application tables before creating exactly 200 fictional movies, 50 directors, 15 genres, two demo users, and a sample member watchlist. Do not run it against data you need to preserve.

## Useful commands

Run these from the repository root:

```bash
npm run build          # production builds for all workspaces
npm run typecheck      # TypeScript checks
npm run lint           # ESLint checks
npm test               # unit/component tests
npm run format:check   # Prettier verification
```

Database and API verification:

```bash
npm run db:generate -w @speedlane/api
npm run db:migrate -w @speedlane/api
npm run db:deploy -w @speedlane/api
npm run db:seed -w @speedlane/api
npm run db:studio -w @speedlane/api
npm run test:e2e -w @speedlane/api
npm run test:smoke -w @speedlane/api
```

The smoke suite expects the API and seeded PostgreSQL database to be running. It verifies health, pagination, search, combined filtering, authentication, authorization, admin CRUD, and member watchlist operations against the real API and cleans up the temporary movie it creates.

## Feature guide

- Browse the catalogue without signing in.
- Search by title or synopsis.
- Filter by genre, release-year range, and minimum rating.
- Sort by title, newest release, or rating.
- Continue through results with infinite scrolling backed by stable offset pagination.
- Open a movie detail page from any card.
- Register a member account or use a demo account.
- Add and remove movies from an authenticated watchlist.
- Sign in as the administrator to create, edit, and delete movies.
- Share or refresh catalogue URLs without losing the active query and filters.

The layout is responsive across mobile, tablet, and desktop sizes. Semantic elements, labelled controls, keyboard-accessible actions, meaningful image alternatives, focus states, and reduced-motion handling cover the main accessibility paths.

## API overview

All application endpoints use the `/api/v1` prefix. Authentication is stored in a 15-minute HTTP-only, same-site cookie; protected requests must include credentials.

| Method   | Endpoint              | Access    | Purpose                            |
| -------- | --------------------- | --------- | ---------------------------------- |
| `GET`    | `/health`             | Public    | API health                         |
| `POST`   | `/auth/register`      | Public    | Register and sign in a member      |
| `POST`   | `/auth/login`         | Public    | Sign in                            |
| `POST`   | `/auth/logout`        | Signed in | Clear the session cookie           |
| `GET`    | `/auth/me`            | Signed in | Current user                       |
| `GET`    | `/movies`             | Public    | Search, filter, sort, and paginate |
| `GET`    | `/movies/:idOrSlug`   | Public    | Movie details                      |
| `POST`   | `/movies`             | Admin     | Create a movie                     |
| `PATCH`  | `/movies/:id`         | Admin     | Update a movie                     |
| `DELETE` | `/movies/:id`         | Admin     | Delete a movie                     |
| `GET`    | `/genres`             | Public    | Genre options                      |
| `GET`    | `/directors`          | Public    | Director options                   |
| `GET`    | `/watchlist`          | Signed in | Current user's watchlist           |
| `PUT`    | `/watchlist/:movieId` | Signed in | Add to watchlist                   |
| `DELETE` | `/watchlist/:movieId` | Signed in | Remove from watchlist              |

`GET /movies` supports `q`, `genre`, `yearFrom`, `yearTo`, `ratingMin`, `sort`, `offset`, and `limit`. `limit` is capped at 48.

Example public request:

```bash
curl 'http://localhost:3000/api/v1/movies?q=archive&genre=drama&ratingMin=7&sort=rating&offset=0&limit=12'
```

Example authenticated request (store the cookie, then reuse it):

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"member@reelhouse.test","password":"Reelhouse123!"}'

curl -b cookies.txt http://localhost:3000/api/v1/watchlist
```

For full request schemas and interactive examples, use Swagger at http://localhost:3000/docs.

## Project structure

```text
apps/
  api/                  NestJS application, Prisma schema/migrations/seed, tests
    src/
      auth/             Authentication and role authorization
      catalogue/        Genre and director lookup endpoints
      movies/           Movie querying and admin CRUD
      watchlist/        Per-user watchlists
  web/                  React/Vite application and component tests
docker-compose.yml      Database, initializer, API, and web orchestration
DECISIONS.md            Architecture, trade-offs, and AI usage
```

## Configuration

`.env.example` documents local-development values. Important variables are:

- `DATABASE_URL`: PostgreSQL connection string
- `WEB_ORIGIN`: comma-separated allowed browser origins
- `VITE_API_URL`: API base URL compiled into the Vite client
- `JWT_ACCESS_SECRET`: JWT signing secret; replace outside local development
- `COOKIE_SECURE`: use `true` when serving over HTTPS

The secrets in `docker-compose.yml` are deliberately local-only defaults. Supply secrets through the deployment platform rather than committing production values.

See [DECISIONS.md](./DECISIONS.md) for design rationale, production follow-ups, shortcuts, and a transparent account of AI assistance.
