# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Track Your Stack** is an investment portfolio tracking application built with Next.js 15, TypeScript, and PostgreSQL. It allows users to monitor investments across multiple portfolios with real-time price updates via Alpha Vantage API, supporting stocks, ETFs, mutual funds, and cryptocurrency with multi-currency conversion.

**Tech Stack:**

- Frontend: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Next.js Server Actions + API Routes
- Database: PostgreSQL via Prisma ORM
- Authentication: NextAuth.js v5 (Google OAuth)
- Market Data: Alpha Vantage API
- Deployment: Vercel

## 🚨 CRITICAL: Documentation Workflow

**⚠️ ALWAYS RUN PARALLEL DOCUMENTATION AGENT DURING CODING**

When implementing ANY feature or making significant changes:

1. **Launch Documentation Agent in Parallel:**

   ```
   Launch a general-purpose agent to maintain documentation while you code
   ```

2. **Documentation Agent Responsibilities:**
   - Monitor all code changes in real-time
   - Update documentation in `/docs` directory as features are implemented
   - Capture screenshots of UI changes immediately after implementation
   - Document API changes, new components, database migrations
   - Update architecture diagrams when structure changes

3. **Documentation Structure:**

   ```
   docs/
   ├── user-guide/
   │   ├── getting-started.md
   │   ├── managing-portfolios.md
   │   ├── adding-investments.md
   │   └── screenshots/
   │       ├── dashboard-overview.png
   │       ├── add-investment-form.png
   │       └── portfolio-chart.png
   ├── api/
   │   ├── authentication.md
   │   ├── server-actions.md
   │   └── alpha-vantage-integration.md
   ├── architecture/
   │   ├── database-schema.md
   │   ├── calculation-logic.md
   │   └── diagrams/
   └── changelog.md
   ```

4. **Documentation Requirements:**
   - **Descriptions + Screenshots:** Every UI feature MUST have both written explanation and visual screenshots
   - **Live Updates:** Documentation evolves with code - never leave it stale
   - **Code Examples:** Include actual code snippets from the implementation
   - **Architecture Changes:** Document WHY decisions were made, not just WHAT

5. **Screenshot Guidelines:**
   - Take screenshots immediately after implementing UI features
   - Use consistent browser window size (1920x1080 recommended)
   - Annotate screenshots to highlight key features when helpful
   - Name screenshots descriptively: `feature-name-state.png`
   - Store in appropriate `/docs/*/screenshots/` directory

**Example Workflow:**

```
Developer Agent: Implements portfolio creation form
Documentation Agent (Parallel):
  1. Updates docs/user-guide/managing-portfolios.md
  2. Takes screenshot of the new form
  3. Adds code example of the Server Action
  4. Updates changelog.md with feature addition
```

**Why This Matters:**

- Documentation decay is the #1 cause of project maintainability issues
- Future Claude instances need accurate docs to understand the codebase
- Screenshots prevent "works on my machine" confusion
- Real-time documentation prevents forgetting implementation details

## 🚨 CRITICAL: Git Branching Workflow

**⚠️ NEVER COMMIT DIRECTLY TO MAIN BRANCH - ALWAYS USE FEATURE BRANCHES**

```
╔═══════════════════════════════════════════════════════════════╗
║  🚫 STOP! READ THIS BEFORE MAKING ANY CHANGES 🚫             ║
║                                                               ║
║  ✅ CORRECT WORKFLOW:                                        ║
║     1. git checkout -b feature/your-feature                  ║
║     2. Make changes                                          ║
║     3. Commit and push                                       ║
║     4. Create Pull Request                                   ║
║     5. Merge via GitHub (after approval)                     ║
║                                                               ║
║  ❌ WRONG: git checkout main → make changes → commit         ║
║                                                               ║
║  This applies to EVERYTHING:                                 ║
║  • Features • Bug fixes • Documentation • Refactoring        ║
║  • Tests • Configuration • EVERYTHING                        ║
╚═══════════════════════════════════════════════════════════════╝
```

**WHY THIS RULE EXISTS:**

- ✅ Enables code review and quality control
- ✅ Maintains clean, reversible history
- ✅ Allows CI/CD validation before merge
- ✅ Prevents accidental main branch corruption
- ✅ Facilitates team collaboration and parallel work
- ✅ Creates clear audit trail for all changes

