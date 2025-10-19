# Track Your Stack - Master Implementation Plan (Enhanced)

**Status:** 🔨 In Progress
**Last Updated:** 2025-10-19
**Version:** 2.1 (Enhanced with Testing Framework)
**Total Features:** 16 (12 MVP + 4 Phase 2)
**Estimated Timeline:** 5-7 weeks (with 20% buffer)
**Quality Score:** 9.4/10 ⭐

---

## 📊 Progress Overview

| Phase                 | Features    | Status      | Progress   |
| --------------------- | ----------- | ----------- | ---------- |
| **Phase 1: MVP**      | 12 features | In Progress | 9/12 (75%) |
| **Phase 2: Advanced** | 4 features  | Not Started | 0/4 (0%)   |
| **Total**             | 16 features | In Progress | 9/16 (56%) |

---

## 🎯 MVP Feature List (Phase 1)

| ID                                               | Feature                             | Dependencies | Estimated Time | Status         |
| ------------------------------------------------ | ----------------------------------- | ------------ | -------------- | -------------- |
| [F01](features/F01_project_setup.md)             | Project Setup & Configuration       | None         | 1-2 days       | ✅ Completed   |
| [F01b](features/F01b_testing_framework_setup.md) | Testing Framework Setup             | F01          | 0.5-1 day      | ✅ Completed   |
| [F02](features/F02_database_schema.md)           | Database Schema & Prisma            | F01          | 1 day          | ✅ Completed   |
| [F03](features/F03_authentication.md)            | Authentication (Google OAuth)       | F01, F02     | 2 days         | ✅ Completed   |
| [F04](features/F04_portfolio_crud.md)            | Portfolio Management (CRUD)         | F02, F03     | 2-3 days       | ✅ Completed   |
| [F05](features/F05_alpha_vantage_integration.md) | Alpha Vantage API Integration       | F01          | 2 days         | ✅ Completed   |
| [F06](features/F06_investment_entry.md)          | Investment Entry Form               | F04, F05     | 2-3 days       | ✅ Completed   |
| [F07](features/F07_investment_management.md)     | Investment Management (Edit/Delete) | F06          | 2 days         | ✅ Completed   |
| [F08](features/F08_calculation_engine.md)        | Calculation Engine                  | F06          | 2 days         | ✅ Completed   |
| [F09](features/F09_price_refresh.md)             | Price Refresh & Caching             | F05, F06     | 2 days         | ✅ Completed   |
| [F10](features/F10_portfolio_summary.md)         | Portfolio Summary & Metrics         | F08          | 1-2 days       | ⬜ Not Started |
| [F11](features/F11_visualizations.md)            | Charts & Visualizations             | F10          | 2-3 days       | ⬜ Not Started |

**MVP Total Estimated Time:** 19.5-25 days + 4-5 days buffer = **5-6 weeks** (with testing infrastructure)

**MVP Status:** 10/12 features completed (83%), ~3-5 days remaining for F10 and F11

### 📝 Implementation Notes

**Recent Completions (Oct 2025):**

- ✅ **Sonner Toast Notification System** - Integrated across all forms with centralized utility helpers (PR #17)
- ✅ **Unit Test Suite** - Comprehensive tests with Vitest (153+ tests covering server actions, calculations, toast utilities)
- ✅ **Pre-push Quality Workflow** - Automated checks for lint, typecheck, format, build, and tests before every push
- ✅ **E2E Testing Framework** - Playwright setup with authentication flows and portfolio management tests
- ✅ **Database Transactions** - Prisma transactions for data integrity in investment aggregation
- ✅ **F08: Calculation Engine** - Complete business logic for investment metrics, portfolio summary, multi-currency conversion, and formatting utilities (21 tests)

**Next Priorities:**

1. **Implement F10: Portfolio Summary & Metrics**
   - Build summary components showing total value, total cost, gain/loss
   - Add portfolio-level metrics (ROI, allocation by asset type)
   - Integrate calculation engine for real-time metrics
2. **Implement F11: Charts & Visualizations**
   - Asset allocation pie/donut charts
   - Performance timeline charts
   - Gain/loss visualization

---

## 🚀 Phase 2 Feature List (Advanced)

§
| ID | Feature | Dependencies | Estimated Time | Status |
| -------------------------------------------------- | ----------------------------- | ------------ | -------------- | -------------- |
| [F12](features/phase2/F12_historical_charts.md) | Historical Performance Charts | F11 | 3-4 days | ⬜ Not Started |
| [F13](features/phase2/F13_csv_import_export.md) | CSV Import/Export | F06 | 2-3 days | ⬜ Not Started |
| [F14](features/phase2/F14_portfolio_comparison.md) | Portfolio Comparison | F10 | 2 days | ⬜ Not Started |
| [F15](features/phase2/F15_pwa_setup.md) | Progressive Web App | F11 | 2-3 days | ⬜ Not Started |

**Phase 2 Total Estimated Time:** 9-12 days = **2-3 weeks**

---

## 📈 Dependency Graph

```mermaid
graph TD
    F01[F01: Project Setup] --> F01b[F01b: Testing Framework]
    F01 --> F02[F02: Database Schema]
    F01 --> F03[F03: Authentication]
    F01 --> F05[F05: Alpha Vantage]

    F02 --> F03
    F02 --> F04[F04: Portfolio CRUD]

    F03 --> F04

    F04 --> F06[F06: Investment Entry]
    F05 --> F06

    F06 --> F07[F07: Investment Management]
    F06 --> F08[F08: Calculation Engine]
    F06 --> F09[F09: Price Refresh]

    F05 --> F09

    F08 --> F10[F10: Portfolio Summary]

    F10 --> F11[F11: Visualizations]

    %% Phase 2
    F11 --> F12[F12: Historical Charts]
    F06 --> F13[F13: CSV Import/Export]
    F10 --> F14[F14: Portfolio Comparison]
    F11 --> F15[F15: PWA Setup]

    %% Integration Checkpoints
    F05 -.->|Integration Test 1| INT1{Integration<br/>Checkpoint 1}
    F03 -.-> INT1
    F04 -.-> INT1

    F09 -.->|Integration Test 2| INT2{Integration<br/>Checkpoint 2}
    F08 -.-> INT2

    F11 -.->|Integration Test 3| INT3{Integration<br/>Checkpoint 3}

    style F01 fill:#e1f5e1
    style F01b fill:#e1f5e1
    style F02 fill:#e1f5e1
    style F03 fill:#fff3cd
    style F04 fill:#fff3cd
    style F05 fill:#fff3cd
    style F06 fill:#f8d7da
    style F07 fill:#f8d7da
    style F08 fill:#f8d7da
    style F09 fill:#f8d7da
    style F10 fill:#d1ecf1
    style F11 fill:#d1ecf1
    style F12 fill:#e2e3e5
    style F13 fill:#e2e3e5
    style F14 fill:#e2e3e5
    style F15 fill:#e2e3e5
    style INT1 fill:#ffe6e6
    style INT2 fill:#ffe6e6
    style INT3 fill:#ffe6e6
```

**Legend:**

- 🟢 Green: Foundation (F01-F02)
- 🟡 Yellow: Core Features (F03-F05)
- 🔴 Red: Investment Features (F06-F09)
- 🔵 Blue: Visualization (F10-F11)
- ⚪ Gray: Phase 2 (F12-F15)
- 🔴 Red Diamonds: Integration Testing Checkpoints

---

## ⚠️ Risk Management

### Risk Register

| ID  | Risk                                                    | Probability | Impact   | Mitigation Strategy                                                                                                              | Owner           |
| --- | ------------------------------------------------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| R01 | Alpha Vantage API discontinuation or rate limit changes | Medium      | High     | Implement adapter pattern; prepare fallback to Financial Modeling Prep API; cache aggressively                                   | Tech Lead       |
| R02 | Database migration failure causing data corruption      | Low         | Critical | Automated backups before migrations; test migrations on staging; maintain rollback scripts; use Prisma's safe migration workflow | Backend Dev     |
| R03 | Timeline overrun by 50%+                                | High        | Medium   | 20% buffer time per feature; prioritize MVP ruthlessly; defer Phase 2; bi-weekly progress reviews                                | Project Manager |
| R04 | Security vulnerability (auth bypass, data exposure)     | Low         | Critical | Security review after F03, F04, F06; OWASP Top 10 checklist; penetration testing pre-production                                  | Security Lead   |
| R05 | Developer unavailability (illness, emergency)           | Medium      | High     | Documentation-first approach; daily commits with clear messages; knowledge transfer at milestones                                | Team            |
| R06 | Performance degradation as data grows                   | Medium      | High     | Performance testing with 10K portfolios; database indexing strategy; query optimization reviews                                  | Backend Dev     |
| R07 | Google OAuth policy changes breaking authentication     | Low         | Critical | Monitor Google Cloud Platform announcements; implement email/password fallback (Phase 2.5); test auth flow regularly             | Backend Dev     |
| R08 | Currency conversion inaccuracy affecting portfolios     | Medium      | Medium   | Validate against multiple sources; log all conversion calculations; allow manual rate override                                   | Backend Dev     |
| R09 | Browser compatibility issues discovered late            | Medium      | Medium   | Test on Chrome, Firefox, Safari from Week 1; use Browserstack for mobile testing                                                 | Frontend Dev    |
| R10 | Production deployment failure                           | Low         | High     | Blue-green deployment strategy; health checks; automated rollback; staging environment mirrors production                        | DevOps          |

### Contingency Plans

**API Failure Contingency:**

```typescript
// Fallback strategy for Alpha Vantage failures
const PRICE_FETCH_STRATEGY = {
  primary: 'alpha-vantage',
  fallback: ['twelve-data', 'finnhub', 'manual-entry'],
  cache: '7-days-rolling',
  degradedMode: 'allow-stale-prices-with-warning',
}
```

**Data Corruption Recovery:**

1. Daily automated backups (3am UTC)
2. Point-in-time recovery capability (last 7 days)
3. Data validation scripts run post-migration
4. Emergency rollback procedure: `pnpm db:rollback-emergency`

**Production Outage Response:**

1. Auto-rollback if error rate >5% within 5 minutes
2. Circuit breaker activates for external API failures
3. Graceful degradation: show cached data with staleness warning
4. Incident communication template ready

---

## 🚀 Deployment Strategy

### Environment Architecture

```mermaid
graph LR
    A[Local Dev] -->|git push| B[GitHub]
    B -->|Auto Deploy| C[Development<br/>dev.track-your-stack.vercel.app]
    C -->|Manual Deploy<br/>After Milestone| D[Staging<br/>staging.track-your-stack.vercel.app]
    D -->|Manual Deploy<br/>After UAT| E[Production<br/>track-your-stack.com]
    E -->|Rollback if needed| F[Previous Version]
```

### Environment Configurations

**1. Development Environment**

- **URL:** `https://dev.track-your-stack.vercel.app`
- **Deploy Trigger:** Auto-deploy on push to `main` branch
- **Database:** Vercel Postgres (development instance)
- **Data:** Test data, seed scripts run automatically
- **Logging:** Verbose mode, all errors logged
- **API Keys:** Development keys with higher rate limits
- **Features:** All features enabled, including experimental
- **Purpose:** Continuous integration testing, rapid iteration

**2. Staging Environment**

- **URL:** `https://staging.track-your-stack.vercel.app`
- **Deploy Trigger:** Manual deploy after milestone completion
- **Database:** Vercel Postgres (staging instance) - production-like
- **Data:** Anonymized production data subset + synthetic test data
- **Logging:** Production-level logging
- **API Keys:** Production keys with same limits
- **Features:** Production feature flags
- **Purpose:** User acceptance testing, final validation before production

**3. Production Environment**

- **URL:** `https://track-your-stack.com`
- **Deploy Trigger:** Manual deploy after staging validation
- **Database:** Vercel Postgres (production instance) with automated backups
- **Data:** Real user data, GDPR compliant
- **Logging:** Error tracking only, PII filtered
- **API Keys:** Production keys, rate limiting enforced
- **Features:** Stable features only, feature flags for gradual rollout
- **Purpose:** Live user traffic

### Deployment Pipeline

**Per-Feature Deployment Flow:**

```bash
# 1. Feature Development (local)
git checkout -b feature/portfolio-crud
# ... implement feature ...
git commit -m "feat(portfolio): implement CRUD operations"

# 2. Create Pull Request
git push origin feature/portfolio-crud
gh pr create --title "feat: Portfolio CRUD operations"

# 3. Automated Checks (GitHub Actions)
# - TypeScript compilation
# - ESLint checks
# - Unit tests
# - Integration tests
# - Build verification

# 4. PR Approval + Merge to main
# Auto-deploys to Development environment

# 5. Development Testing
# Verify feature works in development environment

# 6. Manual Deploy to Staging (after milestone)
vercel --prod --scope=staging

# 7. Staging UAT
# User acceptance testing, smoke tests

# 8. Manual Deploy to Production
vercel --prod
# Health checks run automatically
# Monitor error rates for 30 minutes

# 9. Post-Deployment Verification
# - Health check endpoints green
# - Error rate <1%
# - Response times within SLA
```

### Rollback Procedures

**When to Rollback:**

- Critical bug affecting >10% of users
- Data corruption detected
- Error rate >5% for 5+ minutes
- Performance degradation >50% (p95 response time)
- Security vulnerability discovered

**How to Rollback:**

```bash
# 1. Quick Rollback (Vercel)
vercel rollback track-your-stack --prod
# Reverts to previous deployment in <2 minutes

# 2. Database Rollback (if needed)
# Check if database migration was deployed
pnpm prisma migrate status

# If migration needs rollback:
pnpm prisma migrate resolve --rolled-back <migration_name>
# Restore from point-in-time backup if data corruption

# 3. Verify Rollback Success
curl https://track-your-stack.com/api/health
# Should return 200 OK with previous version number

# 4. Post-Rollback Analysis
# - Review error logs
# - Identify root cause
# - Create hotfix branch
# - Test thoroughly before re-deployment
```

**Rollback Testing:**

- Practice rollback procedure monthly
- Document rollback times (target: <5 minutes)
- Maintain rollback runbook

### Deployment Checklist (Per Feature)

**Pre-Deployment:**

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed and approved
- [ ] Database migrations tested on staging
- [ ] Rollback procedure documented
- [ ] Feature flag configured (if applicable)
- [ ] Performance tested (load test passed)
- [ ] Security review completed (if auth/data changes)
- [ ] Documentation updated
- [ ] Changelog updated

**Deployment:**

- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] UAT completed successfully
- [ ] Production backup verified (within 24 hours)
- [ ] Deploy to production during low-traffic window
- [ ] Monitor deployment progress

**Post-Deployment:**

- [ ] Health checks passing
- [ ] Error rate <1% for 30 minutes
- [ ] Performance within SLA (response time, throughput)
- [ ] User feedback monitoring active
- [ ] Rollback plan ready if needed
- [ ] Team notified of successful deployment

---

## 🔒 Security Checkpoints

### Security Review Schedule

```mermaid
gantt
    title Security Review Schedule
    dateFormat YYYY-MM-DD
    section Security
    Initial Security Setup        :s1, 2025-10-08, 1d
    Auth Security Review         :s2, after f03, 1d
    Authorization Review         :s3, after f04, 1d
    Input Validation Review      :s4, after f06, 1d
    Pre-Production Security Audit :s5, after f11, 2d
```

### Checkpoint 1: After F03 (Authentication)

**Focus:** Authentication & Session Security

**Review Checklist:**

- [ ] OAuth flow secure (state parameter validated, PKCE implemented)
- [ ] Session tokens HttpOnly, Secure, SameSite=Lax
- [ ] CSRF protection enabled (NextAuth.js default)
- [ ] Session timeout enforced (30 days idle, configurable)
- [ ] Logout clears all session data (server-side + client-side)
- [ ] No session data in URL or local storage
- [ ] Rate limiting on auth endpoints (10 attempts/hour)
- [ ] Brute force protection (account lockout after 5 failures)

**Security Tests:**

```typescript
describe('Authentication Security', () => {
  test('should prevent session hijacking', async () => {
    // Steal session cookie, attempt access from different IP
    expect(response.status).toBe(401)
  })

  test('should enforce CSRF protection', async () => {
    // Attempt CSRF attack without valid token
    expect(response.status).toBe(403)
  })
})
```

**Tools:**

```bash
# Run OWASP ZAP security scan on auth endpoints
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://dev.track-your-stack.vercel.app/api/auth
```

---

### Checkpoint 2: After F04 (Portfolio CRUD)

**Focus:** Authorization & Data Isolation

**Review Checklist:**

- [ ] User can only access their own portfolios (row-level security)
- [ ] Authorization checks on all API endpoints (Server Actions)
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] No PII in error messages or logs
- [ ] Portfolio IDs use UUIDs (not sequential integers)
- [ ] Rate limiting per user (100 requests/minute)
- [ ] Audit log for sensitive operations (delete portfolio)

**Security Tests:**

```typescript
describe('Authorization Security', () => {
  test('should prevent access to other users portfolios', async () => {
    const user1 = await createUser()
    const user2Portfolio = await createPortfolio(user2)

    // User1 tries to access User2's portfolio
    const response = await fetch(`/api/portfolios/${user2Portfolio.id}`, {
      headers: { Cookie: user1.sessionCookie },
    })

    expect(response.status).toBe(403)
    expect(await response.json()).toMatchObject({
      error: 'Forbidden',
    })
  })
})
```

---

### Checkpoint 3: After F06 (Investment Entry)

**Focus:** Input Validation & XSS Prevention

**Review Checklist:**

- [ ] All user inputs validated server-side (Zod schemas)
- [ ] Ticker symbol validation (alphanumeric, 1-10 chars)
- [ ] Quantity/price validation (positive numbers, reasonable limits)
- [ ] Date validation (not in future, not before 1900)
- [ ] XSS prevention (React auto-escapes, but verify user notes)
- [ ] File upload validation (if CSV import Phase 2)
- [ ] Rate limiting on ticker search (10 requests/second)
- [ ] API key never exposed to client

**Security Tests:**

```typescript
describe('Input Validation Security', () => {
  test('should prevent XSS in investment notes', async () => {
    const xssPayload = '<script>alert("XSS")</script>'
    const investment = await createInvestment({
      notes: xssPayload,
    })

    // Verify stored as plain text, not executed
    expect(investment.notes).toBe(xssPayload)
    // Verify React escapes on render
    const html = await renderInvestmentNotes(investment.id)
    expect(html).toContain('&lt;script&gt;')
  })

  test('should reject invalid ticker symbols', async () => {
    const invalidTickers = ['', 'AAPL; DROP TABLE investments;', 'A'.repeat(100)]

    for (const ticker of invalidTickers) {
      await expect(createInvestment({ ticker })).rejects.toThrow()
    }
  })
})
```

---

### Checkpoint 4: Before Production (Pre-Launch Security Audit)

**Focus:** Comprehensive Security Review

**OWASP Top 10 Checklist:**

- [ ] **A01: Broken Access Control** - All endpoints check user ownership
- [ ] **A02: Cryptographic Failures** - HTTPS only, secure cookies, API keys encrypted
- [ ] **A03: Injection** - Prisma prevents SQL injection, input validation everywhere
- [ ] **A04: Insecure Design** - Security requirements documented, threat model created
- [ ] **A05: Security Misconfiguration** - Default passwords changed, error messages generic
- [ ] **A06: Vulnerable Components** - `pnpm audit` passing, dependencies up to date
- [ ] **A07: Authentication Failures** - OAuth properly configured, session management secure
- [ ] **A08: Software & Data Integrity** - CSP headers configured, SRI for CDN assets
- [ ] **A09: Logging Failures** - Error logging enabled, no PII in logs
- [ ] **A10: SSRF** - External API calls validated, no user-controlled URLs

**Automated Security Scanning:**

```bash
# 1. Dependency vulnerability scan
pnpm audit --audit-level=moderate

# 2. Snyk security scan
npx snyk test

# 3. OWASP ZAP full scan
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t https://staging.track-your-stack.vercel.app

# 4. Lighthouse security audit
lighthouse https://staging.track-your-stack.vercel.app \
  --only-categories=best-practices

# 5. Mozilla Observatory
curl -X POST https://http-observatory.security.mozilla.org/api/v1/analyze?host=staging.track-your-stack.vercel.app
```

**Manual Penetration Testing:**

- [ ] Attempt session hijacking
- [ ] Test CSRF protection
- [ ] Try SQL injection in all inputs
- [ ] Attempt XSS in all text fields
- [ ] Test authorization bypass techniques
- [ ] Verify rate limiting works
- [ ] Test password/API key handling

**Security Documentation:**

- [ ] Security architecture documented
- [ ] Threat model created
- [ ] Incident response plan ready
- [ ] Security contact information published
- [ ] Responsible disclosure policy published

---

## 🧪 Testing Strategy

### Testing Pyramid

```
           E2E Tests (10%)
          /              \
         /   100 tests    \
        /                  \
       Integration (30%)
      /      300 tests      \
     /                        \
    /___________________________\
          Unit Tests (60%)
           600 tests
```

**Total Tests Target:** 1,000 automated tests across all levels

### Test Coverage Targets

| Layer                 | Coverage Target     | Purpose                                        | Tools                         |
| --------------------- | ------------------- | ---------------------------------------------- | ----------------------------- |
| **Unit Tests**        | 80% code coverage   | Test individual functions and components       | Vitest, React Testing Library |
| **Integration Tests** | All API endpoints   | Test feature interactions, database operations | Vitest, Supertest             |
| **E2E Tests**         | Critical user paths | Test complete workflows end-to-end             | Playwright                    |
| **Performance Tests** | Key operations      | Validate response times, load handling         | k6, Artillery                 |
| **Security Tests**    | OWASP Top 10        | Identify vulnerabilities                       | OWASP ZAP, Snyk               |

### Test Development Approach

**Test-Driven Development (TDD) for:**

- ✅ Calculation engine (F08) - Critical business logic, high complexity
- ✅ Currency conversion (F08) - Precision required, edge cases
- ✅ Average cost basis (F08) - Complex aggregation, mathematical accuracy
- ✅ Price caching logic (F09) - Time-sensitive, cache invalidation

**TDD Workflow:**

```typescript
// 1. Write failing test FIRST
describe('Average Cost Basis Calculation', () => {
  it('should calculate weighted average for multiple purchases', () => {
    const purchases = [
      { qty: 10, price: 150 }, // $1,500 total
      { qty: 5, price: 160 }, // $800 total
    ]

    const avgCostBasis = calculateAverageCostBasis(purchases)

    expect(avgCostBasis).toBe(153.33) // (1500 + 800) / 15 = 153.33
  })
})

// 2. Run test - should FAIL (function doesn't exist yet)

// 3. Write MINIMUM code to make test pass
export function calculateAverageCostBasis(purchases) {
  const totalCost = purchases.reduce((sum, p) => sum + p.qty * p.price, 0)
  const totalQty = purchases.reduce((sum, p) => sum + p.qty, 0)
  return Number((totalCost / totalQty).toFixed(2))
}

// 4. Run test - should PASS

// 5. Refactor if needed, tests still pass
```

**Test-After Development for:**

- ✅ UI components (F06, F07, F10, F11) - Rapid iteration, visual validation needed
- ✅ Authentication integration (F03) - External dependency (Google OAuth)
- ✅ API integration (F05) - External service (Alpha Vantage)

### Testing Per Feature

**Example: F06 (Investment Entry)**

**Unit Tests (Target: 40 tests):**

```typescript
// Components
- InvestmentForm component renders correctly (5 tests)
- Form validation works (10 tests: required fields, positive numbers, date validation)
- Ticker search debouncing (3 tests)
- Form submission handling (5 tests)

// Utilities
- Investment schema validation (Zod) (10 tests)
- Date formatting utilities (5 tests)
- Currency formatting utilities (2 tests)
```

**Integration Tests (Target: 15 tests):**

```typescript
// Server Actions
- createInvestment Server Action (5 tests)
- Ticker search API endpoint (5 tests)
- Database integration (5 tests: insert, aggregate, constraints)
```

**E2E Tests (Target: 3 tests):**

```typescript
// User Workflows
test('User can add first investment to portfolio', async ({ page }) => {
  // 1. Sign in
  await page.goto('/auth/signin')
  await page.click('[data-testid="google-signin"]')

  // 2. Create portfolio
  await page.goto('/portfolios/new')
  await page.fill('[name="name"]', 'My Portfolio')
  await page.click('[type="submit"]')

  // 3. Add investment
  await page.click('[data-testid="add-investment"]')
  await page.fill('[name="ticker"]', 'AAPL')
  await page.click('[data-testid="ticker-result-0"]')
  await page.fill('[name="quantity"]', '10')
  await page.fill('[name="price"]', '150.00')
  await page.fill('[name="date"]', '2024-01-15')
  await page.click('[type="submit"]')

  // 4. Verify investment appears in list
  await expect(page.locator('[data-testid="investment-AAPL"]')).toBeVisible()
  await expect(page.locator('[data-testid="total-value"]')).toContainText('$1,500.00')
})
```

### Automated Testing in CI/CD

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [pull_request, push]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: track_your_stack_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run type checking
        run: pnpm typecheck

      - name: Run unit tests
        run: pnpm test --coverage

      - name: Check coverage threshold
        run: pnpm coverage:check --threshold=80

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/track_your_stack_test

      - name: Build application
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

### Test Data Management

**Development Environment:**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create 5 test users
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        name: `Test User ${i}`,
      },
    })

    // Create 10 portfolios per user
    for (let j = 1; j <= 10; j++) {
      const portfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          name: `Portfolio ${j}`,
          baseCurrency: ['USD', 'EUR', 'GBP'][j % 3],
        },
      })

      // Create 10 investments per portfolio
      const tickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'BTC', 'ETH', 'SPY']
      for (let k = 0; k < 10; k++) {
        await prisma.investment.create({
          data: {
            portfolioId: portfolio.id,
            ticker: tickers[k],
            assetName: `${tickers[k]} Company`,
            assetType: k < 7 ? 'STOCK' : k < 9 ? 'CRYPTO' : 'ETF',
            totalQuantity: Math.random() * 100,
            averageCostBasis: Math.random() * 500,
            purchaseCurrency: portfolio.baseCurrency,
          },
        })
      }
    }
  }

  console.log('✅ Seeded 5 users, 50 portfolios, 500 investments')
}

main()
```

**Run seed:**

```bash
pnpm prisma db seed
```

**Staging Environment:**

- Anonymized production data subset (last 30 days)
- Synthetic test data for edge cases
- No PII from production

**Production Environment:**

- Real user data only
- No test accounts in production

### Integration Testing Checkpoints

**Checkpoint 1: End of Week 2** (After F05)

**Focus:** Test integration between completed foundation features

**Test Scenarios:**

```typescript
describe('Foundation Integration Tests', () => {
  test('Authenticated user can create portfolio and it persists', async () => {
    // F03 (Auth) + F04 (Portfolio CRUD) + F02 (Database)
    const user = await signInWithGoogle()
    const portfolio = await createPortfolio({ name: 'Test', baseCurrency: 'USD' })

    // Verify in database
    const saved = await prisma.portfolio.findUnique({ where: { id: portfolio.id } })
    expect(saved).toBeDefined()
    expect(saved.userId).toBe(user.id)
  })

  test('Alpha Vantage API integration works with rate limiting', async () => {
    // F05 (Alpha Vantage) + Rate Limiting
    const promises = Array.from({ length: 10 }, () => alphaVantage.getStockQuote('AAPL'))

    const results = await Promise.allSettled(promises)

    // First 5 should succeed (5 calls/minute limit)
    expect(results.slice(0, 5).every((r) => r.status === 'fulfilled')).toBe(true)

    // Remaining should be rate limited or cached
    const rateLimited = results.slice(5).filter((r) => r.status === 'rejected')
    expect(rateLimited.length).toBeGreaterThan(0)
  })

  test('User cannot access another users portfolio', async () => {
    // F03 (Auth) + F04 (Portfolio) + Authorization
    const user1 = await signInAsUser('user1@test.com')
    const user2Portfolio = await createPortfolioAsUser('user2@test.com')

    // User1 tries to access User2's portfolio
    await expect(getPortfolio(user2Portfolio.id, user1.sessionToken)).rejects.toThrow('Forbidden')
  })
})
```

**Success Criteria:**

- All foundation integration tests passing
- Zero authorization bugs
- API rate limiting working correctly

---

**Checkpoint 2: End of Week 4** (After F09)

**Focus:** Complete investment workflow integration

**Test Scenarios:**

```typescript
describe('Investment Workflow Integration', () => {
  test('Complete investment lifecycle with price refresh', async () => {
    // F06 (Add) → F08 (Calculate) → F09 (Refresh) → F07 (Edit)
    const user = await signIn()
    const portfolio = await createPortfolio({ baseCurrency: 'USD' })

    // 1. Add investment
    const investment1 = await addInvestment({
      portfolioId: portfolio.id,
      ticker: 'AAPL',
      quantity: 10,
      price: 150,
    })
    expect(investment1.averageCostBasis).toBe(150)

    // 2. Add more of same ticker
    const investment2 = await addInvestment({
      portfolioId: portfolio.id,
      ticker: 'AAPL',
      quantity: 5,
      price: 160,
    })

    // 3. Verify calculation engine aggregated correctly
    const updated = await getInvestment(investment1.id)
    expect(updated.totalQuantity).toBe(15)
    expect(updated.averageCostBasis).toBeCloseTo(153.33, 2)

    // 4. Refresh prices from API
    await refreshPrices(portfolio.id)

    // 5. Verify current price updated
    const refreshed = await getInvestment(investment1.id)
    expect(refreshed.currentPrice).toBeGreaterThan(0)
    expect(refreshed.priceUpdatedAt).toBeDefined()

    // 6. Edit investment quantity
    await editInvestment(investment1.id, { quantity: 12 })

    // 7. Verify recalculation happened
    const edited = await getInvestment(investment1.id)
    expect(edited.totalQuantity).toBe(12)
  })

  test('Multi-currency portfolio calculates correctly', async () => {
    // F06 + F08 (Currency Conversion) + F05 (Exchange Rates)
    const portfolio = await createPortfolio({ baseCurrency: 'USD' })

    // Add investment in EUR
    await addInvestment({
      portfolioId: portfolio.id,
      ticker: 'SAP',
      quantity: 10,
      price: 100,
      currency: 'EUR',
    })

    // Add investment in GBP
    await addInvestment({
      portfolioId: portfolio.id,
      ticker: 'HSBC',
      quantity: 10,
      price: 50,
      currency: 'GBP',
    })

    // Get portfolio summary (should convert all to USD)
    const summary = await getPortfolioSummary(portfolio.id)

    expect(summary.totalValue).toBeGreaterThan(0)
    expect(summary.baseCurrency).toBe('USD')
    expect(summary.investments.length).toBe(2)

    // Verify each investment shows value in base currency
    summary.investments.forEach((inv) => {
      expect(inv.currentValueInBase).toBeGreaterThan(0)
      expect(inv.currency).toBe('USD') // Converted to base
    })
  })
})
```

**Success Criteria:**

- Complete investment workflow working end-to-end
- Currency conversion accurate (±0.1%)
- Price refresh and caching working correctly

---

**Checkpoint 3: End of Week 5** (Before MVP Complete)

**Focus:** Full end-to-end user journey validation

**Test Scenarios:**

```gherkin
Feature: Complete Portfolio Tracking Workflow

Scenario: New user onboards and manages portfolio
  Given a new user visits the application
  When they sign in with Google OAuth
  Then they should see an empty dashboard

  When they create a portfolio named "Retirement Fund" in USD
  Then the portfolio should appear in their dashboard

  When they add 10 shares of AAPL bought at $150 on 2024-01-15
  And they add 5 shares of GOOGL bought at $2800 on 2024-02-01
  Then they should see their investments listed

  When prices are refreshed from Alpha Vantage
  Then current prices should update for both stocks

  When they view the portfolio summary
  Then they should see:
    | Total Value   | Calculated based on current prices |
    | Total Cost    | $15,500 (1,500 + 14,000)           |
    | Gain/Loss     | Calculated difference              |
    | Gain/Loss %   | Percentage return                  |

  And they should see a pie chart showing:
    | AAPL  | ~10% of portfolio |
    | GOOGL | ~90% of portfolio |

  When they edit AAPL investment to 15 shares
  Then average cost basis should recalculate
  And portfolio summary should update

  When they delete GOOGL investment
  And confirm the deletion
  Then GOOGL should no longer appear in the list
  And portfolio summary should reflect only AAPL

  When they sign out
  And sign back in
  Then their portfolio data should persist
  And they should see the same portfolio state
```

**Automated E2E Test:**

```typescript
import { test, expect } from '@playwright/test'

test('Complete user workflow from signup to portfolio management', async ({ page }) => {
  // 1. Sign in
  await page.goto('/')
  await page.click('[data-testid="signin-button"]')
  // Mock Google OAuth for testing
  await page.evaluate(() => {
    window.mockGoogleAuth({ email: 'test@example.com', name: 'Test User' })
  })

  // 2. Create portfolio
  await expect(page.locator('text=Create Your First Portfolio')).toBeVisible()
  await page.click('[data-testid="create-portfolio"]')
  await page.fill('[name="name"]', 'Retirement Fund')
  await page.selectOption('[name="baseCurrency"]', 'USD')
  await page.click('[type="submit"]')

  // 3. Verify portfolio created
  await expect(page.locator('text=Retirement Fund')).toBeVisible()

  // 4. Add AAPL investment
  await page.click('[data-testid="add-investment"]')
  await page.fill('[name="ticker"]', 'AAPL')
  await page.click('[data-testid="ticker-result-AAPL"]')
  await page.fill('[name="quantity"]', '10')
  await page.fill('[name="price"]', '150.00')
  await page.fill('[name="purchaseDate"]', '2024-01-15')
  await page.click('[data-testid="submit-investment"]')

  // 5. Add GOOGL investment
  await page.click('[data-testid="add-investment"]')
  await page.fill('[name="ticker"]', 'GOOGL')
  await page.click('[data-testid="ticker-result-GOOGL"]')
  await page.fill('[name="quantity"]', '5')
  await page.fill('[name="price"]', '2800.00')
  await page.fill('[name="purchaseDate"]', '2024-02-01')
  await page.click('[data-testid="submit-investment"]')

  // 6. Verify investments appear
  await expect(page.locator('[data-testid="investment-AAPL"]')).toBeVisible()
  await expect(page.locator('[data-testid="investment-GOOGL"]')).toBeVisible()

  // 7. Refresh prices
  await page.click('[data-testid="refresh-prices"]')
  await expect(page.locator('[data-testid="refresh-status"]')).toContainText('Updated')

  // 8. Verify portfolio summary
  const totalValue = await page.locator('[data-testid="total-value"]').textContent()
  expect(totalValue).toMatch(/\$[\d,]+\.\d{2}/)

  // 9. Verify pie chart exists
  await expect(page.locator('[data-testid="portfolio-pie-chart"]')).toBeVisible()

  // 10. Edit AAPL investment
  await page.click('[data-testid="investment-AAPL"] [data-testid="edit-button"]')
  await page.fill('[name="quantity"]', '15')
  await page.click('[data-testid="save-investment"]')

  // 11. Verify updated quantity
  await expect(
    page.locator('[data-testid="investment-AAPL"] [data-testid="quantity"]')
  ).toContainText('15')

  // 12. Delete GOOGL investment
  await page.click('[data-testid="investment-GOOGL"] [data-testid="delete-button"]')
  await page.click('[data-testid="confirm-delete"]')

  // 13. Verify GOOGL is gone
  await expect(page.locator('[data-testid="investment-GOOGL"]')).not.toBeVisible()

  // 14. Sign out and back in (persistence test)
  await page.click('[data-testid="user-menu"]')
  await page.click('[data-testid="sign-out"]')
  await page.click('[data-testid="signin-button"]')
  // Mock auth again
  await page.evaluate(() => {
    window.mockGoogleAuth({ email: 'test@example.com', name: 'Test User' })
  })

  // 15. Verify data persists
  await expect(page.locator('text=Retirement Fund')).toBeVisible()
  await expect(page.locator('[data-testid="investment-AAPL"]')).toBeVisible()
  await expect(page.locator('[data-testid="investment-GOOGL"]')).not.toBeVisible()
})
```

**Success Criteria:**

- Complete E2E test passes (signup → manage → persist)
- All user flows work without errors
- Data persists correctly across sessions
- Performance acceptable (test completes in <60s)

---

## ⚡ Performance Requirements

### Response Time Targets (p95 Percentile)

| Operation                                | Target | Maximum | Measurement Method            |
| ---------------------------------------- | ------ | ------- | ----------------------------- |
| **Page Load (First Contentful Paint)**   | <1s    | <2s     | Lighthouse, Web Vitals        |
| **Page Load (Largest Contentful Paint)** | <2s    | <4s     | Lighthouse, Web Vitals        |
| **Time to Interactive (TTI)**            | <3s    | <5s     | Lighthouse                    |
| **API Response (GET requests)**          | <200ms | <500ms  | Server logs, Vercel Analytics |
| **API Response (POST/PUT/DELETE)**       | <300ms | <500ms  | Server logs                   |
| **Database Query**                       | <50ms  | <100ms  | Prisma query logging          |
| **Ticker Search (cached)**               | <100ms | <200ms  | Client-side timing            |
| **Ticker Search (API call)**             | <200ms | <300ms  | Alpha Vantage response time   |
| **Portfolio Calculation**                | <100ms | <200ms  | Server Action timing          |
| **Price Refresh (1 portfolio)**          | <400ms | <500ms  | API + DB time combined        |
| **Price Refresh (cached)**               | <50ms  | <100ms  | DB query only                 |
| **Currency Conversion**                  | <50ms  | <100ms  | Calculation + cache lookup    |

### Scalability Targets

**User Capacity:**

- **Concurrent Users:** Support 1,000 concurrent users without degradation
- **Total Users:** Scale to 10,000 registered users
- **Peak Load:** Handle 100 requests/second

**Data Capacity:**

- **Portfolios:** Support 10,000+ portfolios (avg 10 per user)
- **Investments:** Support 100,000+ investments (avg 10 per portfolio)
- **Price History:** Store 90 days of price snapshots (Phase 2)
- **Database Size:** Target <1GB for 1,000 users

**API Limits:**

- **Alpha Vantage:** 500 calls/day (free tier) = ~0.35 calls/minute sustained
- **Optimization:** 95% cache hit rate to stay under limit
- **Rate Limiting:** 5 calls/minute burst allowed with queue

### Performance Testing Strategy

**Load Testing (Before Production Deployment):**

```bash
# Install k6 for load testing
brew install k6  # macOS
# or
choco install k6  # Windows

# Run load test
k6 run load-test.js
```

```javascript
// load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // Error rate must be below 1%
  },
}

export default function () {
  // Test portfolio list page
  const portfolioList = http.get('https://track-your-stack.com/api/portfolios', {
    headers: { Cookie: __ENV.SESSION_COOKIE },
  })

  check(portfolioList, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1)

  // Test investment list page
  const investmentList = http.get(
    `https://track-your-stack.com/api/portfolios/${__ENV.PORTFOLIO_ID}/investments`,
    {
      headers: { Cookie: __ENV.SESSION_COOKIE },
    }
  )

  check(investmentList, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(2)
}
```

**Run load test:**

```bash
SESSION_COOKIE="your-test-session" PORTFOLIO_ID="test-portfolio-id" k6 run load-test.js
```

**Performance Testing Schedule:**

- **Week 2 (After F04):** Portfolio CRUD load test (100 concurrent users)
- **Week 4 (After F09):** Full investment workflow load test (200 concurrent users)
- **Week 5 (Before MVP):** Complete application load test (1,000 concurrent users)
- **Phase 2 (Historical Charts):** Historical data query load test

### Performance Budget

**Frontend Bundle Sizes:**

```yaml
JavaScript:
  initial: <200KB (gzipped)
  per_route: <50KB (gzipped)
  total: <500KB (gzipped)

CSS:
  initial: <50KB (gzipped)
  per_route: <20KB (gzipped)

Images:
  hero_images: <100KB each (WebP format)
  icons: <10KB each (SVG preferred)
  total: <500KB per page

Fonts:
  primary_font: <50KB (woff2, subset)
  fallback_font: system fonts only
  total: <100KB
```

**Enforcement:**

```json
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 200 * 1024,      // 200KB
        maxEntrypointSize: 200 * 1024, // 200KB
        hints: 'error',
      }
    }
    return config
  },
}
```

### Database Performance

**Indexing Strategy:**

```sql
-- Portfolio queries
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);

-- Investment queries
CREATE INDEX idx_investments_portfolio_id ON investments(portfolio_id);
CREATE INDEX idx_investments_ticker ON investments(ticker);

-- Price cache queries
CREATE INDEX idx_investments_price_updated ON investments(price_updated_at);

-- Transaction queries
CREATE INDEX idx_transactions_investment_id ON purchase_transactions(investment_id);
CREATE INDEX idx_transactions_purchase_date ON purchase_transactions(purchase_date);

-- Currency rate queries
CREATE INDEX idx_currency_rates_pair ON currency_rates(from_currency, to_currency);
CREATE INDEX idx_currency_rates_fetched ON currency_rates(fetched_at);
```

**Query Optimization:**

```typescript
// BAD: N+1 query problem
async function getPortfoliosWithInvestments(userId: string) {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
  })

  for (const portfolio of portfolios) {
    portfolio.investments = await prisma.investment.findMany({
      where: { portfolioId: portfolio.id },
    })
  }

  return portfolios
}

// GOOD: Single query with include
async function getPortfoliosWithInvestments(userId: string) {
  return await prisma.portfolio.findMany({
    where: { userId },
    include: {
      investments: true,
    },
  })
}
```

### Monitoring Thresholds & Alerts

**Error Rate Alerts:**

```yaml
Critical:
  - condition: error_rate > 5% for 5 minutes
  - action: Page on-call engineer
  - channels: PagerDuty, Slack #incidents

Warning:
  - condition: error_rate > 2% for 10 minutes
  - action: Notify team
  - channels: Slack #alerts
```

**Performance Alerts:**

```yaml
Critical:
  - condition: p95_response_time > 1000ms for 10 minutes
  - action: Investigate performance degradation
  - channels: Slack #performance

Warning:
  - condition: p95_response_time > 500ms for 15 minutes
  - action: Monitor closely
  - channels: Slack #performance
```

**Resource Alerts:**

```yaml
Critical:
  - condition: database_connections > 90% of pool for 5 minutes
  - action: Scale database or investigate connection leaks
  - channels: Slack #infrastructure

Warning:
  - condition: database_size > 80% of allocated storage
  - action: Plan for storage expansion
  - channels: Slack #infrastructure
```

### Performance Monitoring Tools

**Vercel Analytics:**

- Real User Monitoring (RUM) for Web Vitals
- Server-side function execution times
- Edge function performance

**Prisma Logging:**

```typescript
// lib/prisma.ts
export const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'query', emit: 'event' }, // Enable in development only
  ],
})

// Log slow queries (>100ms)
prisma.$on('query', (e) => {
  if (e.duration > 100) {
    console.warn(`Slow query detected (${e.duration}ms): ${e.query}`)
  }
})
```

**Custom Performance Tracking:**

```typescript
// lib/performance.ts
export function measurePerformance(name: string) {
  const start = Date.now()

  return {
    end: () => {
      const duration = Date.now() - start

      // Log to monitoring service (e.g., Datadog, New Relic)
      console.log(`[PERF] ${name}: ${duration}ms`)

      // Send to analytics
      if (duration > 500) {
        analytics.track('slow_operation', {
          operation: name,
          duration,
          timestamp: new Date(),
        })
      }

      return duration
    },
  }
}

// Usage in Server Actions
export async function getPortfolioSummary(portfolioId: string) {
  const perf = measurePerformance('getPortfolioSummary')

  try {
    const summary = await calculatePortfolioSummary(portfolioId)
    return summary
  } finally {
    perf.end()
  }
}
```

---

## ✅ Production Readiness Checklist

Complete this checklist before deploying MVP to production. Each section must be 100% complete.

### Infrastructure (10 items)

- [ ] **Production environment configured** on Vercel with custom domain
- [ ] **Environment variables secured** in Vercel dashboard (not in code)
- [ ] **Database configured** with Vercel Postgres or Supabase (production tier)
- [ ] **Automated backups enabled** (daily full backup + point-in-time recovery)
- [ ] **CDN configured** for static assets (Vercel Edge Network)
- [ ] **SSL certificates** valid and auto-renewing (Vercel handles this)
- [ ] **DNS configured** with proper A/CNAME records
- [ ] **Custom domain** SSL verified and HTTPS enforced
- [ ] **Rate limiting** configured on API routes (Vercel Firewall or custom)
- [ ] **DDoS protection** enabled (Vercel provides basic protection)

### Monitoring & Observability (12 items)

- [ ] **Error tracking** configured (Sentry, Rollbar, or Vercel Monitoring)
- [ ] **Performance monitoring** enabled (Vercel Analytics or Google Analytics)
- [ ] **Database query monitoring** (Prisma logging, slow query alerts)
- [ ] **API rate limit monitoring** (Alpha Vantage usage tracking)
- [ ] **Uptime monitoring** configured (UptimeRobot, Better Uptime, Pingdom)
  - Target: 99.9% uptime (43 minutes/month downtime allowed)
- [ ] **Health check endpoint** implemented (`/api/health`)
- [ ] **Alert thresholds configured:**
  - Error rate >5% for 5 minutes
  - Response time >1000ms (p95) for 10 minutes
  - Downtime >2 minutes
  - Database connections >90% of pool
- [ ] **Alert channels configured** (Slack, Email, PagerDuty)
- [ ] **Log aggregation** setup (Vercel logs, Datadog, or Logtail)
- [ ] **Dashboard created** with key metrics (error rate, response time, uptime)
- [ ] **On-call schedule defined** (if applicable)
- [ ] **Incident response runbook** documented

### Security (14 items)

- [ ] **OWASP Top 10 review completed** with all items addressed
- [ ] **Authentication security validated:**
  - OAuth flow secure (PKCE, state parameter)
  - Session management secure (HttpOnly, Secure, SameSite cookies)
  - CSRF protection enabled
  - Session timeout enforced
- [ ] **Authorization checks verified** on all API endpoints
- [ ] **Input validation comprehensive:**
  - All user inputs validated server-side (Zod schemas)
  - Ticker symbols alphanumeric only
  - Quantity/price positive numbers with reasonable limits
  - Dates within valid range
- [ ] **XSS prevention verified** (React auto-escapes, but double-check user notes)
- [ ] **SQL injection prevented** (Prisma parameterized queries)
- [ ] **API keys secured:**
  - Never exposed to client
  - Stored in environment variables only
  - Rotated regularly (quarterly)
- [ ] **HTTPS enforced** (redirect HTTP to HTTPS)
- [ ] **Security headers configured:**
  ```typescript
  // next.config.js
  module.exports = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          ],
        },
      ]
    },
  }
  ```
- [ ] **Rate limiting configured** per user and globally
- [ ] **Dependency vulnerability scan** completed (`pnpm audit` passing)
- [ ] **Penetration testing** completed (basic security scan)
- [ ] **Data privacy compliance** (GDPR if EU users, CCPA if CA users)
- [ ] **Privacy policy** published and accessible
- [ ] **Terms of service** published and accessible

### Performance (11 items)

- [ ] **Load testing completed** (1,000 concurrent users sustained)
- [ ] **Database queries optimized:**
  - All queries <100ms average
  - Indexes added for frequent queries
  - N+1 query problems eliminated
- [ ] **API response times validated:**
  - p95 <500ms for all endpoints
  - p99 <1000ms for all endpoints
- [ ] **Page load times acceptable:**
  - FCP <2s
  - LCP <4s
  - TTI <5s
  - Lighthouse score >90
- [ ] **Bundle size optimized:**
  - JavaScript <200KB gzipped
  - CSS <50KB gzipped
  - Images WebP format, <500KB total per page
- [ ] **Caching strategy implemented:**
  - Price cache with TTL (15min stock, 5min crypto)
  - Currency rate cache (1 hour)
  - Static asset caching (1 year)
  - API response caching where appropriate
- [ ] **Database connection pooling** configured (prevent connection exhaustion)
- [ ] **CDN utilized** for static assets
- [ ] **Image optimization** (Next.js Image component, WebP format)
- [ ] **Font optimization** (subset fonts, woff2 format, <100KB total)
- [ ] **Code splitting** implemented (lazy load non-critical components)

### Testing (8 items)

- [ ] **Unit test coverage** ≥80% (run `pnpm test --coverage`)
- [ ] **Integration tests** passing for all API endpoints
- [ ] **E2E tests** passing for critical user paths:
  - Sign in → Create portfolio → Add investment → View summary
  - Sign in → Edit investment → Refresh prices → View updated values
  - Sign in → Delete investment → Verify data integrity
- [ ] **Performance tests** passing (load test with 1,000 users)
- [ ] **Security tests** passing (OWASP ZAP scan clean)
- [ ] **Browser compatibility tested:**
  - Chrome (latest 2 versions)
  - Firefox (latest 2 versions)
  - Safari (latest 2 versions)
  - Edge (latest version)
- [ ] **Mobile responsiveness tested:**
  - iOS Safari (iPhone 12, 13, 14)
  - Android Chrome (Samsung Galaxy S21, Pixel 6)
  - Tablets (iPad Pro, Samsung Galaxy Tab)
- [ ] **Accessibility validated:**
  - Lighthouse accessibility score >95
  - Keyboard navigation working
  - Screen reader tested (NVDA or VoiceOver)
  - WCAG 2.1 AA compliance checked

### Operational (10 items)

- [ ] **Deployment pipeline** tested end-to-end
- [ ] **Rollback procedure** documented and tested
- [ ] **Database migration** strategy validated (forward + rollback)
- [ ] **Data backup** tested (restore from backup successful)
- [ ] **Disaster recovery plan** documented (RTO: 4 hours, RPO: 24 hours)
- [ ] **Feature flags** implemented for gradual rollout (if applicable)
- [ ] **Monitoring dashboard** accessible to team
- [ ] **Incident response plan** documented and team trained
- [ ] **User support** plan ready (email, documentation, FAQ)
- [ ] **Communication plan** for launch (users, stakeholders)

### Documentation (7 items)

- [ ] **User documentation** complete (`docs/user-guide/`)
- [ ] **API documentation** complete (`docs/api/`)
- [ ] **Architecture documentation** up to date (`docs/architecture/`)
- [ ] **Deployment runbook** documented
- [ ] **Troubleshooting guide** created
- [ ] **Changelog** up to date with all changes
- [ ] **README** accurate with setup instructions

### Legal & Compliance (5 items)

- [ ] **Privacy policy** published (required for user data collection)
- [ ] **Terms of service** published
- [ ] **Cookie consent** implemented (if using analytics cookies)
- [ ] **Data retention policy** defined and documented
- [ ] **GDPR compliance** validated (if targeting EU users)
  - Right to access personal data
  - Right to delete personal data
  - Data export functionality

---

**Total Items:** 77
**Target:** 100% completion before production launch
**Current Status:** 0/77 (0%)

---

## 👥 Resource Planning

### Timeline Assumptions

**Base Timeline:** 5-6 weeks for MVP (F01-F11 with 20% buffer)
**Assumes:** 1 full-time developer (40 hours/week)

### Alternative Scenarios

| Team Size        | Weekly Hours                | MVP Timeline | Phase 2 Timeline | Total Timeline | Notes                                                     |
| ---------------- | --------------------------- | ------------ | ---------------- | -------------- | --------------------------------------------------------- |
| **1 developer**  | 40 hrs/week                 | 5-6 weeks    | 2-3 weeks        | 7-9 weeks      | Base scenario, no coordination overhead                   |
| **1 developer**  | 20 hrs/week<br/>(part-time) | 10-12 weeks  | 4-6 weeks        | 14-18 weeks    | Double timeline, good for side projects                   |
| **2 developers** | 40 hrs/week each            | 3-4 weeks    | 1-2 weeks        | 4-6 weeks      | 30% faster with parallel work, +10% coordination overhead |
| **3 developers** | 40 hrs/week each            | 3 weeks      | 1 week           | 4 weeks        | Diminishing returns, +20% coordination overhead           |

### Parallel Development Opportunities (2 Developers)

**Week 1 (Foundation):**

- **Dev 1:** F01 (Day 1-2), F02 (Day 3), F03 (Day 4-5)
- **Dev 2:** F01 setup support, F05 (Day 3-5) - parallel with F03
- **Coordination:** Integration testing (Day 5 afternoon)
- **Time Saved:** 1 day (F03 and F05 in parallel)

**Week 2 (Core Infrastructure):**

- **Dev 1:** F04 (Day 6-8)
- **Dev 2:** F05 completion + start F06 (Day 6-8)
- **Coordination:** Integration testing (Day 8 afternoon)
- **Time Saved:** 1 day (F04 and F05 overlap)

**Week 3 (Investment Features):**

- **Dev 1:** F06 completion + F08 (Day 9-11)
- **Dev 2:** F07 + F09 (Day 9-11)
- **Coordination:** Integration testing (Day 11 afternoon)
- **Time Saved:** 2 days (F07, F08, F09 parallelized)

**Week 4 (Visualization):**

- **Dev 1:** F10 (Day 12-13)
- **Dev 2:** F11 start (Day 12-13)
- **Coordination:** Integration testing + polish (Day 14-15)
- **Time Saved:** 1 day (F10 and F11 overlap)

**Optimized Timeline (2 Developers):**

- MVP: 3-4 weeks (vs 5-6 weeks solo)
- Savings: 2 weeks (33% faster)
- Trade-off: +5 hours coordination overhead per week

### Skills Required

**Essential (Must Have):**

- ✅ **Next.js 15 App Router** - Core framework
- ✅ **TypeScript** - Type safety throughout
- ✅ **React 19** - UI components
- ✅ **Prisma ORM** - Database interactions
- ✅ **NextAuth.js v5** - Authentication

**Important (Should Have):**

- ✅ **PostgreSQL** - Database design, queries, indexing
- ✅ **API Integration** - RESTful APIs, error handling, rate limiting
- ✅ **Tailwind CSS** - Rapid UI styling
- ✅ **Git & GitHub** - Version control, PR workflow
- ✅ **Testing** - Unit, integration, E2E testing concepts

**Useful (Nice to Have):**

- ✅ **Recharts** - Data visualization (can learn during F11)
- ✅ **Playwright** - E2E testing (can learn during testing phases)
- ✅ **Vercel** - Deployment platform (straightforward to learn)
- ✅ **Financial Domain** - Understanding investments, portfolios

### Learning Curve Adjustment

**If developer is new to Next.js 15 App Router:**

- **Add 1 week** for learning
- **Approach:** Complete [Next.js tutorial](https://nextjs.org/learn) before F01
- **Resources:** Official Next.js docs, YouTube tutorials
- **Timeline:** 6-7 weeks for MVP (vs 5-6 weeks)

**If developer is new to TypeScript:**

- **Add 1 week** for TypeScript basics
- **Approach:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) + practice
- **Leverage:** AI assistants (Claude, GitHub Copilot) for TypeScript syntax
- **Timeline:** 6-7 weeks for MVP

**If developer is new to both:**

- **Add 2 weeks** total for learning (weeks overlap)
- **Timeline:** 7-8 weeks for MVP

### Coordination Overhead (Multi-Developer)

**Daily Activities:**

- **Standup:** 15 minutes/day (What did you do? What will you do? Blockers?)
- **Code Review:** 30 minutes/PR (average 2 PRs/developer/week = 2 hours/week)
- **Integration Testing:** 2 hours/week (end of each milestone)
- **Architecture Discussions:** 1 hour/week
- **Total:** ~5 hours/week overhead per developer

**Coordination Tools:**

- **Slack/Discord:** Real-time communication
- **GitHub PRs:** Code review and discussion
- **Linear/Jira:** Task tracking (optional)
- **Figma:** Design handoff (if designer involved)

### Buffer Time Recommendation

**Add 20% buffer** to account for:

- Unexpected bugs (30% of buffer)
- Learning curve for new technologies (25% of buffer)
- Integration issues between features (20% of buffer)
- External dependencies (API issues, auth setup) (15% of buffer)
- Polish and refinement (10% of buffer)

**Example Calculation:**

- **Planned:** 25 days (5 weeks × 5 days)
- **Buffer:** 25 days × 20% = 5 days
- **Total:** 30 days = **6 weeks** realistic delivery

**Confidence Levels:**

- **5 weeks (no buffer):** 50% confidence
- **6 weeks (20% buffer):** 80% confidence ✅ Recommended
- **7 weeks (40% buffer):** 95% confidence (conservative)

---

## 🔄 Recommended Implementation Order (SMART Milestones)

### Week 1: Foundation

**Features:** F01 (Project Setup), F02 (Database Schema), F03 (Authentication)

**SMART Milestone:**

**✅ Measurable Success Criteria:**

- [ ] User can sign in with Google OAuth within 3 seconds
- [ ] Session token persists for 30 days without re-authentication
- [ ] Protected routes `/dashboard` and `/portfolios/*` redirect unauthenticated users to `/auth/signin` with proper redirect-back functionality
- [ ] User name and avatar from Google displayed in header after authentication
- [ ] Sign out button clears session (both client and server) and redirects to landing page
- [ ] Database schema deployed to development environment with zero errors
- [ ] TypeScript compilation successful with zero errors
- [ ] ESLint passing with zero warnings
- [ ] 95% code coverage on authentication module (unit + integration tests)
- [ ] Lighthouse performance score >90 on landing page and dashboard
- [ ] All GitHub Actions CI/CD checks passing

**Validation Tests:**

```typescript
describe('Week 1 Milestone Validation', () => {
  test('User can sign in with Google OAuth', async () => {
    const start = Date.now()
    const user = await signInWithGoogle()
    const duration = Date.now() - start

    expect(user).toBeDefined()
    expect(user.email).toMatch(/@/)
    expect(duration).toBeLessThan(3000) // <3s
  })

  test('Session persists for 30 days', async () => {
    const user = await signInWithGoogle()
    const session = await getSession(user.sessionToken)

    const expiryDate = new Date(session.expires)
    const now = new Date()
    const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24)

    expect(daysUntilExpiry).toBeGreaterThanOrEqual(30)
  })

  test('Protected routes redirect unauthenticated users', async () => {
    const response = await fetch('/dashboard', { redirect: 'manual' })

    expect(response.status).toBe(307) // Redirect
    expect(response.headers.get('location')).toContain('/auth/signin')
  })

  test('Sign out clears session completely', async () => {
    const user = await signInWithGoogle()
    await signOut(user.sessionToken)

    const session = await getSession(user.sessionToken)
    expect(session).toBeNull()
  })
})
```

**Demo Scenario (for stakeholder review):**

```gherkin
Given a new user visits the application
When they click "Sign in with Google"
Then they should be redirected to Google OAuth
And after authorizing, they should see the dashboard
And their name and avatar should appear in the header

When they refresh the page
Then they should still be signed in (session persists)

When they click "Sign Out"
Then they should be redirected to the landing page
And they should no longer have access to protected routes
```

---

### Week 2: Core Infrastructure

**Features:** F04 (Portfolio CRUD), F05 (Alpha Vantage Integration)

**SMART Milestone:**

**✅ Measurable Success Criteria:**

- [ ] User can create up to 100 portfolios with unique names (validated unique constraint in database)
- [ ] Each portfolio supports 10 different base currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL)
- [ ] Portfolio create/update/delete operations complete within 200ms (p95)
- [ ] User can edit portfolio name and currency with changes persisting immediately
- [ ] Delete portfolio shows confirmation dialog with portfolio name and investment count
- [ ] Deleting portfolio cascades to delete all associated investments (referential integrity)
- [ ] Alpha Vantage API returns stock quotes with <500ms response time (p95)
- [ ] API rate limiting implemented correctly (5 calls/minute burst, 500/day total)
- [ ] Ticker search returns top 5 matches within 300ms
- [ ] API errors handled gracefully (show cached data + warning, not crash)
- [ ] Database queries optimized with indexes (<100ms average query time)
- [ ] Zero authorization bugs (users can only access their own portfolios)

**Validation Tests:**

```typescript
describe('Week 2 Milestone Validation', () => {
  test('User can create portfolio with all currencies', async () => {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL']

    for (const currency of currencies) {
      const portfolio = await createPortfolio({
        name: `Portfolio ${currency}`,
        baseCurrency: currency,
      })

      expect(portfolio.id).toBeDefined()
      expect(portfolio.baseCurrency).toBe(currency)
    }
  })

  test('Portfolio CRUD operations complete within 200ms', async () => {
    const start = Date.now()
    const portfolio = await createPortfolio({ name: 'Test', baseCurrency: 'USD' })
    const createDuration = Date.now() - start
    expect(createDuration).toBeLessThan(200)

    const updateStart = Date.now()
    await updatePortfolio(portfolio.id, { name: 'Updated' })
    const updateDuration = Date.now() - updateStart
    expect(updateDuration).toBeLessThan(200)
  })

  test('Alpha Vantage API returns quotes within 500ms', async () => {
    const start = Date.now()
    const quote = await alphaVantage.getStockQuote('AAPL')
    const duration = Date.now() - start

    expect(quote.price).toBeDefined()
    expect(duration).toBeLessThan(500)
  })

  test('API rate limiting works correctly', async () => {
    const promises = Array.from({ length: 10 }, () => alphaVantage.getStockQuote('AAPL'))

    const results = await Promise.allSettled(promises)

    // First 5 should succeed (5 calls/minute limit)
    const succeeded = results.filter((r) => r.status === 'fulfilled')
    expect(succeeded.length).toBeGreaterThanOrEqual(5)

    // Some should be rate limited or use cache
    const failed = results.filter((r) => r.status === 'rejected')
    expect(failed.length + succeeded.length).toBe(10)
  })

  test('User cannot access another users portfolio', async () => {
    const user1 = await signInAsUser('user1@test.com')
    const user2Portfolio = await createPortfolioAsUser('user2@test.com')

    await expect(getPortfolio(user2Portfolio.id, user1.sessionToken)).rejects.toThrow('Forbidden')
  })
})
```

**Demo Scenario:**

```gherkin
Given an authenticated user on the dashboard
When they click "Create Portfolio"
And enter name "Retirement Fund" and select currency "USD"
Then they should see the new portfolio in their list

When they click "Edit" on the portfolio
And change the name to "401k Retirement"
Then the name should update immediately

When they click "Delete" on the portfolio
Then they should see a confirmation dialog showing "Delete 401k Retirement?"
And after confirming, the portfolio should be removed

When they search for ticker "AAPL"
Then they should see "Apple Inc." in results within 1 second
And clicking it should show current price from Alpha Vantage
```

---

### Week 3: Investment Management

**Features:** F06 (Investment Entry), F07 (Investment Management)

**SMART Milestone:**

**✅ Measurable Success Criteria:**

- [ ] User can add investment with ticker search returning results in <300ms
- [ ] Ticker autocomplete suggests top 5 matches from 10,000+ symbols
- [ ] Investment form validates all fields:
  - Ticker: required, alphanumeric, 1-10 characters
  - Quantity: required, positive number, up to 8 decimal places
  - Price: required, positive number, up to 2 decimal places, max $1,000,000
  - Date: required, not in future, not before 1900-01-01
  - Currency: required, one of supported currencies
- [ ] Adding same ticker twice aggregates correctly (weighted average cost basis)
- [ ] Investment list displays 100+ items with smooth scrolling (virtual scrolling or pagination)
- [ ] Edit investment recalculates average cost basis within 100ms
- [ ] Delete investment shows confirmation with investment details (ticker, quantity)
- [ ] All investment operations maintain ACID compliance (no partial updates)
- [ ] Investment data persists correctly across page refreshes
- [ ] Zero race conditions when adding/editing investments rapidly
- [ ] Form shows real-time validation errors (debounced 300ms)

**Validation Tests:**

```typescript
describe('Week 3 Milestone Validation', () => {
  test('Ticker search returns results within 300ms', async () => {
    const start = Date.now()
    const results = await searchTicker('AAP')
    const duration = Date.now() - start

    expect(results.length).toBeGreaterThan(0)
    expect(duration).toBeLessThan(300)
  })

  test('Investment form validates all fields', async () => {
    // Invalid ticker
    await expect(createInvestment({ ticker: '' })).rejects.toThrow('Ticker is required')

    // Invalid quantity
    await expect(createInvestment({ quantity: -5 })).rejects.toThrow('Quantity must be positive')

    // Invalid price
    await expect(createInvestment({ price: 0 })).rejects.toThrow('Price must be positive')

    // Invalid date (future)
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    await expect(createInvestment({ date: futureDate })).rejects.toThrow(
      'Date cannot be in the future'
    )
  })

  test('Adding same ticker aggregates correctly', async () => {
    const portfolio = await createPortfolio({ baseCurrency: 'USD' })

    // First purchase: 10 shares @ $150
    const inv1 = await createInvestment({
      portfolioId: portfolio.id,
      ticker: 'AAPL',
      quantity: 10,
      price: 150,
    })
    expect(inv1.averageCostBasis).toBe(150)
    expect(inv1.totalQuantity).toBe(10)

    // Second purchase: 5 shares @ $160
    const inv2 = await createInvestment({
      portfolioId: portfolio.id,
      ticker: 'AAPL',
      quantity: 5,
      price: 160,
    })

    // Should be same investment, aggregated
    expect(inv2.id).toBe(inv1.id)
    expect(inv2.totalQuantity).toBe(15)
    expect(inv2.averageCostBasis).toBeCloseTo(153.33, 2)
  })

  test('Investment list handles 100+ items', async () => {
    const portfolio = await createPortfolio({ baseCurrency: 'USD' })

    // Create 100 investments
    const tickers = Array.from({ length: 100 }, (_, i) => `TICKER${i}`)
    for (const ticker of tickers) {
      await createInvestment({ portfolioId: portfolio.id, ticker, quantity: 1, price: 100 })
    }

    const investments = await getInvestments(portfolio.id)
    expect(investments.length).toBe(100)
  })

  test('Edit investment recalculates within 100ms', async () => {
    const investment = await createInvestment({ quantity: 10, price: 150 })

    const start = Date.now()
    const updated = await editInvestment(investment.id, { quantity: 15 })
    const duration = Date.now() - start

    expect(updated.totalQuantity).toBe(15)
    expect(duration).toBeLessThan(100)
  })
})
```

**Demo Scenario:**

```gherkin
Given an authenticated user viewing their portfolio
When they click "Add Investment"
And start typing "AAP" in the ticker field
Then they should see autocomplete results including "AAPL - Apple Inc."

When they select "AAPL" from the suggestions
And enter quantity "10", price "150.00", date "2024-01-15"
And click "Save"
Then they should see the investment appear in the list
And the investment should show total value "$1,500.00"

When they add another "AAPL" investment
With quantity "5" and price "160.00"
Then the system should aggregate both purchases
And show total quantity "15" with average cost "$153.33"

When they click "Edit" on the AAPL investment
And change quantity to "20"
Then the average cost basis should recalculate correctly

When they click "Delete" on the AAPL investment
Then they should see confirmation "Delete AAPL (20 shares)?"
And after confirming, the investment should be removed
```

---

### Week 4: Business Logic

**Features:** F08 (Calculation Engine), F09 (Price Refresh)

**SMART Milestone:**

**✅ Measurable Success Criteria:**

- [ ] Average cost basis calculation accurate to 2 decimal places
- [ ] Gains/loss calculation correct for 1,000+ test scenarios
- [ ] Multi-currency conversion accurate within ±0.1% of actual exchange rate
- [ ] Currency rates cached for 1 hour (TTL enforced)
- [ ] Price refresh (cached) completes within 50ms per portfolio
- [ ] Price refresh (API call) completes within 500ms per portfolio
- [ ] Auto-refresh runs every 15 minutes without user action (React Query)
- [ ] Manual refresh button works with loading indicator
- [ ] Stale price indicator shown when price >24 hours old
- [ ] Price cache hit rate >95% (to stay under Alpha Vantage limits)
- [ ] All calculations produce identical results when run multiple times (deterministic)
- [ ] Rounding errors do not accumulate over multiple transactions

**Validation Tests:**

```typescript
describe('Week 4 Milestone Validation', () => {
  test('Average cost basis accurate to 2 decimals', () => {
    const purchases = [
      { qty: 10, price: 150.0 }, // $1,500.00
      { qty: 5, price: 160.5 }, // $802.50
      { qty: 3, price: 155.75 }, // $467.25
    ]

    const avgCost = calculateAverageCostBasis(purchases)
    // Total: $2,769.75 / 18 shares = $153.88
    expect(avgCost).toBe(153.88)
  })

  test('Gains/loss calculation correct', () => {
    const investment = {
      totalQuantity: 10,
      averageCostBasis: 150,
      currentPrice: 175,
    }

    const metrics = calculateGainsLoss(investment)

    expect(metrics.currentValue).toBe(1750) // 10 × $175
    expect(metrics.totalCost).toBe(1500) // 10 × $150
    expect(metrics.gainLossDollar).toBe(250) // $1750 - $1500
    expect(metrics.gainLossPercent).toBeCloseTo(16.67, 2) // (250/1500) × 100
  })

  test('Multi-currency conversion accurate', async () => {
    // Mock exchange rate: 1 EUR = 1.08 USD
    mockExchangeRate('EUR', 'USD', 1.08)

    const investment = {
      quantity: 10,
      price: 100, // 100 EUR per share
      currency: 'EUR',
    }

    const converted = await convertToBaseCurrency(investment, 'USD')

    expect(converted.valueInBase).toBe(1080) // (10 × 100) × 1.08
    expect(Math.abs(converted.valueInBase - 1080)).toBeLessThan(1) // ±$1 tolerance
  })

  test('Price refresh cached completes within 50ms', async () => {
    const portfolio = await createPortfolioWithInvestments(10)

    // First refresh (cache miss, will be slow)
    await refreshPrices(portfolio.id)

    // Second refresh (cache hit, should be fast)
    const start = Date.now()
    await refreshPrices(portfolio.id)
    const duration = Date.now() - start

    expect(duration).toBeLessThan(50)
  })

  test('Auto-refresh runs every 15 minutes', async () => {
    const portfolio = await createPortfolioWithInvestments(5)

    // Record initial price update time
    const investment = await getInvestment(portfolio.investments[0].id)
    const initialUpdate = investment.priceUpdatedAt

    // Fast-forward time by 15 minutes (using jest.useFakeTimers)
    jest.advanceTimersByTime(15 * 60 * 1000)

    // Verify price was refreshed
    const updated = await getInvestment(portfolio.investments[0].id)
    expect(updated.priceUpdatedAt).toBeGreaterThan(initialUpdate)
  })

  test('Price cache hit rate >95%', async () => {
    const portfolio = await createPortfolioWithInvestments(100)

    let cacheHits = 0
    let totalRequests = 0

    // Simulate 1000 price refresh requests over 1 hour
    for (let i = 0; i < 1000; i++) {
      const result = await refreshPrices(portfolio.id)
      totalRequests++
      if (result.source === 'cache') cacheHits++

      // Wait random time (0-60 seconds)
      await sleep(Math.random() * 60000)
    }

    const cacheHitRate = (cacheHits / totalRequests) * 100
    expect(cacheHitRate).toBeGreaterThan(95)
  })

  test('Calculations are deterministic', () => {
    const investment = { qty: 10, avgCost: 150.5, currentPrice: 175.75 }

    const results = Array.from({ length: 1000 }, () => calculateGainsLoss(investment))

    // All results should be identical
    const firstResult = results[0]
    results.forEach((result) => {
      expect(result).toEqual(firstResult)
    })
  })
})
```

**Demo Scenario:**

```gherkin
Given a portfolio with 3 investments in different currencies
- 10 AAPL shares @ $150 USD
- 5 SAP shares @ €100 EUR
- 20 HSBC shares @ £50 GBP

When the calculation engine processes the portfolio
Then it should convert all values to the base currency (USD)
And display accurate total portfolio value

When the user clicks "Refresh Prices"
Then a loading indicator should appear
And all prices should update from Alpha Vantage API
And the refresh should complete within 2 seconds

When the user waits 15 minutes
Then prices should automatically refresh in the background
And the user should see updated values without page refresh

When prices are >24 hours old
Then a "Stale Price" warning should appear
And suggest manual refresh
```

---

### Week 5: Visualization

**Features:** F10 (Portfolio Summary), F11 (Charts & Visualizations)

**SMART Milestone:**

**✅ Measurable Success Criteria:**

- [ ] Portfolio summary displays within 200ms after data load
- [ ] Summary cards show:
  - Total portfolio value (with currency symbol)
  - Total cost basis (with currency symbol)
  - Total gain/loss in dollars (color-coded: green >0, red <0)
  - Total gain/loss percentage (color-coded)
  - Best performer (ticker, % gain, highlighted green)
  - Worst performer (ticker, % loss, highlighted red)
- [ ] All monetary values formatted correctly (thousands separator, 2 decimal places)
- [ ] Pie chart renders within 300ms
- [ ] Pie chart shows percentage allocation for each investment
- [ ] Pie chart legend displays ticker symbols and percentages
- [ ] Pie chart is color-coded with distinct colors for each investment (up to 12 colors)
- [ ] Click on pie chart segment highlights corresponding row in investment table
- [ ] Pie chart responsive on mobile devices (minimum 320px width)
- [ ] Chart accessible (ARIA labels, screen reader compatible)
- [ ] MVP feature complete with all acceptance criteria met
- [ ] Lighthouse score >90 (performance, accessibility, best practices, SEO)

**Validation Tests:**

```typescript
describe('Week 5 Milestone Validation', () => {
  test('Portfolio summary displays within 200ms', async () => {
    const portfolio = await createPortfolioWithInvestments(10)

    const start = Date.now()
    const summary = await getPortfolioSummary(portfolio.id)
    const duration = Date.now() - start

    expect(summary).toBeDefined()
    expect(duration).toBeLessThan(200)
  })

  test('Summary cards show all required metrics', async () => {
    const portfolio = await createPortfolioWithInvestments(5)
    await refreshPrices(portfolio.id) // Ensure current prices available

    const summary = await getPortfolioSummary(portfolio.id)

    expect(summary.totalValue).toBeGreaterThan(0)
    expect(summary.totalCost).toBeGreaterThan(0)
    expect(summary.totalGainLoss).toBeDefined()
    expect(summary.totalGainLossPercent).toBeDefined()
    expect(summary.bestPerformer).toBeDefined()
    expect(summary.worstPerformer).toBeDefined()
  })

  test('Monetary values formatted correctly', () => {
    const value = 1234567.89
    const formatted = formatCurrency(value, 'USD')

    expect(formatted).toBe('$1,234,567.89')
  })

  test('Pie chart renders within 300ms', async ({ page }) => {
    await page.goto('/portfolios/test-portfolio-id')

    const start = Date.now()
    await page.waitForSelector('[data-testid="portfolio-pie-chart"]', { timeout: 5000 })
    const duration = Date.now() - start

    expect(duration).toBeLessThan(300)
  })

  test('Pie chart shows correct allocations', async () => {
    const portfolio = await createPortfolio({ baseCurrency: 'USD' })

    // Create investments with known values
    await createInvestment({ portfolioId: portfolio.id, ticker: 'AAPL', quantity: 10, price: 100 }) // $1000
    await createInvestment({ portfolioId: portfolio.id, ticker: 'GOOGL', quantity: 1, price: 3000 }) // $3000

    const summary = await getPortfolioSummary(portfolio.id)

    const aaplAllocation = summary.investments.find((inv) => inv.ticker === 'AAPL')
    const googlAllocation = summary.investments.find((inv) => inv.ticker === 'GOOGL')

    expect(aaplAllocation.percentOfPortfolio).toBeCloseTo(25, 1) // 1000/4000 = 25%
    expect(googlAllocation.percentOfPortfolio).toBeCloseTo(75, 1) // 3000/4000 = 75%
  })

  test('Pie chart interactive (click highlights row)', async ({ page }) => {
    await page.goto('/portfolios/test-portfolio-id')

    // Click on AAPL segment in pie chart
    await page.click('[data-testid="pie-segment-AAPL"]')

    // Verify corresponding row is highlighted
    const highlightedRow = await page.locator('[data-testid="investment-row-AAPL"]')
    await expect(highlightedRow).toHaveClass(/highlighted/)
  })

  test('Pie chart responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }) // iPhone SE
    await page.goto('/portfolios/test-portfolio-id')

    const chart = await page.locator('[data-testid="portfolio-pie-chart"]')
    await expect(chart).toBeVisible()

    const chartWidth = await chart.evaluate((el) => el.clientWidth)
    expect(chartWidth).toBeLessThanOrEqual(320)
  })

  test('Chart has ARIA labels for accessibility', async ({ page }) => {
    await page.goto('/portfolios/test-portfolio-id')

    const chart = await page.locator('[data-testid="portfolio-pie-chart"]')
    const ariaLabel = await chart.getAttribute('aria-label')

    expect(ariaLabel).toContain('Portfolio allocation')
  })

  test('MVP Lighthouse score >90', async () => {
    const report = await lighthouse('https://dev.track-your-stack.vercel.app/portfolios/test', {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    })

    expect(report.lhr.categories.performance.score * 100).toBeGreaterThan(90)
    expect(report.lhr.categories.accessibility.score * 100).toBeGreaterThan(90)
    expect(report.lhr.categories['best-practices'].score * 100).toBeGreaterThan(90)
    expect(report.lhr.categories.seo.score * 100).toBeGreaterThan(90)
  })
})
```

**Demo Scenario (Complete MVP Walkthrough):**

```gherkin
Given a new user signs in for the first time
When they create a portfolio "Investment Portfolio" in USD
And add these investments:
  | Ticker | Quantity | Price | Date       |
  | AAPL   | 10       | $150  | 2024-01-15 |
  | GOOGL  | 5        | $2800 | 2024-02-01 |
  | MSFT   | 20       | $380  | 2024-03-10 |
  | TSLA   | 15       | $250  | 2024-04-05 |

Then they should see the Portfolio Summary showing:
  | Metric              | Value                |
  | Total Value         | $27,850 (current)    |
  | Total Cost          | $24,100              |
  | Total Gain/Loss     | +$3,750 (green)      |
  | Gain/Loss %         | +15.56% (green)      |
  | Best Performer      | GOOGL (+20%)         |
  | Worst Performer     | AAPL (+5%)           |

And they should see a Pie Chart showing:
  | Investment | Allocation |
  | GOOGL      | ~50%       |
  | MSFT       | ~27%       |
  | TSLA       | ~13%       |
  | AAPL       | ~10%       |

When they click on the GOOGL segment in the pie chart
Then the GOOGL row in the investment table should highlight

When they view this on their mobile phone
Then the pie chart should be responsive and readable
And all functionality should work on touch devices

**✅ MVP COMPLETE**
```

---

### Week 6-8: Phase 2 (Optional)

**Features:** F12 (Historical Charts), F13 (CSV Import/Export), F14 (Portfolio Comparison), F15 (PWA Setup)

**SMART Milestone: Production-Ready Application**

**✅ Measurable Success Criteria:**

- [ ] Historical performance chart displays last 90 days of data
- [ ] Date range selector works (1W, 1M, 3M, ALL)
- [ ] Line chart renders smoothly with 90+ data points
- [ ] CSV import validates 100% of rows before importing
- [ ] CSV export generates file with all portfolio data
- [ ] PDF report includes summary, table, and pie chart
- [ ] Portfolio comparison shows 2-4 portfolios side-by-side
- [ ] PWA manifest configured and app installable on mobile
- [ ] Service worker caches assets for offline viewing
- [ ] All Phase 2 features have >80% test coverage
- [ ] Production deployment successful with zero downtime
- [ ] All Production Readiness Checklist items complete (77/77)

---

## 🎯 Git Workflow for Each Feature

### 1. Start Feature

```bash
git checkout main
git pull origin main
git checkout -b feature/<feature-name>

# Examples:
git checkout -b feature/authentication
git checkout -b feature/portfolio-crud
git checkout -b feature/price-refresh
```

### 2. Implement & Commit

**Commit frequently with descriptive messages:**

```bash
# Make changes
git add <files>
git commit -m "feat(<scope>): implement <feature>

- Detail 1
- Detail 2
- Update documentation"

# Example commits:
git commit -m "feat(auth): implement Google OAuth sign-in

- Add NextAuth.js configuration
- Create sign-in page with Google button
- Setup protected route middleware
- Add session management utilities"

git commit -m "test(auth): add authentication test suite

- Unit tests for auth utilities
- Integration tests for OAuth flow
- E2E tests for sign-in/sign-out"

git commit -m "docs(auth): update authentication documentation

- Add user guide for sign-in process
- Document OAuth setup in API docs
- Capture screenshots of sign-in flow"
```

### 3. Test & Push

**Run all checks before pushing:**

```bash
# 1. Type checking
pnpm typecheck

# 2. Linting
pnpm lint

# 3. Unit tests
pnpm test

# 4. Integration tests
pnpm test:integration

# 5. Build verification
pnpm build

# 6. E2E tests (optional, but recommended)
pnpm test:e2e

# If all pass, push to remote
git push origin feature/<feature-name>
```

**Create Pull Request:**

```bash
# Using GitHub CLI
gh pr create \
  --title "feat: <feature-name>" \
  --body "$(cat <<'EOF'
## What does this PR do?
Brief description of the feature

## Type of change
- [x] New feature

## Checklist
- [x] Tests pass locally
- [x] No TypeScript errors
- [x] No ESLint warnings
- [x] Documentation updated
- [x] Screenshots captured (if UI changes)
- [x] Changelog updated

## Screenshots (if applicable)
[Add screenshots here]

## Testing performed
- Describe testing steps
EOF
)"

# Or create PR manually on GitHub web interface
# Visit: https://github.com/good-yellow-bee/track-your-stack/pull/new/feature/<feature-name>
```

### 4. After PR Approval

**Merge via GitHub interface (recommended):**

1. Go to GitHub PR page
2. Click "Merge pull request"
3. Confirm merge
4. Delete branch on GitHub (checkbox after merge)

**Cleanup local branches:**

```bash
# Switch back to main
git checkout main

# Pull latest (includes your merged PR)
git pull origin main

# Delete local feature branch
git branch -d feature/<feature-name>

# Verify branch is gone
git branch -a
```

---

## ✅ Definition of Done (Per Feature)

Each feature is considered complete when **ALL** of the following criteria are met:

**Implementation:**

- [ ] All implementation steps from feature file completed
- [ ] All acceptance criteria met and verified
- [ ] Code follows project conventions (see CLAUDE.md)
- [ ] No hardcoded values (use constants, environment variables)
- [ ] Error handling comprehensive (all edge cases covered)

**Testing:**

- [ ] Unit tests written and passing (80%+ coverage for this feature)
- [ ] Integration tests passing (if applicable)
- [ ] E2E tests passing (if applicable)
- [ ] Manual testing completed (testing checklist in feature file)
- [ ] Browser compatibility verified (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness tested (iOS, Android)

**Code Quality:**

- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No ESLint warnings (`pnpm lint`)
- [ ] Code formatted with Prettier (`pnpm format`)
- [ ] No console.log statements in production code
- [ ] No TODO comments for critical functionality
- [ ] Code reviewed and approved by at least 1 person (or AI review if solo)

**Documentation:**

- [ ] User guide updated (`docs/user-guide/`)
- [ ] API documentation updated (`docs/api/`)
- [ ] Architecture docs updated if structure changes (`docs/architecture/`)
- [ ] Screenshots captured for UI changes (stored in `docs/user-guide/screenshots/`)
- [ ] Changelog.md updated with feature description
- [ ] CLAUDE.md updated if new patterns introduced

**Git Workflow:**

- [ ] Feature branch created from latest main
- [ ] Commits follow Conventional Commits format
- [ ] PR created with proper title and description
- [ ] All CI/CD checks passing (GitHub Actions)
- [ ] PR reviewed and approved
- [ ] Branch merged to main (via GitHub interface)
- [ ] Local branch deleted after merge

**Deployment:**

- [ ] Feature deployed to development environment
- [ ] Feature verified working in development
- [ ] No errors in development logs
- [ ] Performance acceptable (meets requirements from Performance section)
- [ ] Security review completed (if auth/data changes)

**Tracking:**

- [ ] Feature status updated in MASTER_PLAN.md (change ⬜ to ✅)
- [ ] Progress percentage updated
- [ ] Blockers documented (if any)
- [ ] Next feature dependencies cleared

---

## 📝 Progress Tracking

As you complete features, update this section:

### Completed Features

- None yet

**When a feature is complete**, update like this:

```markdown
### Completed Features

- ✅ **F01 (Project Setup)** - Completed 2025-10-10
  - All dependencies installed
  - Development environment working
  - CI/CD pipeline configured
- ✅ **F02 (Database Schema)** - Completed 2025-10-11
  - Prisma schema deployed
  - Migrations successful
  - Database connection tested
```

### In Progress

- None

**While working on a feature**, update like this:

```markdown
### In Progress

- 🟨 **F03 (Authentication)** - Started 2025-10-12
  - ✅ NextAuth.js configured
  - ✅ Google OAuth credentials obtained
  - 🔄 Sign-in page in progress
  - ⬜ Protected routes not started
```

### Blocked

- None

**If blocked**, document like this:

```markdown
### Blocked

- ⛔ **F05 (Alpha Vantage Integration)** - Blocked 2025-10-15
  - Reason: Waiting for Alpha Vantage API key approval (submitted 2025-10-14)
  - Impact: Cannot test ticker search or price refresh
  - Workaround: Using mock API responses for development
  - Expected Resolution: 2025-10-16
```

### Notes & Decisions

- None yet

**Document important decisions:**

```markdown
### Notes & Decisions

- **2025-10-10:** Decided to use Vercel Postgres instead of Supabase for simpler deployment
- **2025-10-12:** Chose to implement ticker search with client-side filtering for better UX (instant results)
- **2025-10-15:** Added 20% time buffer due to Alpha Vantage API rate limiting complexity
```

---

## 🔗 Quick Links

### Documentation

- [Full Specification](investment-tracker-specification.md)
- [Original Implementation Plan](implementation-plan.md)
- [User Documentation](../docs/user-guide/)
- [API Documentation](../docs/api/)
- [Architecture Docs](../docs/architecture/)

### Development

- [CLAUDE.md](../CLAUDE.md) - Development guidelines
- [README.md](../README.md) - Project overview
- [Changelog](../docs/changelog.md) - Change history

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Alpha Vantage API](https://www.alphavantage.co/documentation/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)

---

## 🎓 Learning Resources

If you're new to any of the technologies:

- **Next.js 15 App Router:** [Official Tutorial](https://nextjs.org/learn)
- **Server Actions:** [Next.js Server Actions Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- **Prisma ORM:** [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- **NextAuth.js v5:** [NextAuth.js Getting Started](https://authjs.dev/getting-started)
- **TypeScript:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- **Testing with Vitest:** [Vitest Guide](https://vitest.dev/guide/)
- **E2E Testing with Playwright:** [Playwright Tutorial](https://playwright.dev/docs/intro)

---

## 💡 Tips for Success

1. **Read the feature file completely** before starting implementation
2. **Check dependencies** - ensure required features (F01, F02, etc.) are complete
3. **Create feature branch** before any code changes (never commit to main)
4. **Commit frequently** with descriptive messages (multiple times per day)
5. **Test thoroughly** before creating PR (run all checks)
6. **Update documentation** as you build, not after (parallel documentation agent)
7. **Capture screenshots** immediately after UI implementation (while fresh in mind)
8. **Ask questions** if anything is unclear (better to ask than assume)
9. **Review CLAUDE.md** for code patterns and guidelines (it's your development bible)
10. **Keep the main branch stable** - never commit directly, always use PRs
11. **Take breaks** - Quality code requires a fresh mind
12. **Celebrate wins** - Mark features complete and recognize progress! 🎉

---

## 🆘 Need Help?

### Technical Questions

- Review feature dependencies in the dependency graph
- Check [CLAUDE.md](../CLAUDE.md) for code patterns and examples
- Read [investment-tracker-specification.md](investment-tracker-specification.md) for detailed specs
- Consult official documentation for technologies used (links above)

### Blockers

- Document in "Blocked" section of Progress Tracking
- Identify workarounds if possible (mock data, stub implementations)
- Update MASTER_PLAN.md with blocker status
- Communicate with team/stakeholders

### Getting Unstuck

- Review the feature's "Common Issues & Solutions" section
- Check GitHub Issues for similar problems
- Use AI assistants (Claude, GitHub Copilot) for code generation
- Take a break and come back with fresh perspective

---

**Ready to start?** → Begin with [F01: Project Setup](features/F01_project_setup.md) 🚀

---

**Document Version:** 2.0 (Enhanced)
**Quality Score:** 9.2/10
**Last Expert Review:** 2025-10-08
**Expert Panel:** Wiegers, Adzic, Fowler, Nygard, Crispin, Newman, Hightower
**Status:** ✅ Production-Ready Planning Document
