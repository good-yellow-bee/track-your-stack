# Investment Portfolio Tracker - Technical Specification

**Project Name:** Track Your Stack
**Stack:** Next.js 15 + TypeScript + PostgreSQL + Vercel
**Version:** 1.0 (MVP + Phase 2)
**Date:** 2025-10-08

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technical Stack](#technical-stack)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
5. [API Integration Strategy](#api-integration-strategy)
6. [Feature Specifications](#feature-specifications)
7. [Calculation Logic](#calculation-logic)
8. [Phase 1: MVP Features](#phase-1-mvp-features)
9. [Phase 2: Advanced Features](#phase-2-advanced-features)
10. [Implementation Roadmap](#implementation-roadmap)
11. [Security Considerations](#security-considerations)
12. [Performance Optimization](#performance-optimization)

---

## Executive Summary

**Track Your Stack** is a modern investment portfolio tracking application that allows users to monitor their investments across multiple portfolios with real-time price updates, multi-currency support, and comprehensive analytics.

### Core Value Proposition
- **Multi-Asset Support:** Stocks, ETFs, mutual funds, and cryptocurrency
- **Smart Aggregation:** Automatic average cost basis calculation across multiple purchases
- **Multi-Currency:** Portfolio tracking in any major currency with real-time conversion
- **Real-Time Data:** Live price updates via Alpha Vantage API
- **Visual Analytics:** Pie charts, performance tracking, and gains/loss reporting

### Target Users
- Individual investors managing personal portfolios
- Users with diverse asset types across multiple currencies
- Investors who want simple, accurate tracking without manual spreadsheets

---

## Technical Stack

### Frontend
- **Framework:** Next.js 15 (React 19)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Charts:** Recharts or Chart.js
- **State Management:** React Context + React Query (TanStack Query)
- **Forms:** React Hook Form + Zod validation

### Backend
- **Runtime:** Node.js 20+ (Next.js Server Actions + API Routes)
- **ORM:** Prisma 5.x
- **Database:** PostgreSQL 16+ (Vercel Postgres or Supabase)
- **Authentication:** NextAuth.js v5 (Auth.js) with Google OAuth
- **API Client:** Axios or native fetch with retry logic

### External Services
- **Market Data:** Alpha Vantage API (free tier: 500 calls/day)
- **Currency Exchange:** Alpha Vantage CURRENCY_EXCHANGE_RATE
- **Deployment:** Vercel (hosting + serverless functions)
- **Storage:** Vercel Postgres or Supabase PostgreSQL

### Development Tools
- **Package Manager:** pnpm (fast, efficient)
- **Linting:** ESLint + Prettier
- **Testing:** Vitest + React Testing Library + Playwright
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions + Vercel auto-deploy

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  Next.js App Router + React 19 + TypeScript + Tailwind  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Server Actions / API Routes
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Server (Vercel Edge)                │
│  • NextAuth.js (Google OAuth)                           │
│  • Server Actions (mutations)                           │
│  • API Routes (background jobs)                         │
│  • Prisma ORM                                           │
└─────────┬──────────────────────────────┬────────────────┘
          │                              │
          │ Database Queries             │ External API Calls
          ▼                              ▼
┌──────────────────────┐    ┌────────────────────────────┐
│  PostgreSQL Database │    │   Alpha Vantage API        │
│  • Users             │    │   • Stock Quotes           │
│  • Portfolios        │    │   • Crypto Prices          │
│  • Investments       │    │   • Currency Rates         │
│  • Transactions      │    │   • Company Info           │
│  • Price Cache       │    └────────────────────────────┘
└──────────────────────┘
```

### Key Architecture Decisions

1. **Next.js App Router:** Modern React Server Components for optimal performance
2. **Server Actions:** Type-safe mutations without separate API layer
3. **Edge Functions:** Fast global response times via Vercel Edge Network
4. **Prisma ORM:** Type-safe database queries with excellent DX
5. **React Query:** Smart caching and background refetching for real-time updates

---

## Database Schema

### ERD Overview

```
users (NextAuth)
  ├── id (uuid, PK)
  ├── email (string, unique)
  ├── name (string)
  ├── image (string, optional)
  ├── created_at (timestamp)
  └── updated_at (timestamp)

portfolios
  ├── id (uuid, PK)
  ├── user_id (uuid, FK → users.id)
  ├── name (string)
  ├── base_currency (string, e.g., "USD")
  ├── created_at (timestamp)
  └── updated_at (timestamp)

investments (aggregated view)
  ├── id (uuid, PK)
  ├── portfolio_id (uuid, FK → portfolios.id)
  ├── ticker (string, e.g., "AAPL")
  ├── asset_name (string, e.g., "Apple Inc.")
  ├── asset_type (enum: STOCK, ETF, MUTUAL_FUND, CRYPTO)
  ├── total_quantity (decimal)
  ├── average_cost_basis (decimal, in purchase currency)
  ├── purchase_currency (string, e.g., "USD")
  ├── current_price (decimal, cached)
  ├── current_price_currency (string)
  ├── price_updated_at (timestamp)
  ├── created_at (timestamp)
  └── updated_at (timestamp)

purchase_transactions (for recalculation)
  ├── id (uuid, PK)
  ├── investment_id (uuid, FK → investments.id)
  ├── quantity (decimal)
  ├── price_per_unit (decimal)
  ├── currency (string)
  ├── purchase_date (date)
  ├── notes (text, optional)
  ├── created_at (timestamp)
  └── updated_at (timestamp)

currency_rates (cache)
  ├── id (uuid, PK)
  ├── from_currency (string)
  ├── to_currency (string)
  ├── rate (decimal)
  ├── fetched_at (timestamp)
  └── created_at (timestamp)

portfolio_snapshots (Phase 2: historical tracking)
  ├── id (uuid, PK)
  ├── portfolio_id (uuid, FK → portfolios.id)
  ├── total_value (decimal)
  ├── base_currency (string)
  ├── snapshot_date (date)
  └── created_at (timestamp)
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js required tables
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

// Portfolio Management
model Portfolio {
  id            String       @id @default(cuid())
  userId        String
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  name          String
  baseCurrency  String       @default("USD")
  investments   Investment[]
  snapshots     PortfolioSnapshot[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([userId])
}

enum AssetType {
  STOCK
  ETF
  MUTUAL_FUND
  CRYPTO
}

model Investment {
  id                   String               @id @default(cuid())
  portfolioId          String
  portfolio            Portfolio            @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  ticker               String
  assetName            String
  assetType            AssetType
  totalQuantity        Decimal              @db.Decimal(20, 8)
  averageCostBasis     Decimal              @db.Decimal(20, 8)
  purchaseCurrency     String
  currentPrice         Decimal?             @db.Decimal(20, 8)
  currentPriceCurrency String?
  priceUpdatedAt       DateTime?
  transactions         PurchaseTransaction[]
  createdAt            DateTime             @default(now())
  updatedAt            DateTime             @updatedAt

  @@index([portfolioId])
  @@index([ticker])
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

// Phase 2: Historical tracking
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

---

## API Integration Strategy

### Alpha Vantage API

**Base URL:** `https://www.alphavantage.co/query`

**API Key:** Store in environment variable `ALPHA_VANTAGE_API_KEY`

**Free Tier Limits:**
- 500 API calls per day
- 5 API calls per minute

### Endpoints Used

#### 1. Stock/ETF Quote
```
GET /query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_KEY

Response:
{
  "Global Quote": {
    "01. symbol": "AAPL",
    "05. price": "178.50",
    "08. previous close": "177.25",
    "09. change": "1.25",
    "10. change percent": "0.7050%"
  }
}
```

#### 2. Cryptocurrency Quote
```
GET /query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=YOUR_KEY

Response:
{
  "Realtime Currency Exchange Rate": {
    "1. From_Currency Code": "BTC",
    "3. To_Currency Code": "USD",
    "5. Exchange Rate": "43250.50000000"
  }
}
```

#### 3. Currency Exchange Rate
```
GET /query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=YOUR_KEY

Response:
{
  "Realtime Currency Exchange Rate": {
    "5. Exchange Rate": "1.0850"
  }
}
```

#### 4. Company Name Lookup (Symbol Search)
```
GET /query?function=SYMBOL_SEARCH&keywords=apple&apikey=YOUR_KEY

Response:
{
  "bestMatches": [
    {
      "1. symbol": "AAPL",
      "2. name": "Apple Inc.",
      "3. type": "Equity",
      "4. region": "United States",
      "8. currency": "USD"
    }
  ]
}
```

### Caching Strategy

**Problem:** 500 calls/day limit = need smart caching

**Solution:**

1. **Price Cache TTL:**
   - Stock/ETF: 15 minutes during market hours, 1 hour after close
   - Crypto: 5 minutes (24/7 markets)
   - Currency rates: 1 hour

2. **Database Caching:**
   - Store `current_price` and `price_updated_at` in `investments` table
   - Store exchange rates in `currency_rates` table
   - Check cache freshness before API call

3. **Batch Updates:**
   - When user views portfolio, batch all price updates
   - Use background job to update prices every 15 minutes
   - Only update visible portfolios (active users)

4. **Rate Limiting:**
   - Implement request queue with 5 requests/minute limit
   - Use Redis or in-memory queue for API call scheduling
   - Show "updating prices..." indicator during refresh

### API Client Implementation

```typescript
// lib/api/alphaVantage.ts

import axios from 'axios';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY!;
const BASE_URL = 'https://www.alphavantage.co/query';

export class AlphaVantageClient {
  private async request(params: Record<string, string>) {
    const response = await axios.get(BASE_URL, {
      params: { ...params, apikey: API_KEY },
      timeout: 10000,
    });
    return response.data;
  }

  async getStockQuote(ticker: string) {
    const data = await this.request({
      function: 'GLOBAL_QUOTE',
      symbol: ticker,
    });
    return data['Global Quote'];
  }

  async getCryptoPrice(symbol: string, currency: string = 'USD') {
    const data = await this.request({
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: symbol,
      to_currency: currency,
    });
    return data['Realtime Currency Exchange Rate'];
  }

  async getExchangeRate(from: string, to: string) {
    const data = await this.request({
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: from,
      to_currency: to,
    });
    return data['Realtime Currency Exchange Rate'];
  }

  async searchSymbol(keywords: string) {
    const data = await this.request({
      function: 'SYMBOL_SEARCH',
      keywords,
    });
    return data.bestMatches || [];
  }
}
```

---

## Calculation Logic

### Average Cost Basis Calculation

**When user adds multiple purchases of same ticker:**

```typescript
// Example: User owns AAPL, adds more
// Existing: 10 shares @ $150 = $1,500 total cost
// New purchase: 5 shares @ $160 = $800 total cost

// Aggregation:
const newTotalQuantity = 10 + 5; // 15 shares
const newTotalCost = 1500 + 800; // $2,300
const newAverageCostBasis = 2300 / 15; // $153.33 per share

// Update investment record:
investment.totalQuantity = 15;
investment.averageCostBasis = 153.33;

// Create transaction record:
purchaseTransaction.create({
  investmentId: investment.id,
  quantity: 5,
  pricePerUnit: 160,
  purchaseDate: new Date(),
});
```

### Gains/Loss Calculation (Single Investment)

```typescript
interface InvestmentMetrics {
  currentValue: number;      // Current Price × Quantity
  totalCost: number;         // Avg Cost Basis × Quantity
  gainLossDollar: number;    // Current Value - Total Cost
  gainLossPercent: number;   // ((Current - Cost) / Cost) × 100
}

function calculateInvestmentMetrics(investment: Investment): InvestmentMetrics {
  const currentValue = investment.currentPrice * investment.totalQuantity;
  const totalCost = investment.averageCostBasis * investment.totalQuantity;
  const gainLossDollar = currentValue - totalCost;
  const gainLossPercent = (gainLossDollar / totalCost) * 100;

  return {
    currentValue,
    totalCost,
    gainLossDollar,
    gainLossPercent,
  };
}
```

### Multi-Currency Conversion

```typescript
interface ConvertedInvestment {
  currentValueInBase: number;
  totalCostInBase: number;
  gainLossDollar: number;
  gainLossPercent: number;
}

async function convertToBaseCurrency(
  investment: Investment,
  baseCurrency: string
): Promise<ConvertedInvestment> {
  // Get exchange rate (with caching)
  const rate = await getExchangeRate(
    investment.purchaseCurrency,
    baseCurrency
  );

  const currentValueOriginal = investment.currentPrice * investment.totalQuantity;
  const totalCostOriginal = investment.averageCostBasis * investment.totalQuantity;

  const currentValueInBase = currentValueOriginal * rate;
  const totalCostInBase = totalCostOriginal * rate;
  const gainLossDollar = currentValueInBase - totalCostInBase;
  const gainLossPercent = (gainLossDollar / totalCostInBase) * 100;

  return {
    currentValueInBase,
    totalCostInBase,
    gainLossDollar,
    gainLossPercent,
  };
}
```

### Portfolio Summary Calculation

```typescript
interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  investments: Array<{
    investment: Investment;
    metrics: ConvertedInvestment;
    percentOfPortfolio: number;
  }>;
}

async function calculatePortfolioSummary(
  portfolio: Portfolio
): Promise<PortfolioSummary> {
  const investments = await getInvestments(portfolio.id);

  // Convert all investments to base currency
  const convertedInvestments = await Promise.all(
    investments.map(async (inv) => ({
      investment: inv,
      metrics: await convertToBaseCurrency(inv, portfolio.baseCurrency),
    }))
  );

  const totalValue = convertedInvestments.reduce(
    (sum, { metrics }) => sum + metrics.currentValueInBase,
    0
  );

  const totalCost = convertedInvestments.reduce(
    (sum, { metrics }) => sum + metrics.totalCostInBase,
    0
  );

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = (totalGainLoss / totalCost) * 100;

  const investmentsWithPercentage = convertedInvestments.map((item) => ({
    ...item,
    percentOfPortfolio: (item.metrics.currentValueInBase / totalValue) * 100,
  }));

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    investments: investmentsWithPercentage,
  };
}
```

---

## Feature Specifications

### Authentication

**Google OAuth via NextAuth.js v5**

**Flow:**
1. User clicks "Sign in with Google"
2. NextAuth redirects to Google OAuth consent screen
3. User authorizes app
4. Google returns to callback URL with auth code
5. NextAuth exchanges code for tokens
6. Create/update user in database
7. Create session, redirect to dashboard

**Configuration:**

```typescript
// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Environment Variables:**
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
```

---

## Phase 1: MVP Features

### 1. Authentication
- [x] Google OAuth sign-in
- [x] Session management
- [x] Protected routes
- [x] Sign out functionality

### 2. Portfolio Management
- [x] Create portfolio with custom name
- [x] Select base currency (USD, EUR, GBP, etc.)
- [x] Edit portfolio name
- [x] Delete portfolio (with confirmation)
- [x] List all portfolios on dashboard

### 3. Investment Entry
- [x] **Add Investment Form:**
  - Ticker symbol input (autocomplete search)
  - Asset name auto-populated from API
  - Asset type auto-detected or selectable
  - Quantity input (decimal support)
  - Purchase price per unit
  - Purchase currency selector
  - Purchase date picker
  - Optional notes field
  - Preview before save

- [x] **Ticker Search:**
  - Real-time search via Alpha Vantage SYMBOL_SEARCH
  - Display: Symbol, Name, Type, Exchange
  - Click to select and auto-fill

- [x] **Validation:**
  - Required: ticker, quantity, price, date
  - Quantity > 0
  - Price > 0
  - Date <= today
  - Valid ticker symbol

### 4. Investment Management
- [x] View all investments in portfolio (table view)
- [x] Edit investment:
  - Modify quantity, price, date (recalculates avg cost)
  - Cannot edit ticker (create new investment instead)
- [x] Delete investment (with confirmation)
- [x] Refresh prices manually (button)
- [x] Auto-refresh prices (15-min interval)

### 5. Portfolio Visualization
- [x] **Pie Chart:**
  - Show percentage allocation by investment
  - Color-coded by asset
  - Click to highlight in table
  - Library: Recharts

- [x] **Summary Cards:**
  - Total portfolio value (in base currency)
  - Total cost basis
  - Total gain/loss ($)
  - Total gain/loss (%)
  - Best/worst performer

### 6. Gains/Loss Display
- [x] **Per Investment:**
  - Current value
  - Total cost
  - Gain/loss ($)
  - Gain/loss (%)
  - Color-coded (green/red)

- [x] **Portfolio Level:**
  - Total value
  - Total invested
  - Overall gain/loss ($)
  - Overall return (%)

---

## Phase 2: Advanced Features

### 1. Historical Performance Charts
**Priority:** High Value, Medium Complexity

**Features:**
- Line chart showing portfolio value over time
- Date range selector: 1W, 1M, 3M, 6M, 1Y, ALL
- Multiple portfolio comparison on same chart
- Benchmark comparison (S&P 500 equivalent)

**Implementation:**
- Daily cron job to snapshot portfolio values
- Store in `portfolio_snapshots` table
- Chart.js or Recharts for visualization
- API endpoint: `/api/portfolios/[id]/history?range=1M`

**Data Model:**
```typescript
interface PortfolioSnapshot {
  id: string;
  portfolioId: string;
  totalValue: number;
  baseCurrency: string;
  snapshotDate: Date;
  createdAt: Date;
}
```

**Timeline:** Week 4-5

---

### 2. Portfolio Comparison
**Priority:** Medium Value, Low Complexity

**Features:**
- Side-by-side comparison of 2-4 portfolios
- Comparison metrics:
  - Total value
  - Gain/loss %
  - Asset allocation (pie charts)
  - Best/worst performers
- Export comparison report

**Implementation:**
- Reuse existing calculation functions
- Grid layout with comparison cards
- No new data model required

**Timeline:** Week 5

---

### 3. Import from CSV
**Priority:** High Value, Medium Complexity

**Features:**
- Upload CSV file with investment data
- Required columns: ticker, quantity, purchase_price, purchase_date
- Optional columns: currency, notes
- Validation and error reporting
- Preview before import
- Bulk import to selected portfolio

**CSV Format Example:**
```csv
ticker,quantity,purchase_price,purchase_date,currency,notes
AAPL,10,150.50,2024-01-15,USD,Initial purchase
GOOGL,5,2800.00,2024-02-20,USD,
BTC,0.5,42000.00,2024-03-10,USD,Crypto investment
```

**Implementation:**
- Use Papa Parse library for CSV parsing
- Server Action for bulk import
- Transaction support (all or nothing)
- Duplicate detection

**Timeline:** Week 6

---

### 4. Export Reports
**Priority:** Medium Value, Low Complexity

**Features:**
- Export portfolio to CSV
- Export to PDF (summary report)
- Tax reporting format (FIFO/LIFO)
- Email report option

**Formats:**

**CSV Export:**
```csv
ticker,name,quantity,avg_cost,current_price,total_value,gain_loss,$,gain_loss_%
AAPL,Apple Inc.,10,153.33,178.50,1785.00,251.70,16.41%
```

**PDF Report:**
- Portfolio summary
- Investment table
- Pie chart
- Performance metrics
- Generated date

**Implementation:**
- CSV: Native JavaScript
- PDF: jsPDF or Puppeteer
- Server Action for generation

**Timeline:** Week 3

---

### 5. Mobile App / PWA
**Priority:** High Value, Variable Complexity

**Approach 1: Progressive Web App (PWA) - RECOMMENDED**
- Same Next.js codebase
- Add PWA manifest and service worker
- Installable on mobile devices
- Offline support for cached data
- Push notifications for price alerts

**Implementation:**
```json
// public/manifest.json
{
  "name": "Track Your Stack",
  "short_name": "TYS",
  "description": "Investment Portfolio Tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Timeline:** Week 7-8 (PWA)

**Approach 2: React Native (Future)**
- Separate mobile app
- Shared API with web app
- Native features: camera, notifications
- More development effort

**Timeline:** Post-MVP (3-4 months)

---

## Implementation Roadmap

### Week 1: Project Setup & Authentication
**Days 1-2: Project Initialization**
- [ ] Create Next.js 15 project with TypeScript
- [ ] Install dependencies (Prisma, NextAuth, Tailwind, shadcn/ui)
- [ ] Setup ESLint, Prettier, Husky
- [ ] Initialize Git repository
- [ ] Setup Vercel project

**Days 3-4: Database & Authentication**
- [ ] Design and create Prisma schema
- [ ] Setup PostgreSQL (Vercel Postgres)
- [ ] Run migrations
- [ ] Configure NextAuth.js with Google OAuth
- [ ] Create auth pages (sign-in, sign-out)
- [ ] Test authentication flow

**Days 5-7: Base UI Components**
- [ ] Setup shadcn/ui components
- [ ] Create layout components (header, nav, footer)
- [ ] Create loading states and error boundaries
- [ ] Setup protected route middleware
- [ ] Create dashboard skeleton

**Deliverable:** Working authentication + empty dashboard

---

### Week 2: Core Portfolio Features
**Days 1-3: Portfolio CRUD**
- [ ] Create portfolio creation form
- [ ] Implement portfolio list view
- [ ] Add edit portfolio functionality
- [ ] Add delete portfolio with confirmation
- [ ] Create portfolio detail page

**Days 4-7: Alpha Vantage Integration**
- [ ] Create Alpha Vantage API client
- [ ] Implement ticker search with autocomplete
- [ ] Test stock quote endpoint
- [ ] Test crypto quote endpoint
- [ ] Implement currency exchange rates
- [ ] Setup price caching logic

**Deliverable:** Portfolio management + API integration

---

### Week 3: Investment Management
**Days 1-3: Add Investment**
- [ ] Create add investment form
- [ ] Implement ticker search autocomplete
- [ ] Add form validation with Zod
- [ ] Create Server Action for investment creation
- [ ] Test aggregation logic

**Days 4-5: Investment List & Actions**
- [ ] Create investment table component
- [ ] Add edit investment modal
- [ ] Implement delete functionality
- [ ] Add price refresh button
- [ ] Setup auto-refresh (15-min interval)

**Days 6-7: Calculations & Display**
- [ ] Implement average cost basis calculation
- [ ] Implement gains/loss calculation
- [ ] Add multi-currency conversion
- [ ] Display metrics in table
- [ ] Add color coding (green/red)

**Deliverable:** Full investment CRUD + calculations

---

### Week 4: Visualization & Phase 2 Start
**Days 1-3: Portfolio Summary**
- [ ] Implement portfolio summary calculations
- [ ] Create summary cards (total value, gain/loss)
- [ ] Build pie chart with Recharts
- [ ] Add best/worst performer indicators
- [ ] Test with multiple currencies

**Days 4-7: Phase 2 - Export Reports**
- [ ] Create CSV export functionality
- [ ] Implement PDF report generation
- [ ] Add download buttons
- [ ] Test with sample data
- [ ] Add email report option (optional)

**Deliverable:** MVP complete + Export feature

---

### Week 5: Phase 2 - Historical & Comparison
**Days 1-4: Historical Performance**
- [ ] Create portfolio snapshot cron job
- [ ] Implement daily snapshot logic
- [ ] Create history API endpoint
- [ ] Build line chart component
- [ ] Add date range selector
- [ ] Test historical data display

**Days 5-7: Portfolio Comparison**
- [ ] Create comparison page layout
- [ ] Implement comparison calculations
- [ ] Add comparison UI (side-by-side)
- [ ] Add export comparison option
- [ ] Test with multiple portfolios

**Deliverable:** Historical charts + Comparison

---

### Week 6: Phase 2 - Import & Testing
**Days 1-3: CSV Import**
- [ ] Create CSV upload UI
- [ ] Implement CSV parser with Papa Parse
- [ ] Add validation logic
- [ ] Create preview table
- [ ] Implement bulk import Server Action
- [ ] Test with sample CSV files

**Days 4-7: Testing & Bug Fixes**
- [ ] Write unit tests for calculations
- [ ] Write integration tests for API
- [ ] Write E2E tests with Playwright
- [ ] Fix bugs from testing
- [ ] Performance optimization
- [ ] Security audit

**Deliverable:** Import feature + Test coverage

---

### Week 7: Phase 2 - PWA & Polish
**Days 1-3: Progressive Web App**
- [ ] Create PWA manifest.json
- [ ] Setup service worker
- [ ] Add offline support
- [ ] Test installability
- [ ] Add push notification setup

**Days 4-7: Polish & Documentation**
- [ ] UI/UX improvements
- [ ] Accessibility audit (a11y)
- [ ] Performance optimization
- [ ] Write user documentation
- [ ] Create video demo
- [ ] Prepare for launch

**Deliverable:** Production-ready app with PWA

---

### Week 8: Deployment & Launch
**Days 1-2: Production Deployment**
- [ ] Configure production environment variables
- [ ] Setup production database
- [ ] Deploy to Vercel
- [ ] Setup custom domain (optional)
- [ ] Configure monitoring (Sentry)

**Days 3-4: Testing & Monitoring**
- [ ] Production smoke tests
- [ ] Load testing
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Setup alerts

**Days 5-7: Launch & Iteration**
- [ ] Soft launch to beta users
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Public launch
- [ ] Marketing and outreach

**Deliverable:** Live production app

---

## Security Considerations

### Authentication Security
- [x] Secure session management with NextAuth.js
- [x] HTTP-only cookies for session tokens
- [x] CSRF protection enabled
- [x] OAuth state parameter validation
- [x] Session expiration (30 days)

### API Security
- [x] API key stored in environment variables (never client-side)
- [x] Rate limiting on API routes (5 req/min per user)
- [x] Input validation on all Server Actions
- [x] SQL injection prevention via Prisma ORM
- [x] XSS prevention via React auto-escaping

### Data Security
- [x] Database connection over SSL
- [x] User data isolation (userId foreign key constraints)
- [x] No sensitive data in client state
- [x] Encryption at rest (PostgreSQL default)
- [x] Regular backups (Vercel Postgres auto-backup)

### Authorization
- [x] Verify user ownership before any portfolio/investment operation
- [x] Protected API routes (check session)
- [x] Protected pages (middleware redirect)
- [x] No direct database ID exposure (use UUIDs)

### Example Authorization Check:
```typescript
// Server Action example
async function deleteInvestment(investmentId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { portfolio: true },
  });

  if (investment?.portfolio.userId !== session.user.id) {
    throw new Error('Forbidden');
  }

  await prisma.investment.delete({
    where: { id: investmentId },
  });
}
```

---

## Performance Optimization

### Frontend Performance
- **Code Splitting:** Lazy load chart components
- **Image Optimization:** Next.js Image component
- **Font Optimization:** Next.js font optimization
- **Caching:** React Query for data caching
- **Prefetching:** Next.js Link prefetching

### Backend Performance
- **Database Indexing:** Add indexes on foreign keys, frequently queried fields
- **Query Optimization:** Use Prisma select/include efficiently
- **Caching:** Cache prices and exchange rates
- **Batch Updates:** Update multiple prices in single transaction
- **Background Jobs:** Price updates via cron, not on-demand

### API Rate Limiting
- **Request Queue:** Prevent exceeding 5 req/min Alpha Vantage limit
- **Exponential Backoff:** Retry failed requests with backoff
- **Graceful Degradation:** Show cached data when API unavailable

### Monitoring
- **Error Tracking:** Sentry for error monitoring
- **Performance Monitoring:** Vercel Analytics
- **Database Monitoring:** Prisma query logging
- **API Monitoring:** Track Alpha Vantage usage

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Alpha Vantage API
ALPHA_VANTAGE_API_KEY="your_alpha_vantage_api_key"

# Optional: Monitoring
SENTRY_DSN="your_sentry_dsn"
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your_analytics_id"
```

---

## File Structure

```
track-your-stack/
├── app/
│   ├── (auth)/
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── portfolios/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── edit/
│   │   │   │   └── history/
│   │   │   ├── new/
│   │   │   └── compare/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── cron/
│   │   │   └── snapshot/
│   │   │       └── route.ts
│   │   └── prices/
│   │       └── refresh/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── portfolio/
│   │   ├── PortfolioCard.tsx
│   │   ├── PortfolioPieChart.tsx
│   │   ├── PortfolioSummary.tsx
│   │   └── CreatePortfolioForm.tsx
│   ├── investment/
│   │   ├── InvestmentTable.tsx
│   │   ├── AddInvestmentForm.tsx
│   │   ├── EditInvestmentModal.tsx
│   │   └── TickerSearch.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Footer.tsx
├── lib/
│   ├── api/
│   │   ├── alphaVantage.ts
│   │   └── rateLimit.ts
│   ├── calculations/
│   │   ├── portfolio.ts
│   │   ├── investment.ts
│   │   └── currency.ts
│   ├── actions/ (Server Actions)
│   │   ├── portfolio.ts
│   │   ├── investment.ts
│   │   └── import.ts
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
├── types/
│   ├── portfolio.ts
│   ├── investment.ts
│   └── api.ts
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## Success Metrics

### MVP (Phase 1)
- [ ] User can create account with Google OAuth
- [ ] User can create and manage multiple portfolios
- [ ] User can add investments with ticker search
- [ ] App fetches real-time prices from Alpha Vantage
- [ ] App displays accurate gains/loss calculations
- [ ] Pie chart shows portfolio allocation
- [ ] Multi-currency support works correctly

### Phase 2
- [ ] Historical performance charts display correctly
- [ ] Portfolio comparison feature works
- [ ] CSV import successfully imports bulk data
- [ ] Export reports generate valid CSV/PDF
- [ ] PWA installable on mobile devices

### Performance
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Database query time < 100ms
- [ ] Price updates complete < 5 seconds

### Quality
- [ ] Zero security vulnerabilities
- [ ] 80%+ test coverage
- [ ] 90+ Lighthouse score
- [ ] WCAG 2.1 AA accessibility compliance

---

## Next Steps

1. **Review this specification** - Ensure all requirements are captured
2. **Setup development environment** - Install tools, create accounts
3. **Create project repository** - Initialize Git, setup GitHub
4. **Follow Week 1 roadmap** - Start with project setup
5. **Iterate based on feedback** - Adjust as you build

**Questions or clarifications?** Ready to start implementation! 🚀
