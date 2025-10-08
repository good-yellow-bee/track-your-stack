# F13: CSV Import/Export

**Status:** ⬜ Not Started
**Priority:** 🟡 Important
**Estimated Time:** 2-3 days
**Dependencies:** F06 (Investment Entry)
**Phase:** Phase 2 - Advanced Features

---

## 📋 Overview

Implement bulk import/export functionality allowing users to upload CSV files with investment data and export portfolio reports in CSV and PDF formats with tax reporting options.

**What this enables:**
- Bulk import investments from CSV files
- Validate and preview data before import
- Export portfolio data to CSV format
- Generate PDF reports with summary and charts
- Tax reporting with FIFO/LIFO calculation
- Email report delivery option
- Import/export transaction history

---

## 🎯 Acceptance Criteria

- [ ] CSV upload component with drag-and-drop support
- [ ] CSV parser validates required columns
- [ ] Preview table shows data before import
- [ ] Validation errors displayed with row numbers
- [ ] Bulk import creates all investments in transaction
- [ ] Duplicate detection prevents redundant imports
- [ ] CSV export includes all portfolio data
- [ ] PDF report generates with summary and chart
- [ ] FIFO/LIFO tax calculation for exports
- [ ] Email delivery option for reports
- [ ] Import/export history tracking
- [ ] Error handling with detailed messages

---

## 🔧 Dependencies to Install

```bash
# CSV parsing library
pnpm add papaparse
pnpm add -D @types/papaparse

# PDF generation
pnpm add jspdf jspdf-autotable
pnpm add -D @types/jspdf

# Email sending (optional)
pnpm add nodemailer
pnpm add -D @types/nodemailer

# File handling
pnpm add react-dropzone
```

---

## 🏗️ Key Implementation Steps

### Step 1: Update Database Schema

Add import/export tracking to schema:

```prisma
model ImportHistory {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  fileName     String
  rowsTotal    Int
  rowsImported Int
  rowsFailed   Int
  status       ImportStatus @default(PENDING)
  errorLog     String?  @db.Text

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([portfolioId])
  @@map("import_history")
}

enum ImportStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// Add relations
model User {
  // ... existing fields
  importHistory ImportHistory[]
}

model Portfolio {
  // ... existing fields
  importHistory ImportHistory[]
}
```

Run migration:
```bash
pnpm prisma migrate dev --name add_import_export_tracking
```

### Step 2: Create CSV Template and Types

Create `lib/csv/template.ts`:

```typescript
export const CSV_TEMPLATE = {
  headers: [
    'ticker',
    'quantity',
    'purchase_price',
    'purchase_date',
    'currency',
    'notes',
  ],
  example: [
    ['AAPL', '10', '150.50', '2024-01-15', 'USD', 'Initial purchase'],
    ['GOOGL', '5', '2800.00', '2024-02-20', 'USD', ''],
    ['BTC', '0.5', '42000.00', '2024-03-10', 'USD', 'Crypto investment'],
  ],
}

export interface CSVInvestmentRow {
  ticker: string
  quantity: string
  purchase_price: string
  purchase_date: string
  currency?: string
  notes?: string
}

export interface ParsedInvestmentRow {
  ticker: string
  quantity: number
  purchasePrice: number
  purchaseDate: Date
  currency: string
  notes?: string
}

export interface ValidationError {
  row: number
  field: string
  message: string
  value: any
}
```

### Step 3: Create CSV Validation Service

Create `lib/csv/validator.ts`:

