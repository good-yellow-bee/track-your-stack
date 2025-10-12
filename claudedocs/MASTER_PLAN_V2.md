# Track Your Stack - Master Plan V2

**Version**: 2.0
**Date**: 2025-10-12
**Status**: Comprehensive Roadmap with Security, Business Logic, Data Integrity & UX Improvements

---

## Executive Summary

Track Your Stack is an investment portfolio tracking application built with Next.js 15, TypeScript, PostgreSQL, and Prisma. After completing the MVP implementation (F01-F08), a comprehensive analysis has identified **critical gaps** across five domains:

1. **Security** - 15 critical gaps requiring 22-25 days
2. **Business Logic** - 11 critical gaps requiring 33 days
3. **Data Integrity** - Database constraints and validation requiring 12 days
4. **User Experience** - 23 feature/UX improvements across 4 phases
5. **🆕 Competitive Parity** - 31 missing features vs leading platforms (8 critical features prioritized)

**Current State**: Functional MVP with basic portfolio tracking (~40% feature parity with competitors)
**Target State**: Production-ready platform with tax reporting, comprehensive security, professional UX, and 85%+ competitive feature parity

**Total Estimated Effort**:
- **Phases 1-6** (Core Platform): ~102-105 days (~5 months)
- **🆕 Phase 7** (Competitive Parity): +50 days (~2.5 months)
- **Total Timeline**: **~152-155 days** (~7.5 months)

**Recommended Approach**: Phased rollout with parallel tracks for security, business logic, UX, and competitive features

**Critical Competitive Gaps**:
- **100% of competitors** have asset allocation visualization (MISSING)
- **90%+ of competitors** have benchmarking capabilities (MISSING)
- **70%+ of competitors** have goal tracking/retirement planning (MISSING)

---

## Implementation Priority Decision

⚠️ **CRITICAL DECISION REQUIRED BEFORE STARTING IMPLEMENTATION**

Before beginning any phase, the team must choose an implementation strategy based on resources, timeline, and business goals. The full 7.5-month roadmap (Phases 0-7) represents the comprehensive path to production-ready SaaS. However, alternative paths exist for faster value delivery.

### Option A: Full Comprehensive Roadmap (7.5 months)
**Target**: Production-ready SaaS with competitive parity

**Timeline**: 152-155 days (~7.5 months)
**Team Size**: 6-7 developers + 1 designer + 1 QA
**Budget**: ~$400K-600K (assuming $100K/dev-year)

**Phases**: All phases 0-7 as documented below

**Delivers**:
- ✅ Enterprise-grade security (MFA, audit logging, GDPR)
- ✅ Comprehensive tax reporting (FIFO/LIFO, wash sales, 1099-B)
- ✅ Professional UX (dashboard, mobile, accessibility)
- ✅ 85%+ competitive feature parity (asset allocation, benchmarking, goals)
- ✅ Production-ready infrastructure (CI/CD, monitoring, backups)

**Best For**:
- Well-funded teams seeking product-market fit at scale
- SaaS business model with monetization strategy
- Competitive positioning against established players

---

### Option B: Solo Developer MVP Path (6-10 weeks) ⭐ RECOMMENDED FOR QUICK LAUNCH

**Target**: Beta launch to validate demand with core value proposition

**Timeline**: 42-50 days (6-10 weeks)
**Team Size**: 1-2 developers
**Budget**: ~$25K-40K

**Simplified Phases**:

#### **Phase 0A: Security Essentials (2 weeks, 10 days)**
- [ ] Multi-Factor Authentication (3 days)
  - Add `mfaEnabled`, `mfaSecret` to User model
  - Implement TOTP verification (authenticator app)
  - MFA setup flow in user settings
- [ ] Basic Audit Logging (4 days)
  - Log authentication events (login, logout, MFA setup)
  - Log critical mutations (portfolio/investment create/delete)
  - Simple audit log viewer (admin only)
- [ ] Enhanced Rate Limiting (2 days)
  - Implement Redis-based rate limiting
  - 100 requests/15min per user
- [ ] Input Validation (1 day)
  - Zod schemas for all forms
  - Server-side validation enforcement

#### **Phase 0B: Tax Reporting MVP (3-4 weeks, 15-20 days)**
- [ ] Tax Lot Tracking (10 days)
  - Add `TaxLot` model (purchase date, quantity, cost basis)
  - FIFO allocation only (simplest method)
  - Track remaining quantity per lot
  - Associate sales with specific tax lots
- [ ] Basic Capital Gains Report (5 days)
  - Calculate short-term vs long-term gains
  - Simple CSV export for TurboTax import
  - Year-to-date gains summary
- [ ] Tax Disclaimer (1 day)
  - Prominent disclaimer on all tax pages
  - "Not tax advice" messaging
  - Recommend CPA verification

#### **Phase 0C: UX Quick Wins (2 weeks, 10 days)**
- [ ] Dashboard Overview (4 days)
  - Total portfolio value card
  - Today's gain/loss card
  - Top performers/losers list
  - Recent activity feed
- [ ] Mobile Responsive (3 days)
  - Tailwind responsive classes
  - Mobile navigation menu
  - Touch-friendly interactions
- [ ] CSV Import (3 days)
  - Upload CSV with format: ticker, quantity, purchase_price, purchase_date
  - Bulk investment creation
  - Error handling and validation

**MVP Deliverables**:
- ✅ Secure authentication with MFA
- ✅ Basic tax lot tracking (FIFO only)
- ✅ Simple capital gains report for tax filing
- ✅ Mobile-friendly dashboard
- ✅ CSV bulk import capability
- ✅ Functional for US retail investors with tax needs

**What's NOT Included** (can add post-launch):
- ❌ Dividend tracking (add in iteration 1)
- ❌ Corporate actions (add when users report issues)
- ❌ GDPR compliance (not needed for US-only beta)
- ❌ Advanced dashboards (iterate based on feedback)
- ❌ Competitive features (asset allocation, benchmarking - add in iteration 2-3)

**Beta Launch Checklist**:
- [ ] Deploy to Vercel with production database
- [ ] Set up basic error monitoring (Sentry free tier)
- [ ] Create simple landing page explaining the MVP
- [ ] Recruit 20-50 beta users (Reddit r/investing, ProductHunt)
- [ ] Collect feedback via Typeform survey
- [ ] Monitor usage with PostHog (free tier)
- [ ] Iterate based on top 3 user requests

**Success Metrics**:
- 50 beta users signed up within 2 weeks
- 20+ users add at least 5 investments
- 10+ users generate tax report
- NPS score >30 (for MVP)
- <5 critical bugs reported

**Post-MVP Roadmap** (Iterate based on feedback):
1. **Iteration 1** (2-3 weeks): Dividend tracking + improved dashboard
2. **Iteration 2** (3-4 weeks): Asset allocation visualization + benchmarking
3. **Iteration 3** (2-3 weeks): Corporate actions + advanced tax features
4. **Iteration 4** (3-4 weeks): Goal tracking + notifications
5. **Iteration 5**: Full security hardening + GDPR (if expanding to EU)

**Best For**:
- Solo developers or small teams (1-2 people)
- Validating product-market fit before major investment
- Building in public and iterating with users
- Bootstrapped funding model

---

### Option C: Tax-First Specialist Approach (3-4 months)

**Target**: Niche market for tax-conscious US investors

**Timeline**: 60-80 days (3-4 months)
**Team Size**: 2-3 developers + 1 CPA consultant
**Budget**: ~$100K-150K

**Focus Areas**:
- **Security**: MFA only (minimal compliance)
- **Tax Reporting**: Comprehensive (all lot methods, wash sales, 1099-B, estimated taxes)
- **UX**: Minimal (desktop-only, basic dashboard)
- **Features**: Tax-centric (no dividend tracking unless tax-relevant)

