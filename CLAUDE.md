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
- Commit frequently with descriptive messages
- Keep commits atomic (one logical change per commit)

```bash
# Commit changes
git add <files>
git commit -m "feat: implement portfolio creation form

- Add CreatePortfolioForm component
- Create portfolio Server Action
- Add form validation with Zod
- Update documentation and screenshots"
```

### 3. Test Thoroughly

**Before merging, MUST verify:**

- [ ] Feature works as expected
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Documentation updated
- [ ] Screenshots captured

```bash
# Run all checks
pnpm lint
pnpm typecheck
pnpm test
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

**Protected Route Middleware:**

```typescript
// middleware.ts
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/portfolios/:path*'],
}
```

**Getting Session in Server Components:**

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const session = await getServerSession(authOptions)
if (!session?.user?.id) redirect('/auth/signin')
```

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