Before implementing ANY feature, follow this mandatory workflow:

**📋 PRE-PUSH QUALITY GATE WORKFLOW:**

```
┌─────────────────────────────────────────────────────────┐
│ Ready to push code?                                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
           ┌───────────────┐
           │ Run pnpm      │
           │ pre-push      │
           └───────┬───────┘
                   │
         ┌─────────▼─────────┐
         │ All checks pass?  │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │       NO          │ ◄────────────┐
         └─────────┬─────────┘              │
                   │                        │
                   ▼                        │
         ┌─────────────────────┐            │
         │ Fix the failures:   │            │
         │ • pnpm format       │            │
         │ • pnpm lint --fix   │            │
         │ • Fix type errors   │            │
         │ • Fix failing tests │            │
         │ • Fix build errors  │            │
         └─────────┬───────────┘            │
                   │                        │
                   └────────────────────────┘

         ┌─────────▼─────────┐
         │       YES         │
         └─────────┬─────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ ✅ SAFE TO PUSH     │
         │ git push origin ... │
         └─────────────────────┘
```

**🚨 NEVER skip pre-push checks. NEVER push failing code.**

### 1. Create Feature Branch

```bash
# Before starting any feature
git checkout main
git pull origin main
git checkout -b feature/<feature-name>

# Examples:
git checkout -b feature/authentication
git checkout -b feature/portfolio-crud
git checkout -b feature/investment-aggregation
git checkout -b fix/price-cache-bug
```

### 2. Implement Feature

- Work on the feature branch
- **🚨 CRITICAL: Run `pnpm pre-push` before EVERY commit** (not just before pushing)
- Fix any quality check failures before committing
- Commit frequently with descriptive messages
- Keep commits atomic (one logical change per commit)

```bash
# ALWAYS run quality checks BEFORE committing
pnpm pre-push

# If all checks pass, commit changes
git add <files>
git commit -m "feat: implement portfolio creation form

- Add CreatePortfolioForm component
- Create portfolio Server Action
- Add form validation with Zod
- Update documentation and screenshots"
```

**⚠️ This applies to ALL commits:**

- Code changes
- Tests
- Documentation (including CLAUDE.md)
- Configuration files
- **EVERYTHING**

Running `pnpm pre-push` locally prevents CI failures and ensures professional quality standards.

### 3. Test Thoroughly

**🚨 MANDATORY: Run Quality Checks Before Every Push**

Before pushing code or creating a PR, you MUST run the same quality checks that CI/CD will run:

```bash
# Run all quality checks (same as CI pipeline)
pnpm pre-push

# This runs in sequence:
# 1. Format Check (Prettier)  ✓
# 2. Lint (ESLint)            ✓
# 3. Type Check (TypeScript)  ✓
# 4. Unit Tests (Vitest)      ✓
# 5. Build (Next.js)          ✓
```

**If any check fails, FIX IT before pushing. Do NOT push failing code.**

**Manual verification checklist:**

- [ ] `pnpm pre-push` passes with no errors
- [ ] Feature works as expected in `pnpm dev`
- [ ] New tests added for new functionality
- [ ] No console errors in browser
- [ ] Documentation updated (if applicable)
- [ ] Screenshots captured (if UI changes)

**Optional: Run E2E tests locally** (if you have authentication setup):

```bash
pnpm test:e2e
```

**Quick fixes for common failures:**

```bash
# Format failures → Auto-fix
pnpm format

# Lint failures → Auto-fix (some)
pnpm lint --fix

# Type failures → Fix manually based on errors
pnpm typecheck

# Test failures → Fix tests or implementation
pnpm test

# Build failures → Fix based on error messages
pnpm build
```

### 4. Push and Create Pull Request

```bash
# Only after all tests pass
git push origin feature/<feature-name>

# Create Pull Request via GitHub CLI
gh pr create --title "feat: <feature-name>" --body "Description of changes..."

# OR create PR manually on GitHub web interface
# Visit: https://github.com/yourusername/track-your-stack/pull/new/feature/<feature-name>
```

**Pull Request Description Template:**

```markdown
## What does this PR do?

Brief description of the feature/fix

## Type of change

- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring

## Checklist

- [ ] Tests pass locally
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Documentation updated
- [ ] Screenshots captured (if UI changes)
- [ ] Changelog updated

## Screenshots (if applicable)

[Add screenshots here]

## Testing performed

- Describe testing steps
```

### 5. After PR Approval - Merge to Main

```bash
# After PR is reviewed and approved on GitHub
# Merge via GitHub interface (recommended) OR:

git checkout main
git pull origin main
git branch -d feature/<feature-name>

# Remote branch will be deleted automatically via GitHub
```

### Branch Naming Conventions

- `feature/<name>` - New features
- `fix/<name>` - Bug fixes
- `refactor/<name>` - Code refactoring
- `docs/<name>` - Documentation updates
- `test/<name>` - Test additions/fixes
- `chore/<name>` - Build, dependencies, etc.

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build, dependencies, CI

**Examples:**

```bash
git commit -m "feat(auth): implement Google OAuth login"
git commit -m "fix(portfolio): resolve currency conversion rounding error"
git commit -m "docs: add investment calculation examples"
git commit -m "test(investment): add unit tests for average cost basis"
```

### Emergency Hotfix Workflow

For critical production bugs:

```bash
git checkout main
git checkout -b hotfix/<issue>
# Fix the issue
# Test thoroughly
git checkout main
git merge hotfix/<issue>
git push origin main
git tag -a v1.0.1 -m "Hotfix: <description>"
git push origin v1.0.1
```

## CI/CD Pipeline

### Automated Quality Checks

Every pull request triggers automated quality checks via GitHub Actions. The CI pipeline ensures no broken code reaches the main branch.

**CI Workflow** (`.github/workflows/ci.yml`):

```yaml
Quality Checks Pipeline:
├── Lint (ESLint)           ✅ Code style and best practices
├── TypeCheck (TypeScript)  ✅ Type safety verification
├── Format (Prettier)       ✅ Code formatting standards
├── Build (Next.js)         ✅ Production build verification
├── Test (Vitest/Jest)      ⏭️ Unit tests (when configured)
└── E2E (Playwright)        ⏭️ End-to-end tests (when configured)
```

**How It Works:**

1. **On PR Creation/Update:** All checks run automatically in parallel
2. **Status Checks:** Results appear on the PR page
3. **Merge Protection:** PR cannot be merged if any check fails
4. **Local Preview:** Run same checks locally before pushing:
   ```bash
   pnpm lint && pnpm typecheck && pnpm format:check && pnpm build
   ```

### Current Quality Gates

**✅ Active Checks:**

- **ESLint:** `pnpm lint` - Enforces code quality rules
- **TypeScript:** `pnpm typecheck` - Ensures type safety
- **Prettier:** `pnpm format:check` - Verifies code formatting
- **Build:** `pnpm build` - Confirms production build succeeds

**⏭️ Placeholder Checks (Future):**

- **Unit Tests:** `pnpm test` - Runs when test framework installed
- **E2E Tests:** `pnpm test:e2e` - Runs when Playwright configured
- Both checks auto-skip if not configured, but activate automatically once installed

### Adding Test Framework

When you're ready to add tests, the CI pipeline will automatically detect and run them:

**For Unit Tests (Vitest recommended):**

```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react

# Create vitest.config.ts
# Update package.json "test" script to: "vitest"
# CI will automatically start running tests on every PR
```

**For E2E Tests (Playwright):**

```bash
# Install Playwright
pnpm add -D @playwright/test

# Initialize Playwright
pnpm create playwright

# Update package.json "test:e2e" script to: "playwright test"
# CI will automatically start running E2E tests on every PR
```

### GitHub Actions Workflows

**1. CI Quality Checks** (`.github/workflows/ci.yml`)

- **Trigger:** Every PR to main/develop
- **Purpose:** Automated quality verification
- **Duration:** ~3-5 minutes (with caching)
- **Required:** Yes - blocks PR merge if fails

**2. Claude Code Review** (`.github/workflows/claude-code-review.yml`)

- **Trigger:** Every PR creation/update
- **Purpose:** AI-powered code review feedback
- **Required:** No - advisory only

**3. Claude Code Assistant** (`.github/workflows/claude.yml`)

- **Trigger:** @claude mentions in comments
- **Purpose:** On-demand AI assistance
- **Required:** No - interactive help

### CI Performance Optimizations

**Caching Strategy:**

