# Migration Strategy - Track Your Stack

**Version**: 1.0
**Date**: 2025-10-12
**Purpose**: Define safe migration path from MVP schema to enhanced schema with tax reporting, security, and competitive features

---

## Overview

This document outlines the database migration strategy for transitioning from the current MVP schema to the comprehensive schema documented in MASTER_PLAN_V2.md. The strategy prioritizes **zero downtime**, **data integrity**, and **reversibility**.

---

## Current Schema (MVP - v1.0)

### Existing Models

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?

  accounts      Account[]
  sessions      Session[]
  portfolios    Portfolio[]
}

model Portfolio {
  id           String   @id @default(cuid())
  name         String
  baseCurrency String   @default("USD")
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  investments  Investment[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Investment {
  id                String      @id @default(cuid())
  ticker            String
  name              String
  assetType         AssetType
  totalQuantity     Decimal     @db.Decimal(20, 8)
  averageCostBasis  Decimal     @db.Decimal(20, 8)
  purchaseCurrency  String      @default("USD")
  currentPrice      Decimal?    @db.Decimal(20, 8)
  priceUpdatedAt    DateTime?

  portfolioId       String
  portfolio         Portfolio   @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([portfolioId])
  @@index([ticker])
}

enum AssetType {
  STOCK
  ETF
  CRYPTO
  MUTUAL_FUND
}
```

---

## Migration Phases

### Phase 1: Security & Audit (Non-Breaking Changes)

**Timeline**: Week 3
**Risk Level**: LOW (additive changes only)
**Downtime**: Zero

#### Changes

1. **Add MFA fields to User model**

   ```prisma
   model User {
     // ... existing fields
     mfaEnabled Boolean   @default(false)
     mfaSecret  String?   // Encrypted TOTP secret
   }
   ```

2. **Add AuditLog model** (new table)

   ```prisma
   model AuditLog {
     id        String   @id @default(cuid())
     userId    String
     action    String   // "CREATE_PORTFOLIO", "DELETE_INVESTMENT"
     entity    String   // "Portfolio", "Investment"
     entityId  String
     metadata  Json?    // Additional context
     ipAddress String?
     userAgent String?
     createdAt DateTime @default(now())

     @@index([userId, createdAt])
     @@index([entity, entityId])
   }
   ```

3. **Add Session model** (new table for session management UI)

   ```prisma
   model SessionInfo {
     id         String   @id @default(cuid())
     userId     String
     deviceName String?
     ipAddress  String?
     userAgent  String?
     lastActive DateTime @default(now())
     createdAt  DateTime @default(now())

     @@index([userId, lastActive])
   }
   ```

#### Migration Commands

```bash
# 1. Create migration
pnpm prisma migrate dev --name add_security_fields

# 2. Verify migration
pnpm prisma migrate status

# 3. Apply to production (when ready)
pnpm prisma migrate deploy
```

#### Rollback Plan

```bash
# If issues occur, migration can be reverted
pnpm prisma migrate resolve --rolled-back <migration_name>

# Re-deploy previous migration
pnpm prisma migrate deploy
```

#### Data Migration Script

No data migration needed - all new fields are nullable or have defaults.

---

### Phase 2: Tax Reporting Infrastructure (Schema Expansion)

**Timeline**: Week 5-6
**Risk Level**: MEDIUM (new relationships, data transformation)
**Downtime**: Zero (background migration)

#### Changes

1. **Add TaxLot model** (new table)

   ```prisma
   model TaxLot {
     id           String   @id @default(cuid())
     investmentId String
     investment   Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)

     purchaseDate  DateTime @db.Date
     quantity      Decimal  @db.Decimal(20, 8)
     costBasisPerUnit Decimal @db.Decimal(20, 8)
     fees          Decimal  @default(0) @db.Decimal(20, 2)

     remainingQuantity Decimal @db.Decimal(20, 8)
     status        TaxLotStatus @default(OPEN)

     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@index([investmentId, status])
     @@index([investmentId, purchaseDate])
   }

   enum TaxLotStatus {
     OPEN
     PARTIALLY_CLOSED
     CLOSED
   }
   ```

2. **Add SaleTransaction model** (new table)

   ```prisma
   model SaleTransaction {
     id           String   @id @default(cuid())
     investmentId String
     investment   Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)

     saleDate     DateTime @db.Date
     quantity     Decimal  @db.Decimal(20, 8)
     salePricePerUnit Decimal @db.Decimal(20, 8)
     fees         Decimal  @default(0) @db.Decimal(20, 2)

     allocations  TaxLotAllocation[]

     createdAt DateTime @default(now())

     @@index([investmentId, saleDate])
   }

   model TaxLotAllocation {
     id              String @id @default(cuid())
     saleId          String
     sale            SaleTransaction @relation(fields: [saleId], references: [id], onDelete: Cascade)
     taxLotId        String
     taxLot          TaxLot @relation(fields: [taxLotId], references: [id], onDelete: Cascade)

     quantityAllocated Decimal @db.Decimal(20, 8)

     @@unique([saleId, taxLotId])
     @@index([saleId])
     @@index([taxLotId])
   }
   ```

3. **Update Investment model** (add relationships)
   ```prisma
   model Investment {
     // ... existing fields
     taxLots         TaxLot[]
     saleTransactions SaleTransaction[]
   }
   ```

#### Migration Commands

```bash
# 1. Create migration
pnpm prisma migrate dev --name add_tax_reporting_models