**Phases**:
1. **Security Minimal** (1 week): MFA + basic audit logging
2. **Tax Reporting Comprehensive** (6-8 weeks):
   - All tax lot methods (FIFO, LIFO, Specific ID, Average Cost)
   - Wash sale detection and adjustment
   - Form 1099-B reconciliation
   - Form 8949 generation
   - Quarterly estimated tax calculator
   - CPA-friendly export formats
   - Professional tax disclaimer and documentation
3. **Data Integrity** (2 weeks): Database constraints, optimistic locking
4. **Basic UX** (1 week): Desktop-optimized interface, CSV import

**Best For**:
- Targeting active traders with complex tax situations
- Competing with TurboTax/H&R Block add-ons
- Positioning as "the tax expert's portfolio tracker"
- Potential B2B2C model (partnerships with CPAs)

---

### Recommendation Matrix

| Scenario | Recommended Option | Reasoning |
|----------|-------------------|-----------|
| Solo developer, bootstrapping | **Option B (MVP)** | Fastest validation, lowest risk |
| Small team (2-3), seeking funding | **Option B** → **Option A** | MVP first, then full roadmap with funding |
| Well-funded startup, competitive market | **Option A (Full)** | Comprehensive features needed to compete |
| Niche positioning for tax experts | **Option C (Tax-First)** | Differentiation through specialization |
| Open-source project | **Option B** → Community-driven | MVP to attract contributors |

---

## Critical Findings Summary

### Security Audit (22-25 Days)

**15 Critical Security Gaps Identified:**

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 CRITICAL | No Multi-Factor Authentication | Credential compromise risk | 3 days |
| 🔴 CRITICAL | No Audit Logging | No compliance trail | 4 days |
| 🔴 CRITICAL | Missing GDPR Compliance | Legal risk for EU users | 5 days |
| 🟡 HIGH | Weak Rate Limiting | DoS vulnerability | 3 days |
| 🟡 HIGH | No Session Management UI | Security awareness gap | 2 days |
| 🟡 HIGH | Insufficient Input Validation | Injection risks | 2 days |
| 🟡 HIGH | No Encryption Documentation | Unclear data protection | 2 days |

**Additional Gaps**: Content Security Policy, security headers, password requirements, dependency scanning, security testing, penetration testing, incident response plan

**Priority**: Must be addressed before public launch

---

### Business Logic Gaps (33 Days)

**11 Critical Financial Calculation Gaps:**

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 CRITICAL | No Tax Reporting | Unusable for US users | 15 days |
| 🔴 CRITICAL | No Dividend Tracking | 30-40% returns underreported | 7 days |
| 🔴 CRITICAL | No Corporate Actions | Data corruption on stock splits | 8 days |
| 🟡 HIGH | Transaction Fees Ignored | Inaccurate cost basis | 1 day |
| 🟡 HIGH | Wrong Currency Conversion | Incorrect multi-currency returns | 2 days |

**Additional Gaps**: Short selling, margin accounts, interest/fees, realized vs unrealized gains, year-end reports, multi-account consolidation

**Priority**: Tax reporting CRITICAL for US market viability

---

### Data Integrity Gaps (12 Days)

**12 Data Integrity Vulnerabilities:**

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 CRITICAL | No Database Constraints | Invalid data allowed | 2 days |
| 🔴 CRITICAL | No Optimistic Locking | Lost update conflicts | 2 days |
| 🟡 HIGH | No Price Validation | Corrupt price data | 2 days |
| 🟡 HIGH | Inconsistent Time Zones | Date boundary errors | 1 day |
| 🟡 HIGH | No Staleness Detection | Outdated data displayed | 1 day |

**Additional Gaps**: Uniqueness constraints, foreign key integrity, quantity validation, date validation, transaction isolation, retry logic, graceful degradation

**Priority**: Foundation for reliable calculations

---

### UX & Feature Gaps (35 Days Across 3 Phases)

**23 UX/Feature Opportunities Identified:**

**Phase 1: Quick Wins (8 features, 17 days)**
- Dashboard overview with key metrics
- Price refresh button with feedback
- Bulk price refresh
- CSV import functionality
- Performance charts
- Search/filter investments
- Mobile responsive design
- Accessibility improvements

**Phase 2: Strategic Initiatives (6 features, 14 days)**
- Onboarding flow & tutorial
- Notification system
- Advanced reporting & export
- Portfolio comparison
- Watchlist feature
- Social features (optional)

**Phase 3: Low Priority (9 features, 4 days)**
- Dark mode, currency settings, notes, news feed, rebalancing calculator, i18n, etc.

**Priority**: Phase 1 critical for user adoption

---

## Recommended Implementation Phases

### Phase 0: Foundation & Planning (Week 1-2, 10 days)

**Goals**:
- Establish development infrastructure
- Set up quality gates
- Plan parallel work tracks

**Deliverables**:
- [ ] Enhanced CI/CD pipeline (testing, security scans)
- [ ] Database backup strategy
- [ ] Development environment standardization
- [ ] Code review process documentation
- [ ] Sprint planning and resource allocation
- [ ] Risk mitigation plan

**Parallel Tracks Setup**:
- **Track A**: Security Team (2 developers)
- **Track B**: Business Logic Team (2 developers)
- **Track C**: UX/Frontend Team (1-2 developers)
- **Track D**: Data/Infrastructure Team (1 developer)

---

### Phase 1: Security Foundation (Weeks 3-6, 22-25 days)

**Track A: Critical Security (Weeks 3-6)**

**Week 3: Authentication & Authorization**
- [ ] Multi-Factor Authentication (TOTP)
  - Add `mfaEnabled`, `mfaSecret` to User model
  - Implement TOTP verification flow
  - Generate backup codes
  - MFA setup UI
- [ ] Session Management UI
  - Active sessions view
  - Device information display
  - Revoke session capability
- [ ] Enhanced input validation
  - Zod schemas for all forms
  - Server-side validation enforcement

**Week 4: Compliance & Logging**
- [ ] Audit Logging System
  - `AuditLog` model implementation
  - Audit middleware for all mutations
  - Audit log viewer UI
  - Log retention policy
- [ ] GDPR Compliance (Part 1)
  - Account deletion workflow
  - Data export functionality
  - Cookie consent banner

**Week 5: GDPR & Rate Limiting**
- [ ] GDPR Compliance (Part 2)
  - Privacy policy implementation
  - Terms of service
  - Data processing documentation
- [ ] Advanced Rate Limiting
  - Redis integration
  - Per-endpoint rate limits
  - Rate limit headers
  - Rate limit exceeded UI

**Week 6: Security Hardening**
- [ ] Content Security Policy
- [ ] Security headers (Helmet.js)
- [ ] Password requirements enforcement
- [ ] Dependency scanning automation
- [ ] Security testing suite
- [ ] Encryption documentation

**Deliverables**:
- ✅ MFA enabled for all users
- ✅ Complete audit trail
- ✅ GDPR compliant
- ✅ Production-grade rate limiting
- ✅ Comprehensive security documentation

---

### Phase 2: Business Logic & Data Integrity (Weeks 3-10, 45 days parallel with Security)

**Track B: Tax Reporting & Financial Accuracy (Weeks 3-7, 25 days)**

**Week 3-4: Tax Lot Foundation**
- [ ] Database schema updates
  - `TaxLot` model
  - `SaleTransaction` model
  - `TaxLotAllocation` model
  - `TaxMethod` enum
- [ ] Tax lot tracking implementation
  - Purchase → tax lot creation
  - Sale → tax lot allocation (FIFO/LIFO/Specific ID)
  - Remaining quantity tracking
  - Wash sale detection

**Week 5-6: Tax Calculations**
- [ ] Capital gains engine
  - Short-term vs long-term classification
  - Cost basis calculation with fees
  - Gain/loss calculation per sale
  - Wash sale adjustment
- [ ] 1099-B report generation
  - Form 8949 data export
  - TurboTax CSV format
  - PDF report generation

