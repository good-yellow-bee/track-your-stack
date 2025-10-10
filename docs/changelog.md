# Changelog

All notable changes to Track Your Stack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **F03: Authentication System** ([#PR-TBD](../docs/features/authentication.md))
  - NextAuth.js v5 (Auth.js) integration with database sessions
  - Google OAuth provider for one-click sign-in
  - Protected route middleware for dashboard and portfolio pages
  - User navigation component with profile dropdown and sign-out
  - Session management with 30-day expiry
  - Type-safe session extensions with user ID
  - Responsive sign-in page with feature highlights
  - Auto-redirect for authenticated users
  - Helper functions for server/client authentication checks

- **F02: Database Schema** ([#10](https://github.com/good-yellow-bee/track-your-stack/pull/10))
  - Prisma schema with User, Portfolio, Investment, Transaction models
  - NextAuth.js database adapter tables (Account, Session, VerificationToken)
  - Multi-currency support with ISO 4217 currency codes
  - Asset type enum (Stock, ETF, Mutual Fund, Cryptocurrency)
  - Transaction tracking for purchase/sale history
  - User data isolation with cascade delete
  - Database indexes for optimized queries

- Initial project structure with Next.js 15, TypeScript, Tailwind CSS
- Documentation framework with feature docs, architecture, and user guides

### Changed

### Deprecated

### Removed

### Fixed

### Security

- CSRF protection via NextAuth.js HTTP-only cookies
- Session tokens stored in HTTP-only cookies (XSS prevention)
- User data isolation with mandatory ownership checks
- Minimal OAuth scopes (openid, email, profile only)

---

## Documentation Agent Instructions

When features are implemented, add entries here following this format:

```markdown
## [Version] - YYYY-MM-DD

### Added

- Feature description with link to relevant docs
- Include screenshots in user-guide when applicable

### Changed

- What was modified and why

### Fixed

- Bug fixes with issue references
```
