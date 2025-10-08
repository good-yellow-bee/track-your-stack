# Track Your Stack - Implementation Plan

**Status:** Ready to Start
**Last Updated:** 2025-10-08
**Reference:** See `investment-tracker-specification.md` for full technical details

---

## Quick Start Commands

### 1. Initialize Next.js Project
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --use-pnpm
```

### 2. Install Core Dependencies
```bash
pnpm add @prisma/client @auth/prisma-adapter next-auth@beta
pnpm add -D prisma
pnpm add zod react-hook-form @hookform/resolvers
pnpm add @tanstack/react-query axios
pnpm add recharts lucide-react
```

### 3. Install shadcn/ui
```bash
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button input label card dialog form select table
```

---

## Implementation Checklist

### Week 1: Foundation (Days 1-7)

#### ✅ Day 1-2: Project Setup
- [ ] Run `npx create-next-app@latest` with TypeScript + Tailwind
- [ ] Install dependencies (Prisma, NextAuth, shadcn/ui)
- [ ] Setup ESLint and Prettier configuration
- [ ] Create `.env.local` file with environment variables
- [ ] Initialize Git repository: `git init && git add . && git commit -m "Initial commit"`

**Environment Variables Template:**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/track_your_stack"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with: openssl rand -base64 32"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"

# Alpha Vantage API (get from alphavantage.co)
ALPHA_VANTAGE_API_KEY="your_api_key"
```

#### ✅ Day 3-4: Database Setup
- [ ] Create Prisma schema at `prisma/schema.prisma`
- [ ] Copy schema from specification document
- [ ] Setup PostgreSQL database (local or Vercel Postgres)
- [ ] Run: `pnpm prisma generate`
- [ ] Run: `pnpm prisma db push`
- [ ] Create `lib/prisma.ts` for Prisma client singleton
- [ ] Test database connection

**Prisma Client Setup:**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### ✅ Day 5-7: Authentication
- [ ] Create `app/api/auth/[...nextauth]/route.ts`
- [ ] Configure Google OAuth in Google Cloud Console
- [ ] Setup NextAuth.js with Google provider
- [ ] Create `lib/auth.ts` with auth utilities
- [ ] Create sign-in page: `app/auth/signin/page.tsx`
- [ ] Create middleware for protected routes: `middleware.ts`
- [ ] Test authentication flow end-to-end

**NextAuth Config:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
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
})

export { handler as GET, handler as POST }
```

---

### Week 2: Core Features (Days 8-14)

#### ✅ Day 8-10: Alpha Vantage Integration
- [ ] Create `lib/api/alphaVantage.ts` client class
- [ ] Implement `getStockQuote()` method
- [ ] Implement `getCryptoPrice()` method
- [ ] Implement `getExchangeRate()` method
- [ ] Implement `searchSymbol()` method
- [ ] Add error handling and retry logic
- [ ] Test all API endpoints

**Alpha Vantage Client:**
```typescript
// lib/api/alphaVantage.ts
import axios from 'axios';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY!;
const BASE_URL = 'https://www.alphavantage.co/query';

export class AlphaVantageClient {
  async getStockQuote(ticker: string) {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: ticker,
        apikey: API_KEY,
      },
    });
    return response.data['Global Quote'];
  }

  // Add other methods...
}

export const alphaVantage = new AlphaVantageClient();
```

#### ✅ Day 11-14: Portfolio Management
- [ ] Create dashboard page: `app/(dashboard)/dashboard/page.tsx`
- [ ] Create portfolio list component: `components/portfolio/PortfolioCard.tsx`
- [ ] Create "New Portfolio" form: `components/portfolio/CreatePortfolioForm.tsx`
- [ ] Create Server Actions: `lib/actions/portfolio.ts`
- [ ] Implement CRUD operations (Create, Read, Update, Delete)
- [ ] Add portfolio currency selector
- [ ] Test all portfolio operations

**Server Actions Example:**
```typescript
// lib/actions/portfolio.ts
'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function createPortfolio(name: string, baseCurrency: string) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const portfolio = await prisma.portfolio.create({
    data: {
      name,
      baseCurrency,
      userId: session.user.id,
    },
  })

  revalidatePath('/dashboard')
  return portfolio
}
```

---

### Week 3: Investment Features (Days 15-21)

#### ✅ Day 15-17: Investment Entry
- [ ] Create portfolio detail page: `app/(dashboard)/portfolios/[id]/page.tsx`
- [ ] Create "Add Investment" form: `components/investment/AddInvestmentForm.tsx`
- [ ] Implement ticker search with autocomplete
- [ ] Create Server Actions: `lib/actions/investment.ts`
- [ ] Implement aggregation logic for multiple purchases
- [ ] Add form validation with Zod
- [ ] Test investment creation with various scenarios

**Add Investment Form:**
```typescript
// components/investment/AddInvestmentForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const investmentSchema = z.object({
  ticker: z.string().min(1),
  quantity: z.number().positive(),
  pricePerUnit: z.number().positive(),
  purchaseDate: z.date(),
  currency: z.string(),
})

export function AddInvestmentForm({ portfolioId }: { portfolioId: string }) {
  const form = useForm({
    resolver: zodResolver(investmentSchema),
  })

  // Implementation...
}
```

#### ✅ Day 18-19: Investment Management
- [ ] Create investment table: `components/investment/InvestmentTable.tsx`
- [ ] Add edit investment modal: `components/investment/EditInvestmentModal.tsx`
- [ ] Implement delete functionality with confirmation
- [ ] Add price refresh button
- [ ] Setup auto-refresh (React Query with 15-min refetch)
- [ ] Test edit and delete operations

#### ✅ Day 20-21: Calculations & Display
- [ ] Implement calculation utilities: `lib/calculations/investment.ts`
- [ ] Create average cost basis calculator
- [ ] Create gains/loss calculator
- [ ] Implement multi-currency conversion: `lib/calculations/currency.ts`
- [ ] Add color coding (green for gains, red for losses)
- [ ] Test calculations with sample data

**Calculation Utilities:**
```typescript
// lib/calculations/investment.ts

export function calculateAverageCostBasis(
  existingQty: number,
  existingAvg: number,
  newQty: number,
  newPrice: number
): number {
  const totalCost = (existingQty * existingAvg) + (newQty * newPrice)
  const totalQty = existingQty + newQty
  return totalCost / totalQty
}

export function calculateGainsLoss(
  currentPrice: number,
  avgCost: number,
  quantity: number
) {
  const currentValue = currentPrice * quantity
  const totalCost = avgCost * quantity
  const gainLossDollar = currentValue - totalCost
  const gainLossPercent = (gainLossDollar / totalCost) * 100

  return {
    currentValue,
    totalCost,
    gainLossDollar,
    gainLossPercent,
  }
}
```

---

### Week 4: Visualization & Polish (Days 22-28)

#### ✅ Day 22-24: Portfolio Summary
- [ ] Create summary cards: `components/portfolio/PortfolioSummary.tsx`
- [ ] Display total value, cost, gains/loss
- [ ] Add best/worst performer indicators
- [ ] Implement portfolio calculation logic: `lib/calculations/portfolio.ts`
- [ ] Test with multiple currencies
- [ ] Add loading states and error handling

#### ✅ Day 25-27: Pie Chart Visualization
- [ ] Install and setup Recharts
- [ ] Create pie chart component: `components/portfolio/PortfolioPieChart.tsx`
- [ ] Show percentage allocation by investment
- [ ] Add color coding and legends
- [ ] Make chart interactive (click to highlight)
- [ ] Test with various portfolio sizes

**Pie Chart Component:**
```typescript
// components/portfolio/PortfolioPieChart.tsx
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export function PortfolioPieChart({ investments }: { investments: any[] }) {
  const data = investments.map(inv => ({
    name: inv.ticker,
    value: inv.currentValue,
    percentage: inv.percentOfPortfolio,
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

#### ✅ Day 28: MVP Testing & Bug Fixes
- [ ] End-to-end testing of all features
- [ ] Fix any bugs discovered
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Deploy to Vercel for testing

---

## Phase 2 Implementation (Weeks 5-8)

### Week 5: Historical & Comparison
- [ ] Day 29-32: Historical performance charts
- [ ] Day 33-35: Portfolio comparison feature

### Week 6: Import/Export
- [ ] Day 36-38: CSV import functionality
- [ ] Day 39-42: Export reports (CSV/PDF)

### Week 7: PWA & Polish
- [ ] Day 43-45: Progressive Web App setup
- [ ] Day 46-49: UI/UX improvements and polish

### Week 8: Launch
- [ ] Day 50-51: Production deployment
- [ ] Day 52-53: Testing and monitoring
- [ ] Day 54-56: Soft launch and iteration

---

## Key Files to Create

### Configuration Files
- [ ] `prisma/schema.prisma` - Database schema
- [ ] `.env.local` - Environment variables
- [ ] `middleware.ts` - Auth protection
- [ ] `next.config.js` - Next.js configuration
- [ ] `.eslintrc.json` - ESLint rules
- [ ] `.prettierrc` - Code formatting

### Library Files
- [ ] `lib/prisma.ts` - Prisma client
- [ ] `lib/auth.ts` - Auth utilities
- [ ] `lib/api/alphaVantage.ts` - API client
- [ ] `lib/actions/portfolio.ts` - Portfolio Server Actions
- [ ] `lib/actions/investment.ts` - Investment Server Actions
- [ ] `lib/calculations/investment.ts` - Investment calculations
- [ ] `lib/calculations/currency.ts` - Currency conversion
- [ ] `lib/calculations/portfolio.ts` - Portfolio calculations

### Component Files
- [ ] `components/ui/*` - shadcn/ui components
- [ ] `components/layout/Header.tsx`
- [ ] `components/layout/Navigation.tsx`
- [ ] `components/portfolio/PortfolioCard.tsx`
- [ ] `components/portfolio/CreatePortfolioForm.tsx`
- [ ] `components/portfolio/PortfolioSummary.tsx`
- [ ] `components/portfolio/PortfolioPieChart.tsx`
- [ ] `components/investment/InvestmentTable.tsx`
- [ ] `components/investment/AddInvestmentForm.tsx`
- [ ] `components/investment/EditInvestmentModal.tsx`
- [ ] `components/investment/TickerSearch.tsx`

### Page Files
- [ ] `app/page.tsx` - Landing page
- [ ] `app/layout.tsx` - Root layout
- [ ] `app/auth/signin/page.tsx` - Sign-in page
- [ ] `app/(dashboard)/dashboard/page.tsx` - Dashboard
- [ ] `app/(dashboard)/portfolios/[id]/page.tsx` - Portfolio detail
- [ ] `app/(dashboard)/portfolios/new/page.tsx` - Create portfolio

---

## Critical Prerequisites

### Before Starting Development

1. **Google Cloud Console Setup:**
   - Create new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Download client ID and secret

2. **Alpha Vantage API Key:**
   - Register at https://www.alphavantage.co/support/#api-key
   - Get free API key (500 calls/day)
   - Save in `.env.local`

3. **Database Setup:**
   - Install PostgreSQL locally OR
   - Create Vercel Postgres database OR
   - Use Supabase free tier
   - Get connection string

4. **Development Tools:**
   - Node.js 20+ installed
   - pnpm installed: `npm install -g pnpm`
   - Git installed
   - Code editor (VS Code recommended)

---

## Testing Checklist

### Manual Testing
- [ ] User can sign in with Google
- [ ] User can create portfolio with custom name
- [ ] User can add investment with ticker search
- [ ] Ticker search returns correct results
- [ ] Investment prices update from API
- [ ] Average cost basis calculates correctly
- [ ] Multi-currency conversion works
- [ ] Pie chart displays correctly
- [ ] Gains/loss calculations are accurate
- [ ] User can edit investments
- [ ] User can delete investments
- [ ] User can delete portfolios

### Edge Cases
- [ ] Adding same ticker multiple times (aggregation)
- [ ] Zero quantity after edit
- [ ] Invalid ticker symbol
- [ ] API rate limit handling
- [ ] Offline/no network handling
- [ ] Missing price data
- [ ] Different currencies in same portfolio

---

## Deployment Checklist

### Vercel Deployment
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Add environment variables in Vercel dashboard
- [ ] Setup production database (Vercel Postgres)
- [ ] Configure custom domain (optional)
- [ ] Enable Vercel Analytics
- [ ] Test production deployment
- [ ] Setup monitoring (Sentry)

---

## Resources & Links

### Documentation
- Next.js 15: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth.js: https://next-auth.js.org/
- shadcn/ui: https://ui.shadcn.com/
- Alpha Vantage: https://www.alphavantage.co/documentation/
- Recharts: https://recharts.org/

### Tools
- Google Cloud Console: https://console.cloud.google.com/
- Alpha Vantage API: https://www.alphavantage.co/
- Vercel: https://vercel.com/
- Supabase: https://supabase.com/

---

## Notes

- **Estimated Time:** 4 weeks for MVP, 8 weeks for full Phase 2
- **Complexity:** Medium - requires API integration, auth, and calculations
- **Tech Debt:** Keep minimal, prioritize clean code from start
- **Performance:** Focus on caching and efficient queries
- **Security:** Auth on all routes, validate all inputs, never expose API keys

**Next Session:** Start with Day 1 - Project initialization

Ready to build! 🚀