**Week 7: Dividend Tracking**
- [ ] Dividend model implementation
- [ ] Dividend yield calculations
- [ ] Qualified vs ordinary dividend classification
- [ ] Total return calculations (price + dividends)
- [ ] Dividend reinvestment tracking

**Week 8-9: Corporate Actions**
- [ ] Corporate action model
- [ ] Stock split handler
  - Adjust quantity, price, cost basis
  - Update tax lots proportionally
  - Audit trail
- [ ] Ticker change handler
- [ ] Merger/acquisition handler
- [ ] Spin-off handler
- [ ] Delisting handler

**Week 10: Currency & Fees**
- [ ] Historical exchange rate tracking
- [ ] Currency conversion at purchase time
- [ ] Transaction fee tracking
- [ ] Cost basis adjustments for fees

**Track D: Data Integrity (Weeks 3-5, 12 days parallel)**

**Week 3: Database Constraints**
- [ ] CHECK constraints (positive values, reasonable bounds)
- [ ] UNIQUE constraints (portfolio names, investment tickers)
- [ ] Foreign key integrity review
- [ ] Constraint violation testing

**Week 4: Validation & Concurrency**
- [ ] Price validation logic
- [ ] Quantity validation rules
- [ ] Date validation
- [ ] Optimistic locking implementation
- [ ] Version field on mutable entities
- [ ] Conflict resolution UI

**Week 5: Quality Assurance**
- [ ] Time zone standardization
- [ ] Price staleness detection
- [ ] Retry logic with exponential backoff
- [ ] Graceful degradation patterns
- [ ] Data consistency monitoring
- [ ] Automated integrity checks

**Deliverables**:
- ✅ Complete tax lot tracking
- ✅ Accurate capital gains calculations
- ✅ Dividend tracking and yield
- ✅ Corporate action handling
- ✅ Multi-currency accuracy
- ✅ Database integrity guaranteed

---

### Phase 3: UX Quick Wins (Weeks 7-10, 17 days)

**Track C: Critical UX Improvements**

**Week 7: Dashboard & Visualization**
- [ ] Dashboard overview cards
  - Total portfolio value
  - Aggregate gain/loss
  - Best/worst performers
- [ ] Performance charts
  - Line chart with time range selector
  - Portfolio value vs cost basis
  - Daily snapshot generation cron job

**Week 8: Mobile & Accessibility**
- [ ] Mobile responsive design
  - Table → Card list transformation
  - Bottom navigation
  - Touch-optimized interactions
- [ ] Accessibility improvements
  - ARIA labels
  - Keyboard navigation
  - Color contrast fixes
  - Skip navigation links
- [ ] Price refresh improvements
  - Manual refresh button per investment
  - Bulk refresh all prices
  - Progress indicators
  - Staleness indicators

**Week 9: Search & Import**
- [ ] Search and filter investments
  - Search by ticker
  - Filter by asset type
  - Sort by value/gain/loss
- [ ] CSV import functionality
  - File upload
  - Column mapping
  - Validation preview
  - Bulk import
  - Error handling

**Week 10: Polish & Testing**
- [ ] Loading states across app
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Empty states with helpful CTAs
- [ ] UX testing and bug fixes

**Deliverables**:
- ✅ Intuitive dashboard
- ✅ Mobile-friendly experience
- ✅ WCAG 2.1 AA compliant
- ✅ Fast onboarding (CSV import)
- ✅ Professional polish

---

### Phase 4: Strategic Features (Weeks 11-14, 14 days)

**Track C: Engagement & Retention**

**Week 11-12: Onboarding & Notifications**
- [ ] Welcome flow
  - 3-step onboarding wizard
  - Quick start checklist
  - Interactive product tour (react-joyride)
  - Sample portfolio option
- [ ] Notification system
  - Email notifications (Resend + React Email)
  - In-app notification center
  - Notification preferences
  - Price alerts
  - Weekly digest email

**Week 13: Reporting & Export**
- [ ] Advanced reporting
  - PDF portfolio report
  - CSV holdings export
  - JSON data export
  - TurboTax CSV export
- [ ] Year-end tax summary
  - Short-term capital gains
  - Long-term capital gains
  - Dividend income breakdown
  - Form 1099-DIV equivalent

**Week 14: Comparison & Watchlist**
- [ ] Portfolio comparison view
  - Side-by-side summary table
  - Performance chart overlay
  - Allocation breakdown comparison
- [ ] Watchlist feature
  - Create multiple watchlists
  - Add tickers to track
  - Price alerts on watchlist
  - Target price notifications

**Deliverables**:
- ✅ Low user abandonment
- ✅ High engagement
- ✅ Tax reporting ready
- ✅ Competitive feature parity

---

### Phase 5: Testing & Quality Assurance (Weeks 15-17, 15 days)

**Comprehensive Testing Strategy**

**Week 15: Unit & Integration Testing**
- [ ] Tax calculation tests
  - FIFO/LIFO/Specific ID scenarios
  - Wash sale detection
  - Capital gains classification
  - Dividend yield calculations
- [ ] Currency conversion tests
- [ ] Corporate action tests
- [ ] Data integrity tests
  - Database constraint violations
  - Optimistic locking conflicts
  - Validation edge cases

**Week 16: E2E & Security Testing**
- [ ] Playwright E2E tests
  - Complete user journey
  - Onboarding flow
  - Portfolio CRUD
  - Investment tracking
  - Tax report generation
- [ ] Security testing
  - OWASP Top 10 testing
  - Authentication flow testing
  - Authorization boundary testing
  - Rate limiting verification
  - Input validation fuzzing

**Week 17: Performance & Accessibility Testing**
- [ ] Performance testing
  - Lighthouse audits
  - Load testing (k6 or Artillery)
  - Database query optimization
  - API response time monitoring
- [ ] Accessibility audit
  - axe DevTools scan
  - Screen reader testing
  - Keyboard navigation validation
  - WCAG 2.1 AA compliance verification

**Deliverables**:
- ✅ 80%+ test coverage
- ✅ All OWASP Top 10 addressed
- ✅ Sub-3s page loads
- ✅ WCAG 2.1 AA compliant

---

### Phase 6: Beta Launch & Iteration (Weeks 18-20, 15 days)

**Controlled Beta Launch**

**Week 18: Beta Preparation**
- [ ] Beta user recruitment (50-100 users)
- [ ] Monitoring setup
  - Sentry for error tracking
  - PostHog/Mixpanel for analytics
  - Vercel analytics for performance
- [ ] Feedback collection system
  - In-app feedback widget
  - User interview scheduling
  - NPS survey

**Week 19: Beta Launch**
- [ ] Soft launch to beta users
- [ ] Daily monitoring and triage
- [ ] Bug fixing priority queue
- [ ] User interview sessions
- [ ] Feature usage analytics review

**Week 20: Iteration & Refinement**
- [ ] Critical bug fixes
- [ ] UX refinements based on feedback
- [ ] Performance optimizations
- [ ] Documentation improvements
- [ ] Prepare for public launch

**Deliverables**:
- ✅ 50+ beta users onboarded
- ✅ Feedback incorporated
- ✅ Critical bugs resolved
- ✅ NPS >40
- ✅ Ready for public launch

---

### Phase 7: Competitive Parity Features (Weeks 21-30, 50 days)

**Objective**: Close critical feature gaps identified through comprehensive competitor analysis to achieve 85%+ feature parity with leading platforms (Empower, Sharesight, Seeking Alpha, Stock Rover).

**Critical Finding**: 100% of analyzed competitors have asset allocation visualization and 90%+ have benchmarking capabilities - both currently missing from Track Your Stack.

**Week 21-22: Asset Allocation & Visualization (CRITICAL)**

**Why Critical**: Universal feature across ALL competitors, essential for portfolio understanding

- [ ] Asset Allocation Pie/Donut Chart (3 days)
  - Aggregate investments by `assetType` enum
  - Interactive chart with drill-down capability
  - Percentage labels and color coding
  - Use Recharts/Chart.js for visualization

