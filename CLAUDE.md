# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:debug      # Start in debug mode with watch

# Build
npm run build            # Compile TypeScript to dist/

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run E2E tests (in /test directory)

# Code quality
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting
```

To run a single test file:
```bash
npx jest src/sellers/sellers.service.spec.ts
```

## Architecture

**NestJS modular monolith** with three separate database connections:

| Connection name | Type | Purpose |
|---|---|---|
| `postgresConnection` | PostgreSQL (vinku.net) | Primary app data: sellers, roles, queries, cash flow versions |
| `postgresConnectionPierce` | PostgreSQL (AWS RDS) | Read-only: piers/reports data |
| `mssqlConnection` | MSSQL (localhost:14330) | Dashboard analytics with long-running queries (5 min timeout) |

**Feature modules**: `AuthModule`, `SellersModule`, `DashboardModule`, `PiersModule`, `CashFlowVersionsModule`. The `QueryModule` exists but is currently commented out in `AppModule`.

**Standard module layout**:
```
src/<feature>/
  entities/       # TypeORM entities
  dto/            # class-validator DTOs
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.module.ts
```

## Key Patterns

**Database access**: Inject specific `DataSource` by connection name when you need raw SQL or multi-step transactions. Use `@InjectRepository(Entity, 'connectionName')` for repository access.

**Authentication**: JWT strategy with 1-year access tokens and 30-day refresh tokens. Use `@UseGuards(LocalAuthGuard)` on protected endpoints. Extract the current user with `@UserDecorator()` (custom decorator in `src/auth/`).

**Dynamic SQL**: `DashboardModule` and `PiersModule` execute parameterized raw SQL stored in `QueryModel` entities via `QueryRunner`. The `QueryModule` (disabled) manages these stored templates.

**Environment**: All database credentials and `SECRET_SEED` (JWT signing key) come from `.env`. TypeORM `synchronize: true` is active on the main and MSSQL connections — no migration files are used.

**Validation**: DTOs use `class-validator` decorators. The global validation pipe is enabled in `main.ts`.

## Deployment

Docker image targets port 3000 (Node 18 Alpine). `docker-compose.yml` exposes port 5050. The app reads `PORT` from the environment at startup.
