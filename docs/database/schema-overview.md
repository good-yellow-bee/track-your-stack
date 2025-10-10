# Database Schema Overview

## Introduction

Track Your Stack uses PostgreSQL with Prisma ORM for type-safe database operations. The schema is designed for multi-user portfolio tracking with financial precision and proper data isolation.

## Schema Architecture

### Core Models

#### 1. User & Authentication (NextAuth.js)

- **User**: Core user account with email and profile information
- **Account**: OAuth provider accounts (Google, etc.)
- **Session**: Active user sessions
- **VerificationToken**: Email verification tokens

All authentication tables follow NextAuth.js adapter pattern.

#### 2. Portfolio Management

**Portfolio Model**

```prisma
model Portfolio {
  id            String   @id @default(cuid())
  userId        String
  name          String
  baseCurrency  String   @default("USD")
  investments   Investment[]
  snapshots     PortfolioSnapshot[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

- Each user can have multiple portfolios
- Base currency determines conversion target for calculations
- Cascade delete ensures data cleanup when portfolio is removed

#### 3. Investment Tracking

**Investment Model**

```prisma
model Investment {
  id                   String   @id @default(cuid())
  portfolioId          String
  ticker               String
  assetName            String
  assetType            AssetType
  totalQuantity        Decimal  @db.Decimal(20, 8)
  averageCostBasis     Decimal  @db.Decimal(20, 8)
  purchaseCurrency     String
  currentPrice         Decimal? @db.Decimal(20, 8)
  priceUpdatedAt       DateTime?
  transactions         PurchaseTransaction[]
}
```

**Key Features:**

- Decimal(20, 8) precision for financial accuracy
- Aggregated totals (quantity, average cost) for performance
- Individual transactions preserved for recalculation
- Asset type enum: STOCK, ETF, MUTUAL_FUND, CRYPTO

**PurchaseTransaction Model**

```prisma
model PurchaseTransaction {
  id           String   @id @default(cuid())
  investmentId String
  quantity     Decimal  @db.Decimal(20, 8)
  pricePerUnit Decimal  @db.Decimal(20, 8)
  currency     String
  purchaseDate DateTime @db.Date
  notes        String?  @db.Text
}
```

Preserves individual purchase history for:

- Detailed transaction logs
- Recalculating averages when editing/deleting
- Tax lot tracking (future feature)

#### 4. Price Caching

**CurrencyRate Model**

```prisma
model CurrencyRate {
  id           String   @id @default(cuid())
  fromCurrency String
  toCurrency   String
  rate         Decimal  @db.Decimal(20, 8)
  fetchedAt    DateTime

  @@unique([fromCurrency, toCurrency])
}
```

Caches exchange rates to minimize API calls to Alpha Vantage.

#### 5. Historical Tracking

**PortfolioSnapshot Model**

```prisma
model PortfolioSnapshot {
  id           String   @id @default(cuid())
  portfolioId  String
  totalValue   Decimal  @db.Decimal(20, 2)
  baseCurrency String
  snapshotDate DateTime @db.Date

  @@unique([portfolioId, snapshotDate])
}
```

Daily snapshots for historical performance charts (Phase 2 feature).

## Data Relationships

```
User
├── Account (1:many)
├── Session (1:many)
└── Portfolio (1:many)
    ├── Investment (1:many)
    │   └── PurchaseTransaction (1:many)
    └── PortfolioSnapshot (1:many)
```

All relationships use CASCADE delete for proper cleanup.

## Indexes

Performance indexes on frequently queried fields:

```prisma
@@index([userId])              // User data lookups
@@index([portfolioId])         // Portfolio investments
@@index([ticker])              // Investment searches
@@index([priceUpdatedAt])      // Stale price detection
@@index([portfolioId, snapshotDate])  // Historical queries
```

## Security & Authorization

### Row-Level Security Pattern

All queries MUST filter by `userId` from authenticated session:

```typescript
// ❌ WRONG - Security vulnerability
const portfolio = await prisma.portfolio.findUnique({
  where: { id: portfolioId },
})

// ✅ CORRECT - Enforces user ownership
const portfolio = await prisma.portfolio.findFirst({
  where: {
    id: portfolioId,
    userId: session.user.id, // Authorization check
  },
})
```

### Utility Functions

Use `lib/db/utils.ts` helpers for authorized queries:

- `getAuthorizedPortfolio(portfolioId, userId)`
- `getUserPortfolios(userId)`
- `userOwnsPortfolio(portfolioId, userId)`

## Financial Precision

### Decimal Types

Use Decimal(20, 8) for all financial values:

- **20 digits total**: Supports large cryptocurrency values
- **8 decimal places**: Bitcoin precision standard
- **Prevents rounding errors**: JavaScript number limitations avoided

### Currency Handling

- Store purchase currency separately from base currency
- Convert to base currency for aggregations only
- Preserve original purchase currency for accuracy

## Database Operations

### Setup Commands

```bash
# Generate Prisma Client
pnpm prisma generate

# Create migration (development)
pnpm prisma migrate dev --name migration_name

# Apply migrations (production)
pnpm prisma migrate deploy

# Open database GUI
pnpm prisma studio

# Seed test data
pnpm prisma db seed
```

### Prisma Client Singleton

Always import from `lib/prisma.ts`:

```typescript
import { prisma } from '@/lib/prisma'

// Safe to use across the application
const users = await prisma.user.findMany()
```

The singleton prevents multiple database connections in development.

## Type Definitions

Custom types in `lib/types/database.ts`:

```typescript
// Portfolio with all relations
type PortfolioWithInvestments = Prisma.PortfolioGetPayload<{
  include: {
    investments: {
      include: { transactions: true }
    }
  }
}>

// Dashboard summaries
interface PortfolioSummary {
  totalValue: number
  totalGainLoss: number
  investmentCount: number
  // ...
}
```

## Migration Strategy

### Development Workflow

1. Modify `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name descriptive_name`
3. Review generated migration SQL
4. Test with seed data
5. Commit migration files to git

### Production Deployment

1. Migrations run automatically via `prisma migrate deploy`
2. Never use `prisma db push` in production
3. Always test migrations on staging first

## Health Monitoring

Test database connectivity via API endpoint:

```bash
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "database": {
    "status": "healthy",
    "responseTime": "15ms"
  }
}
```

## Future Enhancements

### Planned Phase 2

- Tax lot tracking for capital gains
- Multi-currency portfolio support
- Benchmark comparisons
- Transaction categories (buy, sell, dividend)

### Schema Extensibility

Current design supports:

- Additional asset types via enum
- Custom fields in transactions (notes)
- Historical snapshots for any date range
- Portfolio sharing/permissions (add `portfolioUsers` table)

## Troubleshooting

### Common Issues

**"Prisma Client not initialized"**

```bash
pnpm prisma generate
```

**"Can't reach database server"**

- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Verify connection string format

**Type errors after schema changes**

```bash
pnpm prisma generate
pnpm typecheck
```

### Database Reset (Development Only)

```bash
# ⚠️ WARNING: Deletes all data
pnpm prisma migrate reset
```

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [PostgreSQL Decimal Types](https://www.postgresql.org/docs/current/datatype-numeric.html)