- [ ] Sector Exposure Breakdown (5 days)
  - Add `sector` field to Investment model
  - Integrate Alpha Vantage `OVERVIEW` endpoint for sector data
  - Implement GICS sector classification
  - Sector breakdown bar chart with percentage
  - Benchmark sector allocation comparison

- [ ] Industry Exposure Analysis (3 days)
  - Add `industry` field to Investment model
  - Industry-level breakdown within sectors
  - Drill-down from sector view to industry view

- [ ] Geographic Allocation (2 days)
  - Add `country` field to Investment model
  - Map ticker symbols to countries (Alpha Vantage provides this)
  - Geographic breakdown visualization

**Database Schema Updates**:
```prisma
model Investment {
  // Existing fields...
  sector    String?  // Technology, Healthcare, Finance, etc.
  industry  String?  // Software, Pharmaceuticals, Banks, etc.
  country   String?  // US, GB, JP, etc.
  marketCap Decimal? @db.Decimal(20, 2)
}
```

---

**Week 23-24: Benchmarking & Performance (CRITICAL)**

**Why Critical**: 90%+ of competitors offer this - answers the #1 investor question: "Am I beating the market?"

- [ ] Benchmark Comparison Infrastructure (6 days)
  - Create `PortfolioBenchmark` model
  - Fetch benchmark historical prices (Alpha Vantage TIME_SERIES_DAILY)
  - Calculate benchmark returns over matching periods
  - Portfolio vs benchmark comparison chart
  - Display alpha (excess return vs benchmark)
  - Support multiple benchmarks (S&P 500, NASDAQ, custom ETFs)

- [ ] Portfolio Risk Score (4 days)
  - Calculate based on: asset allocation, volatility, concentration, beta
  - Weighted scoring algorithm (1-10 scale or Conservative/Moderate/Aggressive)
  - Risk score gauge visualization
  - Educational tooltips about risk levels

- [ ] Volatility Metrics (5 days)
  - Calculate daily/monthly returns from portfolio snapshots
  - Standard deviation of returns = volatility
  - Beta calculation vs market benchmark
  - Volatility chart over time
  - Sharpe ratio display (optional)

**Database Schema Updates**:
```prisma
model PortfolioBenchmark {
  id          String   @id @default(cuid())
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  benchmarkTicker String  // e.g., "SPY", "QQQ", "VTI"
  benchmarkName   String  // e.g., "S&P 500", "NASDAQ 100", "Total Market"
  weight          Decimal @default(1.0) @db.Decimal(5, 4)  // For blended benchmarks

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([portfolioId, benchmarkTicker])
  @@index([portfolioId])
}

model BenchmarkPrice {
  id          String   @id @default(cuid())
  ticker      String
  date        DateTime @db.Date
  closePrice  Decimal  @db.Decimal(20, 8)

  createdAt DateTime @default(now())

  @@unique([ticker, date])
  @@index([ticker, date])
}
```

---

**Week 25-26: Automation & Intelligence (HIGH PRIORITY)**

**Why Important**: 60%+ of competitors offer automated features - reduces manual effort and increases engagement

- [ ] Rebalancing Recommendations (8 days)
  - Create `TargetAllocation` model (portfolio → target % per dimension)
  - Calculate drift from target allocation
  - Generate recommended trades to minimize transactions
  - Tax-aware rebalancing (prefer tax-advantaged accounts)
  - Rebalancing wizard UI with preview

- [ ] Automated Price Alerts (6 days)
  - Create `PriceAlert` model
  - Background job checks prices against alerts (cron every 5 minutes)
  - Trigger notifications (email + in-app) when conditions met
  - Alert types: price above/below, percent gain/loss
  - Alert management UI with status tracking

**Database Schema Updates**:
```prisma
model TargetAllocation {
  id          String   @id @default(cuid())
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  allocationType AllocationDimension
  targetKey      String  // e.g., "STOCK", "Technology", "AAPL"
  targetPercent  Decimal @db.Decimal(5, 2)

  rebalanceThreshold Decimal @default(5.0) @db.Decimal(5, 2)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([portfolioId, allocationType, targetKey])
  @@index([portfolioId])
}

enum AllocationDimension {
  ASSET_TYPE
  SECTOR
  INDUSTRY
  TICKER
  COUNTRY
}

model RebalancingRecommendation {
  id          String   @id @default(cuid())
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  ticker      String
  action      RebalanceAction
  shares      Decimal  @db.Decimal(20, 8)
  currentPercent Decimal @db.Decimal(5, 2)
  targetPercent  Decimal @db.Decimal(5, 2)
  drift          Decimal @db.Decimal(5, 2)

  estimatedCost Decimal @db.Decimal(20, 2)
  taxImpact     Decimal? @db.Decimal(20, 2)

  createdAt DateTime @default(now())

  @@index([portfolioId, createdAt])
}

enum RebalanceAction {
  BUY
  SELL
  HOLD
}

model PriceAlert {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  investmentId String?
  investment   Investment? @relation(fields: [investmentId], references: [id], onDelete: Cascade)
  ticker       String

  alertType    PriceAlertType
  targetPrice  Decimal?  @db.Decimal(20, 8)
  percentChange Decimal? @db.Decimal(5, 2)

  triggered    Boolean  @default(false)
  triggeredAt  DateTime?

  notificationEmail Boolean @default(true)
  notificationInApp Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, triggered])
  @@index([ticker, triggered])
}

enum PriceAlertType {
  PRICE_ABOVE
  PRICE_BELOW
  PERCENT_GAIN
  PERCENT_LOSS
}
```

---

**Week 27-29: Goal Setting & Planning (HIGH PRIORITY)**

**Why Important**: 70%+ of competitors offer retirement planning - top use case for portfolio tracking

- [ ] Retirement Planning Calculator (10 days)
  - Create `Goal` model (retirement, home purchase, education, FIRE, custom)
  - Calculator inputs: current age, retirement age, current savings, monthly contribution, expected return
  - Projection algorithm with inflation adjustment
  - Success probability based on Monte Carlo simulation (simplified)
  - Visualization: projected vs required savings over time
  - Goal progress tracking linked to portfolios

- [ ] Goal Tracking System (6 days)
  - Progress tracking: `currentAmount / targetAmount`
  - Status calculation: on track, off track, at risk (based on time remaining and growth rate)
  - Linked portfolio tracking (auto-update from portfolio value)
  - Goal dashboard with progress bars
  - Milestone notifications

**Database Schema Updates**:
```prisma
enum GoalType {
  RETIREMENT
  HOME_PURCHASE
  EDUCATION
  EMERGENCY_FUND
  FINANCIAL_INDEPENDENCE
  CUSTOM
}

model Goal {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name        String
  type        GoalType
  targetAmount Decimal @db.Decimal(20, 2)
  targetDate   DateTime
  currentAmount Decimal @default(0) @db.Decimal(20, 2)

  // Retirement-specific fields
  monthlyContribution Decimal? @db.Decimal(20, 2)
  expectedReturnRate  Decimal? @db.Decimal(5, 2)  // e.g., 7.5 for 7.5%
  inflationRate       Decimal  @default(3.0) @db.Decimal(5, 2)  // e.g., 3.0 for 3%

  linkedPortfolioId String?
  linkedPortfolio   Portfolio? @relation(fields: [linkedPortfolioId], references: [id])

  status       GoalStatus @default(ON_TRACK)
  progressPercentage Decimal @default(0) @db.Decimal(5, 2)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, status])
  @@index([userId, targetDate])
}

enum GoalStatus {
  ON_TRACK
  OFF_TRACK
  AT_RISK
  ACHIEVED
}
```

---

**Week 30: Performance Attribution & Polish**

- [ ] Performance Attribution Analysis (7 days)
  - Calculate individual contribution: `(holding_return × holding_weight)`
  - Aggregate by: ticker, sector, asset type, country
  - Contribution waterfall chart
  - Highlight best/worst contributors (top 5 and bottom 5)
  - Time-period selection (1M, 3M, 1Y, YTD, All)

