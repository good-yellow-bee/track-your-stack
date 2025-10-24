# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-10-23 - Phase 1 Security & UX Improvements

### Security

- **Global Security Headers:** Added CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy to all routes
- **NextAuth Cookie Hardening:** Implemented `__Secure-` prefix in production, explicit httpOnly, secure, and sameSite settings
- **Database Constraints:** Added unique constraints for Portfolio(userId, name) and Investment(portfolioId, ticker)
- **Rate Limiting:** Applied IP-based rate limiting to public API endpoints (health check: 20/min, test API: 5/min)
- **Production Data Minimization:** Health endpoint returns minimal info in production
- **Centralized Error Handling:** Created sanitization and logging system with Sentry integration support
- **PII Protection:** Automatic redaction of sensitive data (passwords, tokens, emails) from logs

### UI/UX

- **Chart Accessibility:** Added data-testid attributes and ARIA labels to all charts for E2E testing and screen readers
- **Mobile-Responsive Legends:** Improved chart legends with smaller text and tighter spacing on mobile devices
- **Interactive Highlighting:** Pie chart slices now highlight corresponding table rows on click (3-second auto-clear)
- **Visual Feedback:** Highlighted investment rows show blue background with ring border

### Logic & Precision

- **Decimal Arithmetic:** Portfolio calculations now use Decimal to prevent floating-point precision errors
- **Deterministic Sorting:** Best/worst performers use alphabetical tie-breaking for consistent results
- **Enhanced Validation:** Strengthened ticker (alphanumeric, 1-10 chars) and purchase date (ISO-8601, not future, not before 1900) validation
- **Concurrency Safety:** Investment creation handles P2002 (unique constraint violations) gracefully with automatic retry
- **Price Currency Tracking:** Price refresh now tracks and stores currency information (currentPriceCurrency field)
- **Smart Performance Ranking:** Only investments with current prices considered for best/worst performer calculation

### Developer Experience

- **Error Sanitization:** Production errors hide stack traces and sensitive details
- **Safe Logging:** safeLogger utility automatically sanitizes PII from log output
- **Better Error Messages:** User-friendly error messages with proper HTTP status codes
- **Type Safety:** Enhanced TypeScript types for price data with currency information

### Documentation

- Added `docs/security/phase1-improvements.md` with comprehensive improvement summary
- Updated security review checklist
- Documented migration requirements for database constraints

### Breaking Changes

- **Database Migration Required:** Run `pnpm prisma migrate dev --name add_unique_constraints` before deploying
- **Duplicate Data:** Migration will fail if duplicate portfolios (same user + name) or investments (same portfolio + ticker) exist
- **Cookie Names:** Production cookies now use `__Secure-` prefix (users will need to re-authenticate once)

### Migration Guide

1. Clean up any duplicate portfolios or investments in database
2. Run `pnpm prisma migrate dev --name add_unique_constraints`
3. Deploy application (users will be logged out once due to cookie name change)
4. Optional: Configure Sentry by setting `SENTRY_DSN` and `SENTRY_AUTH_TOKEN` environment variables

## [1.0.0] - 2025-10-21 - MVP Complete

### MVP Features (F01-F11)

### Added - F01: Project Setup & Configuration (2025-01-09)

#### Core Framework

- Next.js 15.5.4 with App Router and React 19
- TypeScript 5.x with strict mode enabled
- Tailwind CSS 3.4.18 with PostCSS and Autoprefixer
- shadcn/ui component system with 9 base components

#### Development Tools

- ESLint configuration with Next.js and TypeScript rules
- Prettier with Tailwind CSS plugin for consistent formatting
- TypeScript path aliases (@/\* pointing to root)
- Development scripts for build, lint, format, and typecheck

#### Dependencies Installed

**Production:**

- next@15.5.4
- react@19.2.0, react-dom@19.2.0
- @prisma/client@6.2.0
- next-auth@5.0.0-beta.25
- react-hook-form@7.54.2
- zod@3.24.1
- @tanstack/react-query@5.66.0
- clsx@2.1.1, tailwind-merge@2.7.0
- lucide-react@0.475.0
- recharts@2.15.1

**shadcn/ui Components:**

- button
- input
- label
- card
- dialog
- form
- select
- table
- dropdown-menu

**Development:**

- typescript@5.7.3
- @types/node@22.10.7, @types/react@19.0.8, @types/react-dom@19.0.3
- eslint@9.18.0, eslint-config-next@15.5.4
- prettier@3.4.2, prettier-plugin-tailwindcss@0.6.10
- tailwindcss@3.4.18, postcss@8.4.31, autoprefixer@10.4.20
- prisma@6.2.0

#### Project Structure

```
track-your-stack/
├── app/
│   ├── (auth)/auth/signin/
│   ├── (dashboard)/dashboard/
│   ├── (dashboard)/portfolios/[id]/
│   ├── api/auth/[...nextauth]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/              # 9 shadcn/ui components
│   ├── portfolio/       # Portfolio components (empty)
│   ├── investment/      # Investment components (empty)
│   └── layout/          # Layout components (empty)
├── lib/
│   ├── actions/         # Server Actions (empty)
│   ├── api/             # API clients (empty)
│   ├── calculations/    # Business logic (empty)
│   ├── constants.ts     # App constants
│   ├── utils.ts         # Utility functions
│   └── prisma.ts        # Prisma client (to be created)
├── prisma/              # Database schema (to be created)
├── types/               # TypeScript types (empty)
├── public/              # Static assets (empty)
└── claudedocs/          # Project documentation
```

#### Configuration Files Created

- `package.json` with all dependencies and scripts
- `tsconfig.json` with strict TypeScript configuration
- `tailwind.config.ts` with shadcn/ui theme
- `postcss.config.mjs` for Tailwind CSS processing
- `.eslintrc.json` with Next.js and TypeScript rules
- `.prettierrc` with code formatting rules
- `.prettierignore` to exclude generated files
- `next.config.ts` for Next.js configuration
- `components.json` for shadcn/ui configuration
- `.env.example` with environment variable template
- `.env.local` with actual environment variables (gitignored)

#### Quality Checks

- ✅ TypeScript compilation passing (pnpm typecheck)
- ✅ ESLint linting passing (pnpm lint)
- ✅ Prettier formatting passing (pnpm format:check)
- ✅ Production build successful (pnpm build)

#### Git Workflow

- Feature branch created: `feature/project-setup`
- Following git branching workflow (never commit to main)
- Ready for PR after documentation completion

### Technical Notes

- Tailwind CSS: Initially attempted v4.x but downgraded to v3.4.18 for shadcn/ui compatibility
- PostCSS: Uses standard Tailwind CSS 3.x plugin format
- Package Manager: pnpm for efficient dependency management
- Node Version: Compatible with Node.js 18.x and above

### Next Steps (F02)

- Database schema design with Prisma
- Authentication implementation with NextAuth.js
- User model and session management
