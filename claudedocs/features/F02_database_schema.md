# F02: Database Schema & Prisma Setup

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 3-4 hours
**Dependencies:** F01 (Project Setup)

---

## 📋 Overview

Design and implement the complete database schema using Prisma ORM with PostgreSQL. Setup database connection, create all necessary tables for authentication, portfolios, investments, transactions, and price caching.

**What this enables:**
- Complete data model for the application
- Type-safe database queries with Prisma
- NextAuth.js authentication tables
- Portfolio and investment tracking
- Price caching for API optimization
- Multi-currency support infrastructure

---

## 🎯 Acceptance Criteria

- [ ] Prisma schema file created with all models
- [ ] Database connection configured
- [ ] Initial migration created and applied
- [ ] Prisma Client generated successfully
- [ ] Database schema matches specification
- [ ] All relationships properly defined
- [ ] Indexes added for performance
- [ ] Seed data script created (optional)
- [ ] Can query database from Next.js
- [ ] Prisma Studio works for visual inspection

---

## 📦 Dependencies to Install

All Prisma dependencies should already be installed from F01:
```bash
# Verify these are in package.json
@prisma/client        # Prisma client
prisma               # Prisma CLI (dev dependency)
@auth/prisma-adapter # NextAuth Prisma adapter
```

If not installed:
```bash
pnpm add @prisma/client @auth/prisma-adapter
pnpm add -D prisma
```

---

## 🔧 Implementation Steps

### Step 1: Initialize Prisma (15 min)

```bash
# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql

# This creates:
# - prisma/schema.prisma
# - .env with DATABASE_URL
```

Update `.env.local`:
```bash
# Use Vercel Postgres, Supabase, or local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/track_your_stack?schema=public"
```

For local development with Docker:
```bash
# Optional: Run PostgreSQL in Docker
docker run --name track-your-stack-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=track_your_stack \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Step 2: Create Complete Prisma Schema (60 min)

Replace contents of `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// NextAuth.js Tables
// ============================================

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model User {
  id            String      @id @default(cuid())
  name          String?
  email         String?     @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  portfolios    Portfolio[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// Portfolio Management
// ============================================

model Portfolio {
  id            String              @id @default(cuid())
  userId        String
  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  name          String
  baseCurrency  String              @default("USD")
  investments   Investment[]
  snapshots     PortfolioSnapshot[]
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@index([userId])
}

// ============================================
// Investment Tracking
// ============================================

enum AssetType {
  STOCK
  ETF
  MUTUAL_FUND
  CRYPTO
}

model Investment {
  id                   String                @id @default(cuid())
  portfolioId          String
  portfolio            Portfolio             @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  ticker               String
  assetName            String
  assetType            AssetType
  totalQuantity        Decimal               @db.Decimal(20, 8)
  averageCostBasis     Decimal               @db.Decimal(20, 8)
  purchaseCurrency     String
  currentPrice         Decimal?              @db.Decimal(20, 8)
  currentPriceCurrency String?
  priceUpdatedAt       DateTime?
  transactions         PurchaseTransaction[]
  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt

  @@index([portfolioId])
  @@index([ticker])
  @@index([priceUpdatedAt])
}

model PurchaseTransaction {
  id           String     @id @default(cuid())
  investmentId String
  investment   Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)
  quantity     Decimal    @db.Decimal(20, 8)
  pricePerUnit Decimal    @db.Decimal(20, 8)
  currency     String
  purchaseDate DateTime   @db.Date
  notes        String?    @db.Text
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([investmentId])
  @@index([purchaseDate])
}

// ============================================
// Price Caching
// ============================================

model CurrencyRate {
  id           String   @id @default(cuid())
  fromCurrency String
  toCurrency   String
  rate         Decimal  @db.Decimal(20, 8)
  fetchedAt    DateTime
  createdAt    DateTime @default(now())

  @@unique([fromCurrency, toCurrency])
  @@index([fetchedAt])
}

// ============================================
// Phase 2: Historical Tracking
// ============================================

model PortfolioSnapshot {
  id           String    @id @default(cuid())
  portfolioId  String
  portfolio    Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  totalValue   Decimal   @db.Decimal(20, 2)
  baseCurrency String
  snapshotDate DateTime  @db.Date
  createdAt    DateTime  @default(now())

  @@unique([portfolioId, snapshotDate])
  @@index([portfolioId, snapshotDate])
}
```

### Step 3: Create Prisma Client Instance (15 min)

Create `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

This pattern prevents multiple Prisma Client instances in development.

### Step 4: Generate Prisma Client (10 min)

```bash
# Generate Prisma Client from schema
pnpm db:generate

# This creates the @prisma/client with types
# Verify types are generated in node_modules/.prisma/client
```

### Step 5: Create Initial Migration (20 min)

```bash
# Create and apply migration
pnpm db:migrate

# Prompt: Name of migration?
# Enter: initial_schema

# This creates:
# - prisma/migrations/[timestamp]_initial_schema/migration.sql
# - Applies migration to database
```

Verify migration file created:
```bash
ls -la prisma/migrations/
```

### Step 6: Verify Database Schema (15 min)

```bash
# Open Prisma Studio to inspect tables
pnpm db:studio

# This opens http://localhost:5555
# Verify all tables exist:
# - Account, Session, User, VerificationToken
# - Portfolio, Investment, PurchaseTransaction
# - CurrencyRate, PortfolioSnapshot
```

### Step 7: Create Type Definitions (30 min)

Create `types/database.ts`:
```typescript
import { Prisma } from '@prisma/client'

// Portfolio with all relations
export type PortfolioWithInvestments = Prisma.PortfolioGetPayload<{
  include: {
    investments: {
      include: {
        transactions: true
      }
    }
  }
}>

// Investment with transactions
export type InvestmentWithTransactions = Prisma.InvestmentGetPayload<{
  include: {
    transactions: true
  }
}>

// User with portfolios
export type UserWithPortfolios = Prisma.UserGetPayload<{
  include: {
    portfolios: true
  }
}>

// Type helpers
export type AssetType = Prisma.AssetType
export type Portfolio = Prisma.Portfolio
export type Investment = Prisma.Investment
export type PurchaseTransaction = Prisma.PurchaseTransaction
export type CurrencyRate = Prisma.CurrencyRate
export type PortfolioSnapshot = Prisma.PortfolioSnapshot
```

### Step 8: Create Database Utilities (30 min)

Create `lib/db/utils.ts`:
```typescript
import { prisma } from '@/lib/prisma'

/**
 * Test database connection
 */
export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase() {
  await prisma.$disconnect()
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const [userCount, portfolioCount, investmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.portfolio.count(),
    prisma.investment.count(),
  ])

  return {
    users: userCount,
    portfolios: portfolioCount,
    investments: investmentCount,
  }
}
```

### Step 9: Create Seed Script (Optional, 30 min)

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a test user (only in development)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })

  console.log('✅ Created test user:', testUser.email)

  // Create sample portfolio
  const portfolio = await prisma.portfolio.create({
    data: {
      userId: testUser.id,
      name: 'My First Portfolio',
      baseCurrency: 'USD',
    },
  })

  console.log('✅ Created sample portfolio:', portfolio.name)

  // Create sample investment
  const investment = await prisma.investment.create({
    data: {
      portfolioId: portfolio.id,
      ticker: 'AAPL',
      assetName: 'Apple Inc.',
      assetType: 'STOCK',
      totalQuantity: 10,
      averageCostBasis: 150.50,
      purchaseCurrency: 'USD',
      transactions: {
        create: {
          quantity: 10,
          pricePerUnit: 150.50,
          currency: 'USD',
          purchaseDate: new Date('2024-01-15'),
        },
      },
    },
  })

  console.log('✅ Created sample investment:', investment.ticker)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Update `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed"
  }
}
```

Install tsx for seeding:
```bash
pnpm add -D tsx
```

### Step 10: Test Database Integration (20 min)

Create `app/api/test-db/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { testDatabaseConnection, getDatabaseStats } from '@/lib/db/utils'

export async function GET() {
  const isConnected = await testDatabaseConnection()

  if (!isConnected) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const stats = await getDatabaseStats()

  return NextResponse.json({
    status: 'connected',
    database: 'PostgreSQL',
    stats,
  })
}
```

Test the endpoint:
```bash
# Start dev server
pnpm dev

# Test in browser or curl
curl http://localhost:3000/api/test-db

# Expected response:
# {
#   "status": "connected",
#   "database": "PostgreSQL",
#   "stats": {
#     "users": 0,
#     "portfolios": 0,
#     "investments": 0
#   }
# }
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] Database connection succeeds
- [ ] Prisma Studio opens and shows all tables
- [ ] Can create a user record
- [ ] Can create a portfolio linked to user
- [ ] Can create an investment linked to portfolio
- [ ] Can create a transaction linked to investment
- [ ] Foreign key relationships work correctly
- [ ] Cascade deletes work (delete portfolio → investments deleted)
- [ ] Unique constraints work (duplicate email fails)
- [ ] Indexes are created (check Prisma Studio)

### Verification Commands
```bash
# Generate Prisma Client
pnpm db:generate

# Create migration
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Run seed (optional)
pnpm db:seed

# Test database connection
curl http://localhost:3000/api/test-db
```

### Database Queries to Test

```typescript
// Test in Prisma Studio or create a test script

// Create user
await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'Test User',
  },
})