**Deliverables**:
- ✅ Asset allocation visualization (pie chart, sector breakdown, geographic breakdown)
- ✅ Benchmark comparison (S&P 500, NASDAQ, custom benchmarks)
- ✅ Portfolio risk score and volatility metrics
- ✅ Rebalancing recommendations engine
- ✅ Automated price alerts system
- ✅ Retirement planning calculator
- ✅ Goal tracking system
- ✅ Performance attribution analysis
- ✅ 85%+ feature parity with top 3 competitors

**Success Metrics**:
- **Feature Parity Score**: >85% vs Empower, Sharesight, Seeking Alpha
- **User Engagement**: +50% increase in daily active users (DAU)
- **Feature Adoption**: >70% of users view asset allocation chart
- **Competitive NPS**: Match or exceed competitor NPS scores (target: >45)

---

## Resource Allocation

### Team Structure

**Recommended Team Size**: 6-7 people for 5-month timeline

**Team Composition**:
- **1 Tech Lead / Architect** (full-time)
  - Oversees all tracks
  - Code reviews
  - Architecture decisions
  - Sprint planning

- **2 Backend Engineers** (Track A + B)
  - Security implementation
  - Tax reporting & business logic
  - Database schema updates
  - API development

- **2 Frontend Engineers** (Track C)
  - UX improvements
  - Component development
  - Mobile responsiveness
  - Accessibility

- **1 Full-Stack Engineer** (Track D + Support)
  - Data integrity
  - Testing infrastructure
  - DevOps/CI/CD
  - Float support

- **1 QA Engineer** (Weeks 15-20)
  - Test strategy
  - E2E test development
  - Security testing
  - Accessibility audit

---

## Parallel Execution Strategy

### Weeks 3-6: Three Parallel Tracks

```
Week 3          Week 4          Week 5          Week 6
│               │               │               │
Track A: ────┬──MFA───┬──Audit Log─┬──GDPR────┬──Security──
Security     │        │            │          │  Hardening
             │        │            │          │
Track B: ────┼──Tax Lots────────┬──Tax Calc─┼──────────────
Business     │                  │           │
Logic        │                  │           │
             │                  │           │
Track D: ────┴──DB Constraints─┴──Validation─┴──Quality────
Data                                              Checks
Integrity
```

### Weeks 7-10: Two Parallel Tracks

```
Week 7          Week 8          Week 9          Week 10
│               │               │               │
Track B: ────Dividends────Corporate Actions──Currency/Fees─
Business
Logic
             │               │               │
Track C: ────Dashboard/─────Mobile/A11y────Search/Import──
UX           Charts                          Polish
Quick Wins
```

### Weeks 11-14: Single Track (Strategic Features)

```
Week 11         Week 12         Week 13         Week 14
│               │               │               │
Track C: ───Onboarding──────Notifications───Reporting───Comparison/
Strategic                                                 Watchlist
Features
```

---

## Risk Mitigation

### Technical Risks

**Risk 1: Tax Calculation Complexity**
- **Impact**: HIGH - Wrong calculations could cause user financial harm
- **Likelihood**: MEDIUM
- **Mitigation**:
  - Hire tax professional consultant for spec review
  - Extensive unit testing with IRS examples
  - CPA beta tester validation
  - Clear disclaimers about tax advice
  - User verification prompts

**Risk 2: Alpha Vantage API Reliability**
- **Impact**: MEDIUM - Price fetching failures
- **Likelihood**: MEDIUM
- **Mitigation**:
  - Implement fallback API (Polygon.io, IEX Cloud)
  - Aggressive caching strategy
  - Graceful degradation with stale data
  - Manual price entry option

**Risk 3: Database Migration Failures**
- **Impact**: HIGH - Data corruption or loss
- **Likelihood**: LOW
- **Mitigation**:
  - Comprehensive backup strategy
  - Migration testing on staging database
  - Rollback procedures documented
  - Dry-run migrations before production
  - Point-in-time recovery capability

**Risk 4: Performance Degradation**
- **Impact**: MEDIUM - Poor user experience
- **Likelihood**: MEDIUM
- **Mitigation**:
  - Database indexing strategy
  - Query optimization
  - Caching layer (Redis)
  - Load testing before launch
  - Performance monitoring (Vercel Analytics)

---

### Business Risks

**Risk 5: Regulatory Compliance**
- **Impact**: HIGH - Legal liability
- **Likelihood**: LOW
- **Mitigation**:
  - Legal consultation for disclaimers
  - Clear "not financial advice" messaging
  - GDPR compliance for EU users
  - SEC/FINRA review of features
  - Insurance (E&O coverage)

**Risk 6: User Adoption**
- **Impact**: HIGH - Product failure
- **Likelihood**: MEDIUM
- **Mitigation**:
  - Beta user feedback iteration
  - Competitive analysis
  - User onboarding optimization
  - Growth marketing strategy
  - Referral program

**Risk 7: Data Security Breach**
- **Impact**: CRITICAL - Reputation damage, legal liability
- **Likelihood**: LOW
- **Mitigation**:
  - Comprehensive security audit
  - Penetration testing
  - Incident response plan
  - Cyber insurance
  - Regular security updates

---

## Success Metrics

### Phase 1-2: Foundation (Weeks 1-10)

**Security Metrics**:
- ✅ 100% MFA adoption for new users
- ✅ Zero security vulnerabilities (OWASP Top 10)
- ✅ Audit log for 100% of mutations
- ✅ GDPR compliant (verified by legal)

**Business Logic Metrics**:
- ✅ Tax calculations match TurboTax within $0.01
- ✅ Corporate actions handled correctly (0 data corruption incidents)
- ✅ Multi-currency accuracy within 0.1%

**Data Integrity Metrics**:
- ✅ Zero invalid data in production
- ✅ <0.1% optimistic lock conflicts
- ✅ 99.9% price fetch success rate

---

### Phase 3-4: UX & Features (Weeks 7-14)

**User Activation**:
- ✅ 80%+ signup → first portfolio within 24 hours
- ✅ 75%+ onboarding checklist completion
- ✅ 40%+ CSV import adoption

**User Engagement**:
- ✅ WAU/MAU > 60% (weekly active / monthly active)
- ✅ 90%+ users refresh prices weekly
- ✅ 70%+ users view performance charts

**User Satisfaction**:
- ✅ Net Promoter Score (NPS) > 40
- ✅ <10% monthly churn rate
- ✅ >4.5 star rating (when launched)

---

### Phase 5-6: Quality & Launch (Weeks 15-20)

**Quality Metrics**:
- ✅ 80%+ code coverage (unit + integration tests)
- ✅ <3 second page load (Lighthouse score >90)
- ✅ WCAG 2.1 AA compliance (zero axe violations)
- ✅ Zero critical bugs in production

**Beta Launch Metrics**:
- ✅ 50+ beta users recruited
- ✅ 10+ user interviews conducted
- ✅ NPS > 40 from beta cohort
- ✅ <5% user-reported bug rate

**Public Launch Readiness**:
- ✅ 100% feature completeness (Phase 1-4)
- ✅ Security audit passed
- ✅ Performance benchmarks met
- ✅ Documentation complete

---

## Timeline Summary

### High-Level Gantt Chart

```
Phase 0: Foundation        [Week 1-2]     ████████████
Phase 1: Security         [Week 3-6]     ████████████████████████
Phase 2: Business Logic   [Week 3-10]    ████████████████████████████████████
Phase 2: Data Integrity   [Week 3-5]     ████████████
Phase 3: UX Quick Wins    [Week 7-10]             ████████████████
Phase 4: Strategic        [Week 11-14]                    ████████████
Phase 5: Testing          [Week 15-17]                            ████████
Phase 6: Beta Launch      [Week 18-20]                                    ████████

Total Duration: 20 weeks (~5 months)
```

---

## Effort Breakdown

### By Track

| Track | Focus Area | Effort | Weeks |
|-------|------------|--------|-------|
| Track A | Security | 22-25 days | Weeks 3-6 |
| Track B | Business Logic | 33 days | Weeks 3-10 |
| Track C | UX/Frontend | 31 days | Weeks 7-14 |
| Track D | Data Integrity | 12 days | Weeks 3-5 |
| Testing | Quality Assurance | 15 days | Weeks 15-17 |
| Beta | Launch & Iteration | 15 days | Weeks 18-20 |

**Total**: ~128 days of effort across 20 weeks (parallel execution)

---

### By Phase

| Phase | Description | Duration | Effort |
|-------|-------------|----------|--------|
| Phase 0 | Foundation & Planning | 2 weeks | 10 days |
| Phase 1 | Security Foundation | 4 weeks | 22-25 days |
| Phase 2 | Business Logic & Data | 8 weeks | 45 days |
| Phase 3 | UX Quick Wins | 4 weeks | 17 days |
| Phase 4 | Strategic Features | 4 weeks | 14 days |
| Phase 5 | Testing & QA | 3 weeks | 15 days |
| Phase 6 | Beta Launch | 3 weeks | 15 days |

**Total**: ~20 weeks (~5 months) with parallel execution

---

## Deployment Strategy

### Staging Environment

**Purpose**: Pre-production testing and validation

**Setup**:
- Separate Vercel project
- Separate database (Neon or Supabase)
- Identical environment variables
- Alpha Vantage test API key
- Automated deployments from `develop` branch

**Usage**:
- All feature branches merge to `develop` → auto-deploy to staging
- QA testing on staging
- Beta users may access staging for early feedback
- Production deployment only after staging validation

---

### Production Deployment

**Blue-Green Deployment Strategy**:

1. **Pre-Deployment**:
   - [ ] Run all tests (unit, integration, E2E)
   - [ ] Performance benchmarks
   - [ ] Security scan
   - [ ] Database migration dry-run
   - [ ] Backup production database

2. **Deployment**:
   - [ ] Deploy to production (Vercel instant rollout)
   - [ ] Run database migrations
   - [ ] Smoke test critical paths
   - [ ] Monitor error rates (Sentry)
   - [ ] Monitor performance (Vercel Analytics)

3. **Post-Deployment**:
   - [ ] User acceptance testing
   - [ ] Monitor for 24 hours
   - [ ] Rollback plan ready
   - [ ] Announcement to users (if major release)

---

### Database Migration Strategy

**Safe Migration Process**:

```bash
# 1. Backup production database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on staging
DATABASE_URL=$STAGING_URL pnpm prisma migrate deploy

# 3. Validate staging
pnpm test:integration

# 4. Apply to production (during low-traffic window)
DATABASE_URL=$PRODUCTION_URL pnpm prisma migrate deploy

# 5. Validate production
pnpm smoke-test
```

**Rollback Plan**:
- Keep previous version deployed in Vercel (instant rollback)
- Database rollback: restore from backup + manual SQL if needed
- Feature flags for gradual rollout of risky features

---

### Rollback Procedures

⚠️ **CRITICAL**: Every deployment must have a tested rollback procedure ready before going to production.

#### Immediate Rollback (Code-Only Changes)

**Scenario**: New code deployed but causes errors, no database migration involved

**Timeline**: <5 minutes

**Procedure**:

```bash
# 1. Revert deployment in Vercel (instant)
vercel rollback --production

# Alternative: Re-deploy previous commit
git revert HEAD
git push origin main  # Triggers auto-deployment

# 2. Verify rollback successful
curl https://trackyourstack.com/api/health
# Should return 200 OK

# 3. Monitor error rates in Sentry
# Verify errors have stopped

# 4. Post-rollback analysis
# - Document what went wrong
# - Fix issue in feature branch
# - Re-test on staging before redeploying
```

**Success Criteria**:
- Application returns to previous stable state
- Error rate drops to baseline
- All critical user flows functional

---

#### Database Migration Rollback

**Scenario**: Database migration causes issues or data corruption

**Timeline**: 10-30 minutes (depending on database size)

**Risk Level**: HIGH (potential data loss)

##### Option 1: Prisma Migration Rollback (Preferred)

```bash
# 1. Mark migration as rolled back
pnpm prisma migrate resolve --rolled-back <migration_name>

# 2. Revert to previous migration state
pnpm prisma migrate deploy

# 3. Verify database schema
pnpm prisma validate

# 4. Restart application
vercel --prod
```

**When to Use**: Migration completed but causing issues, no data modifications yet

---

##### Option 2: Point-in-Time Recovery (PITR)

```bash
# 1. Stop application (prevent new writes)
vercel --prod --scale 0  # Scale down to 0 instances

# 2. Restore database to point before migration
# (Requires PostgreSQL PITR enabled - Neon/Supabase support this)
pg_restore --before='2025-10-12 14:00:00' backup.dump

# Alternative: Restore from latest backup
psql $DATABASE_URL < backup_20251012_140000.sql

# 3. Revert application code
git revert HEAD
git push origin main

# 4. Scale application back up
vercel --prod --scale 1

# 5. Verify data integrity
pnpm tsx scripts/verify-data-integrity.ts
```

**When to Use**: Migration caused data corruption, must restore to pre-migration state

**Data Loss Risk**: All writes since migration will be lost

---

##### Option 3: Forward-Fix Migration

```bash
# 1. Create corrective migration
pnpm prisma migrate dev --name fix_previous_migration

# 2. Test on staging
DATABASE_URL=$STAGING_URL pnpm prisma migrate deploy
pnpm test:integration

# 3. Apply to production
DATABASE_URL=$PRODUCTION_URL pnpm prisma migrate deploy

# 4. Verify fix
pnpm tsx scripts/verify-fix.ts
```

**When to Use**: Cannot restore from backup (too much time passed), fix forward instead

---

#### Phase-Specific Rollback Procedures

##### Phase 1: Security Foundation Rollback

**MFA Rollback**:
```sql
-- Emergency disable MFA for all users (allows login if MFA broken)
UPDATE "User" SET "mfaEnabled" = false WHERE "mfaEnabled" = true;

-- Log affected users
INSERT INTO "AuditLog" (action, entity, metadata)
VALUES ('MFA_EMERGENCY_DISABLE', 'User', '{"reason": "rollback", "count": (SELECT COUNT(*) FROM "User")}');
```

**Audit Logging Rollback**:
- Disable audit logging middleware
- Keep existing audit log data (no deletion)
- Revert application code to remove audit calls

---

##### Phase 2: Tax Reporting Rollback

**Tax Lot Migration Rollback** (COMPLEX):

```sql
-- Step 1: Verify investment quantities match before rollback
SELECT
  i.id,
  i."totalQuantity" as investment_qty,
  SUM(t."remainingQuantity") as tax_lot_qty
FROM "Investment" i
LEFT JOIN "TaxLot" t ON t."investmentId" = i.id
GROUP BY i.id
HAVING i."totalQuantity" != COALESCE(SUM(t."remainingQuantity"), 0);

-- Step 2: Archive tax lot data before deletion (for audit)
CREATE TABLE "TaxLot_Archive" AS SELECT * FROM "TaxLot";
CREATE TABLE "SaleTransaction_Archive" AS SELECT * FROM "SaleTransaction";

-- Step 3: Remove tax lot relationships
ALTER TABLE "Investment" DROP CONSTRAINT IF EXISTS "Investment_taxLots_fkey";

-- Step 4: Revert application code
git revert <tax_lot_commit>
git push origin main

-- Note: Cannot restore aggregated data - users must re-enter purchase details
```

**Data Loss Warning**:
- All individual purchase history will be lost
- Only aggregated quantities/cost basis preserved
- Users must re-enter purchase details if needed

**Prevention**:
- Migrate users incrementally (not all at once)
- Keep old schema during transition period
- Dual-write to both old and new schema