- pnpm dependencies cached across jobs
- Next.js build cache preserved
- Playwright browsers cached when installed

**Parallel Execution:**

- All quality checks run simultaneously
- Typical runtime: 3-5 minutes
- No sequential dependencies between jobs

**Smart Skipping:**

- Test jobs check if framework installed before running
- Prevents CI failures when tests not yet configured
- Zero configuration needed - auto-detects setup

### Troubleshooting CI Failures

**ESLint Failures:**

```bash
# Fix locally
pnpm lint --fix

# Verify
pnpm lint
```

**TypeScript Failures:**

```bash
# Check errors
pnpm typecheck

# Common fixes: update types, fix imports, add type annotations
```

**Prettier Failures:**

```bash
# Auto-fix formatting
pnpm format

# Verify
pnpm format:check
```

**Build Failures:**

```bash
# Test build locally
pnpm build

# Check .env.local has all required variables
# CI uses placeholder values for build-time validation
```

### Future Enhancements

**Planned Additions:**

- Test coverage reporting (Codecov)
- Security scanning (npm audit, Snyk)
- Bundle size tracking
- Performance budgets
- Preview deployments with smoke tests
- Automated dependency updates (Dependabot)

## Essential Commands

### Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Format code
pnpm format
```

### Database Operations

```bash
# Generate Prisma Client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name <migration_name>

# Apply migrations to production
pnpm prisma migrate deploy

# Push schema changes (development only)
pnpm prisma db push

# Open Prisma Studio (database GUI)
pnpm prisma studio

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests with Playwright
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui
```

## Project Architecture

### Key Architectural Patterns

**Server Components First:** Default to React Server Components for data fetching and rendering. Use Client Components (`'use client'`) only when needed for interactivity, browser APIs, or React hooks.

**Server Actions for Mutations:** All data mutations (create, update, delete) use Next.js Server Actions with `'use server'` directive. These provide type-safe mutations without separate API endpoints.

**API Routes for External Calls:** Use API routes (`app/api/*`) only for:

- Webhook handlers
- Background jobs (cron)
- Third-party API proxies requiring rate limiting
- OAuth callbacks

**Data Fetching Pattern:**

```typescript
// Server Component - direct database access
export default async function PortfolioPage({ params }: { params: { id: string } }) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: params.id },
    include: { investments: true }
  })

  return <PortfolioView portfolio={portfolio} />
}

// Server Action - for mutations
'use server'
export async function createInvestment(formData: FormData) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Validate, then create
  await prisma.investment.create({ data: { ... } })
  revalidatePath('/portfolios/[id]')
}
```

**Authentication Guard:** All portfolio/investment operations MUST verify user ownership:

```typescript
// ALWAYS check authorization
const portfolio = await prisma.portfolio.findUnique({
  where: { id: portfolioId },
  select: { userId: true },
})

if (portfolio?.userId !== session.user.id) {
  throw new Error('Forbidden')
}
```

### Directory Structure

```
app/
├── (auth)/                    # Unauthenticated routes
│   └── auth/signin/          # Sign-in page
├── (dashboard)/              # Authenticated routes
│   ├── dashboard/            # Main dashboard
│   └── portfolios/[id]/      # Portfolio detail pages
├── api/                      # API routes
│   ├── auth/[...nextauth]/  # NextAuth handlers
│   └── cron/                # Background jobs
└── layout.tsx               # Root layout

components/
├── ui/                      # shadcn/ui components
├── portfolio/               # Portfolio-specific components
├── investment/              # Investment-specific components
└── layout/                  # Layout components

lib/
├── actions/                 # Server Actions
│   ├── portfolio.ts        # Portfolio mutations
│   └── investment.ts       # Investment mutations
├── api/                    # External API clients
│   └── alphaVantage.ts    # Alpha Vantage client
├── calculations/           # Business logic
│   ├── investment.ts      # Investment calculations
│   ├── currency.ts        # Currency conversion
│   └── portfolio.ts       # Portfolio aggregations
├── prisma.ts              # Prisma client singleton
└── auth.ts                # Auth utilities

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Migration history
```

## Core Business Logic

### Average Cost Basis Calculation

When a user adds multiple purchases of the same ticker, the system aggregates them using weighted average:

```typescript
// Existing: 10 shares @ $150 = $1,500 total cost
// New: 5 shares @ $160 = $800 total cost
// Result: 15 shares @ $153.33 average

const newTotalQuantity = existingQty + newQty
const newTotalCost = existingQty * existingAvg + newQty * newPrice
const newAverageCostBasis = newTotalCost / newTotalQuantity
```

**Implementation:** See `lib/calculations/investment.ts`

### Multi-Currency Conversion

All portfolio values convert to the portfolio's base currency for accurate aggregation:

```typescript
// 1. Get exchange rate (from cache or Alpha Vantage)
const rate = await getExchangeRate(investmentCurrency, baseCurrency)

// 2. Convert both cost and current value
const currentValueInBase = currentPrice * quantity * rate
const totalCostInBase = avgCostBasis * quantity * rate

// 3. Calculate gains/loss in base currency
const gainLoss = currentValueInBase - totalCostInBase
```

**Implementation:** See `lib/calculations/currency.ts`

### Price Caching Strategy

Alpha Vantage API has strict limits (500 calls/day, 5 calls/minute), so aggressive caching is essential:

- **Stock/ETF:** 15 minutes during market hours, 1 hour after close
- **Crypto:** 5 minutes (24/7 markets)
- **Currency rates:** 1 hour

Prices stored in `investments.currentPrice` and `investments.priceUpdatedAt`. Check cache freshness before making API calls.

**Implementation:** See `lib/api/alphaVantage.ts`

## Database Schema Key Points

### Investment Aggregation

The `investments` table stores **aggregated** data:

- `totalQuantity`: Sum of all purchases for this ticker
- `averageCostBasis`: Weighted average cost per unit
- `purchaseCurrency`: Currency of purchase (may differ from portfolio base currency)

Individual purchases are preserved in `purchase_transactions` for recalculation if user edits/deletes.

### User Data Isolation

All tables connect to `users` via foreign keys with `onDelete: Cascade`:

```prisma
model Portfolio {
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Security Rule:** Always filter by `userId` from session before any database operation.

## Authentication Pattern

NextAuth.js v5 with Google OAuth. Session management uses database adapter.

**Important:** This project uses **layout-based authentication** instead of middleware. This is because Next.js 15 middleware runs on edge runtime, which doesn't support Prisma Client without additional configuration (Prisma Accelerate or Driver Adapters).

**Protected Routes via Layout:**

```typescript
// app/(dashboard)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return <>{children}</>
}
```

**Benefits of Layout-Based Authentication:**

- ✅ Runs in Node.js runtime (full Prisma support)
- ✅ More granular control over protected routes
- ✅ Better performance (no middleware overhead for public routes)
- ✅ Easier to debug and maintain

**Getting Session in Server Components:**

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const session = await getServerSession(authOptions)
if (!session?.user?.id) redirect('/auth/signin')
```

## Toast Notification Patterns

This project uses **Sonner** via shadcn/ui for user feedback notifications. All toast notifications are managed through centralized utility helpers for consistency.

### Architecture

- **Global Setup:** Toaster component in `app/layout.tsx` (top-right position)
- **Utility Helpers:** `lib/utils/toast.ts` - Type-safe notification functions
- **Server Actions:** Return `ActionResult<T>` with success/error messages
- **Client Components:** Call toast helpers based on Server Action results
- **Error Boundaries:** Automatic toast on uncaught errors

### Toast Utility API

All notifications use the centralized `toasts` object from `lib/utils/toast.ts`:

```typescript
import { toasts } from '@/lib/utils/toast'

// Portfolio operations
toasts.portfolio.created() // "Portfolio created successfully"
toasts.portfolio.updated() // "Portfolio updated"
toasts.portfolio.deleted() // "Portfolio deleted"
toasts.portfolio.createError() // "Failed to create portfolio"

// Investment operations
toasts.investment.added('AAPL') // "AAPL added to portfolio"
toasts.investment.aggregated('AAPL', 10) // "AAPL: 10 shares aggregated"
toasts.investment.removed('AAPL') // "AAPL removed from portfolio"

// Price refresh with loading state
toasts.prices.refreshing() // Loading toast with ID
toasts.prices.refreshed(5) // "5 prices updated"
toasts.prices.failed() // Error toast

// Generic operations
toasts.success('Custom success message')
toasts.error('Custom error message')
toasts.loading('Processing...')

// Common errors
toasts.authError() // "Authentication required"
toasts.forbidden() // "You don't have permission..."
toasts.rateLimitError() // "API rate limit exceeded..."

// Form validation
toasts.validation.required('Portfolio name')
toasts.validation.mustBePositive('Quantity')
```

### Server Action Pattern

Server Actions return structured results for consistent client-side handling:

```typescript
// lib/actions/portfolio.ts
'use server'

type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export async function createPortfolio(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const portfolio = await prisma.portfolio.create({
      /* ... */
    })
    revalidatePath('/dashboard')
    return {
      success: true,
      data: { id: portfolio.id },
      message: 'Portfolio created successfully',
    }
  } catch (error) {
    return { success: false, error: 'Failed to create portfolio' }
  }
}
```

### Client Component Integration

Client components handle Server Action results and trigger appropriate toasts:

```typescript
// components/portfolio/CreatePortfolioForm.tsx
'use client'

import { createPortfolio } from '@/lib/actions/portfolio'
import { toasts } from '@/lib/utils/toast'

export function CreatePortfolioForm() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createPortfolio(formData)

      if (result.success) {
        toasts.portfolio.created()
        router.refresh()
      } else {
        if (result.error === 'Unauthorized') {
          toasts.authError()
        } else if (result.error === 'Portfolio name is required') {
          toasts.validation.required('Portfolio name')
        } else {
          toasts.portfolio.createError()
        }
      }
    })
  }

  return <form action={handleSubmit}>...</form>
}
```

### Advanced Patterns

#### Promise-Based Loading States

For long-running operations, use `toast.promise()` for automatic state management:

```typescript
import { toast } from 'sonner'

async function refreshAllPrices() {
  toast.promise(updateAllPrices(), {
    loading: 'Refreshing prices...',
    success: (data) => `${data.count} prices updated`,
    error: 'Price refresh failed',
  })
}
```

#### Multi-Currency Conversion Feedback

```typescript
async function addInvestment(data: InvestmentData) {
  const needsConversion = data.currency !== portfolio.baseCurrency

  if (needsConversion) {
    toasts.currency.converting(data.currency, portfolio.baseCurrency)
    const rate = await getExchangeRate(data.currency, portfolio.baseCurrency)
    toasts.currency.converted(data.currency, portfolio.baseCurrency, rate)
  }

  toasts.investment.added(data.ticker)
}
```

#### Toast IDs for Updates

Use toast IDs to update loading states into success/error states:

```typescript
// Start loading
toast.loading('Refreshing prices...', { id: 'price-refresh' })

// Update to success (replaces loading toast)
toast.success('5 prices updated', { id: 'price-refresh' })

// Or update to error
toast.error('Price refresh failed', { id: 'price-refresh' })
```

### Error Boundary Integration

The global error boundary (`app/error.tsx`) automatically shows toast on uncaught errors:

```typescript
// app/error.tsx
'use client'

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    toasts.error('Something went wrong. Please try again.')
  }, [error])

  return <div>Error UI</div>
}
```

### Notification Placement Guidelines

| Location                    | Notification Type     | Example                       |
| --------------------------- | --------------------- | ----------------------------- |
| `lib/actions/portfolio.ts`  | Success/Error returns | Portfolio CRUD operations     |
| `lib/actions/investment.ts` | Success/Error returns | Investment CRUD + aggregation |
| `components/*/Form.tsx`     | Client-side handling  | Form submission feedback      |
| `lib/api/alphaVantage.ts`   | Error handling        | API failures, rate limits     |
| `app/error.tsx`             | Error boundary        | Uncaught errors               |

### Benefits of This Pattern

✅ **Type Safety:** Autocomplete for all toast methods
✅ **Consistency:** Uniform messaging across the app
✅ **Maintainability:** Update messages in one place
✅ **Accessibility:** Sonner includes ARIA labels and keyboard navigation
✅ **Zero Prop Drilling:** Global toast state, call from anywhere
✅ **Theme Integration:** Automatically uses Tailwind theme colors

## API Integration

### Alpha Vantage Client

Wrapper class in `lib/api/alphaVantage.ts` provides methods:

- `getStockQuote(ticker)` - Real-time stock price
- `getCryptoPrice(symbol, currency)` - Cryptocurrency price
- `getExchangeRate(from, to)` - Currency conversion rate
- `searchSymbol(keywords)` - Ticker symbol search

**Rate Limiting:** Implement request queue to respect 5 requests/minute limit. Use Redis or in-memory queue.

**Error Handling:** All API calls should handle:

- Network timeouts
- Invalid ticker symbols
- Rate limit exceeded (429)
- API key invalid

## Testing Strategy

### Unit Tests

- Calculation functions in `lib/calculations/` (pure functions)
- Currency conversion logic
- Average cost basis calculations

### Integration Tests

- Server Actions with mocked database
- API client with mocked HTTP responses
- Authentication flows

### E2E Tests (Playwright)

- Complete user journey: sign in → create portfolio → add investment → view gains/loss
- Multi-currency scenarios
- Price refresh functionality

## Common Development Tasks

### Adding a New Investment Type

1. Update `AssetType` enum in `prisma/schema.prisma`
2. Add corresponding API integration in `lib/api/alphaVantage.ts`
3. Update form validation in `components/investment/AddInvestmentForm.tsx`
4. Handle new type in calculation logic if special rules apply

### Adding a New Currency

1. Ensure currency code follows ISO 4217 (USD, EUR, GBP, etc.)
2. Alpha Vantage supports all major currencies automatically
3. Add to currency selector options in form components

### Modifying Calculation Logic

1. Update pure functions in `lib/calculations/`
2. Write unit tests for edge cases
3. Update Server Actions that depend on calculations
4. Revalidate affected pages with `revalidatePath()`

## Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with: openssl rand -base64 32"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Alpha Vantage (from alphavantage.co)
ALPHA_VANTAGE_API_KEY="..."

# Optional: Monitoring
SENTRY_DSN="..."
```

## Performance Considerations

### Database Queries

- Always use `select` to fetch only needed fields
- Use `include` judiciously (can create N+1 queries)
- Add database indexes on foreign keys and frequently queried fields
- Batch updates when possible

### React Query Caching

Configure TanStack Query for smart background refetching:

```typescript
const { data } = useQuery({
  queryKey: ['portfolio', portfolioId],
  queryFn: () => fetchPortfolio(portfolioId),
  staleTime: 15 * 60 * 1000, // 15 minutes
  refetchInterval: 15 * 60 * 1000,
})
```

### Server Component Optimization

- Fetch data in parallel when possible: `Promise.all()`
- Stream UI with Suspense boundaries for long queries
- Use `loading.tsx` files for instant loading states

## Security Checklist

**Before Deploying ANY Feature:**

- [ ] User ownership verified in all Server Actions
- [ ] Input validation with Zod schemas
- [ ] SQL injection prevented (Prisma handles this)
- [ ] API keys never exposed to client
- [ ] CSRF protection enabled (NextAuth default)
- [ ] Rate limiting on sensitive endpoints
- [ ] Error messages don't leak sensitive data

## Deployment

### Vercel Deployment (Recommended)

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push to main

### Database Migration Process

**Development:**

```bash
pnpm prisma migrate dev --name <change_description>
```

**Production:**

```bash
pnpm prisma migrate deploy
```

**Never** use `db push` in production - it can cause data loss.

## Troubleshooting

### "Prisma Client not initialized"

```bash
pnpm prisma generate
```

### "Invalid session" errors

Check `NEXTAUTH_SECRET` is set and matches across deployments.

### Alpha Vantage 429 errors

Rate limit exceeded. Check cache logic and implement request queue.

### TypeScript errors after schema changes

Regenerate Prisma Client: `pnpm prisma generate`

## Code Style

- **TypeScript:** Strict mode enabled, no implicit any
- **Formatting:** Prettier with 2-space indentation
- **Naming:** camelCase for variables/functions, PascalCase for components/types
- **Imports:** Absolute imports with `@/` alias
- **Components:** Functional components with TypeScript interfaces
- **Comments:** JSDoc for complex business logic functions

## Additional Resources

- Full specification: `claudedocs/investment-tracker-specification.md`
- Implementation plan: `claudedocs/implementation-plan.md`
- Stack research: `claudedocs/research_web_stacks_2025.md`
- Prisma docs: https://www.prisma.io/docs
- Next.js docs: https://nextjs.org/docs
- Alpha Vantage API: https://www.alphavantage.co/documentation/