# 2. Run data migration script (see below)
pnpm tsx scripts/migrate-to-tax-lots.ts

# 3. Verify data integrity
pnpm tsx scripts/verify-tax-lot-migration.ts

# 4. Deploy to production
pnpm prisma migrate deploy
pnpm tsx scripts/migrate-to-tax-lots.ts --production
```

#### Data Migration Script

**File**: `scripts/migrate-to-tax-lots.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateInvestmentsToTaxLots() {
  console.log('Starting tax lot migration...')

  // Get all existing investments
  const investments = await prisma.investment.findMany()

  let migrated = 0
  let errors = 0

  for (const investment of investments) {
    try {
      // Create a single tax lot representing the aggregated purchase
      await prisma.taxLot.create({
        data: {
          investmentId: investment.id,
          purchaseDate: investment.createdAt, // Use creation date as purchase date
          quantity: investment.totalQuantity,
          costBasisPerUnit: investment.averageCostBasis,
          fees: 0, // No historical fee data
          remainingQuantity: investment.totalQuantity,
          status: 'OPEN',
        },
      })

      migrated++

      if (migrated % 100 === 0) {
        console.log(`Migrated ${migrated} investments...`)
      }
    } catch (error) {
      console.error(`Error migrating investment ${investment.id}:`, error)
      errors++
    }
  }

  console.log(`Migration complete: ${migrated} investments migrated, ${errors} errors`)
}

migrateInvestmentsToTaxLots()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

#### Verification Script

**File**: `scripts/verify-tax-lot-migration.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyTaxLotMigration() {
  console.log('Verifying tax lot migration...')

  // Check 1: Every investment should have at least one tax lot
  const investmentsWithoutTaxLots = await prisma.investment.findMany({
    where: {
      taxLots: {
        none: {},
      },
    },
  })

  if (investmentsWithoutTaxLots.length > 0) {
    console.error(`❌ ${investmentsWithoutTaxLots.length} investments missing tax lots`)
    return false
  }

  // Check 2: Tax lot quantities should match investment quantities
  const investments = await prisma.investment.findMany({
    include: {
      taxLots: true,
    },
  })

  let mismatchCount = 0

  for (const investment of investments) {
    const totalLotQuantity = investment.taxLots.reduce(
      (sum, lot) => sum + Number(lot.remainingQuantity),
      0
    )

    if (Math.abs(totalLotQuantity - Number(investment.totalQuantity)) > 0.00000001) {
      console.error(
        `❌ Investment ${investment.id}: quantity mismatch (${totalLotQuantity} vs ${investment.totalQuantity})`
      )
      mismatchCount++
    }
  }

  if (mismatchCount > 0) {
    console.error(`❌ ${mismatchCount} investments with quantity mismatches`)
    return false
  }

  console.log('✅ Tax lot migration verification passed')
  return true
}

verifyTaxLotMigration()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

#### Rollback Plan

```bash
# 1. Drop new tables (if no sales have been recorded yet)
pnpm prisma migrate resolve --rolled-back add_tax_reporting_models

# 2. If sales exist, data must be preserved - create rollback migration
pnpm prisma migrate dev --name rollback_tax_lots