---

##### Phase 3: UX Quick Wins Rollback

**Dashboard/UI Rollback**:
- Instant rollback (frontend-only changes)
- No data migration involved
- Low risk

```bash
# Revert React component changes
git revert HEAD
git push origin main
# Auto-deploys previous version
```

---

##### Phase 4-7: Feature Rollback

**General Feature Rollback Pattern**:

1. **Disable feature via feature flag** (instant):
   ```typescript
   // app/config/features.ts
   export const FEATURES = {
     BENCHMARKING: false,  // Disable feature
     GOAL_TRACKING: false,
     PRICE_ALERTS: false,
   }
   ```

2. **Revert code** (if feature flag not enough):
   ```bash
   git revert <feature_commit>
   git push origin main
   ```

3. **Database cleanup** (optional, if tables created):
   ```sql
   -- Mark as inactive instead of deleting
   UPDATE "PriceAlert" SET "triggered" = true, "active" = false;
   -- Keeps historical data for analysis
   ```

---

#### Rollback Decision Matrix

| Severity | Time Since Deploy | Data Modified | Recommended Action | Timeline |
|----------|------------------|---------------|-------------------|----------|
| 🟢 Low | Any | No | Code rollback via Vercel | <5 min |
| 🟡 Medium | <1 hour | No | Code rollback + monitor | <10 min |
| 🟡 Medium | <1 hour | Yes (minimal) | Forward fix | <30 min |
| 🔴 High | <1 hour | Yes (significant) | PITR + code rollback | <30 min |
| 🔴 High | >1 hour | Yes | Forward fix + manual correction | 1-2 hours |
| 🔴 Critical | Any | Data corruption | PITR + incident response | <1 hour |

---

#### Rollback Communication Template

**Internal Team (Slack/Discord)**:
```
🚨 ROLLBACK IN PROGRESS
Deployment: [deployment_id]
Reason: [brief description]
Initiated by: [name]
Estimated completion: [time]
Status updates: [every 5 minutes]
```

**External Users (Status Page)**:
```
⚠️ Service Update - [timestamp]

We're experiencing issues with today's deployment and are rolling back to the previous version.

Expected resolution: [time]
User impact: [describe impact]
Data safety: All your data is safe and backed up.

We apologize for any inconvenience.
```

---

#### Post-Rollback Checklist

After any rollback:

- [ ] **Verify services restored**: All critical paths working
- [ ] **Check error rates**: Sentry shows errors stopped
- [ ] **Data integrity check**: Run verification scripts
- [ ] **User communication**: Status page updated
- [ ] **Incident report**: Document what went wrong
- [ ] **Root cause analysis**: Within 24 hours
- [ ] **Prevention plan**: How to avoid in future
- [ ] **Fix and re-deploy**: Only after staging validation

---

#### Prevention: Pre-Deployment Risk Assessment

**Before EVERY deployment, assess**:

1. **Code changes**:
   - [ ] Breaking API changes?
   - [ ] Database schema changes?
   - [ ] Third-party dependency updates?

2. **Data risk**:
   - [ ] Modifies existing data?
   - [ ] Irreversible operations?
   - [ ] Large data migrations?

3. **Feature flags**:
   - [ ] New features behind feature flags?
   - [ ] Can be disabled instantly if issues?

4. **Rollback plan**:
   - [ ] Rollback procedure documented?
   - [ ] Rollback tested on staging?
   - [ ] Team trained on rollback process?

**Risk Score Calculation**:
- 0-2 factors: ✅ Low risk, standard deployment
- 3-4 factors: ⚠️ Medium risk, deploy during low-traffic, monitor closely
- 5+ factors: 🚨 High risk, incremental rollout, immediate rollback ready

---

**See Also**:
- [MIGRATION_STRATEGY.md](./MIGRATION_STRATEGY.md) - Detailed database migration procedures
- [security-audit-blind-spots.md](./security-audit-blind-spots.md) - Security incident response

---

## Monitoring & Observability

### Application Monitoring

**Error Tracking**: Sentry
- Real-time error notifications
- Error grouping and trends
- User impact analysis
- Performance monitoring
- Release tracking

**Analytics**: PostHog or Mixpanel
- User behavior tracking
- Feature adoption rates
- Funnel analysis (signup → onboarding → engagement)
- Retention cohorts
- A/B testing capability

**Performance**: Vercel Analytics
- Core Web Vitals
- Page load times
- API response times
- Edge function performance

---

### Database Monitoring

**Query Performance**:
- Prisma logging in development
- Slow query log in production
- Index usage analysis
- Connection pool monitoring

**Data Quality**:
- Daily integrity checks (cron job)
- Orphaned record detection
- Price staleness alerts
- Constraint violation logs

---

### Security Monitoring

**Access Logs**:
- Authentication attempts (success/failure)
- MFA usage rates
- Session creation/destruction
- Account deletion requests

**Threat Detection**:
- Rate limit violations
- Unusual access patterns
- Multiple failed login attempts
- Suspicious IP addresses

---

## Documentation Requirements

### User Documentation

**Getting Started**:
- [ ] Account creation guide
- [ ] Portfolio setup tutorial
- [ ] Adding investments guide
- [ ] Understanding performance metrics

**Feature Guides**:
- [ ] CSV import instructions
- [ ] Tax reporting guide
- [ ] Dividend tracking explanation
- [ ] Corporate action handling
- [ ] Multi-currency portfolios

**FAQ**:
- [ ] Common questions
- [ ] Troubleshooting
- [ ] Privacy and security
- [ ] Tax disclaimer

---

### Developer Documentation

**Architecture**:
- [ ] System architecture diagram
- [ ] Database schema documentation
- [ ] API documentation
- [ ] Authentication flow

**Development**:
- [ ] Local setup guide
- [ ] Testing strategy
- [ ] Deployment process
- [ ] Contribution guidelines

**Operations**:
- [ ] Monitoring and alerting
- [ ] Incident response plan
- [ ] Backup and recovery
- [ ] Database migration guide

---

## Cost Estimation

### Infrastructure Costs (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro | $20/month |
| Neon/Supabase | Pro | $25/month |
| Redis (Upstash) | Pay-as-go | $5-10/month |
| Resend (Email) | Pro | $20/month |
| Sentry | Team | $26/month |
| PostHog/Mixpanel | Startup | $0-25/month |
| Alpha Vantage | Premium | $50/month |
| Domain | Annual | ~$1/month |

**Total**: ~$150-180/month for production + staging

---

### Development Costs (5-Month Timeline)

**Personnel** (assuming market rates):

| Role | Rate | Duration | Total |
|------|------|----------|-------|
| Tech Lead | $150/hour | 800 hours | $120,000 |
| Backend Engineers (2) | $125/hour | 1,600 hours | $200,000 |
| Frontend Engineers (2) | $120/hour | 1,200 hours | $144,000 |
| Full-Stack Engineer | $130/hour | 800 hours | $104,000 |
| QA Engineer | $100/hour | 300 hours | $30,000 |

**Total Personnel**: ~$598,000

**Additional Costs**:
- Legal consultation (GDPR, disclaimers): $5,000
- Tax professional consultation: $3,000
- Security audit/penetration testing: $10,000
- Design/UX consultation: $5,000
- Contingency (10%): $60,000

**Grand Total**: ~$681,000 for 5-month development

---

## Alternative: Reduced Scope MVP+

**If budget is constrained**, consider a reduced scope approach:

### MVP+ (3-Month Timeline, $350K Budget)

**Must-Have**:
- ✅ Critical security fixes (MFA, audit logging, GDPR)
- ✅ Tax lot tracking + basic tax reporting
- ✅ Dividend tracking
- ✅ Data integrity (constraints, validation, optimistic locking)
- ✅ UX quick wins (dashboard, mobile, CSV import)

**Defer to V2**:
- ❌ Corporate actions (manual workaround)
- ❌ Advanced reporting
- ❌ Notification system
- ❌ Portfolio comparison
- ❌ Watchlist