```typescript
import { CSVInvestmentRow, ParsedInvestmentRow, ValidationError } from './template'

const REQUIRED_FIELDS = ['ticker', 'quantity', 'purchase_price', 'purchase_date']
const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']

export function validateCSVRow(
  row: CSVInvestmentRow,
  rowIndex: number,
  defaultCurrency: string
): { valid: boolean; data?: ParsedInvestmentRow; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!row[field as keyof CSVInvestmentRow] || row[field as keyof CSVInvestmentRow].trim() === '') {
      errors.push({
        row: rowIndex,
        field,
        message: `${field} is required`,
        value: row[field as keyof CSVInvestmentRow],
      })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  // Validate ticker (alphanumeric, max 10 chars)
  const ticker = row.ticker.trim().toUpperCase()
  if (!/^[A-Z0-9]{1,10}$/.test(ticker)) {
    errors.push({
      row: rowIndex,
      field: 'ticker',
      message: 'Ticker must be 1-10 alphanumeric characters',
      value: row.ticker,
    })
  }

  // Validate quantity (positive number)
  const quantity = parseFloat(row.quantity)
  if (isNaN(quantity) || quantity <= 0) {
    errors.push({
      row: rowIndex,
      field: 'quantity',
      message: 'Quantity must be a positive number',
      value: row.quantity,
    })
  }

  // Validate purchase price (positive number)
  const purchasePrice = parseFloat(row.purchase_price)
  if (isNaN(purchasePrice) || purchasePrice <= 0) {
    errors.push({
      row: rowIndex,
      field: 'purchase_price',
      message: 'Purchase price must be a positive number',
      value: row.purchase_price,
    })
  }

  // Validate purchase date (valid date format)
  const purchaseDate = new Date(row.purchase_date)
  if (isNaN(purchaseDate.getTime())) {
    errors.push({
      row: rowIndex,
      field: 'purchase_date',
      message: 'Purchase date must be a valid date (YYYY-MM-DD)',
      value: row.purchase_date,
    })
  }

  // Check date not in future
  if (purchaseDate > new Date()) {
    errors.push({
      row: rowIndex,
      field: 'purchase_date',
      message: 'Purchase date cannot be in the future',
      value: row.purchase_date,
    })
  }

  // Validate currency (if provided)
  const currency = row.currency?.trim().toUpperCase() || defaultCurrency
  if (!VALID_CURRENCIES.includes(currency)) {
    errors.push({
      row: rowIndex,
      field: 'currency',
      message: `Currency must be one of: ${VALID_CURRENCIES.join(', ')}`,
      value: row.currency,
    })
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  // Return validated data
  return {
    valid: true,
    data: {
      ticker,
      quantity,
      purchasePrice,
      purchaseDate,
      currency,
      notes: row.notes?.trim() || undefined,
    },
    errors: [],
  }
}

export function validateCSVData(
  rows: CSVInvestmentRow[],
  defaultCurrency: string
): {
  valid: boolean
  validRows: ParsedInvestmentRow[]
  errors: ValidationError[]
} {
  const validRows: ParsedInvestmentRow[] = []
  const allErrors: ValidationError[] = []

  rows.forEach((row, index) => {
    const result = validateCSVRow(row, index + 2, defaultCurrency) // +2 for header row and 1-indexing

    if (result.valid && result.data) {
      validRows.push(result.data)
    } else {
      allErrors.push(...result.errors)
    }
  })

  return {
    valid: allErrors.length === 0,
    validRows,
    errors: allErrors,
  }
}
```

### Step 4: Create CSV Import Service

Create `lib/csv/import-service.ts`:

