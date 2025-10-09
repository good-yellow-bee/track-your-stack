# Track Your Stack Documentation

This directory contains living documentation that evolves with the codebase.

## 🤖 For Documentation Agents

When running in parallel with development:

1. **Monitor code changes** in real-time
2. **Update relevant documentation** immediately after features are implemented
3. **Capture screenshots** of UI changes right after implementation
4. **Add code examples** from actual implementation (not pseudo-code)
5. **Update changelog.md** for every significant change

## Documentation Structure

### `/user-guide`

End-user documentation with screenshots showing how to use the application.

**Files:**

- `getting-started.md` - First-time user onboarding
- `managing-portfolios.md` - Portfolio CRUD operations
- `adding-investments.md` - Investment management
- `screenshots/` - UI screenshots with descriptive names

### `/api`

Technical documentation for developers working with the codebase.

**Files:**

- `authentication.md` - NextAuth.js implementation details
- `server-actions.md` - All Server Actions with signatures and examples
- `alpha-vantage-integration.md` - External API integration

### `/architecture`

System design, database schema, and calculation logic.

**Files:**

- `database-schema.md` - Prisma schema with ERD diagrams
- `calculation-logic.md` - Business logic formulas and implementations
- `diagrams/` - Architecture diagrams (ERD, sequence, flow)

### `/changelog.md`

Chronological record of all changes, following Keep a Changelog format.

## Documentation Standards

### Screenshots

1. **When to capture:**
   - Immediately after implementing any UI feature
   - When UI changes significantly
   - Before and after states for modifications

2. **Naming convention:**

   ```
   [feature]-[state].png

   Examples:
   - signin-page.png
   - dashboard-overview.png
   - create-portfolio-form.png
   - add-investment-modal-filled.png
   - portfolio-chart-pie.png
   ```

3. **Guidelines:**
   - Use 1920x1080 resolution
   - PNG format for clarity
   - Annotate screenshots when helpful
   - Show realistic data, not lorem ipsum

### Code Examples

1. **Use actual implementation code:**

   ```typescript
   // ✅ GOOD - Actual code from implementation
   export async function createPortfolio(name: string, baseCurrency: string) {
     const session = await getServerSession()
     // ... actual implementation
   }
   ```

   ```typescript
   // ❌ BAD - Pseudo-code or placeholder
   export async function createPortfolio() {
     // Implementation here
   }
   ```

2. **Include context:**
   - File path where code lives
   - Import statements if relevant
   - Usage examples

### Changelog Format

```markdown
## [0.1.0] - 2025-10-09

### Added

- Authentication with Google OAuth ([docs/api/authentication.md](api/authentication.md))
  - Screenshot: ![Sign-in page](user-guide/screenshots/signin-page.png)
- Portfolio creation and management
  - CRUD operations for portfolios
  - Base currency selection (USD, EUR, GBP)

### Changed

- Updated database schema to include `baseCurrency` field

### Fixed

- Fixed session persistence issue on page refresh
```

## Keeping Documentation Fresh

### Triggers for Updates

Update documentation when:

- ✅ New feature is implemented
- ✅ UI changes are made
- ✅ Database schema is modified
- ✅ API endpoints are added/changed
- ✅ Business logic is updated
- ✅ Bugs are fixed (document the fix)
- ✅ Environment variables are added
- ✅ Dependencies are upgraded (if breaking changes)

### What NOT to Document

- ❌ Temporary debug code
- ❌ Work-in-progress features
- ❌ Private implementation details (unless architecturally significant)
- ❌ Auto-generated code (Prisma client, etc.)

## For Manual Updates

If updating documentation manually (not via agent):

1. Check if related screenshots need updating
2. Verify code examples still match implementation
3. Update "Last Updated" date at bottom of file
4. Add entry to changelog.md
5. Test all code examples still work

## Documentation Review Checklist

Before considering documentation complete for a feature:

- [ ] User guide updated with screenshots
- [ ] API documentation includes actual code
- [ ] Architecture docs reflect implementation
- [ ] Changelog entry added
- [ ] All screenshots are clear and properly named
- [ ] Code examples are tested and work
- [ ] Links between documents are valid

## Questions?

Refer to the main [CLAUDE.md](../CLAUDE.md) file for overall project guidance.
