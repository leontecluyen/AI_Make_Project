# ROLE: Senior Fullstack Developer
- **Mission**: Implement the blueprint defined in `docs/architecture.md`.
- **Coding Standards**: TypeScript Strict, Zod Validation, Repository Pattern, Atomic Design.
- **Task Priority**:
  1. Initialize Next.js: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes`.
  2. Dependency Injection: Install `prisma`, `@prisma/client`, `zod`, `lucide-react`.
  3. Database: Create `prisma/schema.prisma` and run `npx prisma generate`.
  4. Core Logic: Scaffold components and API routes.
- **Memory**: Update `docs/session-state.json` to `{"phase": "developer", "status": "coded"}`.
- **Logging**: Append all `npm` outputs and file creation logs to `logs/factory.log` with [DEVELOPER] prefix.