```typescript
import { db } from '@/lib/db'
import { ParsedInvestmentRow } from './template'
import { getTickerInfo, getCurrentPrice } from '@/lib/services/alpha-vantage-service'
import { Decimal } from '@prisma/client/runtime/library'

export async function importInvestments(
  portfolioId: string,
  userId: string,
  investments: ParsedInvestmentRow[],
  fileName: string
) {
  let importId: string | null = null

  try {
    // Create import history record
    const importHistory = await db.importHistory.create({
      data: {
        userId,
        portfolioId,
        fileName,
        rowsTotal: investments.length,
        rowsImported: 0,
        rowsFailed: 0,
        status: 'PROCESSING',
      },
    })

    importId = importHistory.id

    let imported = 0
    let failed = 0
    const errors: string[] = []

    // Process investments in transaction
    for (const [index, inv] of investments.entries()) {
      try {
        // Get ticker info from Alpha Vantage
        const tickerInfo = await getTickerInfo(inv.ticker)

        if (!tickerInfo) {
          errors.push(`Row ${index + 2}: Failed to fetch info for ${inv.ticker}`)
          failed++
          continue
        }

        // Get current price
        const currentPrice = await getCurrentPrice(inv.ticker, tickerInfo.assetType)

        // Create investment
        await db.investment.create({
          data: {
            portfolioId,
            ticker: inv.ticker,
            assetName: tickerInfo.name,
            assetType: tickerInfo.assetType,
            quantity: new Decimal(inv.quantity),
            purchasePrice: new Decimal(inv.purchasePrice),
            purchaseDate: inv.purchaseDate,
            currency: inv.currency,
            currentPrice: currentPrice ? new Decimal(currentPrice) : null,
            notes: inv.notes,
          },
        })

        imported++
      } catch (error) {
        console.error(`Failed to import row ${index + 2}:`, error)
        errors.push(
          `Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        failed++
      }
    }

    // Update import history
    await db.importHistory.update({
      where: { id: importId },
      data: {
        rowsImported: imported,
        rowsFailed: failed,
        status: failed > 0 ? 'COMPLETED' : 'COMPLETED',
        errorLog: errors.length > 0 ? errors.join('\n') : null,
      },
    })

    return {
      success: true,
      imported,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    console.error('CSV import failed:', error)

    if (importId) {
      await db.importHistory.update({
        where: { id: importId },
        data: {
          status: 'FAILED',
          errorLog: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    }

    throw error
  }
}

export async function getImportHistory(userId: string, portfolioId?: string) {
  return await db.importHistory.findMany({
    where: {
      userId,
      ...(portfolioId && { portfolioId }),
    },
    include: {
      portfolio: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })
}
```

### Step 5: Create CSV Export Service

Create `lib/csv/export-service.ts`:

```typescript
import { db } from '@/lib/db'
import { calculatePortfolioSummary } from '@/lib/services/calculation-service'

export type TaxMethod = 'FIFO' | 'LIFO' | 'AVERAGE'

export async function exportPortfolioToCSV(portfolioId: string, userId: string) {
  const portfolio = await db.portfolio.findUnique({
    where: {
      id: portfolioId,
      userId,
    },
    include: {
      investments: {
        where: { isSold: false },
        orderBy: { ticker: 'asc' },
      },
    },
  })

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  const summary = await calculatePortfolioSummary(portfolio)

  // CSV headers
  const headers = [
    'Ticker',
    'Name',
    'Type',
    'Quantity',
    'Avg Cost',
    'Current Price',
    'Total Value',
    'Gain/Loss $',
    'Gain/Loss %',
    'Currency',
    'Purchase Date',
    'Notes',
  ]

  // CSV rows
  const rows = summary.investments.map((inv) => [
    inv.investment.ticker,
    inv.investment.assetName,
    inv.investment.assetType,
    inv.investment.totalQuantity.toString(),
    inv.metrics.avgCostBasis.toFixed(2),
    inv.investment.currentPrice?.toFixed(2) || 'N/A',
    inv.metrics.currentValue.toFixed(2),
    inv.metrics.totalGainLoss.toFixed(2),
    inv.metrics.gainLossPercent.toFixed(2),
    inv.investment.currency,
    inv.investment.oldestPurchaseDate?.toISOString().split('T')[0] || '',
    inv.investment.notes || '',
  ])

  // Add summary row
  rows.push([])
  rows.push(['PORTFOLIO SUMMARY'])
  rows.push(['Total Value', summary.totalValue.toFixed(2)])
  rows.push(['Total Gain/Loss', summary.totalGainLoss.toFixed(2)])
  rows.push(['Gain/Loss %', summary.totalGainLossPercent.toFixed(2)])
  rows.push(['Base Currency', portfolio.baseCurrency])

  // Convert to CSV string
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')

  return {
    content: csvContent,
    fileName: `${portfolio.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
  }
}

export async function exportTaxReport(
  portfolioId: string,
  userId: string,
  taxYear: number,
  method: TaxMethod = 'FIFO'
) {
  const portfolio = await db.portfolio.findUnique({
    where: {
      id: portfolioId,
      userId,
    },
    include: {
      investments: {
        where: {
          purchaseDate: {
            gte: new Date(`${taxYear}-01-01`),
            lt: new Date(`${taxYear + 1}-01-01`),
          },
        },
        orderBy: { purchaseDate: method === 'FIFO' ? 'asc' : 'desc' },
      },
    },
  })

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  // Calculate summary
  const summary = await calculatePortfolioSummary(portfolio)

  // CSV headers for tax report
  const headers = [
    'Ticker',
    'Name',
    'Purchase Date',
    'Quantity',
    'Purchase Price',
    'Current Price',
    'Cost Basis',
    'Current Value',
    'Gain/Loss',
    'Holding Period',
    'Tax Status',
  ]

  const rows = summary.investments.map((inv) => {
    const holdingDays = inv.investment.oldestPurchaseDate
      ? Math.floor(
          (new Date().getTime() - inv.investment.oldestPurchaseDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

    const taxStatus = holdingDays > 365 ? 'Long-term' : 'Short-term'

    return [
      inv.investment.ticker,
      inv.investment.assetName,
      inv.investment.oldestPurchaseDate?.toISOString().split('T')[0] || '',
      inv.investment.totalQuantity.toString(),
      inv.metrics.avgCostBasis.toFixed(2),
      inv.investment.currentPrice?.toFixed(2) || 'N/A',
      (inv.metrics.avgCostBasis * inv.investment.totalQuantity.toNumber()).toFixed(2),
      inv.metrics.currentValue.toFixed(2),
      inv.metrics.totalGainLoss.toFixed(2),
      `${holdingDays} days`,
      taxStatus,
    ]
  })

  // Add summary
  rows.push([])
  rows.push(['TAX SUMMARY', `${taxYear}`])
  rows.push(['Method', method])
  rows.push(['Total Gain/Loss', summary.totalGainLoss.toFixed(2)])
  rows.push([
    'Short-term Gains',
    rows
      .filter((r) => r[10] === 'Short-term')
      .reduce((sum, r) => sum + parseFloat(r[8] as string), 0)
      .toFixed(2),
  ])
  rows.push([
    'Long-term Gains',
    rows
      .filter((r) => r[10] === 'Long-term')
      .reduce((sum, r) => sum + parseFloat(r[8] as string), 0)
      .toFixed(2),
  ])

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')

  return {
    content: csvContent,
    fileName: `Tax_Report_${portfolio.name.replace(/\s+/g, '_')}_${taxYear}_${method}.csv`,
  }
}
```

### Step 6: Create PDF Export Service

Create `lib/pdf/export-service.ts`:

```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { db } from '@/lib/db'
import { calculatePortfolioSummary } from '@/lib/services/calculation-service'

export async function exportPortfolioPDF(portfolioId: string, userId: string) {
  const portfolio = await db.portfolio.findUnique({
    where: {
      id: portfolioId,
      userId,
    },
    include: {
      investments: {
        where: { isSold: false },
        orderBy: { ticker: 'asc' },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  const summary = await calculatePortfolioSummary(portfolio)

  // Create PDF
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text('Portfolio Report', 14, 22)

  // Portfolio info
  doc.setFontSize(12)
  doc.text(`Portfolio: ${portfolio.name}`, 14, 32)
  doc.text(`Owner: ${portfolio.user.name || portfolio.user.email}`, 14, 38)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 44)
  doc.text(`Base Currency: ${portfolio.baseCurrency}`, 14, 50)

  // Summary boxes
  doc.setFontSize(10)
  doc.setDrawColor(200, 200, 200)
  doc.rect(14, 56, 90, 24)
  doc.rect(106, 56, 90, 24)

  doc.setFontSize(8)
  doc.text('Total Value', 16, 62)
  doc.setFontSize(14)
  doc.text(`${summary.totalValue.toFixed(2)} ${portfolio.baseCurrency}`, 16, 70)

  doc.setFontSize(8)
  doc.text('Total Gain/Loss', 108, 62)
  doc.setFontSize(14)
  const gainColor = summary.totalGainLoss >= 0 ? [0, 128, 0] : [255, 0, 0]
  doc.setTextColor(...gainColor)
  doc.text(
    `${summary.totalGainLoss >= 0 ? '+' : ''}${summary.totalGainLoss.toFixed(2)} (${summary.totalGainLossPercent.toFixed(2)}%)`,
    108,
    70
  )
  doc.setTextColor(0, 0, 0)

  // Investment table
  const tableData = summary.investments.map((inv) => [
    inv.investment.ticker,
    inv.investment.assetName,
    inv.investment.totalQuantity.toString(),
    inv.metrics.avgCostBasis.toFixed(2),
    inv.investment.currentPrice?.toFixed(2) || 'N/A',
    inv.metrics.currentValue.toFixed(2),
    `${inv.metrics.totalGainLoss >= 0 ? '+' : ''}${inv.metrics.totalGainLoss.toFixed(2)}`,
    `${inv.metrics.gainLossPercent >= 0 ? '+' : ''}${inv.metrics.gainLossPercent.toFixed(2)}%`,
  ])

  autoTable(doc, {
    startY: 86,
    head: [
      [
        'Ticker',
        'Name',
        'Qty',
        'Avg Cost',
        'Price',
        'Value',
        'Gain/Loss',
        '%',
      ],
    ],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 15 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 },
    },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  return {
    content: doc.output('arraybuffer'),
    fileName: `${portfolio.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
  }
}
```

### Step 7: Create Import API Route

Create `app/api/portfolios/[id]/import/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Papa from 'papaparse'
import { validateCSVData } from '@/lib/csv/validator'
import { importInvestments } from '@/lib/csv/import-service'
import { CSVInvestmentRow } from '@/lib/csv/template'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolioId = params.id

    // Verify portfolio ownership
    const portfolio = await db.portfolio.findUnique({
      where: {
        id: portfolioId,
        userId: session.user.id,
      },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()

    // Parse CSV
    const parseResult = Papa.parse<CSVInvestmentRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'CSV parsing failed',
          details: parseResult.errors,
        },
        { status: 400 }
      )
    }

    // Validate data
    const validation = validateCSVData(parseResult.data, portfolio.baseCurrency)

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    // Import investments
    const result = await importInvestments(
      portfolioId,
      session.user.id,
      validation.validRows,
      file.name
    )

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('Import failed:', error)
    return NextResponse.json(
      {
        error: 'Import failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

### Step 8: Create Export API Routes

Create `app/api/portfolios/[id]/export/csv/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exportPortfolioToCSV } from '@/lib/csv/export-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, fileName } = await exportPortfolioToCSV(params.id, session.user.id)

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('CSV export failed:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
```

Create `app/api/portfolios/[id]/export/pdf/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exportPortfolioPDF } from '@/lib/pdf/export-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, fileName } = await exportPortfolioPDF(params.id, session.user.id)

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('PDF export failed:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
```

### Step 9: Create Import UI Component

Create `components/portfolio/ImportCSV.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { CSVInvestmentRow } from '@/lib/csv/template'
import { validateCSVData } from '@/lib/csv/validator'

interface ImportCSVProps {
  portfolioId: string
  baseCurrency: string
  onSuccess?: () => void
}

export default function ImportCSV({ portfolioId, baseCurrency, onSuccess }: ImportCSVProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<CSVInvestmentRow[]>([])
  const [validationResult, setValidationResult] = useState<any>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return

      setFile(file)

      const text = await file.text()
      const parseResult = Papa.parse<CSVInvestmentRow>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
      })

      setPreviewData(parseResult.data)

      const validation = validateCSVData(parseResult.data, baseCurrency)
      setValidationResult(validation)
    },
  })

  async function handleImport() {
    if (!file) return

    setImporting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/portfolios/${portfolioId}/import`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data.result)
      onSuccess?.()
    } catch (error) {
      console.error('Import failed:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setImporting(false)
    }
  }

  function reset() {
    setFile(null)
    setPreviewData([])
    setValidationResult(null)
    setResult(null)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Investments from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with your investment data. Required columns: ticker, quantity,
              purchase_price, purchase_date
            </DialogDescription>
          </DialogHeader>

          {!file && (
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">
                {isDragActive ? 'Drop the CSV file here' : 'Drag and drop a CSV file, or click to select'}
              </p>
              <p className="mt-2 text-xs text-gray-500">CSV files only</p>
            </div>
          )}

          {file && !result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="font-medium">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Remove
                </Button>
              </div>

              {validationResult && (
                <>
                  {validationResult.valid ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        All {validationResult.validRows.length} rows validated successfully
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {validationResult.errors.length} validation errors found:
                        <ul className="mt-2 list-inside list-disc text-sm">
                          {validationResult.errors.slice(0, 5).map((err: any, i: number) => (
                            <li key={i}>
                              Row {err.row}, {err.field}: {err.message}
                            </li>
                          ))}
                          {validationResult.errors.length > 5 && (
                            <li>... and {validationResult.errors.length - 5} more</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="max-h-64 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left">Ticker</th>
                          <th className="p-2 text-left">Quantity</th>
                          <th className="p-2 text-left">Price</th>
                          <th className="p-2 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-2">{row.ticker}</td>
                            <td className="p-2">{row.quantity}</td>
                            <td className="p-2">{row.purchase_price}</td>
                            <td className="p-2">{row.purchase_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 10 && (
                      <p className="mt-2 text-center text-xs text-gray-500">
                        ... and {previewData.length - 10} more rows
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={reset}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={!validationResult.valid || importing}
                    >
                      {importing ? 'Importing...' : 'Import'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Import complete! {result.imported} investments imported successfully
                    {result.failed > 0 && `, ${result.failed} failed`}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    reset()
                    setOpen(false)
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### Step 10: Create Export UI Component

Create `components/portfolio/ExportMenu.tsx`:

```typescript
'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'

interface ExportMenuProps {
  portfolioId: string
}

export default function ExportMenu({ portfolioId }: ExportMenuProps) {
  async function handleExport(format: 'csv' | 'pdf') {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/export/${format}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('content-disposition')?.split('filename=')[1] || `export.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Step 11: Update Portfolio Page

Update `app/(dashboard)/portfolios/[id]/page.tsx`:

```typescript
import ImportCSV from '@/components/portfolio/ImportCSV'
import ExportMenu from '@/components/portfolio/ExportMenu'

export default async function PortfolioPage({ params }: { params: { id: string } }) {
  // ... existing code

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{portfolio.name}</h1>
        </div>
        <div className="flex gap-2">
          <ImportCSV
            portfolioId={portfolio.id}
            baseCurrency={portfolio.baseCurrency}
            onSuccess={() => window.location.reload()}
          />
          <ExportMenu portfolioId={portfolio.id} />
        </div>
      </div>

      {/* ... rest of page */}
    </div>
  )
}
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist

- [ ] CSV upload with drag-and-drop works
- [ ] CSV validation catches errors correctly
- [ ] Preview table displays data accurately
- [ ] Import creates investments in database
- [ ] Import history tracked correctly
- [ ] Duplicate detection prevents redundant imports
- [ ] CSV export downloads correctly
- [ ] PDF export generates with correct data
- [ ] Tax report calculates FIFO/LIFO correctly
- [ ] Error messages clear and helpful

### Test CSV Files

Create `test-data/sample-import.csv`:
```csv
ticker,quantity,purchase_price,purchase_date,currency,notes
AAPL,10,150.50,2024-01-15,USD,Initial purchase
GOOGL,5,2800.00,2024-02-20,USD,Tech investment
MSFT,20,350.00,2024-03-10,USD,Large cap
```

Create `test-data/sample-import-errors.csv`:
```csv
ticker,quantity,purchase_price,purchase_date,currency,notes
,10,150.50,2024-01-15,USD,Missing ticker
GOOGL,-5,2800.00,2024-02-20,USD,Negative quantity
MSFT,20,invalid,2024-03-10,USD,Invalid price
TSLA,15,250.00,2025-12-31,USD,Future date
```

---

## 📚 Documentation Updates

### Update README.md

Add Import/Export section:
```markdown
## Import/Export

- Bulk import from CSV files
- CSV export with full portfolio data
- PDF report generation
- Tax reporting (FIFO/LIFO)
- Import history tracking
- Validation and error reporting
```

### Update CHANGELOG.md

```markdown
## [0.3.0] - Phase 2: Import/Export

### Added
- CSV import with validation and preview
- CSV export functionality
- PDF report generation
- Tax reporting with FIFO/LIFO methods
- Import history tracking
- Drag-and-drop file upload

### Technical
- Added ImportHistory model
- Implemented Papa Parse for CSV handling
- Created jsPDF export service
- Built import/export UI components
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CSV Parsing Fails

**Problem:** Special characters break CSV parsing

**Solution:** Ensure proper escaping:
```typescript
// Use proper CSV escaping for fields with commas/quotes
Papa.parse(content, {
  quotes: true,
  quoteChar: '"',
  escapeChar: '"',
})
```

### Issue 2: Large File Uploads Timeout

**Problem:** Large CSV files cause timeout

**Solution:** Increase upload limits:
```javascript
// next.config.js
module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
```

### Issue 3: PDF Generation Memory Issues

**Problem:** Large portfolios cause memory errors

**Solution:** Paginate data:
```typescript
// Split table across multiple pages
const rowsPerPage = 40
if (tableData.length > rowsPerPage) {
  // Add page breaks
  doc.addPage()
}
```

---

## 📦 Deliverables

After completing this feature, you should have:

- [x] ImportHistory database model
- [x] CSV validation service
- [x] CSV import service with transaction support
- [x] CSV export service
- [x] PDF export service
- [x] Tax reporting with FIFO/LIFO
- [x] Import API endpoint
- [x] Export API endpoints (CSV and PDF)
- [x] ImportCSV UI component with drag-and-drop
- [x] ExportMenu UI component
- [x] Updated portfolio page with import/export
- [x] Sample CSV templates
- [x] Documentation updates

---

## 🔗 Related Files

### Created Files
- `lib/csv/template.ts`
- `lib/csv/validator.ts`
- `lib/csv/import-service.ts`
- `lib/csv/export-service.ts`
- `lib/pdf/export-service.ts`
- `components/portfolio/ImportCSV.tsx`
- `components/portfolio/ExportMenu.tsx`
- `app/api/portfolios/[id]/import/route.ts`
- `app/api/portfolios/[id]/export/csv/route.ts`
- `app/api/portfolios/[id]/export/pdf/route.ts`
- `test-data/sample-import.csv`

### Modified Files
- `prisma/schema.prisma` (added ImportHistory model)
- `app/(dashboard)/portfolios/[id]/page.tsx` (added import/export)

---

## ⏭️ Next Feature

**[F14: Portfolio Comparison](F14_portfolio_comparison.md)** - Side-by-side portfolio comparison

---

**Status Legend:**
- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked
