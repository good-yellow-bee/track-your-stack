# Magic MCP Command Library

**Ready-to-Use Commands for Track Your Stack**

Last Updated: 2025-10-10

## Overview

This library contains production-ready Magic MCP commands specifically tailored for Track Your Stack components. Copy, customize, and use these commands to accelerate development.

## Command Format

```
/ui [description with specifications]
```

**Best Practices:**
- Be specific about features (sorting, filtering, pagination)
- Include data structure (columns, fields, types)
- Specify interactions (click, hover, expand)
- Mention responsive behavior
- List required accessibility features

## Investment Components

### 1. Investment Data Table

**Use Case:** Display all investments in a portfolio with advanced table features.

**Command:**

```
/ui create investment data table with the following specifications:

Columns:
- Ticker Symbol (text, left-aligned, sortable, searchable)
- Company/Asset Name (text, left-aligned, secondary text color)
- Asset Type (badge with colors: Stock=blue, ETF=purple, Crypto=orange, Mutual Fund=green, sortable, filterable)
- Quantity (number with 8 decimal places, right-aligned, sortable)
- Average Cost Basis (currency with symbol, right-aligned, sortable)
- Current Price (currency with symbol, right-aligned, sortable, with real-time indicator icon)
- Current Value (currency with symbol, right-aligned, sortable, bold)
- Gain/Loss Amount (currency with symbol, right-aligned, sortable, color: green if positive, red if negative)
- Gain/Loss Percentage (percentage with 2 decimals, right-aligned, sortable, color: green if positive, red if negative)
- Actions (dropdown menu: View Details, Edit, Delete)

Features:
- Sort by any column (ascending/descending toggle)
- Filter by asset type (multi-select dropdown)
- Global search across ticker and company name (debounced 300ms)
- Pagination with 20 items per page
- Page size selector (10, 20, 50, 100)
- Row click navigates to investment detail page
- Expandable rows showing purchase transaction history
- Responsive: horizontal scroll on mobile, sticky first column
- Empty state with "Add Investment" call-to-action
- Loading skeleton with shimmer effect
- Export to CSV button in header

Styling:
- Use shadcn/ui table components
- Tailwind CSS with theme variables
- Hover effect on rows
- Selected row highlight
```

**Save to:** `components/investment/investment-data-table.tsx`

**Props Interface:**

```tsx
interface InvestmentDataTableProps {
  investments: (Investment & { portfolio: Portfolio })[]
  onRowClick?: (investment: Investment) => void
  onEdit?: (investment: Investment) => void
  onDelete?: (investment: Investment) => void
  isLoading?: boolean
}
```

---

### 2. Add Investment Wizard (Multi-Step Form)

**Use Case:** Guide users through adding a new investment with validation.

**Command:**

```
/ui create multi-step investment form wizard with 5 steps:

Step 1: Asset Type Selection
- Large card grid (2 columns on desktop, 1 on mobile)
- Options: Stock, ETF, Cryptocurrency, Mutual Fund, Other
- Each card shows icon, title, and brief description
- Radio button selection (only one active)
- "Next" button disabled until selection made

Step 2: Ticker/Symbol Search
- Autocomplete search input with debounce (300ms)
- Display search results: Ticker, Company Name, Exchange
- Each result clickable to select
- Show loading spinner during search
- "Can't find your investment?" link to manual entry
- Manual entry form: Ticker input, Company Name input
- "Back" and "Next" buttons

Step 3: Purchase Details
- Quantity input (number, 8 decimal places, min: 0.00000001, required)
- Average Cost Basis per unit (currency input, required)
- Purchase Date (date picker, max: today, default: today)
- Total Cost (calculated read-only field: quantity × cost basis, formatted as currency)
- Purchase Currency selector (searchable dropdown, 100+ currencies)
- Notes textarea (optional, 500 character limit, counter shown)
- "Back" and "Next" buttons

Step 4: Additional Information
- Portfolio selection (dropdown, required)
- Tags/Categories (multi-select, optional, with "Create new tag" option)
- Risk Level (slider: Low, Medium, High, Very High)
- Dividend Paying toggle (yes/no)
- Target Allocation percentage (number input, optional, 0-100%)
- "Back" and "Next" buttons

Step 5: Review and Confirm
- Summary view showing all entered data organized by sections
- Each section has "Edit" button (returns to that step)
- Final calculated values: Total Cost, Current Value (if price available), Estimated Gain/Loss
- Terms checkbox: "I confirm the information is accurate"
- "Back" and "Submit" buttons
- Submit button disabled until terms checked
- Loading state during submission with progress text
- Success message with "View Investment" and "Add Another" buttons
- Error handling with retry button

Global Features:
- Progress indicator at top (5 steps with labels)
- Current step highlighted
- Completed steps show checkmark
- Form validation at each step
- Can't proceed without completing required fields
- Validation errors shown inline
- Auto-save to localStorage every 30 seconds (draft recovery)
- Mobile responsive with fullscreen modal on mobile
- Keyboard navigation support (Tab, Enter, Escape)
- Accessibility: proper ARIA labels, screen reader support
```

