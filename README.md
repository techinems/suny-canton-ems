# SUNY Canton EMS Portal

The SUNY Canton EMS Portal is a full-stack application for EMS organizations to manage certifications, calls, inventory, buildings, and member records in one place. It provides a unified workflow so coordinators can keep compliance data, incident logs, and readiness metrics up to date without juggling spreadsheets.

## Why It Exists
- Centralize operational data (members, certifications, equipment, buildings).
- Track call history with structured forms, status, and notes.
- Surface expiring certifications and low inventory before they become issues.
- Provide a secure self-service dashboard for members to review their profile and training status.

## Key Features
- **Dashboards** with stats cards, recent call feeds, and certification alerts.
- **Certification tracking** with renewal reminders and card previews.
- **Call logging** for incident details, crew members, and outcomes.
- **Inventory management** including quantity thresholds and usage stats.
- **Member management** with profile photos, role assignments, and contact info.
- **Building registry** for station locations, apparatus bays, and notes.
- **Authentication** with registration, login, profile editing, and password reset flows.

## Tech Stack
- `Next.js 15` App Router for combined frontend/backend routes.
- `React 19` with server components where possible.
- `Mantine 8` UI library plus Tabler icons for consistent styling.
- `Prisma` ORM with a PostgreSQL-compatible database.
- `NextAuth`-style custom auth helpers (see `src/lib/auth*`).

## Repo Layout
- `src/app` – App Router routes, including `/dashboard/*` sections and API routes.
- `src/components` – Mantine-based UI building blocks (forms, tables, stats cards).
- `src/lib` – Prisma client, auth helpers, shared utilities, and client/server services.
- `prisma` – Schema and migrations for members, certifications, inventory, and file storage.

## Getting Started
1. **Install dependencies**
	```bash
	npm install
	```
2. **Set environment variables** – copy `.env.example` to `.env.local` and fill in database URL, auth secrets, SMTP credentials, and any storage providers.
3. **Generate Prisma client**
	```bash
	npx prisma generate
	```
4. **Apply migrations** (creates local database schema)
	```bash
	npx prisma migrate dev --name init
	```
5. **Start the dev server**
	```bash
	npm run dev
	```
6. Open `http://localhost:3000` and sign up for an account via `/register` or seed an admin user through Prisma Studio (`npx prisma studio`).

## Available Scripts
- `npm run dev` – start Next.js in development mode with hot reloading.
- `npm run build` – create an optimized production build.
- `npm start` – run the compiled production server.
- `npm run lint` – lint source files via `next lint` and the unified ESLint config.

## Deployment
The project ships as a standard Next.js application. Deploy to Vercel or any platform that supports Node.js 18+:
1. Configure production environment variables (database, auth secrets, SMTP).
2. Run `npm run build` as the CI build step.
3. Run migrations during deployment (`npx prisma migrate deploy`).
4. Start the Next.js server with `npm start` or the platform's Next.js adapter.

## Contributing
Open issues or submit pull requests for bug fixes and feature requests. Please include database migration files when modifying the Prisma schema and add relevant tests where possible.
