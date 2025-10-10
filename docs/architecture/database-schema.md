# Database Schema

> 📝 **Documentation Agent:** Keep this synchronized with the actual Prisma schema. Update whenever migrations are created.

> 📚 **See Full Documentation:** [Schema Overview](../database/schema-overview.md) provides comprehensive details on all models, relationships, and best practices.

## Quick Reference

### Core Models

| Model               | Purpose                     | Key Fields                           |
| ------------------- | --------------------------- | ------------------------------------ |
| User                | User accounts               | email, name, emailVerified           |
| Account             | OAuth provider accounts     | provider, providerAccountId          |
| Session             | Active user sessions        | sessionToken, expires                |
| VerificationToken   | Email verification          | token, expires                       |
| Portfolio           | Investment portfolios       | name, baseCurrency, userId           |
| Investment          | Aggregated investment data  | ticker, totalQuantity, avgCostBasis  |
| PurchaseTransaction | Individual purchase records | quantity, pricePerUnit, purchaseDate |
| CurrencyRate        | Exchange rate cache         | fromCurrency, toCurrency, rate       |
| PortfolioSnapshot   | Historical portfolio values | totalValue, snapshotDate             |

### Entity Relationships

```
User
├── Account (1:many) - OAuth providers
├── Session (1:many) - Active sessions
└── Portfolio (1:many) - Investment portfolios
    ├── Investment (1:many) - Asset holdings
    │   └── PurchaseTransaction (1:many) - Purchase history
    └── PortfolioSnapshot (1:many) - Daily snapshots
```

## Schema File Location

- **Prisma Schema:** `prisma/schema.prisma`
- **Migrations:** `prisma/migrations/`
- **Seed Script:** `prisma/seed.ts`

## Key Design Decisions

### Financial Precision

All financial values use `Decimal @db.Decimal(20, 8)`:

- **20 total digits**: Supports large values (crypto)
- **8 decimal places**: Bitcoin precision standard
- **No rounding errors**: Avoids JavaScript number limitations

### Data Security

All operations MUST verify user ownership:

```typescript
// Always filter by userId from session
const portfolio = await prisma.portfolio.findFirst({
  where: {
    id: portfolioId,
    userId: session.user.id, // ✅ Authorization check
  },
})
```

Use helper functions in `lib/db/utils.ts` for authorized queries.

### Investment Aggregation

- **Investment table**: Stores aggregated `totalQuantity` and `averageCostBasis`
- **PurchaseTransaction table**: Preserves individual purchases for recalculation
- **Why both?**: Performance + accuracy when editing/deleting transactions

### Price Caching

- **CurrencyRate table**: Caches exchange rates from Alpha Vantage API
- **Investment.currentPrice**: Cached asset prices with `priceUpdatedAt` timestamp
- **TTL Strategy**: 15min (stocks), 5min (crypto), 1hr (currencies)

## Database Operations

### Essential Commands

```bash
# Generate Prisma Client
pnpm prisma generate

# Create migration (development)
pnpm prisma migrate dev --name descriptive_name

# Apply migrations (production)
pnpm prisma migrate deploy

# Open Prisma Studio (database GUI)
pnpm prisma studio

# Seed test data
pnpm prisma db seed

# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset
```

### Prisma Client Singleton

Always import from `lib/prisma.ts`:

```typescript
import { prisma } from '@/lib/prisma'

// Singleton prevents multiple connections
const users = await prisma.user.findMany()
```

## Type Definitions

Custom types in `lib/types/database.ts`:

- `PortfolioWithInvestments`: Portfolio with nested investments and transactions
- `InvestmentWithTransactions`: Investment with purchase history
- `UserWithPortfolios`: User with all portfolios
- `PortfolioSummary`: Dashboard aggregation interface
- `InvestmentSummary`: Investment performance interface

## Health Monitoring

Test database connectivity:

```bash
GET /api/health

# Response
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "database": {
    "status": "healthy",
    "responseTime": "15ms"
  }
}
```

## Migration History

| Migration        | Date       | Description                             |
| ---------------- | ---------- | --------------------------------------- |
| `initial_schema` | 2025-01-15 | Complete schema with all Phase 1 models |

## Indexes

Performance indexes on frequently queried fields:

| Table               | Index                       | Purpose                 |
| ------------------- | --------------------------- | ----------------------- |
| Account             | `userId`                    | User account lookups    |
| Session             | `userId`                    | User session queries    |
| Portfolio           | `userId`                    | User portfolio listings |
| Investment          | `portfolioId`               | Portfolio investments   |
| Investment          | `ticker`                    | Symbol searches         |
| Investment          | `priceUpdatedAt`            | Stale price detection   |
| PurchaseTransaction | `investmentId`              | Transaction history     |
| PurchaseTransaction | `purchaseDate`              | Date-based queries      |
| CurrencyRate        | `fromCurrency, toCurrency`  | Exchange rate lookups   |
| CurrencyRate        | `fetchedAt`                 | Cache freshness checks  |
| PortfolioSnapshot   | `portfolioId, snapshotDate` | Historical data queries |

## Cascade Deletes

All foreign keys use `onDelete: Cascade` for automatic cleanup:

- Delete user → removes all accounts, sessions, portfolios
- Delete portfolio → removes all investments, snapshots
- Delete investment → removes all purchase transactions

## Troubleshooting

### "Prisma Client not initialized"

```bash
pnpm prisma generate
```

### "Can't reach database server"

Check `DATABASE_URL` in `.env.local` and ensure PostgreSQL is running.

### Type errors after schema changes

```bash
pnpm prisma generate
pnpm typecheck
```

---

**Last Updated:** 2025-01-15 (F02 Implementation)