**Save to:** `components/investment/add-investment-wizard.tsx`

---

### 3. Investment Detail Card

**Use Case:** Show comprehensive investment information on detail page.

**Command:**

```
/ui create investment detail card with the following sections:

Header Section:
- Large ticker symbol (left)
- Company/Asset name (subtitle)
- Asset type badge (top-right)
- Current price with currency (large, prominent)
- Price change indicator (amount and percentage with up/down arrow, colored)
- Last updated timestamp

Overview Section:
- Grid of key metrics (2 columns desktop, 1 column mobile)
  - Total Quantity
  - Average Cost Basis per unit
  - Total Cost (quantity × avg cost)
  - Current Value (quantity × current price)
  - Gain/Loss Amount (with color indicator)
  - Gain/Loss Percentage (with color indicator)
  - Purchase Date
  - Holdings Period (calculated days)

Performance Section:
- Mini line chart showing 7-day price history
- Date range selector (7D, 1M, 3M, 6M, 1Y)
- Tooltip on hover showing exact price and date

Transaction History Section:
- Expandable accordion
- Table of purchase transactions: Date, Quantity, Price, Total, Actions
- "Add Purchase" button
- Edit/Delete actions per transaction

Actions Footer:
- "Update Price" button (manual refresh)
- "Edit Investment" button
- "Delete Investment" button (with confirmation modal)
- "Export Data" button

Styling:
- Card with subtle shadow
- Positive numbers in green, negative in red
- Responsive grid layout
- Hover effects on interactive elements
```

**Save to:** `components/investment/investment-detail-card.tsx`

---

### 4. Quick Add Investment Modal

**Use Case:** Fast investment entry from anywhere in the app.

**Command:**

```
/ui create quick add investment modal with compact form:

Modal Structure:
- Title: "Quick Add Investment"
- Close button (X) in top-right

Form Fields (single column, compact spacing):
- Portfolio selector (dropdown, required, defaults to currently viewed portfolio)
- Asset Type (segmented control: Stock | ETF | Crypto | Other)
- Ticker/Symbol (text input with autocomplete, required)
- Quantity (number input, required)
- Price per unit (currency input, required)
- Purchase Date (date input with calendar popup, defaults to today)
- Total Cost (calculated, read-only, shown in muted text)

Features:
- Real-time total cost calculation
- Form validation (show errors on blur)
- "Cancel" and "Add Investment" buttons
- Add button disabled until valid
- Loading state on submit
- Success animation (checkmark) on completion
- Auto-close after 2 seconds on success
- Error message display at bottom
- Keyboard shortcuts: Enter to submit, Escape to close
- Focus management (trap focus in modal)
- Backdrop click to close (with unsaved changes warning)

Styling:
- Centered modal, max-width 500px
- Smooth slide-up animation on open
- Backdrop with blur effect
- Mobile: full screen on small devices
```

**Save to:** `components/investment/quick-add-investment-modal.tsx`

---

## Portfolio Components

### 5. Portfolio Performance Line Chart

**Use Case:** Visualize portfolio value over time.

**Command:**

```
/ui create portfolio performance line chart with:

Chart Type: Multi-line chart

Data Visualization:
- X-axis: Date (format: MMM DD for daily, MMM YYYY for monthly)
- Y-axis: Portfolio value in currency (auto-scaled, formatted with K/M suffixes)
- Multiple lines (up to 5 portfolios simultaneously)
- Each line distinct color from palette: blue, green, purple, orange, pink
- Line thickness: 2px
- Smooth curves (not sharp angles)
- Dots on data points on hover
- Gradient fill under each line (subtle, 20% opacity)

Interactive Features:
- Tooltip on hover showing:
  - Date
  - Portfolio name
  - Exact value
  - Change from previous day (amount and %)
- Crosshair on hover (vertical line at mouse position)
- Click data point to see detailed breakdown modal
- Zoom: Pinch on mobile, scroll on desktop
- Pan: Drag to move along timeline
- Legend: Click portfolio name to show/hide line

Controls:
- Date range selector (button group at top):
  - 1W, 1M, 3M, 6M, 1Y, YTD, All
  - Active button highlighted
- Portfolio selector (multi-select dropdown with max 5)
- View mode toggle: Line | Area | Bar
- Export menu: Download PNG | Download CSV | Print

Responsive:
- Desktop: Full featured with all controls
- Tablet: Stacked controls, smaller chart
- Mobile: Essential controls only, swipe for pan

Accessibility:
- Keyboard navigation through data points
- Screen reader descriptions of trends
- Color-blind friendly palette
- High contrast mode support

Empty State:
- Show when no data available
- Message: "No performance data yet. Add investments to start tracking."
- Illustration or icon
- "Add Investment" CTA button
```

**Save to:** `components/portfolio/portfolio-performance-chart.tsx`

---

### 6. Portfolio Allocation Pie Chart

**Use Case:** Show portfolio distribution by asset type or investment.

**Command:**

```
/ui create portfolio allocation pie chart with:

Chart Type: Donut chart (pie chart with center cut out)

Data Visualization:
- Segments for each category (asset type or individual investment)
- Segment colors from accessible color palette
- Each segment shows percentage on hover
- Center displays total portfolio value

Features:
- Toggle between two views:
  - By Asset Type (Stock, ETF, Crypto, Mutual Fund, Other)
  - By Individual Investments (top 10, others grouped)
- Hover segment:
  - Highlight and slightly expand
  - Show tooltip: Name, Value, Percentage
- Click segment:
  - Navigate to filtered view
  - Or show detail modal
- Animation on load (segments grow from 0)

Legend:
- Position: Right side on desktop, bottom on mobile
- Each item shows: Color square, Name, Percentage, Value
- Click legend item to highlight segment
- Show/hide toggle per item

Controls:
- View toggle: Asset Type | Investments
- Sort dropdown: Largest to Smallest | Smallest to Largest | Alphabetical
- Currency selector (if multi-currency portfolio)

Responsive:
- Desktop: Chart left, legend right
- Tablet: Chart top, legend bottom
- Mobile: Stacked, smaller chart

Empty State:
- Greyed out circle
- Message: "Add investments to see allocation"
- "Add Investment" button
```

**Save to:** `components/portfolio/portfolio-allocation-chart.tsx`

---

### 7. Portfolio Summary Card

**Use Case:** Quick overview card for portfolio list and dashboard.

**Command:**

```
/ui create portfolio summary card with:

Card Structure:
- Header with portfolio name (left) and menu (right)
- Main content area with metrics
- Footer with action buttons

Header:
- Portfolio name (h3, truncate long names)
- Base currency badge
- Options menu (•••): Edit, Delete, Export, Share
- Risk indicator (small badge): Low | Medium | High

Main Content (Grid: 2×2 on desktop, 1×4 on mobile):
Metric 1: Total Value
- Large number (formatted currency)
- Small text: "Total Value"

Metric 2: Total Gain/Loss
- Large number (formatted currency, colored: green positive, red negative)
- Small text: "Gain/Loss"
- Percentage in parentheses

Metric 3: Number of Investments
- Large number (count)
- Small text: "Investments"
- Mini icon showing asset type distribution

Metric 4: 24h Change
- Number (formatted currency, colored)
- Small text: "24h Change"
- Percentage with arrow (↑ or ↓)

Mini Chart:
- Sparkline chart showing 7-day trend
- No axes, just the line
- Color matches gain/loss (green or red)
- Very subtle, background element

Footer Actions:
- Primary button: "View Details"
- Secondary button: "Add Investment"
- Tertiary: "Refresh Prices" (icon button)

States:
- Default (as described)
- Hover: Subtle shadow increase, slight scale (1.02)
- Loading: Skeleton with shimmer animation
- Error: Red border, error icon, error message, "Retry" button

Accessibility:
- Focus indicators
- Keyboard navigation
- Screen reader labels
- High contrast mode

Responsive:
- Desktop: 2×2 grid, side-by-side buttons
- Mobile: Stacked metrics, full-width buttons
```