# Rollback migration removes relationships but keeps data:
# - Keep TaxLot, SaleTransaction tables for historical record
# - Remove foreign keys from Investment
# - Mark as archived
```

---

### Phase 3: Dividend & Corporate Actions (Schema Expansion)

**Timeline**: Week 7-9
**Risk Level**: LOW (independent new tables)
**Downtime**: Zero

#### Changes

1. **Add Dividend model**

   ```prisma
   model Dividend {
     id            String   @id @default(cuid())
     investmentId  String
     investment    Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)

     exDate        DateTime @db.Date
     paymentDate   DateTime @db.Date
     amountPerShare Decimal @db.Decimal(20, 8)
     totalAmount   Decimal  @db.Decimal(20, 2)
     dividendType  DividendType

     createdAt DateTime @default(now())

     @@index([investmentId, exDate])
   }

   enum DividendType {
     QUALIFIED
     ORDINARY
     RETURN_OF_CAPITAL
   }
   ```

2. **Add CorporateAction model**

   ```prisma
   model CorporateAction {
     id            String   @id @default(cuid())
     investmentId  String
     investment    Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)

     actionType    CorporateActionType
     effectiveDate DateTime @db.Date
     description   String

     // Stock split fields
     splitRatio    String?  // "2:1", "3:2"

     // Ticker change fields
     newTicker     String?

     processed     Boolean  @default(false)
     processedAt   DateTime?

     createdAt DateTime @default(now())

     @@index([investmentId, effectiveDate])
     @@index([processed])
   }

   enum CorporateActionType {
     STOCK_SPLIT
     REVERSE_SPLIT
     TICKER_CHANGE
     MERGER
     ACQUISITION
     SPIN_OFF
     DELISTING
   }
   ```

#### Migration Commands

```bash
# 1. Create migration
pnpm prisma migrate dev --name add_dividend_corporate_action