**Reduced Team**:
- 1 Tech Lead
- 2 Backend Engineers
- 1 Frontend Engineer
- 1 Full-Stack Engineer (part-time)

**Result**: Production-ready core product in 3 months, iterate based on user feedback

---

## Conclusion

This master plan provides a comprehensive roadmap to transform Track Your Stack from a functional MVP to a production-ready, feature-complete investment tracking platform.

**Critical Path**:
1. **Security** → Protect user data and enable public launch
2. **Tax Reporting** → Essential for US market viability
3. **Data Integrity** → Foundation for accurate calculations
4. **UX** → Competitive user experience

**Recommended Approach**:
- **5-month full-scope implementation** with parallel execution
- **OR 3-month MVP+ with focused scope** for faster launch

**Next Steps**:
1. Review and approve master plan
2. Secure budget and resources
3. Recruit/assign development team
4. Kickoff Phase 0 (Foundation & Planning)
5. Begin parallel execution on Phase 1-2

**Success Criteria**:
- Production-ready platform
- Tax-compliant for US users
- GDPR-compliant for EU users
- Professional UX with <3s page loads
- NPS >40, <10% churn

---

## Appendices

### Appendix A: Complete Feature Checklist

**Security** (15 items):
- [ ] Multi-Factor Authentication
- [ ] Audit Logging
- [ ] GDPR Compliance
- [ ] Advanced Rate Limiting
- [ ] Session Management UI
- [ ] Input Validation
- [ ] Encryption Documentation
- [ ] Content Security Policy
- [ ] Security Headers
- [ ] Password Requirements
- [ ] Dependency Scanning
- [ ] Security Testing
- [ ] Penetration Testing
- [ ] Incident Response Plan
- [ ] Security Documentation

**Business Logic** (11 items):
- [ ] Tax Lot Tracking
- [ ] Tax Calculation Engine
- [ ] Dividend Tracking
- [ ] Corporate Actions
- [ ] Transaction Fees
- [ ] Historical Currency Conversion
- [ ] Short Selling Support
- [ ] Margin Account Tracking
- [ ] Interest and Fees Tracking
- [ ] Realized vs Unrealized Gains
- [ ] Year-End Tax Reports

**Data Integrity** (12 items):
- [ ] Database CHECK Constraints
- [ ] UNIQUE Constraints
- [ ] Foreign Key Integrity
- [ ] Optimistic Locking
- [ ] Price Validation
- [ ] Quantity Validation
- [ ] Date Validation
- [ ] Time Zone Standards
- [ ] Price Staleness Detection
- [ ] Retry Logic
- [ ] Graceful Degradation
- [ ] Data Consistency Monitoring

**UX/Features** (23 items):
- [ ] Dashboard Overview
- [ ] Price Refresh Button
- [ ] Bulk Price Refresh
- [ ] CSV Import
- [ ] Performance Charts
- [ ] Search/Filter
- [ ] Mobile Responsive
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Onboarding Flow
- [ ] Notification System
- [ ] Advanced Reporting
- [ ] Portfolio Comparison
- [ ] Watchlist
- [ ] Dark Mode
- [ ] Currency Settings
- [ ] Portfolio Notes
- [ ] News Feed
- [ ] Rebalancing Calculator
- [ ] Multi-Language Support
- [ ] Native Mobile Apps (future)
- [ ] Options Tracking (future)
- [ ] AI Recommendations (future)
- [ ] Social Features (optional)

**Total**: 61 items

---

### Appendix B: Technology Stack Details

**Frontend**:
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Radix UI primitives
- React Hook Form
- Zod validation
- TanStack Query (React Query)
- Recharts for visualizations
- react-joyride for tours

**Backend**:
- Next.js Server Actions
- API Routes
- Prisma ORM
- PostgreSQL (Neon or Supabase)
- NextAuth.js v5
- Resend (email)
- React Email (templates)
- Uptime Kuma (monitoring)

**External APIs**:
- Alpha Vantage (market data primary)
- Polygon.io (fallback)
- IEX Cloud (fallback)

**Infrastructure**:
- Vercel (hosting & deployment)
- GitHub Actions (CI/CD)
- Redis (Upstash - rate limiting & caching)
- Sentry (error tracking)
- PostHog/Mixpanel (analytics)

**Development**:
- ESLint + Prettier
- Husky (git hooks)
- Vitest (unit tests)
- Playwright (E2E tests)
- Storybook (component library - optional)

---

### Appendix C: Database Schema v2 (Major Updates)

**New Models**:

```prisma
model TaxLot {
  id                String
  investmentId      String
  quantity          Decimal
  remainingQuantity Decimal
  costBasisPerUnit  Decimal
  purchaseDate      Date
  status            TaxLotStatus
  // ...
}

model SaleTransaction {
  id           String
  investmentId String
  quantity     Decimal
  pricePerUnit Decimal
  saleDate     Date
  taxMethod    TaxMethod
  taxLotsUsed  TaxLotAllocation[]
  gainLoss     Decimal
  isShortTerm  Boolean
  isLongTerm   Boolean
  // ...
}

model Dividend {
  investmentId      String
  type              DividendType
  paymentDate       Date
  amountPerShare    Decimal
  sharesOwned       Decimal
  totalAmount       Decimal
  wasReinvested     Boolean
  qualifiedDividend Boolean
  // ...
}

model CorporateAction {
  ticker         String
  type           CorporateActionType
  effectiveDate  Date
  splitRatio     String?
  splitMultiplier Decimal?
  newTicker      String?
  // ...
}

model AuditLog {
  userId    String
  action    AuditAction
  entity    AuditEntity
  entityId  String
  changes   Json?
  ipAddress String?
  timestamp DateTime
  // ...
}

model Notification {
  userId    String
  type      NotificationType
  title     String
  message   String
  read      Boolean
  actionUrl String?
  createdAt DateTime
  // ...
}

model NotificationPreferences {
  userId              String
  emailEnabled        Boolean
  priceAlerts         Boolean
  weeklyDigest        Boolean
  alertThreshold      Decimal
  // ...
}

model PortfolioSnapshot {
  portfolioId String
  date        DateTime
  totalValue  Decimal
  totalCost   Decimal
  gainLoss    Decimal
  // ...
}

model Watchlist {
  userId    String
  name      String
  items     WatchlistItem[]
  // ...
}
```

**Updated Models**:

```prisma
model User {
  // MFA fields
  mfaEnabled    Boolean
  mfaSecret     String?
  backupCodes   String[]

  // Relations
  sessions              Session[]
  accounts              Account[]
  portfolios            Portfolio[]
  auditLogs             AuditLog[]
  notifications         Notification[]
  notificationPrefs     NotificationPreferences?
  watchlists            Watchlist[]
}

model Investment {
  // Versioning for optimistic locking
  version Int @default(0)

  // New relations
  taxLots              TaxLot[]
  saleTransactions     SaleTransaction[]
  dividends            Dividend[]
}

model Portfolio {
  // Versioning
  version Int @default(0)

  // New relations
  snapshots PortfolioSnapshot[]
}
```

---

### Appendix D: Reference Materials

**Tax Reporting**:
- IRS Publication 550 (Investment Income and Expenses)
- IRS Form 8949 (Sales and Other Dispositions of Capital Assets)
- Wash Sale Rule (IRC Section 1091)
- Qualified Dividend Requirements (IRC Section 1(h)(11))

**Security Standards**:
- OWASP Top 10 Web Application Security Risks
- NIST Cybersecurity Framework
- GDPR Compliance Checklist
- WCAG 2.1 Level AA Guidelines

**Financial APIs**:
- Alpha Vantage Documentation
- Polygon.io API Reference
- IEX Cloud API Documentation

**Development Best Practices**:
- Next.js 15 Documentation
- Prisma Best Practices
- React Testing Library Guide
- Playwright Testing Guide