**Save to:** `components/portfolio/portfolio-summary-card.tsx`

---

### 8. Create Portfolio Form

**Use Case:** Simple form for creating a new portfolio.

**Command:**

```
/ui create portfolio creation form with:

Form Fields:
1. Portfolio Name
   - Text input (required)
   - Placeholder: "e.g., Retirement Fund, Tech Stocks"
   - Max length: 100 characters
   - Character counter shown
   - Validation: Cannot be empty, must be unique

2. Base Currency
   - Searchable select dropdown (required)
   - Popular currencies at top: USD, EUR, GBP, JPY, CAD, AUD
   - Full list: 150+ currencies with flags
   - Format display: "USD - United States Dollar 🇺🇸"
   - Validation: Must select one

3. Risk Level (optional)
   - Segmented control: Conservative | Moderate | Aggressive | Very Aggressive
   - Each with icon and brief description tooltip
   - Default: Moderate

4. Description (optional)
   - Textarea (4 rows)
   - Placeholder: "Describe your investment strategy..."
   - Max length: 500 characters
   - Character counter

5. Initial Investment Amount (optional)
   - Currency input (matches base currency)
   - Helper text: "Optional: Starting cash balance"

Features:
- Real-time validation with inline errors
- Form state persistence (localStorage)
- Unsaved changes warning
- "Cancel" button (returns to previous page with confirmation)
- "Create Portfolio" button
  - Disabled when form invalid
  - Loading state during submission
  - Success animation
- Success redirect to new portfolio page after 1 second
- Error handling with specific messages

Layout:
- Card-based form with clear sections
- Two-column on desktop (Name/Currency, Risk/Amount)
- Single column on mobile
- Logical tab order
- Auto-focus on portfolio name input

Accessibility:
- Labels for all inputs
- Error announcements for screen readers
- Keyboard shortcuts (Ctrl+Enter to submit)
```

**Save to:** `components/portfolio/create-portfolio-form.tsx`

---

## Dashboard Components

### 9. Dashboard Overview Cards

**Use Case:** High-level metrics on main dashboard.

**Command:**

```
/ui create dashboard overview metrics with 4 summary cards:

Card 1: Total Portfolio Value
- Large number: Total value across all portfolios (formatted currency)
- Subtitle: "Across X portfolios"
- 24h change indicator (percentage, colored, with arrow)
- Mini sparkline showing 7-day trend
- Background gradient: blue theme

Card 2: Total Gain/Loss
- Large number: Total unrealized gain/loss (formatted currency)
- Colored based on positive/negative (green/red)
- Subtitle: "Since inception"
- Percentage of total investment
- Background gradient: matches value (green/red theme)

Card 3: Best Performer
- Asset ticker/symbol (large)
- Gain percentage (colored green)
- Subtitle: Asset name
- "View Details" link
- Background gradient: green theme

Card 4: Active Investments
- Large number: Total count of investments
- Breakdown by asset type (mini badges)
- Subtitle: "Across X portfolios"
- "View All" link
- Background gradient: purple theme

Card Design:
- White/dark background (theme-aware)
- Rounded corners
- Subtle shadow
- Hover effect: lift with larger shadow
- Icon in top-right corner (theme-colored)

Grid Layout:
- Desktop: 4 columns, equal width
- Tablet: 2×2 grid
- Mobile: Stacked (1 column)

States:
- Loading: Skeleton placeholder with pulse animation
- Empty: Greyed out with "Add Portfolio" CTA
- Error: Red border with error icon

Responsive Typography:
- Desktop: Large numbers (3xl), regular subtitles
- Mobile: Medium numbers (2xl), small subtitles
```

**Save to:** `components/dashboard/overview-metrics.tsx`

---

### 10. Recent Activity Feed

**Use Case:** Show recent transactions and price updates on dashboard.

**Command:**

```
/ui create activity feed component with:

Activity Types:
1. New Investment Added
   - Icon: Plus in circle (green)
   - Text: "Added [Ticker] to [Portfolio]"
   - Metadata: Quantity, Cost
   - Timestamp: "2 hours ago"

2. Price Update (Significant Change)
   - Icon: Arrow up/down (green/red)
   - Text: "[Ticker] price updated"
   - Metadata: Old price → New price (±X%)
   - Timestamp: "5 minutes ago"

3. Investment Edited
   - Icon: Edit (blue)
   - Text: "Updated [Ticker] details"
   - Metadata: What changed
   - Timestamp: "1 day ago"

4. Investment Deleted
   - Icon: Trash (red)
   - Text: "Removed [Ticker] from [Portfolio]"
   - Metadata: Final value
   - Timestamp: "3 days ago"

Feed Layout:
- Vertical timeline with connecting line
- Each item: Icon (left), Content (center), Timestamp (right)
- Click item to navigate to related page
- Hover effect: Background highlight

Features:
- Load more button (show 10, then +10 more)
- Filter dropdown: All Activity | Investments | Price Updates | Edits
- Time grouping: Today, Yesterday, This Week, Older
- Empty state: "No recent activity"
- Loading: Skeleton items (3-5 placeholders)

Responsive:
- Desktop: Full layout with all metadata
- Mobile: Compact, timestamp below content

Styling:
- Clean, minimal design
- Theme-aware colors
- Proper spacing between items
```

**Save to:** `components/dashboard/activity-feed.tsx`

---

## Utility Components

### 11. Currency Selector

**Use Case:** Searchable dropdown for currency selection.

**Command:**

```
/ui create currency selector with:

Display Format:
- Selected: "USD - United States Dollar 🇺🇸"
- Dropdown items: Same format with flag emoji

Features:
- Searchable (type to filter by code or name)
- Debounced search (300ms)
- Popular currencies section at top:
  - USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY
  - Separated by divider line
- Full list below (alphabetical by code)
- Support 150+ currencies
- Keyboard navigation (↑↓ arrows, Enter to select, Escape to close)
- Recently used section (stores last 3 selected, localStorage)

Dropdown:
- Max height: 400px with scroll
- Smooth scroll behavior
- Highlighted on hover
- Selected item has checkmark
- Loading state while fetching exchange rates (optional)

Mobile:
- Bottom sheet on mobile devices
- Full-screen search at top
- Large touch targets (48px min height)

Accessibility:
- Combobox ARIA role
- Announcements for filtering results
- Clear focus indicators
```

**Save to:** `components/ui/currency-selector.tsx`

---

### 12. Date Range Picker

**Use Case:** Select date ranges for filtering charts and data.

**Command:**

```
/ui create date range picker with:

Quick Select Buttons:
- Row of buttons: 1W | 1M | 3M | 6M | 1Y | YTD | All
- Active button highlighted (primary color)
- Click to instantly apply range

Custom Range:
- "Custom Range" button opens calendar modal
- Calendar modal:
  - Two-month view (side by side on desktop, stacked on mobile)
  - Start date picker (left/top)
  - End date picker (right/bottom)
  - Visual range highlighting
  - "Apply" and "Cancel" buttons
  - Preset shortcuts on side: "Last 7 days", "Last 30 days", etc.

Display:
- Shows currently selected range as text
- Example: "Jan 1, 2024 - Jan 31, 2024"
- Or: "Last 30 days"

Features:
- Validation: End date must be after start date
- Max range: 5 years (configurable)
- Min date: Account creation date (configurable)
- Max date: Today
- onChange callback with start/end dates
- Reset button to clear selection

Responsive:
- Desktop: Horizontal button group with custom button at end
- Mobile: Scroll horizontally if needed, or wrap buttons

Styling:
- Outlined buttons when inactive
- Filled button when active
- Smooth transitions
```

**Save to:** `components/ui/date-range-picker.tsx`

---

### 13. Ticker Symbol Search

**Use Case:** Autocomplete search for stock/crypto ticker symbols.

**Command:**

```
/ui create ticker symbol search with:

Input:
- Search input with icon (magnifying glass)
- Placeholder: "Search by ticker or company name..."
- Debounced search (300ms after last keystroke)
- Clear button (X) when text present
- Loading spinner during search

Results Dropdown:
- Opens below input
- Shows 5 results at a time
- Each result displays:
  - Ticker symbol (bold, larger)
  - Company/Asset name (regular, smaller)
  - Exchange (badge, small)
  - Asset type icon (Stock/ETF/Crypto)
- Keyboard navigation (↑↓ arrows)
- Enter to select highlighted result
- Escape to close dropdown

Features:
- Search integration with Alpha Vantage API
- Result caching (avoid repeat API calls)
- "No results found" state with:
  - Helpful message
  - "Add manually" link
- Recent searches (localStorage, max 5)
- Popular tickers suggestion when empty

Manual Entry Fallback:
- "Can't find your investment?" link
- Opens manual entry form:
  - Ticker input (text)
  - Company name input (text)
  - Asset type selector
  - "Add" button

Error Handling:
- API error: Show friendly message with retry
- Network error: Offline indicator

Mobile:
- Full-screen modal on mobile
- Large search bar at top
- Results with touch-friendly spacing
```

**Save to:** `components/investment/ticker-search.tsx`

---

### 14. Gain/Loss Indicator Badge

**Use Case:** Consistent display of financial gains and losses.

**Command:**

```
/ui create gain/loss indicator component with:

Display Variants:
1. Compact: "+$1,234.56 (12.3%)"
2. Detailed: Amount on one line, percentage below
3. Icon + Number: Arrow + amount
4. Badge: Pill-shaped badge with value

Styling Rules:
- Positive values: Green color (#22c55e), up arrow (↑)
- Negative values: Red color (#ef4444), down arrow (↓)
- Zero: Neutral gray color (#64748b), dash (—)

Features:
- Props:
  - amount: number
  - percentage: number
  - variant: 'compact' | 'detailed' | 'icon' | 'badge'
  - showArrow: boolean (default true)
  - showPercentage: boolean (default true)
  - currency: string (default 'USD')
- Formatted using locale formatting
- Tooltip on hover with calculation details
- Accessibility: aria-label describes value and direction

Responsive:
- Desktop: Default size
- Mobile: Slightly smaller font for compact view

Usage Examples:
<GainLossIndicator amount={1234.56} percentage={12.3} variant="compact" />
<GainLossIndicator amount={-500} percentage={-5.2} variant="badge" />
```

**Save to:** `components/ui/gain-loss-indicator.tsx`

---

## Testing Components

When using any Magic-generated component, create corresponding test files:

```tsx
// Example test structure
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ComponentName } from '@/components/path/component-name'

describe('ComponentName', () => {
  const mockData = {
    // Test fixtures
  }

  it('should render with data', () => {
    render(<ComponentName data={mockData} />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle interaction', async () => {
    const onAction = jest.fn()
    render(<ComponentName data={mockData} onAction={onAction} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(onAction).toHaveBeenCalled()
    })
  })

  it('should show loading state', () => {
    render(<ComponentName data={mockData} isLoading={true} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
```

---

## Command Customization Tips

### Adjusting Complexity

**Too Complex?** Simplify by removing features:

```
❌ Original: "with sorting, filtering, pagination, search, export, and bulk actions"
✅ Simplified: "with basic sorting and pagination"
```

**Too Simple?** Add features incrementally:

```
✅ Phase 1: Generate basic table
✅ Phase 2: Add sorting
✅ Phase 3: Add filtering
```

### Styling Consistency

Always include in commands:

```
Styling:
- Use shadcn/ui components where applicable
- Tailwind CSS with theme variables (bg-primary, text-foreground, etc.)
- No hardcoded colors
- Responsive design (desktop, tablet, mobile)
- Accessibility: ARIA labels, keyboard navigation
```

### Common Mistakes to Avoid

❌ **Too Vague:**

```
/ui create investment table
```

✅ **Specific:**

```
/ui create investment table with ticker, quantity, price, gain/loss columns, sortable, filterable by asset type
```

---

## Next Steps

After generating a component with these commands:

1. **Review** generated code for quality
2. **Customize** to match design system (theme variables)
3. **Test** all interactive features
4. **Integrate** into your page/feature
5. **Document** any customizations made

---

**Quick Links:**

- [Magic MCP Quick Start Guide](./magic-mcp-quickstart.md)
- [UI Component Selection Guide](./ui-component-selection-guide.md)
- [Component Templates](../../components/__templates/)

**Last Updated:** 2025-10-10
