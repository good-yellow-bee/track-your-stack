# F07: Investment Management (List, Edit, Delete)

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 4-5 hours
**Dependencies:** F06 (Investment Entry)

---

## 📋 Overview

Display investments in a table view with edit/delete capabilities. Show current prices, gains/losses, and provide manual price refresh functionality.

**What this enables:**
- View all investments in portfolio
- Edit investment details
- Delete investments with confirmation
- Manual price refresh button
- Sortable/filterable table
- Responsive design

---

## 🎯 Acceptance Criteria

- [ ] Investment table displays all portfolio investments
- [ ] Shows ticker, name, quantity, cost basis, current price
- [ ] Edit modal or page working
- [ ] Delete confirmation dialog
- [ ] Price refresh button functional
- [ ] Table sortable by columns
- [ ] Responsive on mobile
- [ ] Loading states for async operations

---

## 🔧 Key Implementation Steps

### Investment Server Actions
```typescript
// lib/actions/investment.ts (add to existing)

export async function updateInvestment(id: string, data: UpdateInvestmentInput) {
  const user = await requireAuth()

  // Verify ownership through portfolio
  const investment = await prisma.investment.findUnique({
    where: { id },
    include: { portfolio: true },
  })

  if (!investment || investment.portfolio.userId !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Recalculate average cost if quantity/price changed
  // Update investment record
  // Return updated investment
}

export async function deleteInvestment(id: string) {
  const user = await requireAuth()

  // Verify ownership
  // Delete investment (cascade deletes transactions)

  revalidatePath(`/portfolios/${portfolioId}`)
  return { success: true }
}

export async function refreshInvestmentPrice(id: string) {
  // Fetch fresh price from Alpha Vantage
  // Update investment.currentPrice and priceUpdatedAt
  // Return updated price
}
```

### Investment Table Component
```typescript
// components/investment/InvestmentTable.tsx

export default function InvestmentTable({ investments, portfolioId }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Avg Cost</TableHead>
          <TableHead>Current Price</TableHead>
          <TableHead>Market Value</TableHead>
          <TableHead>Gain/Loss</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investments.map(inv => (
          <InvestmentRow key={inv.id} investment={inv} />
        ))}
      </TableBody>
    </Table>
  )
}
```

### Edit/Delete Components
- EditInvestmentModal with form
- DeleteInvestmentButton with confirmation
- RefreshPriceButton with loading state

---

## 🧪 Testing Requirements

- [ ] Table displays all investments
- [ ] Edit modal opens and saves changes
- [ ] Delete removes investment
- [ ] Refresh updates price
- [ ] Sorting works
- [ ] Mobile responsive

---

## 📦 Deliverables

- [x] Investment CRUD Server Actions
- [x] Investment table component
- [x] Edit modal/page
- [x] Delete confirmation
- [x] Price refresh functionality

---

## 🔗 Related Files

- `lib/actions/investment.ts` (extended)
- `components/investment/InvestmentTable.tsx`
- `components/investment/EditInvestmentModal.tsx`
- `components/investment/DeleteInvestmentButton.tsx`
- `components/investment/RefreshPriceButton.tsx`

---

## ⏭️ Next Feature

→ [F08: Calculation Engine](F08_calculation_engine.md)