# 2. Deploy to production
pnpm prisma migrate deploy
```

#### Data Migration

No historical data migration needed - these track future events.

---

### Phase 4: Data Integrity Constraints (Database Constraints)

**Timeline**: Week 10
**Risk Level**: HIGH (can block existing invalid data)
**Downtime**: Minimal (constraint validation)

#### Strategy

Add constraints incrementally with validation flags:

1. **Audit existing data for violations**
2. **Fix violations before adding constraints**
3. **Add constraints with `NOT VALID` flag** (PostgreSQL)
4. **Validate constraints in background**

#### Changes

**File**: `prisma/migrations/XXXXXX_add_data_constraints/migration.sql`

```sql
-- Step 1: Add constraints as NOT VALID (doesn't check existing data)
ALTER TABLE "Investment"
  ADD CONSTRAINT "Investment_totalQuantity_positive"
  CHECK ("totalQuantity" > 0) NOT VALID;

ALTER TABLE "Investment"
  ADD CONSTRAINT "Investment_averageCostBasis_positive"
  CHECK ("averageCostBasis" >= 0) NOT VALID;

ALTER TABLE "Investment"
  ADD CONSTRAINT "Investment_currentPrice_positive"
  CHECK ("currentPrice" IS NULL OR "currentPrice" >= 0) NOT VALID;

ALTER TABLE "TaxLot"
  ADD CONSTRAINT "TaxLot_quantity_positive"
  CHECK ("quantity" > 0) NOT VALID;

ALTER TABLE "TaxLot"
  ADD CONSTRAINT "TaxLot_remainingQuantity_valid"
  CHECK ("remainingQuantity" >= 0 AND "remainingQuantity" <= "quantity") NOT VALID;

-- Step 2: Fix existing data violations (run before validating)
UPDATE "Investment" SET "totalQuantity" = 0.00000001 WHERE "totalQuantity" <= 0;
UPDATE "Investment" SET "averageCostBasis" = 0 WHERE "averageCostBasis" < 0;
UPDATE "Investment" SET "currentPrice" = NULL WHERE "currentPrice" < 0;

-- Step 3: Validate constraints (checks all existing data)
ALTER TABLE "Investment" VALIDATE CONSTRAINT "Investment_totalQuantity_positive";
ALTER TABLE "Investment" VALIDATE CONSTRAINT "Investment_averageCostBasis_positive";
ALTER TABLE "Investment" VALIDATE CONSTRAINT "Investment_currentPrice_positive";
ALTER TABLE "TaxLot" VALIDATE CONSTRAINT "TaxLot_quantity_positive";
ALTER TABLE "TaxLot" VALIDATE CONSTRAINT "TaxLot_remainingQuantity_valid";
```

#### Pre-Migration Audit Script

**File**: `scripts/audit-data-constraints.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditDataConstraints() {
  console.log('Auditing data for constraint violations...')

  // Check for negative quantities
  const negativeQuantities = await prisma.investment.count({
    where: { totalQuantity: { lte: 0 } },
  })

  // Check for negative cost basis
  const negativeCostBasis = await prisma.investment.count({
    where: { averageCostBasis: { lt: 0 } },
  })

  // Check for negative prices
  const negativePrices = await prisma.investment.count({
    where: { currentPrice: { lt: 0 } },
  })

  console.log('Constraint Violations Found:')
  console.log(`  Negative quantities: ${negativeQuantities}`)
  console.log(`  Negative cost basis: ${negativeCostBasis}`)
  console.log(`  Negative prices: ${negativePrices}`)

  if (negativeQuantities + negativeCostBasis + negativePrices > 0) {
    console.log('⚠️  Fix violations before adding constraints')
    return false
  }

  console.log('✅ No constraint violations found')
  return true
}

auditDataConstraints()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

---

### Phase 5: Competitive Features (Schema Expansion)

**Timeline**: Week 21-30
**Risk Level**: LOW (independent new features)
**Downtime**: Zero

#### Changes

1. **Benchmarking models**

   ```prisma
   model PortfolioBenchmark {
     id              String   @id @default(cuid())
     portfolioId     String
     portfolio       Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

     benchmarkTicker String  // "SPY", "QQQ", "VTI"
     benchmarkName   String  // "S&P 500"
     weight          Decimal @default(1.0) @db.Decimal(5, 4)

     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@unique([portfolioId, benchmarkTicker])
     @@index([portfolioId])
   }

   model BenchmarkPrice {
     id         String   @id @default(cuid())
     ticker     String
     date       DateTime @db.Date
     closePrice Decimal  @db.Decimal(20, 8)

     createdAt DateTime @default(now())

     @@unique([ticker, date])
     @@index([ticker, date])
   }
   ```

2. **Goal tracking models**

   ```prisma
   model Goal {
     id          String   @id @default(cuid())
     userId      String
     user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

     name        String
     type        GoalType
     targetAmount Decimal @db.Decimal(20, 2)
     targetDate   DateTime
     currentAmount Decimal @default(0) @db.Decimal(20, 2)

     linkedPortfolioId String?
     linkedPortfolio   Portfolio? @relation(fields: [linkedPortfolioId], references: [id])

     status       GoalStatus @default(ON_TRACK)

     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@index([userId, status])
   }

   enum GoalType {
     RETIREMENT
     HOME_PURCHASE
     EDUCATION
     EMERGENCY_FUND
     FINANCIAL_INDEPENDENCE
     CUSTOM
   }

   enum GoalStatus {
     ON_TRACK
     OFF_TRACK
     AT_RISK
     ACHIEVED
   }
   ```

3. **Price alerts & rebalancing**

   ```prisma
   model PriceAlert {
     id           String   @id @default(cuid())
     userId       String
     user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

     ticker       String
     alertType    PriceAlertType
     targetPrice  Decimal?  @db.Decimal(20, 8)
     percentChange Decimal? @db.Decimal(5, 2)

     triggered    Boolean  @default(false)
     triggeredAt  DateTime?

     createdAt DateTime @default(now())

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

4. **Investment enhancements for allocation**
   ```prisma
   model Investment {
     // ... existing fields
     sector    String?  // Technology, Healthcare, etc.
     industry  String?  // Software, Pharmaceuticals, etc.
     country   String?  // US, GB, JP, etc.
     marketCap Decimal? @db.Decimal(20, 2)
   }
   ```

#### Migration Commands

```bash
# 1. Create migration
pnpm prisma migrate dev --name add_competitive_features

# 2. Backfill investment metadata (sector, industry, country)
pnpm tsx scripts/backfill-investment-metadata.ts

# 3. Deploy to production
pnpm prisma migrate deploy
pnpm tsx scripts/backfill-investment-metadata.ts --production
```

#### Backfill Script

**File**: `scripts/backfill-investment-metadata.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { getStockOverview } from '@/lib/api/alphaVantage'

const prisma = new PrismaClient()

async function backfillInvestmentMetadata() {
  const investments = await prisma.investment.findMany({
    where: {
      assetType: { in: ['STOCK', 'ETF'] },
      sector: null, // Only backfill missing data
    },
  })

  console.log(`Backfilling metadata for ${investments.length} investments...`)

  for (const investment of investments) {
    try {
      const overview = await getStockOverview(investment.ticker)

      await prisma.investment.update({
        where: { id: investment.id },
        data: {
          sector: overview.sector || null,
          industry: overview.industry || null,
          country: overview.country || null,
          marketCap: overview.marketCap ? BigInt(overview.marketCap) : null,
        },
      })

      // Respect rate limits (5 calls/minute for Alpha Vantage)
      await new Promise((resolve) => setTimeout(resolve, 12000))
    } catch (error) {
      console.error(`Error backfilling ${investment.ticker}:`, error)
    }
  }

  console.log('Backfill complete')
}

backfillInvestmentMetadata()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

---

## Migration Checklist

### Pre-Migration

- [ ] Review migration plan with team
- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Run audit scripts to detect violations
- [ ] Fix data quality issues
- [ ] Document rollback procedures
- [ ] Set up monitoring alerts

### During Migration

- [ ] Execute migration during low-traffic window
- [ ] Monitor error logs in real-time
- [ ] Run verification scripts after each phase
- [ ] Keep rollback scripts ready
- [ ] Communicate status to stakeholders

### Post-Migration

- [ ] Verify data integrity
- [ ] Monitor application performance
- [ ] Check for new errors in Sentry
- [ ] Update API documentation
- [ ] Train team on new features
- [ ] Archive migration scripts

---

## Rollback Procedures

### General Rollback Process

1. **Immediate rollback** (within 1 hour):

   ```bash
   # Revert migration
   pnpm prisma migrate resolve --rolled-back <migration_name>

   # Re-deploy previous state
   pnpm prisma migrate deploy

   # Restart application
   vercel --prod
   ```

2. **Delayed rollback** (data already modified):
   - Create reverse migration script
   - Test on staging first
   - Apply carefully to production
   - May lose data from new features

### Point-in-Time Recovery

If migrations cause data corruption:

```sql
-- PostgreSQL PITR (requires WAL archiving enabled)
-- Restore database to state before migration
pg_restore --before='2025-10-12 14:00:00' backup.dump
```

---

## Testing Strategy

### Staging Environment

1. **Clone production data** (anonymized):

   ```bash
   pg_dump production_db | psql staging_db
   # Anonymize user data
   UPDATE "User" SET email = CONCAT('test+', id, '@example.com')
   ```

2. **Run migrations on staging**:

   ```bash
   pnpm prisma migrate deploy
   pnpm tsx scripts/migrate-to-tax-lots.ts
   ```

3. **Verify application functionality**:
   - Manual testing of all features
   - Run integration test suite
   - Load testing with k6
   - Monitor for errors

### Automated Testing

```typescript
// tests/migrations/tax-lot-migration.test.ts
describe('Tax Lot Migration', () => {
  it('should create tax lots for all investments', async () => {
    // Test migration logic
  })

  it('should preserve total quantities', async () => {
    // Test data integrity
  })

  it('should handle edge cases', async () => {
    // Test zero quantities, negative values, etc.
  })
})
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

- Migration duration
- Data integrity violations
- Application error rate
- Database query performance
- API response times

### Alert Triggers

```yaml
migration_duration_alert:
  threshold: >10 minutes
  action: Notify engineering team

data_integrity_violation:
  threshold: >0 violations
  action: Roll back migration immediately

error_rate_spike:
  threshold: >5% increase
  action: Investigate and potentially rollback

query_performance_degradation:
  threshold: >20% slower
  action: Review indexes and query optimization
```

---

## Support & Resources

### Documentation

- Prisma Migration Guide: https://www.prisma.io/docs/concepts/components/prisma-migrate
- PostgreSQL ALTER TABLE: https://www.postgresql.org/docs/current/sql-altertable.html

### Emergency Contacts

- **Database Admin**: [contact]
- **Engineering Lead**: [contact]
- **DevOps**: [contact]

### Related Documents

- [MASTER_PLAN_V2.md](./MASTER_PLAN_V2.md) - Complete roadmap
- [data-integrity-requirements.md](./data-integrity-requirements.md) - Constraint specifications
- [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) - Current limitations

---

**Last Updated**: 2025-10-12
**Next Review**: Before Phase 2 migration
**Owner**: Engineering Team