// Create portfolio with investment
await prisma.portfolio.create({
  data: {
    userId: 'user_id_here',
    name: 'Test Portfolio',
    baseCurrency: 'USD',
    investments: {
      create: {
        ticker: 'AAPL',
        assetName: 'Apple Inc.',
        assetType: 'STOCK',
        totalQuantity: 10,
        averageCostBasis: 150,
        purchaseCurrency: 'USD',
      },
    },
  },
})

// Query with relations
const portfolio = await prisma.portfolio.findFirst({
  include: {
    investments: {
      include: {
        transactions: true,
      },
    },
  },
})
```

---

## 📚 Documentation Updates

### Files to Create/Update
- [ ] `claudedocs/database-schema.md` - Complete schema documentation
- [ ] `docs/architecture/data-model.md` - ERD and relationships
- [ ] `docs/changelog.md` - Add F02 entry

### Changelog Entry
```markdown
## [0.2.0] - 2025-10-08

### Added
- Complete Prisma schema with all tables
- NextAuth.js authentication tables
- Portfolio, Investment, and Transaction models
- Currency rate caching table
- Portfolio snapshot table for historical data
- Database connection utilities
- Prisma Client instance with proper singleton pattern
- Type definitions for all database models
- Seed script for development data
- Database testing endpoint
```

---

## 🔀 Git Workflow

### Branch Name
```bash
git checkout -b feature/database-schema
```

### Commit Messages
```bash
git commit -m "feat(db): setup Prisma with PostgreSQL

- Initialize Prisma with PostgreSQL datasource
- Configure database connection
- Add Prisma client singleton pattern"

git commit -m "feat(db): create complete database schema

- Add NextAuth.js tables (User, Account, Session)
- Add Portfolio and Investment models
- Add PurchaseTransaction model
- Add CurrencyRate caching model
- Add PortfolioSnapshot for historical data
- Define all relationships and indexes"

git commit -m "feat(db): add database utilities and types

- Create type definitions for all models
- Add database connection utilities
- Add database statistics helper
- Create test endpoint for database connection"

git commit -m "feat(db): create seed script

- Add development seed data
- Create sample user, portfolio, and investment
- Configure Prisma seed command"
```

### Pull Request Template
```markdown
## F02: Database Schema & Prisma Setup

### What does this PR do?
Implements the complete database schema using Prisma ORM with PostgreSQL, including all necessary tables for authentication, portfolios, investments, and price caching.

### Type of change
- [x] Database schema
- [x] New feature (Prisma setup)
- [x] Configuration

### Database Changes
- ✅ Created initial migration: `initial_schema`
- ✅ 11 tables created
- ✅ All relationships defined
- ✅ Indexes added for performance

### Checklist
- [x] Prisma schema created
- [x] Initial migration applied
- [x] Prisma Client generated
- [x] Database connection works
- [x] Type definitions created
- [x] Utilities and helpers added
- [x] Seed script created
- [x] Test endpoint working
- [x] Documentation updated

### Testing performed
- Verified database connection
- Tested all CRUD operations
- Confirmed relationships work
- Validated cascade deletes
- Checked indexes in Prisma Studio

### Migration commands
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```
```

---

## ⚠️ Common Issues & Solutions

### Issue: `DATABASE_URL` not found
**Solution:** Ensure `.env.local` exists with valid `DATABASE_URL`

### Issue: Migration fails with connection error
**Solution:**
- Check if PostgreSQL is running
- Verify connection string format
- Test connection: `psql $DATABASE_URL`

### Issue: Prisma Client import errors
**Solution:** Run `pnpm db:generate` to regenerate client

### Issue: Type errors after schema changes
**Solution:**
```bash
pnpm db:generate
# Restart TypeScript server in VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: Migration out of sync
**Solution:**
```bash
# Reset database (DEVELOPMENT ONLY!)
npx prisma migrate reset

# Or create new migration
pnpm db:migrate
```

### Issue: Decimal type precision errors
**Solution:** Use `Decimal` from Prisma for all decimal fields:
```typescript
import { Decimal } from '@prisma/client/runtime/library'
```

---

## 📦 Deliverables

After completing this feature, you should have:

- [x] Complete Prisma schema file
- [x] Database migrations applied
- [x] Prisma Client generated
- [x] Database connection working
- [x] Type definitions for all models
- [x] Database utilities and helpers
- [x] Seed script for development
- [x] Test endpoint functional
- [x] Documentation updated

---

## 🔗 Related Files

- `prisma/schema.prisma` - Database schema definition
- `prisma/migrations/` - Migration files
- `prisma/seed.ts` - Seed script
- `lib/prisma.ts` - Prisma client instance
- `lib/db/utils.ts` - Database utilities
- `types/database.ts` - Type definitions
- `app/api/test-db/route.ts` - Test endpoint
- `.env.local` - Database connection string

---

## ⏭️ Next Feature

After completing F02, proceed to:
→ [F03: Authentication with NextAuth.js](F03_authentication.md)

---

**Status Legend:**
- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked
