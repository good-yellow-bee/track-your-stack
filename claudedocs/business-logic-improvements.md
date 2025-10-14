# Business Logic Improvements - Critical Gaps & Enhancements

**Report Date**: 2025-10-12
**Project**: Track Your Stack - Investment Portfolio Tracker
**Scope**: Financial Calculations, Tax Reporting, Corporate Actions
**Analysis**: Claude Code Financial Review

---

## 🎯 Executive Summary

This report identifies **11 critical gaps** in the business logic and financial calculations of Track Your Stack. While the current MVP handles basic portfolio tracking, it lacks essential features that professional investors and tax-compliant users require.

**Overall Assessment**: ⚠️ **INCOMPLETE FOR TAX COMPLIANCE**

### Critical Findings:

- **Tax Reporting**: Completely missing (CRITICAL for US users)
- **Dividend Tracking**: Not implemented (major income source)
- **Corporate Actions**: No support for splits, mergers
- **Transaction Costs**: Fees not tracked (affects cost basis)
- **Currency Conversion**: Timing issues with gains/loss calculation

### User Impact:

- **Cannot use for tax filing** without FIFO/LIFO tracking
- **Inaccurate returns** without dividend tracking (30-40% of total return)
- **Data corruption** if stock splits occur (manual quantity adjustment required)

---

## ⚠️ Tax Disclaimer Requirements

**CRITICAL LEGAL REQUIREMENT**: All tax reporting features MUST include prominent disclaimers to limit liability.

### Standard Tax Disclaimer Template

This disclaimer MUST appear on:

- Tax report pages
- 1099-B export pages
- Capital gains summary pages
- Any page displaying tax-related calculations

---

#### **Primary Disclaimer (Required on All Tax Pages)**

```typescript
// components/tax/TaxDisclaimer.tsx
export function TaxDisclaimer({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Alert variant="warning" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Not Tax Advice</AlertTitle>
        <AlertDescription>
          This report is for informational purposes only.{' '}
          <Link href="/tax-disclaimer" className="underline">
            See full disclaimer
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-yellow-500 bg-yellow-50 my-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900">
          <AlertTriangle className="h-5 w-5" />
          Important Tax Disclaimer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-yellow-900">
        <p className="font-semibold">
          ⚠️ This application provides investment tracking and tax reporting features for
          <strong> informational purposes ONLY</strong>. It is <strong>NOT</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Tax advice</strong> - We are not CPAs, enrolled agents, or tax professionals
          </li>
          <li>
            <strong>Investment advice</strong> - We do not provide financial planning or investment recommendations
          </li>
          <li>
            <strong>Guaranteed accuracy</strong> - Tax calculations may contain errors or be incomplete
          </li>
          <li>
            <strong>IRS-compliant filing</strong> - Always verify with official tax forms and qualified professionals
          </li>
        </ul>

        <div className="border-t border-yellow-300 pt-4">
          <p className="font-semibold mb-2">
            🚨 Critical Warnings:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Verify all cost basis calculations</strong> with your broker's 1099-B
            </li>
            <li>
              <strong>Consult a qualified CPA or tax advisor</strong> before filing taxes
            </li>
            <li>
              <strong>We are not responsible</strong> for errors, omissions, or tax penalties
            </li>
            <li>
              <strong>Tax laws change</strong> - Our calculations may not reflect current IRS rules
            </li>
          </ul>
        </div>

        <div className="border-t border-yellow-300 pt-4">
          <p className="font-semibold mb-2">
            ✅ How to Use This Responsibly:
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Compare our calculations with your broker's 1099-B statements</li>
            <li>Reconcile any discrepancies before filing</li>
            <li>Use as a <em>starting point</em> for tax preparation, not the final word</li>
            <li>Share with your CPA for professional review and validation</li>
            <li>Keep records of all transactions for IRS audit defense</li>
          </ol>
        </div>

        <p className="text-xs pt-4 border-t border-yellow-300">
          By using Track Your Stack's tax features, you agree to our{' '}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{' '}
          and acknowledge that you have read and understood this disclaimer.
        </p>
      </CardContent>
    </Card>
  )
}
```

---

#### **Compact Inline Warning (Use for Specific Fields)**

```typescript
// Use for individual tax calculations
<div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
  <AlertTriangle className="h-4 w-4" />
  <span>Tax calculation - verify with CPA before filing</span>
</div>
```

---

### Legal Text Requirements

#### **Terms of Service - Tax Section**

Add to `/app/(legal)/terms/page.tsx`:

```markdown
## Tax Reporting Disclaimer

Track Your Stack provides tax lot tracking and capital gains calculations as a convenience feature
for users. However:

### Limitation of Liability

- **No Guarantee of Accuracy**: We make no representations or warranties regarding the accuracy,
  completeness, or reliability of tax calculations.

- **User Responsibility**: You are solely responsible for the accuracy of your tax filings. You must
  independently verify all calculations and data before submission to tax authorities.

- **No Tax Advice**: Nothing in this application constitutes tax advice. We are not engaged in
  providing professional tax, legal, or accounting services.

- **No Liability for Errors**: Track Your Stack, its owners, employees, and contractors shall not be
  liable for any errors, omissions, or inaccuracies in tax calculations, or for any losses, damages,
  or penalties resulting from reliance on our calculations.

### Professional Consultation Required

Users MUST consult with qualified tax professionals (CPAs, enrolled agents, tax attorneys) before:

- Filing tax returns based on our calculations
- Making investment decisions with tax implications
- Claiming deductions or credits
- Responding to IRS inquiries or audits

### Known Limitations

Our tax reporting features have known limitations:

- FIFO method only in MVP (LIFO and Specific ID coming later)
- No wash sale rule detection initially
- No state tax calculations (federal only)
- No AMT (Alternative Minimum Tax) calculations
- No cryptocurrency staking/mining tax treatment
- No options/derivatives tax treatment

### Indemnification

You agree to indemnify and hold harmless Track Your Stack from any claims, losses, or damages
arising from your use of tax reporting features, including but not limited to:

- IRS audits or tax penalties
- Incorrect tax filings
- Lost tax benefits or overpayment
- Legal fees related to tax disputes

### Changes to Tax Calculations

We reserve the right to modify, improve, or discontinue tax calculation features at any time without
notice. Historical calculations may be updated to reflect IRS guidance changes, but we are not
obligated to notify users of such changes.
```

---

#### **Privacy Policy - Tax Data Section**

```markdown
## Tax Data Handling

### Data We Collect

- Purchase dates, quantities, and prices
- Sale transactions and capital gains
- Tax lot allocations and cost basis methods
- User-selected tax filing preferences

### How We Use Tax Data

- To calculate capital gains and losses
- To generate tax reports and exports
- To improve our tax calculation algorithms
- To comply with legal obligations (if subpoenaed)

### Data Security

Tax data is encrypted at rest and in transit. However, we cannot guarantee absolute security.
Users are responsible for backing up tax-critical data.

### Data Retention

Tax data is retained for 7 years (standard IRS audit period) unless users request deletion.

### Sharing with Tax Professionals

Users may export tax data to share with CPAs. We do not directly share with third parties without consent.
```

---

### Required User Consent Flow

#### **Initial Setup Prompt**

When user accesses tax features for the first time:

```typescript
// components/tax/TaxConsentDialog.tsx
<Dialog open={!hasAcceptedTaxDisclaimer}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Tax Reporting Acknowledgment Required</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <TaxDisclaimer variant="full" />

      <div className="bg-gray-50 p-4 rounded space-y-2">
        <p className="font-semibold">Before proceeding, you must acknowledge:</p>
        <label className="flex items-start gap-3">
          <Checkbox checked={ack1} onCheckedChange={setAck1} />
          <span className="text-sm">
            I understand this is NOT tax advice and calculations may be incorrect
          </span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox checked={ack2} onCheckedChange={setAck2} />
          <span className="text-sm">
            I will verify all data with my broker's 1099-B before filing taxes
          </span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox checked={ack3} onCheckedChange={setAck3} />
          <span className="text-sm">
            I will consult a qualified CPA or tax professional for my tax filing
          </span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox checked={ack4} onCheckedChange={setAck4} />
          <span className="text-sm">
            I agree Track Your Stack is not liable for errors or tax penalties
          </span>
        </label>
      </div>
    </div>

    <DialogFooter>
      <Button
        onClick={acceptTaxDisclaimer}
        disabled={!ack1 || !ack2 || !ack3 || !ack4}
      >
        I Acknowledge and Accept
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Annual Reminder System

```typescript
// lib/actions/tax-disclaimer.ts
export async function checkTaxDisclaimerExpiry(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { taxDisclaimerAcceptedAt: true },
  })

  if (!user?.taxDisclaimerAcceptedAt) return false

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // Require re-acceptance every tax season (annually)
  return user.taxDisclaimerAcceptedAt > oneYearAgo
}
```

---

### CPA Validation Recommendation

Include in tax report exports:

```markdown
## Recommended CPA Review Checklist

Before filing your taxes, have your CPA verify:

- [ ] All transaction dates and prices match broker statements
- [ ] Cost basis calculations follow your selected method (FIFO/LIFO/Specific ID)
- [ ] Wash sale rules have been correctly applied
- [ ] Short-term vs long-term classification is accurate
- [ ] All corporate actions (splits, mergers) are properly adjusted
- [ ] Currency conversions use appropriate exchange rates
- [ ] Form 1099-B reconciliation is complete
- [ ] Any discrepancies are documented and explained

**Questions for Your CPA:**

1. Does my tax lot method (FIFO/LIFO) optimize my tax situation?
2. Should I consider tax loss harvesting opportunities?
3. Are there any wash sale violations I should address?
4. Do I need to file Schedule D, Form 8949, or both?
5. Are there state-specific tax implications I should know about?

**Documents to Bring to Your CPA:**

- This capital gains report
- All broker 1099-B statements
- Record of all purchases and sales
- Receipts for transaction fees and commissions
- Corporate action notices (splits, mergers, etc.)
```

---

### MVP Implementation Priority

For **Option B (MVP Path)**, implement minimum viable disclaimers:

**Phase 0B (Tax Reporting MVP)**:

- [ ] Primary disclaimer component (1 day)
  - Create `TaxDisclaimer.tsx` component
  - Add to all tax report pages

- [ ] User consent flow (1 day)
  - Add `taxDisclaimerAcceptedAt` field to User model
  - Implement consent dialog on first tax feature access
  - Store acceptance timestamp

- [ ] Terms of Service update (0.5 days)
  - Add tax disclaimer section to legal pages
  - Link from tax disclaimer component

**Total: 2.5 days** (included in Phase 0B budget)

---

### Future Enhancements (Post-MVP)

**Phase 2 (Full Tax Reporting)**:

- Annual re-acceptance reminder
- CPA export format with built-in disclaimer
- Email notification before tax season with disclaimer reminder
- Comparison tool: "Our calculations vs Your 1099-B"

---

### Error & Omissions Insurance

**Recommendation**: After beta launch, consider E&O insurance:

- **Coverage**: $1-2 million professional liability
- **Cost**: ~$2,000-5,000/year for startups
- **Protects**: Legal fees if sued for tax calculation errors
- **Required**: If targeting >10,000 users or enterprise customers

---

## 🔴 CRITICAL: Tax Reporting Infrastructure Missing

### Problem Statement

**Current State**: The application has NO tax reporting capabilities:

- ❌ No FIFO (First In, First Out) tracking
- ❌ No LIFO (Last In, First Out) tracking
- ❌ No Specific ID method support
- ❌ No short-term vs long-term capital gains distinction
- ❌ No tax lot tracking
- ❌ No 1099-B export format
- ❌ No wash sale rule detection

**Impact**: Users cannot:

1. File accurate tax returns
2. Optimize tax strategy (tax loss harvesting)
3. Prove cost basis to IRS
4. Export data for tax software (TurboTax, etc.)

### Current Schema Limitations

```prisma
// Current: Only aggregated data
model Investment {
  totalQuantity        Decimal  // Sum of all purchases
  averageCostBasis     Decimal  // Weighted average
  // ❌ Cannot reconstruct individual tax lots
}

model PurchaseTransaction {
  quantity     Decimal
  pricePerUnit Decimal
  purchaseDate DateTime
  // ✅ Individual lots exist, but not used for tax calculations
}
```

**Problem**:

- Aggregation destroys tax lot identity
- Cannot determine which shares were sold (FIFO vs LIFO vs Specific ID)
- No concept of "holding period" (short-term < 1 year, long-term ≥ 1 year)

### Recommended Solution

#### Phase 1: Add Tax Lot Tracking

```prisma
// prisma/schema.prisma

enum TaxLotStatus {
  OPEN      // Still held
  CLOSED    // Sold
  PARTIAL   // Partially sold
}

enum CostBasisMethod {
  FIFO      // First In, First Out
  LIFO      // Last In, Last Out
  SPECIFIC  // Specific Identification
  AVERAGE   // Average Cost (for mutual funds)
}

model TaxLot {
  id                String        @id @default(cuid())
  investmentId      String
  investment        Investment    @relation(fields: [investmentId], references: [id], onDelete: Cascade)

  // Purchase details
  quantity          Decimal       @db.Decimal(20, 8)
  remainingQuantity Decimal       @db.Decimal(20, 8)  // After partial sales
  costBasisPerUnit  Decimal       @db.Decimal(20, 8)
  purchaseDate      Date
  purchaseCurrency  String

  // Transaction costs
  commissionPaid    Decimal       @db.Decimal(20, 2)  @default(0)
  otherFees         Decimal       @db.Decimal(20, 2)  @default(0)
  totalCostBasis    Decimal       @db.Decimal(20, 2)  // quantity * price + fees

  // Tax tracking
  status            TaxLotStatus  @default(OPEN)
  acquisitionDate   Date          // For holding period
  closedDate        Date?         // When fully sold

  // Wash sale tracking
  isWashSale        Boolean       @default(false)
  washSaleAmount    Decimal?      @db.Decimal(20, 2)

  // Relationships
  sales             SaleTransaction[]

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([investmentId, status])
  @@index([investmentId, purchaseDate])
}

model SaleTransaction {
  id                String        @id @default(cuid())
  investmentId      String
  investment        Investment    @relation(fields: [investmentId], references: [id])

  // Sale details
  quantity          Decimal       @db.Decimal(20, 8)
  pricePerUnit      Decimal       @db.Decimal(20, 8)
  saleDate          Date
  saleCurrency      String

  // Transaction costs
  commissionPaid    Decimal       @db.Decimal(20, 2)  @default(0)
  otherFees         Decimal       @db.Decimal(20, 2)  @default(0)
  netProceeds       Decimal       @db.Decimal(20, 2)  // quantity * price - fees

  // Tax lots sold (for FIFO/LIFO/Specific ID)
  taxLotsUsed       TaxLotAllocation[]

  // Tax calculations
  costBasis         Decimal       @db.Decimal(20, 2)
  gainLoss          Decimal       @db.Decimal(20, 2)
  holdingPeriod     Int           // Days held
  isShortTerm       Boolean       // < 365 days
  isLongTerm        Boolean       // >= 365 days

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([investmentId, saleDate])
}

model TaxLotAllocation {
  id                String          @id @default(cuid())
  saleTransactionId String
  sale              SaleTransaction @relation(fields: [saleTransactionId], references: [id])
  taxLotId          String
  taxLot            TaxLot          @relation(fields: [taxLotId], references: [id])

  quantitySold      Decimal         @db.Decimal(20, 8)
  costBasis         Decimal         @db.Decimal(20, 2)
  gainLoss          Decimal         @db.Decimal(20, 2)

  createdAt         DateTime        @default(now())

  @@unique([saleTransactionId, taxLotId])
}

// User preference for cost basis method
model Portfolio {
  // ... existing fields
  costBasisMethod   CostBasisMethod @default(FIFO)
}
```

#### Phase 2: Tax Calculation Engine

```typescript
// lib/tax/calculator.ts

export interface TaxLotWithCost {
  taxLotId: string
  purchaseDate: Date
  quantity: Decimal
  remainingQuantity: Decimal
  costBasisPerUnit: Decimal
  totalCostBasis: Decimal
}

export interface SaleTaxImpact {
  quantitySold: Decimal
  totalCostBasis: Decimal
  netProceeds: Decimal
  capitalGain: Decimal
  shortTermGain: Decimal
  longTermGain: Decimal
  taxLotsUsed: Array<{
    taxLotId: string
    quantitySold: Decimal
    costBasis: Decimal
    gainLoss: Decimal
    isShortTerm: boolean
  }>
}

/**
 * Calculate tax impact of selling investment shares
 * Applies FIFO, LIFO, or Specific ID method
 */
export async function calculateSaleTaxImpact(
  investmentId: string,
  quantityToSell: Decimal,
  salePrice: Decimal,
  saleDate: Date,
  method: CostBasisMethod = 'FIFO'
): Promise<SaleTaxImpact> {
  // Get available tax lots
  const availableLots = await prisma.taxLot.findMany({
    where: {
      investmentId,
      status: { in: ['OPEN', 'PARTIAL'] },
      remainingQuantity: { gt: 0 },
    },
    orderBy:
      method === 'FIFO'
        ? { purchaseDate: 'asc' } // Sell oldest first
        : { purchaseDate: 'desc' }, // Sell newest first (LIFO)
  })

  if (availableLots.length === 0) {
    throw new Error('No tax lots available to sell')
  }

  let remainingToSell = quantityToSell
  const taxLotsUsed: SaleTaxImpact['taxLotsUsed'] = []
  let totalCostBasis = new Decimal(0)
  let shortTermGain = new Decimal(0)
  let longTermGain = new Decimal(0)

  for (const lot of availableLots) {
    if (remainingToSell.lte(0)) break

    // How much to sell from this lot
    const quantityFromLot = Decimal.min(lot.remainingQuantity, remainingToSell)

    // Calculate cost basis for this portion
    const costBasisFromLot = lot.costBasisPerUnit.mul(quantityFromLot)
    const proceedsFromLot = salePrice.mul(quantityFromLot)
    const gainLossFromLot = proceedsFromLot.sub(costBasisFromLot)

    // Determine holding period
    const holdingPeriodDays = Math.floor(
      (saleDate.getTime() - lot.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const isShortTerm = holdingPeriodDays < 365
    const isLongTerm = holdingPeriodDays >= 365

    // Accumulate tax impact
    totalCostBasis = totalCostBasis.add(costBasisFromLot)
    if (isShortTerm) {
      shortTermGain = shortTermGain.add(gainLossFromLot)
    } else {
      longTermGain = longTermGain.add(gainLossFromLot)
    }

    taxLotsUsed.push({
      taxLotId: lot.id,
      quantitySold: quantityFromLot,
      costBasis: costBasisFromLot,
      gainLoss: gainLossFromLot,
      isShortTerm,
    })

    remainingToSell = remainingToSell.sub(quantityFromLot)
  }

  if (remainingToSell.gt(0)) {
    throw new Error(`Insufficient shares: ${remainingToSell} remaining`)
  }

  const netProceeds = salePrice.mul(quantityToSell)
  const capitalGain = netProceeds.sub(totalCostBasis)

  return {
    quantitySold: quantityToSell,
    totalCostBasis,
    netProceeds,
    capitalGain,
    shortTermGain,
    longTermGain,
    taxLotsUsed,
  }
}

/**
 * Check for wash sale violations
 * IRS Rule: Cannot claim loss if repurchase within 30 days
 */
export async function checkWashSale(
  investmentId: string,
  saleDate: Date,
  quantitySold: Decimal
): Promise<boolean> {
  const thirtyDaysBefore = new Date(saleDate)
  thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30)

  const thirtyDaysAfter = new Date(saleDate)
  thirtyDaysAfter.setDate(thirtyDaysAfter.getDate() + 30)

  // Check for purchases within wash sale window
  const purchases = await prisma.taxLot.findMany({
    where: {
      investmentId,
      purchaseDate: {
        gte: thirtyDaysBefore,
        lte: thirtyDaysAfter,
      },
    },
  })

  return purchases.some((p) => p.quantity.gte(quantitySold))
}
```

#### Phase 3: Tax Report Export (1099-B Format)

```typescript
// lib/tax/export.ts

export interface TaxReport {
  taxYear: number
  userId: string
  shortTermTransactions: TaxTransaction[]
  longTermTransactions: TaxTransaction[]
  totalShortTermGain: Decimal
  totalLongTermGain: Decimal
  washSaleAdjustments: Decimal
}

export interface TaxTransaction {
  description: string // "100 shares of AAPL"
  dateAcquired: Date
  dateSold: Date
  proceeds: Decimal
  costBasis: Decimal
  gainLoss: Decimal
  isWashSale: boolean
}

/**
 * Generate Form 1099-B equivalent report
 */
export async function generateTaxReport(userId: string, taxYear: number): Promise<TaxReport> {
  const startDate = new Date(`${taxYear}-01-01`)
  const endDate = new Date(`${taxYear}-12-31`)

  // Get all sales for the tax year
  const sales = await prisma.saleTransaction.findMany({
    where: {
      investment: {
        portfolio: { userId },
      },
      saleDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      investment: true,
      taxLotsUsed: {
        include: {
          taxLot: true,
        },
      },
    },
  })

  const shortTermTransactions: TaxTransaction[] = []
  const longTermTransactions: TaxTransaction[] = []
  let totalShortTermGain = new Decimal(0)
  let totalLongTermGain = new Decimal(0)
  let washSaleAdjustments = new Decimal(0)

  for (const sale of sales) {
    for (const allocation of sale.taxLotsUsed) {
      const transaction: TaxTransaction = {
        description: `${allocation.quantitySold} shares of ${sale.investment.ticker}`,
        dateAcquired: allocation.taxLot.purchaseDate,
        dateSold: sale.saleDate,
        proceeds: sale.pricePerUnit.mul(allocation.quantitySold),
        costBasis: allocation.costBasis,
        gainLoss: allocation.gainLoss,
        isWashSale: allocation.taxLot.isWashSale,
      }

      if (sale.isShortTerm) {
        shortTermTransactions.push(transaction)
        totalShortTermGain = totalShortTermGain.add(allocation.gainLoss)
      } else {
        longTermTransactions.push(transaction)
        totalLongTermGain = totalLongTermGain.add(allocation.gainLoss)
      }

      if (allocation.taxLot.isWashSale) {
        washSaleAdjustments = washSaleAdjustments.add(allocation.taxLot.washSaleAmount || 0)
      }
    }
  }

  return {
    taxYear,
    userId,
    shortTermTransactions,
    longTermTransactions,
    totalShortTermGain,
    totalLongTermGain,
    washSaleAdjustments,
  }
}

/**
 * Export to CSV for TurboTax import
 */
export function exportToTurboTaxCSV(report: TaxReport): string {
  const rows = [
    [
      'Description',
      'Date Acquired',
      'Date Sold',
      'Proceeds',
      'Cost Basis',
      'Gain/Loss',
      'Type',
      'Wash Sale',
    ],
  ]

  // Short-term transactions
  for (const tx of report.shortTermTransactions) {
    rows.push([
      tx.description,
      tx.dateAcquired.toISOString().split('T')[0],
      tx.dateSold.toISOString().split('T')[0],
      tx.proceeds.toString(),
      tx.costBasis.toString(),
      tx.gainLoss.toString(),
      'Short-Term',
      tx.isWashSale ? 'Yes' : 'No',
    ])
  }

  // Long-term transactions
  for (const tx of report.longTermTransactions) {
    rows.push([
      tx.description,
      tx.dateAcquired.toISOString().split('T')[0],
      tx.dateSold.toISOString().split('T')[0],
      tx.proceeds.toString(),
      tx.costBasis.toString(),
      tx.gainLoss.toString(),
      'Long-Term',
      tx.isWashSale ? 'Yes' : 'No',
    ])
  }

  return rows.map((row) => row.join(',')).join('\n')
}
```

### Implementation Timeline

**Phase 1a - Database Schema** (Week 2, 3 days):

- Add TaxLot, SaleTransaction, TaxLotAllocation models
- Migration script to convert existing PurchaseTransactions to TaxLots
- Add costBasisMethod to Portfolio

**Phase 1b - Tax Calculations** (Week 3, 4 days):

- Implement FIFO/LIFO logic
- Calculate holding periods
- Wash sale detection

**Phase 1c - UI for Sales** (Week 4, 3 days):

- "Sell Investment" flow
- Show tax impact before confirming sale
- Tax lot selection (for Specific ID method)

**Phase 2 - Tax Reports** (Week 5-6, 5 days):

- Generate 1099-B equivalent report
- CSV export for TurboTax/H&R Block
- Annual tax summary dashboard

**Total Effort**: 15 days (3 weeks)
**Priority**: 🔴 CRITICAL - Required for US users
**Dependencies**: None (foundational feature)

---

## 🔴 CRITICAL: Dividend Tracking Missing

### Problem Statement

**Current State**: Dividends are completely ignored:

- ❌ No dividend payment tracking
- ❌ No dividend yield calculation
- ❌ No total return including dividends
- ❌ No dividend reinvestment (DRIP) support

**Impact**:

- **30-40% of total stock returns** come from dividends (S&P 500 historical)
- Portfolio performance metrics are wildly inaccurate
- Users cannot evaluate dividend-focused strategies
- Cannot track passive income

### Real-World Example

```
User buys 100 shares of AAPL at $150 = $15,000 cost basis
AAPL pays quarterly dividend: $0.96/quarter = $3.84/year
Over 5 years: $3.84 * 5 = $19.20 per share in dividends
Total dividends received: 100 * $19.20 = $1,920

Current app shows:
  Cost: $15,000
  Current value: $17,500
  Gain: $2,500 (16.7%)

Actual including dividends:
  Cost: $15,000
  Current value: $17,500
  Dividends: $1,920
  Total return: $4,420 (29.5%) ← 13% HIGHER!
```

### Recommended Solution

```prisma
// prisma/schema.prisma

enum DividendType {
  CASH          // Regular cash dividend
  STOCK         // Stock dividend (additional shares)
  SPECIAL       // Special one-time dividend
  CAPITAL_GAIN  // Capital gains distribution (mutual funds)
  RETURN_OF_CAPITAL  // ROC (reduces cost basis)
}

model Dividend {
  id              String        @id @default(cuid())
  investmentId    String
  investment      Investment    @relation(fields: [investmentId], references: [id], onDelete: Cascade)

  // Dividend details
  type            DividendType
  paymentDate     Date
  exDividendDate  Date          // Date to own shares by
  recordDate      Date          // Date shares are counted
  amountPerShare  Decimal       @db.Decimal(20, 4)
  currency        String

  // Shares owned on record date
  sharesOwned     Decimal       @db.Decimal(20, 8)
  totalAmount     Decimal       @db.Decimal(20, 2)

  // Tax information
  qualifiedDividend Boolean     @default(false)  // Qualified for lower tax rate
  taxWithheld     Decimal?      @db.Decimal(20, 2)  // Foreign tax withholding

  // Reinvestment
  wasReinvested   Boolean       @default(false)
  reinvestedShares Decimal?     @db.Decimal(20, 8)
  reinvestPrice   Decimal?      @db.Decimal(20, 4)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([investmentId, paymentDate])
}

// Track dividend history for yield calculations
model DividendPaymentHistory {
  id          String   @id @default(cuid())
  ticker      String
  paymentDate Date
  amountPerShare Decimal @db.Decimal(20, 4)
  frequency   String   // "quarterly", "monthly", "annual"

  createdAt   DateTime @default(now())

  @@unique([ticker, paymentDate])
  @@index([ticker, paymentDate])
}
```

### Dividend Calculations

```typescript
// lib/calculations/dividends.ts

export interface DividendMetrics {
  totalDividendsReceived: Decimal
  annualDividendIncome: Decimal
  dividendYield: number // Percentage
  yieldOnCost: number // Yield based on original purchase price
}

/**
 * Calculate dividend metrics for an investment
 */
export async function calculateDividendMetrics(investmentId: string): Promise<DividendMetrics> {
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { dividends: true },
  })

  if (!investment) throw new Error('Investment not found')

  // Total dividends received (all time)
  const totalDividendsReceived = investment.dividends.reduce(
    (sum, div) => sum.add(div.totalAmount),
    new Decimal(0)
  )

  // Annual dividend income (last 12 months)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const recentDividends = investment.dividends.filter((div) => div.paymentDate >= oneYearAgo)

  const annualDividendIncome = recentDividends.reduce(
    (sum, div) => sum.add(div.totalAmount),
    new Decimal(0)
  )

  // Current dividend yield (annual income / current value)
  const currentValue = (investment.currentPrice || new Decimal(0)).mul(investment.totalQuantity)

  const dividendYield = currentValue.gt(0)
    ? annualDividendIncome.div(currentValue).mul(100).toNumber()
    : 0

  // Yield on cost (annual income / original cost basis)
  const originalCost = investment.averageCostBasis.mul(investment.totalQuantity)
  const yieldOnCost = originalCost.gt(0)
    ? annualDividendIncome.div(originalCost).mul(100).toNumber()
    : 0

  return {
    totalDividendsReceived,
    annualDividendIncome,
    dividendYield,
    yieldOnCost,
  }
}

/**
 * Calculate total return including dividends
 */
export async function calculateTotalReturn(investment: Investment): Promise<{
  priceReturn: Decimal
  dividendReturn: Decimal
  totalReturn: Decimal
  totalReturnPercent: number
}> {
  const metrics = calculateInvestmentMetrics(investment)
  const dividendMetrics = await calculateDividendMetrics(investment.id)

  const priceReturn = metrics.gainLossDollar
  const dividendReturn = dividendMetrics.totalDividendsReceived
  const totalReturn = priceReturn.add(dividendReturn)

  const totalReturnPercent = metrics.totalCost.gt(0)
    ? totalReturn.div(metrics.totalCost).mul(100).toNumber()
    : 0

  return {
    priceReturn,
    dividendReturn,
    totalReturn,
    totalReturnPercent,
  }
}
```

### Manual Dividend Entry UI

```typescript
// components/investment/AddDividendForm.tsx
'use client'

export function AddDividendForm({ investmentId }: { investmentId: string }) {
  const form = useForm<DividendFormData>({
    resolver: zodResolver(dividendSchema),
  })

  return (
    <Form {...form}>
      <FormField
        name="paymentDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Date</FormLabel>
            <DatePicker {...field} />
          </FormItem>
        )}
      />

      <FormField
        name="amountPerShare"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dividend Per Share</FormLabel>
            <Input type="number" step="0.01" {...field} />
          </FormItem>
        )}
      />

      <FormField
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <Select {...field}>
              <SelectItem value="CASH">Cash Dividend</SelectItem>
              <SelectItem value="STOCK">Stock Dividend</SelectItem>
              <SelectItem value="SPECIAL">Special Dividend</SelectItem>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        name="wasReinvested"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <Checkbox {...field} />
            <FormLabel>Dividend was reinvested (DRIP)</FormLabel>
          </FormItem>
        )}
      />

      <Button type="submit">Add Dividend</Button>
    </Form>
  )
}
```

### Implementation Timeline

**Phase 1 - Schema & Data Entry** (Week 3, 2 days):

- Add Dividend model
- Manual dividend entry form
- Display dividend history

**Phase 2 - Calculations** (Week 3-4, 2 days):

- Dividend metrics calculation
- Total return including dividends
- Dividend yield dashboard

**Phase 3 - Automatic Dividend Fetching** (Phase 2, 3 days):

- Alpha Vantage has dividend history API
- Fetch historical dividends
- Auto-populate for new investments

**Total Effort**: 7 days
**Priority**: 🔴 CRITICAL - Affects portfolio accuracy
**Dependencies**: None

---

## 🔴 CRITICAL: Corporate Actions Not Handled

### Problem Statement

**Current State**: No support for corporate actions:

- ❌ Stock splits (2:1, 3:1, etc.)
- ❌ Reverse splits (1:10)
- ❌ Ticker symbol changes (FB → META)
- ❌ Mergers & acquisitions
- ❌ Spin-offs
- ❌ Rights offerings

**Impact**:

- Data corruption after stock split (quantity incorrect)
- Manual adjustment required (error-prone)
- Cost basis calculations wrong
- Historical data meaningless

### Real-World Examples

**Stock Split Example**:

```
User owns 100 shares of AAPL at $600/share
June 2014: AAPL does 7:1 stock split

Before split:
  Quantity: 100 shares
  Price: $600/share
  Value: $60,000

After split (what should happen):
  Quantity: 700 shares (100 * 7)
  Price: $85.71/share ($600 / 7)
  Value: $60,000 (same)

Current app behavior:
  Quantity: 100 shares (WRONG)
  Price: $85.71/share (from API)
  Value: $8,571 (WRONG - shows 85% loss!)
```

**Ticker Change Example**:

```
User owns 50 shares of FB (Facebook)
October 2021: FB changes ticker to META

Current app behavior:
  - FB ticker no longer exists in API
  - Price updates fail
  - Shows as $0 value
  - User must manually create new META investment
  - Loses historical data
```

### Recommended Solution

```prisma
// prisma/schema.prisma

enum CorporateActionType {
  STOCK_SPLIT         // Forward split (2:1, 3:1)
  REVERSE_SPLIT       // Reverse split (1:10)
  TICKER_CHANGE       // Symbol change (FB → META)
  MERGER              // Company merger
  SPIN_OFF            // Spin-off new company
  ACQUISITION         // Acquired by another company
  DELISTING           // Removed from exchange
}

model CorporateAction {
  id                String               @id @default(cuid())
  ticker            String               // Original ticker
  type              CorporateActionType
  effectiveDate     Date
  announcementDate  Date?

  // Split details
  splitRatio        String?              // "2:1", "3:2", "1:10"
  splitMultiplier   Decimal?             @db.Decimal(10, 6)  // 2.0, 1.5, 0.1

  // Ticker change details
  newTicker         String?              // New symbol

  // Merger/acquisition details
  acquiringCompany  String?
  exchangeRatio     String?              // "1:0.5" (1 old share = 0.5 new shares)

  // Spin-off details
  spinOffTicker     String?
  spinOffRatio      String?              // "1:0.1" (1 old share = 0.1 spin-off shares)

  // User notification
  affectedUsers     Int                  @default(0)
  notificationSent  Boolean              @default(false)

  // Processing status
  processed         Boolean              @default(false)
  processedAt       DateTime?

  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  @@index([ticker, effectiveDate])
  @@index([processed, effectiveDate])
}

model CorporateActionLog {
  id                String             @id @default(cuid())
  corporateActionId String
  corporateAction   CorporateAction    @relation(fields: [corporateActionId], references: [id])
  investmentId      String
  investment        Investment         @relation(fields: [investmentId], references: [id])

  // Before state
  quantityBefore    Decimal            @db.Decimal(20, 8)
  priceBefore       Decimal            @db.Decimal(20, 4)

  // After state
  quantityAfter     Decimal            @db.Decimal(20, 8)
  priceAfter        Decimal            @db.Decimal(20, 4)

  // Adjustment details
  adjustmentReason  String
  processedAt       DateTime           @default(now())

  @@index([investmentId, processedAt])
}
```

### Corporate Action Handler

```typescript
// lib/corporate-actions/handler.ts

export async function processCorporateAction(actionId: string): Promise<void> {
  const action = await prisma.corporateAction.findUnique({
    where: { id: actionId },
  })

  if (!action || action.processed) return

  switch (action.type) {
    case 'STOCK_SPLIT':
      await processStockSplit(action)
      break
    case 'REVERSE_SPLIT':
      await processReverseSplit(action)
      break
    case 'TICKER_CHANGE':
      await processTickerChange(action)
      break
    case 'MERGER':
      await processMerger(action)
      break
    case 'SPIN_OFF':
      await processSpinOff(action)
      break
    case 'DELISTING':
      await processDelisting(action)
      break
  }

  // Mark as processed
  await prisma.corporateAction.update({
    where: { id: actionId },
    data: {
      processed: true,
      processedAt: new Date(),
    },
  })
}

/**
 * Handle stock split
 * Example: 2:1 split means multiply quantity by 2, divide price by 2
 */
async function processStockSplit(action: CorporateAction): Promise<void> {
  if (!action.splitMultiplier) throw new Error('Split multiplier required')

  // Find all investments with this ticker
  const investments = await prisma.investment.findMany({
    where: { ticker: action.ticker },
  })

  for (const investment of investments) {
    const quantityBefore = investment.totalQuantity
    const priceBefore = investment.currentPrice || new Decimal(0)

    // Adjust quantity and price
    const quantityAfter = quantityBefore.mul(action.splitMultiplier)
    const priceAfter = priceBefore.div(action.splitMultiplier)

    // Update investment
    await prisma.investment.update({
      where: { id: investment.id },
      data: {
        totalQuantity: quantityAfter,
        averageCostBasis: investment.averageCostBasis.div(action.splitMultiplier),
        currentPrice: priceAfter,
      },
    })

    // Adjust all tax lots
    await prisma.taxLot.updateMany({
      where: { investmentId: investment.id },
      data: {
        quantity: { multiply: action.splitMultiplier },
        remainingQuantity: { multiply: action.splitMultiplier },
        costBasisPerUnit: { divide: action.splitMultiplier },
      },
    })

    // Log action
    await prisma.corporateActionLog.create({
      data: {
        corporateActionId: action.id,
        investmentId: investment.id,
        quantityBefore,
        priceBefore,
        quantityAfter,
        priceAfter,
        adjustmentReason: `Stock split ${action.splitRatio}`,
      },
    })
  }
}

/**
 * Handle ticker symbol change
 * Example: FB → META
 */
async function processTickerChange(action: CorporateAction): Promise<void> {
  if (!action.newTicker) throw new Error('New ticker required')

  // Update all investments with old ticker
  await prisma.investment.updateMany({
    where: { ticker: action.ticker },
    data: {
      ticker: action.newTicker,
      assetName: `${action.newTicker} (formerly ${action.ticker})`,
    },
  })

  // Notify users
  const affectedUsers = await prisma.user.findMany({
    where: {
      portfolios: {
        some: {
          investments: {
            some: { ticker: action.newTicker },
          },
        },
      },
    },
  })

  for (const user of affectedUsers) {
    await sendNotification(user.id, {
      type: 'TICKER_CHANGE',
      message: `${action.ticker} has changed to ${action.newTicker}`,
    })
  }
}

/**
 * Handle delisting
 * Set manual price entry mode, notify users
 */
async function processDelisting(action: CorporateAction): Promise<void> {
  // Mark investments as delisted
  await prisma.investment.updateMany({
    where: { ticker: action.ticker },
    data: {
      assetName: `${action.ticker} (DELISTED)`,
      // Enable manual price entry mode
    },
  })

  // Notify users to enter final value manually
  const affectedUsers = await prisma.user.findMany({
    where: {
      portfolios: {
        some: {
          investments: {
            some: { ticker: action.ticker },
          },
        },
      },
    },
  })

  for (const user of affectedUsers) {
    await sendNotification(user.id, {
      type: 'DELISTING',
      message: `${action.ticker} has been delisted. Please enter final value manually.`,
    })
  }
}
```

### Corporate Action Data Source

**Option 1: Alpha Vantage** (Limited)

- Has some corporate action data
- Not comprehensive
- Manual entry required

**Option 2: Polygon.io** (Better)

- Comprehensive corporate action data
- Includes splits, dividends, mergers
- $99/month

**Option 3: Manual Entry + Community**

- Admin interface to enter corporate actions
- Community-reported actions
- Verification process

### Implementation Timeline

**Phase 1 - Schema & Infrastructure** (Week 5, 3 days):

- Add CorporateAction and CorporateActionLog models
- Stock split handler
- Ticker change handler

**Phase 2 - User Notifications** (Week 5-6, 2 days):

- Email notifications for affected users
- In-app notifications
- Corporate action history page

**Phase 3 - Data Source Integration** (Week 6-7, 3 days):

- Integrate with Polygon.io OR
- Build admin interface for manual entry
- Automated processing

**Total Effort**: 8 days
**Priority**: 🔴 CRITICAL - Prevents data corruption
**Dependencies**: None

---

## 🟡 HIGH: Transaction Fees/Commissions Not Tracked

### Problem Statement

**Current State**: Brokerage fees and commissions are ignored

- ❌ No commission tracking on purchases
- ❌ No commission tracking on sales
- ❌ Cost basis calculations are inaccurate
- ❌ Actual returns are overstated

### Impact on Cost Basis

```
User buys 100 shares of AAPL at $150 = $15,000
Brokerage commission: $6.95

Current app calculation:
  Cost basis: $150.00/share
  Total cost: $15,000

Correct calculation:
  Cost basis: $150.07/share ($15,006.95 / 100)
  Total cost: $15,006.95

Impact: 0.05% error (seems small)
But for high-frequency trades: significant!
```

### Recommended Solution

Already included in Tax Lot schema above:

```prisma
model TaxLot {
  // ... existing fields
  commissionPaid    Decimal       @db.Decimal(20, 2)  @default(0)
  otherFees         Decimal       @db.Decimal(20, 2)  @default(0)
  totalCostBasis    Decimal       @db.Decimal(20, 2)  // quantity * price + fees
}

model SaleTransaction {
  // ... existing fields
  commissionPaid    Decimal       @db.Decimal(20, 2)  @default(0)
  otherFees         Decimal       @db.Decimal(20, 2)  @default(0)
  netProceeds       Decimal       @db.Decimal(20, 2)  // quantity * price - fees
}
```

### UI Enhancement

```typescript
// Add commission field to investment entry form
<FormField
  name="commission"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Commission/Fees (Optional)</FormLabel>
      <Input type="number" step="0.01" placeholder="0.00" {...field} />
      <FormDescription>
        Brokerage commission or transaction fees
      </FormDescription>
    </FormItem>
  )}
/>

// Calculate true cost basis including fees
const totalCost = (quantity * pricePerUnit) + commission
const costBasisPerUnit = totalCost / quantity
```

**Estimated Effort**: 1 day (piggybacks on tax lot implementation)
**Priority**: 🟡 HIGH - Affects accuracy

---

## 🟡 HIGH: Currency Conversion Timing Issues

### Problem Statement

**Current State**: Currency conversion timing is unclear

- When is conversion rate applied? Purchase date or current date?
- For gains/loss calculation, should use historical rates
- Current implementation might show incorrect gain/loss

### Example of Problem

```
User buys €1,000 of European stock on Jan 1, 2024
EUR/USD rate on Jan 1: 1.10 → $1,100 cost basis

User views portfolio on Dec 1, 2024
EUR/USD rate on Dec 1: 1.05
Stock value: €1,200

Current app (probably):
  Cost: €1,000 * 1.05 = $1,050 ← WRONG (uses current rate)
  Value: €1,200 * 1.05 = $1,260
  Gain: $210

Correct calculation:
  Cost: €1,000 * 1.10 = $1,100 (use historical rate)
  Value: €1,200 * 1.05 = $1,260
  Gain: $160
```

### Recommended Solution

```prisma
model TaxLot {
  // ... existing fields
  purchaseCurrency    String
  purchaseExchangeRate Decimal? @db.Decimal(10, 6)  // Historical rate
}

// Store exchange rate at purchase time
export async function createTaxLot(data: TaxLotInput) {
  const rate = await getCurrencyRate(
    data.purchaseCurrency,
    portfolio.baseCurrency,
    data.purchaseDate  // Use historical rate!
  )

  await prisma.taxLot.create({
    data: {
      ...data,
      purchaseExchangeRate: rate,
    },
  })
}

// For gains/loss: use historical rate for cost, current rate for value
export function calculateGainLossMultiCurrency(taxLot, currentPrice, portfolio) {
  const costBasisInBase = taxLot.totalCostBasis * taxLot.purchaseExchangeRate
  const currentValueInBase = currentPrice * taxLot.quantity * getCurrentRate()
  return currentValueInBase - costBasisInBase
}
```

**Estimated Effort**: 2 days
**Priority**: 🟡 HIGH - Affects accuracy for international users
**Dependencies**: Tax lot implementation

---

## 📊 Implementation Priority Matrix

| Feature             | User Impact | Effort  | Priority | Phase   |
| ------------------- | ----------- | ------- | -------- | ------- |
| Tax Lot Tracking    | 🔴 Critical | 15 days | P0       | Phase 1 |
| Dividend Tracking   | 🔴 Critical | 7 days  | P0       | Phase 1 |
| Corporate Actions   | 🔴 Critical | 8 days  | P1       | Phase 1 |
| Transaction Fees    | 🟡 High     | 1 day   | P2       | Phase 1 |
| Currency Timing Fix | 🟡 High     | 2 days  | P2       | Phase 1 |

**Total Additional Effort**: 33 days (6.5 weeks)

---

## 🎯 Recommended Implementation Sequence

### Week 3-4: Foundation

1. Implement tax lot schema
2. Migrate existing data to tax lots
3. Add dividend schema

### Week 5-6: Core Features

4. Implement FIFO/LIFO calculations
5. Add dividend entry and calculations
6. Corporate action infrastructure

### Week 7-8: Polish & Testing

7. Tax report generation
8. Corporate action processing
9. Integration testing
10. User documentation

---

## 📚 Related Documents

- [F06: Investment Entry](features/F06_investment_entry.md)
- [F08: Calculation Engine](features/F08_calculation_engine.md)
- [Investment Tracker Specification](investment-tracker-specification.md)

---

**Next Review**: After Phase 1 implementation
