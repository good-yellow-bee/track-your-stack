/**
 * Data Table Component Test Template
 *
 * Use this template when testing Magic-generated data table components.
 *
 * Steps:
 * 1. Copy this template
 * 2. Replace YourDataTable with actual component name
 * 3. Replace mockData with actual test fixtures
 * 4. Customize tests based on table features
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { YourDataTable } from '@/components/path/your-data-table' // TODO: Update path
import { mockInvestments } from '@/test/fixtures/investments' // ✅ Fixture file created

describe('YourDataTable', () => {
  // Default props for testing
  const defaultProps = {
    data: mockInvestments,
    onRowClick: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render table with all rows', () => {
      render(<YourDataTable {...defaultProps} />)

      // Check that table is rendered
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      // Check that all data rows are rendered
      const rows = screen.getAllByRole('row')
      // +1 for header row
      expect(rows).toHaveLength(mockInvestments.length + 1)
    })

    it('should render column headers', () => {
      render(<YourDataTable {...defaultProps} />)

      // TODO: Update column names based on your table
      expect(screen.getByText('Ticker')).toBeInTheDocument()
      expect(screen.getByText('Quantity')).toBeInTheDocument()
      expect(screen.getByText('Current Value')).toBeInTheDocument()
      expect(screen.getByText('Gain/Loss')).toBeInTheDocument()
    })

    it('should render empty state when no data', () => {
      render(<YourDataTable {...defaultProps} data={[]} />)

      expect(screen.getByText(/no investments found/i)).toBeInTheDocument()
      // TODO: Check for empty state CTA if applicable
    })

    it('should show loading skeleton when loading', () => {
      render(<YourDataTable {...defaultProps} isLoading={true} />)

      // TODO: Adjust based on loading implementation
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      // OR: expect(screen.getAllByTestId('skeleton')).toHaveLength(5)
    })
  })

  describe('Sorting', () => {
    it('should sort by column when header clicked', async () => {
      render(<YourDataTable {...defaultProps} />)

      // Click sort header
      const gainLossHeader = screen.getByText('Gain/Loss')
      fireEvent.click(gainLossHeader)

      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        // First data row (index 1, after header)
        // TODO: Verify sorting based on your data
        expect(within(rows[1]).getByText('AAPL')).toBeInTheDocument()
      })
    })

    it('should toggle sort direction on second click', async () => {
      render(<YourDataTable {...defaultProps} />)

      const quantityHeader = screen.getByText('Quantity')

      // First click: ascending
      fireEvent.click(quantityHeader)
      await waitFor(() => {
        // TODO: Verify ascending order
      })

      // Second click: descending
      fireEvent.click(quantityHeader)
      await waitFor(() => {
        // TODO: Verify descending order
      })
    })

    it('should show sort indicator icon', () => {
      render(<YourDataTable {...defaultProps} />)

      const header = screen.getByText('Ticker')
      fireEvent.click(header)

      // TODO: Adjust based on sort icon implementation
      expect(screen.getByTestId('sort-asc-icon')).toBeInTheDocument()
    })
  })

  describe('Filtering', () => {
    it('should filter by asset type', async () => {
      render(<YourDataTable {...defaultProps} />)

      // Open filter dropdown
      const filterButton = screen.getByRole('button', { name: /asset type/i })
      fireEvent.click(filterButton)

      // Select Stock filter
      const stockOption = screen.getByRole('option', { name: /stock/i })
      fireEvent.click(stockOption)

      await waitFor(() => {
        // Verify only stocks are shown
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.queryByText('BTC')).not.toBeInTheDocument()
      })
    })

    it('should support multi-select filtering', async () => {
      render(<YourDataTable {...defaultProps} />)

      const filterButton = screen.getByRole('button', { name: /asset type/i })
      fireEvent.click(filterButton)

      // Select multiple options
      fireEvent.click(screen.getByRole('option', { name: /stock/i }))
      fireEvent.click(screen.getByRole('option', { name: /etf/i }))

      await waitFor(() => {
        // Verify both types are shown
        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeGreaterThan(1)
      })
    })

    it('should clear all filters', async () => {
      render(<YourDataTable {...defaultProps} />)

      // Apply filter
      const filterButton = screen.getByRole('button', { name: /asset type/i })
      fireEvent.click(filterButton)
      fireEvent.click(screen.getByRole('option', { name: /stock/i }))

      // Clear filters
      const clearButton = screen.getByRole('button', { name: /clear filters/i })
      fireEvent.click(clearButton)

      await waitFor(() => {
        // All data should be visible again
        const rows = screen.getAllByRole('row')
        expect(rows).toHaveLength(mockInvestments.length + 1)
      })
    })
  })

  describe('Search', () => {
    it('should filter by search term', async () => {
      const user = userEvent.setup()
      render(<YourDataTable {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'AAPL')

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.queryByText('GOOGL')).not.toBeInTheDocument()
      })
    })

    it('should debounce search input', async () => {
      const user = userEvent.setup()
      render(<YourDataTable {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/search/i)

      // Type quickly
      await user.type(searchInput, 'AAP')

      // Should not filter immediately
      expect(screen.getByText('GOOGL')).toBeInTheDocument()

      // Wait for debounce (300ms default)
      await waitFor(
        () => {
          expect(screen.queryByText('GOOGL')).not.toBeInTheDocument()
        },
        { timeout: 500 }
      )
    })

    it('should show "no results" when search has no matches', async () => {
      const user = userEvent.setup()
      render(<YourDataTable {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'ZZZZZZ')

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument()
      })
    })

    it('should clear search with clear button', async () => {
      const user = userEvent.setup()
      render(<YourDataTable {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'AAPL')

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(searchInput).toHaveValue('')
        expect(screen.getByText('GOOGL')).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    // Create large dataset for pagination testing
    const largeDataset = Array.from({ length: 50 }, (_, i) => ({
      ...mockInvestments[0],
      id: `inv-${i}`,
      ticker: `TICK${i}`,
    }))

    it('should show first page by default', () => {
      render(<YourDataTable {...defaultProps} data={largeDataset} />)

      // Should show items 1-20 (default page size)
      expect(screen.getByText('TICK0')).toBeInTheDocument()
      expect(screen.getByText('TICK19')).toBeInTheDocument()
      expect(screen.queryByText('TICK20')).not.toBeInTheDocument()
    })

    it('should navigate to next page', async () => {
      render(<YourDataTable {...defaultProps} data={largeDataset} />)

      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('TICK20')).toBeInTheDocument()
        expect(screen.queryByText('TICK0')).not.toBeInTheDocument()
      })
    })

    it('should navigate to previous page', async () => {
      render(<YourDataTable {...defaultProps} data={largeDataset} />)

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('TICK20')).toBeInTheDocument()
      })

      // Go back to page 1
      const prevButton = screen.getByRole('button', { name: /previous/i })
      fireEvent.click(prevButton)

      await waitFor(() => {
        expect(screen.getByText('TICK0')).toBeInTheDocument()
      })
    })

    it('should change page size', async () => {
      render(<YourDataTable {...defaultProps} data={largeDataset} />)

      const pageSizeSelect = screen.getByRole('combobox', { name: /items per page/i })
      fireEvent.change(pageSizeSelect, { target: { value: '50' } })

      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        // +1 for header
        expect(rows).toHaveLength(51)
      })
    })

    it('should show pagination info', () => {
      render(<YourDataTable {...defaultProps} data={largeDataset} />)

      expect(screen.getByText(/showing 1-20 of 50/i)).toBeInTheDocument()
    })

    it('should disable previous button on first page', () => {
      render(<YourDataTable {...defaultProps} data={largeDataset} />)

      const prevButton = screen.getByRole('button', { name: /previous/i })
      expect(prevButton).toBeDisabled()
    })

    it('should disable next button on last page', async () => {
      render(<YourDataTable {...defaultProps} data={largeDataset} />)

      // Navigate to last page
      const nextButton = screen.getByRole('button', { name: /next/i })

      // 50 items / 20 per page = 3 pages, need 2 clicks
      fireEvent.click(nextButton)
      await waitFor(() => expect(screen.getByText('TICK20')).toBeInTheDocument())

      fireEvent.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText('TICK40')).toBeInTheDocument()
        expect(nextButton).toBeDisabled()
      })
    })
  })

  describe('Row Interactions', () => {
    it('should call onRowClick when row is clicked', () => {
      render(<YourDataTable {...defaultProps} />)

      const firstRow = screen.getAllByRole('row')[1] // Skip header
      fireEvent.click(firstRow)

      expect(defaultProps.onRowClick).toHaveBeenCalledWith(mockInvestments[0])
    })

    it('should highlight row on hover', () => {
      render(<YourDataTable {...defaultProps} />)

      const firstRow = screen.getAllByRole('row')[1]
      fireEvent.mouseEnter(firstRow)

      // TODO: Adjust based on hover implementation
      expect(firstRow).toHaveClass('hover:bg-muted')
    })

    it('should expand row when expand button clicked', async () => {
      render(<YourDataTable {...defaultProps} />)

      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0]
      fireEvent.click(expandButton)

      await waitFor(() => {
        // TODO: Check for expanded content
        expect(screen.getByText(/purchase transactions/i)).toBeInTheDocument()
      })
    })
  })

  describe('Actions Menu', () => {
    it('should open actions menu when button clicked', async () => {
      render(<YourDataTable {...defaultProps} />)

      const menuButton = screen.getAllByRole('button', { name: /actions/i })[0]
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
        expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument()
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument()
      })
    })

    it('should call onEdit when edit action clicked', async () => {
      render(<YourDataTable {...defaultProps} />)

      const menuButton = screen.getAllByRole('button', { name: /actions/i })[0]
      fireEvent.click(menuButton)

      const editButton = await screen.findByRole('menuitem', { name: /edit/i })
      fireEvent.click(editButton)

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockInvestments[0])
    })

    it('should call onDelete when delete action clicked', async () => {
      render(<YourDataTable {...defaultProps} />)

      const menuButton = screen.getAllByRole('button', { name: /actions/i })[0]
      fireEvent.click(menuButton)

      const deleteButton = await screen.findByRole('menuitem', { name: /delete/i })
      fireEvent.click(deleteButton)

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockInvestments[0])
    })
  })

  describe('Accessibility', () => {
    it('should have proper table semantics', () => {
      render(<YourDataTable {...defaultProps} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0)
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1)
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<YourDataTable {...defaultProps} />)

      const firstRow = screen.getAllByRole('row')[1]
      firstRow.focus()

      // Tab to navigate
      await user.keyboard('{Tab}')

      // Enter to activate
      await user.keyboard('{Enter}')

      expect(defaultProps.onRowClick).toHaveBeenCalled()
    })

    it('should have aria labels for sort buttons', () => {
      render(<YourDataTable {...defaultProps} />)

      const sortButton = screen.getByRole('button', { name: /sort by ticker/i })
      expect(sortButton).toHaveAttribute('aria-label')
    })

    it('should announce sort changes to screen readers', async () => {
      render(<YourDataTable {...defaultProps} />)

      const sortButton = screen.getByText('Ticker')
      fireEvent.click(sortButton)

      await waitFor(() => {
        // TODO: Check for aria-live announcement
        expect(screen.getByRole('status')).toHaveTextContent(/sorted/i)
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should render mobile layout on small screens', () => {
      // Mock window.matchMedia for mobile viewport
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }))

      render(<YourDataTable {...defaultProps} />)

      // TODO: Check for mobile-specific elements
      // Example: horizontal scroll, stacked layout, etc.
    })
  })

  describe('Export', () => {
    it('should export to CSV when export button clicked', async () => {
      const mockDownload = jest.fn()
      global.URL.createObjectURL = jest.fn()
      global.document.createElement = jest.fn().mockReturnValue({
        click: mockDownload,
        setAttribute: jest.fn(),
      })

      render(<YourDataTable {...defaultProps} />)

      const exportButton = screen.getByRole('button', { name: /export/i })
      fireEvent.click(exportButton)

      await waitFor(() => {
        expect(mockDownload).toHaveBeenCalled()
      })
    })
  })
})
