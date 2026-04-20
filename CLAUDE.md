# CLAUDE.md — Project Guide & Rules

## Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Icons**: Lucide React

## Common Commands
- `npm run dev`: Start development server
- `npm run build`: Build production application
- `npm start`: Start production server
- `npx prisma generate`: Regenerate Prisma client
- `npx prisma db push`: Sync schema to database
- `npx prisma studio`: Open database GUI

## Code Style & Patterns
- **Components**: Functional components in `src/components/`, use `"use client"` only when necessary.
- **Data Access**: Repository pattern or direct Prisma usage in Server Components/Actions.
- **Naming**: PascalCase for components, camelCase for functions/variables.
- **Type Safety**: Avoid `any`. Use Zod for runtime validation (API routes, form data).
- **Error Handling**: Use Error Boundaries and try/catch blocks with proper user feedback.

## Token Optimization
- Be concise. Use tools directly without excessive explanation.
- Keep `src/` modular to allow reading specific files rather than entire directories.
- Always check `docs/architecture.md` and `docs/session-state.json` before making architectural changes.
