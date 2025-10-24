# Next Steps - Phase 1 Improvements Deployment

**Current Status:** ✅ Code complete, ready for migration and testing
**Version:** 1.1.0
**Date:** 2025-10-23

## Immediate Actions Required

### 1. Database Migration (REQUIRED before deployment)

The Prisma schema has been updated with unique constraints. You need to create and apply the migration:

```bash
# Ensure your .env.local has DATABASE_URL set
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/track_your_stack"

# Create and apply migration
pnpm prisma migrate dev --name add_unique_constraints

# This will:
# - Create migration file in prisma/migrations/
# - Apply unique constraints to Portfolio and Investment tables
# - Regenerate Prisma Client with updated types
```

**⚠️ Important:** If you have duplicate data, the migration will fail. See `docs/deployment/migration-guide.md` for cleanup queries.

### 2. Verify Changes Locally

```bash
# Run all quality checks
pnpm pre-push

# This runs:
# - Format check (Prettier)
# - Lint (ESLint)
# - Type check (TypeScript)
# - Unit tests (Vitest)
# - Build (Next.js)
```

### 3. Test the New Features

Start the development server and test:

```bash
pnpm dev
```

**Test checklist:**

- [ ] Sign in (verify new cookie settings work)
- [ ] Create a portfolio with duplicate name (should fail gracefully)
- [ ] Add investment with duplicate ticker (should aggregate correctly)
- [ ] Click pie chart slice (should highlight table row)
- [ ] Test ticker validation with invalid characters
- [ ] Test purchase date validation with future date
- [ ] Check `/api/health` endpoint (should return minimal info)
- [ ] Verify charts have proper ARIA labels (use screen reader or browser inspector)

### 4. Review Documentation

Read the new documentation:

- `IMPLEMENTATION_SUMMARY.md` - What was implemented
- `docs/security/phase1-improvements.md` - Detailed security improvements
- `docs/deployment/migration-guide.md` - How to run the migration
- `CHANGELOG.md` - v1.1.0 release notes

## Optional Actions (Recommended)

### 5. Add Unit Tests

Create tests for the new logic:

```bash
# Create test files
touch __tests__/unit/validation-enhanced.test.ts
touch __tests__/unit/decimal-calculations.test.ts
touch __tests__/unit/error-handler.test.ts
```

**Test coverage needed:**

- Enhanced ticker validation (alphanumeric, length)
- Purchase date validation (ISO-8601, range checks)
- Decimal arithmetic in portfolio calculations
- Error sanitization logic
- PII redaction in logs
- P2002 handling in investment creation

### 6. Update E2E Tests

Update E2E tests to use new `data-testid` selectors:

```typescript
// e2e/portfolio-crud.spec.ts
await page.click('[data-testid="portfolio-pie-chart"]')
await page.click('[data-testid="pie-segment-AAPL"]')
await expect(page.locator('[data-testid="investment-row-AAPL"]')).toHaveClass(/ring-2/)
```

### 7. Configure Sentry (Optional)

If you want production error tracking:

```bash
# Add to .env.local
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# Install Sentry SDK (if not already installed)
pnpm add @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs
```

## Deployment Workflow

### Step 1: Local Testing

```bash
# 1. Run migration
pnpm prisma migrate dev --name add_unique_constraints

# 2. Verify changes
pnpm dev

# 3. Run quality checks
pnpm pre-push

# 4. Test manually (see checklist above)
```

### Step 2: Commit and Push

```bash
# You're currently on: feature/f11-charts-visualizations
# First, pull latest changes
git pull origin feature/f11-charts-visualizations

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Phase 1 security, visual, and logic improvements

Security:
- Add global security headers (CSP, HSTS, etc.)
- Harden NextAuth cookies with __Secure- prefix
- Add database unique constraints
- Implement rate limiting on public endpoints
- Centralize error handling with PII sanitization

UI/UX:
- Add chart accessibility (ARIA, data-testid)
- Implement interactive chart-to-table highlighting
- Improve mobile-responsive legends

Logic:
- Use Decimal arithmetic for precision
- Enhance input validation (tickers, dates)
- Handle concurrency with P2002 retry
- Track price currency information

Docs:
- Add comprehensive security documentation
- Create migration guide
- Update CHANGELOG for v1.1.0"

# Push to remote
git push origin feature/f11-charts-visualizations
```

### Step 3: Create Pull Request

```bash
# Using GitHub CLI
gh pr create \
  --title "feat: Phase 1 Security, Visual, and Logic Improvements (v1.1.0)" \
  --body "$(cat <<'EOF'
## What does this PR do?

Implements comprehensive security hardening, visual accessibility improvements, and logic enhancements after completing Phase 1 MVP (F01-F11).

## Changes Summary

### Security (7 improvements)
- Global security headers (CSP, HSTS, XFO, etc.)
- NextAuth cookie hardening with __Secure- prefix
- Database unique constraints
- Rate limiting on public endpoints
- Production data minimization
- Centralized error handling with Sentry support
- PII sanitization in logs

### UI/UX (2 improvements)
- Chart accessibility (ARIA, data-testid)
- Interactive chart-to-table highlighting

### Logic (5 improvements)
- Decimal arithmetic for precision
- Enhanced validation (tickers, dates)
- Concurrency safety (P2002 handling)
- Price currency tracking
- Smart performance ranking

### Documentation (3 items)
- Security improvements guide
- Migration guide
- Updated CHANGELOG

## Type of change

- [x] Security improvements
- [x] UI/UX enhancements
- [x] Logic improvements
- [x] Documentation

## Breaking Changes

⚠️ **Database migration required** - Run `pnpm prisma migrate dev --name add_unique_constraints`
⚠️ **Users will be logged out once** - Cookie name change in production

## Checklist

- [x] Code changes complete
- [x] No linting errors
- [x] No TypeScript errors
- [x] Documentation updated
- [x] CHANGELOG updated
- [ ] Database migration run (requires DATABASE_URL)
- [ ] Unit tests added (recommended before prod)
- [ ] E2E tests updated (recommended before prod)

## Testing Performed

- ✅ All files pass linting
- ✅ TypeScript compilation successful
- ⏳ Manual testing pending (requires DATABASE_URL)
- ⏳ Unit tests pending
- ⏳ E2E tests pending

## References

- `IMPLEMENTATION_SUMMARY.md` - Full implementation details
- `docs/security/phase1-improvements.md` - Security improvements
- `docs/deployment/migration-guide.md` - Migration instructions
- `CHANGELOG.md` - v1.1.0 release notes
EOF
)"
```

### Step 4: After PR Approval

```bash
# Merge via GitHub interface
# Then update local main branch
git checkout main
git pull origin main
git branch -d feature/f11-charts-visualizations
```

### Step 5: Deploy to Staging

```bash
# Run migration on staging database
DATABASE_URL="postgresql://staging..." pnpm prisma migrate deploy

# Deploy to staging (Vercel)
vercel --prod --scope=staging

# Verify staging deployment
curl https://staging.track-your-stack.vercel.app/api/health
# Expected: {"status":"ok"}
```

### Step 6: Deploy to Production

```bash
# Backup production database first!
pg_dump $PRODUCTION_DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration on production
DATABASE_URL="postgresql://production..." pnpm prisma migrate deploy

# Deploy to production
vercel --prod

# Monitor for 30 minutes
# - Check error rates
# - Verify health endpoint
# - Monitor user sign-ins
```

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

**Solution:** Create `.env.local` file:

```bash
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/track_your_stack"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
EOF
```

### "Unique constraint violation during migration"

**Solution:** Clean up duplicate data first (see `docs/deployment/migration-guide.md`)

### "Users can't sign in after deployment"

**Cause:** Cookie name changed to `__Secure-` prefix in production

**Solution:** This is expected. Users need to sign in once. Clear browser cookies if issues persist.

## Success Criteria

✅ All improvements implemented
✅ Zero linting errors
✅ Documentation complete
⏳ Migration run successfully (pending DATABASE_URL)
⏳ All tests passing (pending DATABASE_URL)
⏳ Staging deployment successful
⏳ Production deployment successful

## Questions?

- Review `IMPLEMENTATION_SUMMARY.md` for what was done
- Check `docs/deployment/migration-guide.md` for migration help
- See `docs/security/phase1-improvements.md` for security details
- Read `CHANGELOG.md` for breaking changes

---

**Status:** Ready for migration and deployment
**Blockers:** DATABASE_URL environment variable required
**Estimated Time to Deploy:** 30 minutes (including testing)
