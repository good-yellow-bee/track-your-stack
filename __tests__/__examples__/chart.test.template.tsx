/**
 * Chart Component Test Template
 *
 * Use this template when testing Magic-generated chart components.
 *
 * Steps:
 * 1. Copy this template
 * 2. Replace YourChart with actual component name
 * 3. Replace mockChartData with actual test fixtures
 * 4. Customize tests based on chart features
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { YourChart } from '@/components/path/your-chart' // TODO: Update path
import { mockPerformanceData } from '@/test/fixtures/performance' // TODO: Create fixtures

describe('YourChart', () => {
  const defaultProps = {
    data: mockPerformanceData,
    onDataPointClick: jest.fn(),
    title: 'Portfolio Performance',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render chart with title', () => {
      render(<YourChart {...defaultProps} />)

      expect(screen.getByText('Portfolio Performance')).toBeInTheDocument()
    })

    it('should render chart canvas/svg', () => {
      render(<YourChart {...defaultProps} />)

      // TODO: Adjust based on chart library (canvas or SVG)
      const chart = screen.getByRole('img', { name: /chart/i })
      // OR: const chartSvg = screen.getByTestId('chart-svg')
      expect(chart).toBeInTheDocument()
    })

    it('should render with correct dimensions', () => {
      render(<YourChart {...defaultProps} width={800} height={400} />)

      const chartContainer = screen.getByTestId('chart-container')
      expect(chartContainer).toHaveStyle({
        width: '800px',
        height: '400px',
      })
    })

    it('should render empty state when no data', () => {
      render(<YourChart {...defaultProps} data={[]} />)

      expect(screen.getByText(/no data available/i)).toBeInTheDocument()
    })

    it('should show loading state', () => {
      render(<YourChart {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  describe('Data Visualization', () => {
    it('should display all data points', () => {
      render(<YourChart {...defaultProps} />)

      // TODO: Verify data points based on chart type
      const dataPoints = screen.getAllByTestId('data-point')
      expect(dataPoints).toHaveLength(mockPerformanceData.length)
    })

    it('should format values correctly', () => {
      render(<YourChart {...defaultProps} />)

      // TODO: Check for formatted currency values
      expect(screen.getByText('$1,234.56')).toBeInTheDocument()
    })

    it('should use correct colors for positive/negative values', () => {
      render(<YourChart {...defaultProps} />)

      // TODO: Check color application
      const positiveBar = screen.getByTestId('bar-positive')
      expect(positiveBar).toHaveClass('fill-green-600')

      const negativeBar = screen.getByTestId('bar-negative')
      expect(negativeBar).toHaveClass('fill-red-600')
    })
  })

  describe('Legend', () => {
    it('should render legend with all series', () => {
      render(<YourChart {...defaultProps} />)

      // TODO: Check for legend items
      expect(screen.getByText('Portfolio A')).toBeInTheDocument()
      expect(screen.getByText('Portfolio B')).toBeInTheDocument()
    })

    it('should toggle series visibility when legend item clicked', async () => {
      render(<YourChart {...defaultProps} />)

      const legendItem = screen.getByText('Portfolio A')
      fireEvent.click(legendItem)

      await waitFor(() => {
        // TODO: Verify series is hidden
        expect(screen.queryByTestId('series-portfolio-a')).not.toBeInTheDocument()
      })
    })

    it('should show color indicators in legend', () => {
      render(<YourChart {...defaultProps} />)

      const colorIndicator = screen.getAllByTestId('legend-color')[0]
      expect(colorIndicator).toHaveStyle({ backgroundColor: 'rgb(59, 130, 246)' })
    })
  })

  describe('Tooltips', () => {
    it('should show tooltip on hover', async () => {
      render(<YourChart {...defaultProps} />)

      const dataPoint = screen.getAllByTestId('data-point')[0]
      fireEvent.mouseEnter(dataPoint)

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument()
      })
    })

    it('should display formatted values in tooltip', async () => {
      render(<YourChart {...defaultProps} />)

      const dataPoint = screen.getAllByTestId('data-point')[0]
      fireEvent.mouseEnter(dataPoint)

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toHaveTextContent('$1,234.56')
        expect(tooltip).toHaveTextContent('Jan 15, 2024')
      })
    })

    it('should hide tooltip on mouse leave', async () => {
      render(<YourChart {...defaultProps} />)

      const dataPoint = screen.getAllByTestId('data-point')[0]
      fireEvent.mouseEnter(dataPoint)

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument()
      })

      fireEvent.mouseLeave(dataPoint)

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      })
    })
  })

  describe('Date Range Controls', () => {
    it('should render date range buttons', () => {
      render(<YourChart {...defaultProps} showDateRange={true} />)

      expect(screen.getByRole('button', { name: '1W' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '1M' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '3M' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '1Y' })).toBeInTheDocument()
    })

    it('should filter data when date range selected', async () => {
      render(<YourChart {...defaultProps} showDateRange={true} />)

      const oneMonthButton = screen.getByRole('button', { name: '1M' })
      fireEvent.click(oneMonthButton)

      await waitFor(() => {
        // TODO: Verify filtered data
        const dataPoints = screen.getAllByTestId('data-point')
        expect(dataPoints.length).toBeLessThan(mockPerformanceData.length)
      })
    })

    it('should highlight active date range button', async () => {
      render(<YourChart {...defaultProps} showDateRange={true} />)

      const oneMonthButton = screen.getByRole('button', { name: '1M' })
      fireEvent.click(oneMonthButton)

      await waitFor(() => {
        expect(oneMonthButton).toHaveClass('bg-primary')
      })
    })
  })

  describe('Chart Type Switching', () => {
    it('should render chart type selector', () => {
      render(<YourChart {...defaultProps} allowTypeSwitch={true} />)

      expect(screen.getByRole('combobox', { name: /chart type/i })).toBeInTheDocument()
    })

    it('should switch between chart types', async () => {
      render(<YourChart {...defaultProps} allowTypeSwitch={true} />)

      const typeSelector = screen.getByRole('combobox', { name: /chart type/i })
      fireEvent.change(typeSelector, { target: { value: 'bar' } })

      await waitFor(() => {
        // TODO: Verify chart type changed
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })
    })

    it('should persist selected chart type', async () => {
      const { rerender } = render(<YourChart {...defaultProps} allowTypeSwitch={true} />)

      const typeSelector = screen.getByRole('combobox', { name: /chart type/i })
      fireEvent.change(typeSelector, { target: { value: 'bar' } })

      rerender(<YourChart {...defaultProps} allowTypeSwitch={true} />)

      expect(typeSelector).toHaveValue('bar')
    })
  })

  describe('Interactions', () => {
    it('should call onDataPointClick when data point clicked', async () => {
      render(<YourChart {...defaultProps} />)

      const dataPoint = screen.getAllByTestId('data-point')[0]
      fireEvent.click(dataPoint)

      expect(defaultProps.onDataPointClick).toHaveBeenCalledWith(mockPerformanceData[0])
    })

    it('should support zoom interaction', async () => {
      render(<YourChart {...defaultProps} enableZoom={true} />)

      const chartContainer = screen.getByTestId('chart-container')

      // Simulate zoom (pinch or scroll)
      fireEvent.wheel(chartContainer, { deltaY: -100 })

      await waitFor(() => {
        // TODO: Verify zoom level changed
        expect(screen.getByTestId('zoom-level')).toHaveTextContent('150%')
      })
    })

    it('should support pan interaction', async () => {
      render(<YourChart {...defaultProps} enablePan={true} />)

      const chartContainer = screen.getByTestId('chart-container')

      fireEvent.mouseDown(chartContainer, { clientX: 100 })
      fireEvent.mouseMove(chartContainer, { clientX: 200 })
      fireEvent.mouseUp(chartContainer)

      await waitFor(() => {
        // TODO: Verify chart panned
      })
    })
  })

  describe('Export', () => {
    it('should export chart as PNG', async () => {
      const mockDownload = jest.fn()
      global.URL.createObjectURL = jest.fn()
      global.document.createElement = jest.fn().mockReturnValue({
        click: mockDownload,
        setAttribute: jest.fn(),
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,...'),
      })

      render(<YourChart {...defaultProps} showExport={true} />)

      const exportButton = screen.getByRole('button', { name: /export/i })
      fireEvent.click(exportButton)

      const pngOption = await screen.findByRole('menuitem', { name: /png/i })
      fireEvent.click(pngOption)

      await waitFor(() => {
        expect(mockDownload).toHaveBeenCalled()
      })
    })

    it('should export data as CSV', async () => {
      const mockDownload = jest.fn()
      global.URL.createObjectURL = jest.fn()
      global.document.createElement = jest.fn().mockReturnValue({
        click: mockDownload,
        setAttribute: jest.fn(),
      })

      render(<YourChart {...defaultProps} showExport={true} />)

      const exportButton = screen.getByRole('button', { name: /export/i })
      fireEvent.click(exportButton)

      const csvOption = await screen.findByRole('menuitem', { name: /csv/i })
      fireEvent.click(csvOption)

      await waitFor(() => {
        expect(mockDownload).toHaveBeenCalled()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should resize chart on window resize', async () => {
      render(<YourChart {...defaultProps} />)

      const chartContainer = screen.getByTestId('chart-container')
      const initialWidth = chartContainer.clientWidth

      // Simulate window resize
      global.innerWidth = 500
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        expect(chartContainer.clientWidth).not.toBe(initialWidth)
      })
    })

    it('should use mobile layout on small screens', () => {
      // Mock mobile viewport
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }))

      render(<YourChart {...defaultProps} />)

      // TODO: Check for mobile-specific elements
      expect(screen.getByTestId('mobile-controls')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have descriptive alt text or aria-label', () => {
      render(<YourChart {...defaultProps} />)

      const chart = screen.getByRole('img')
      expect(chart).toHaveAccessibleName(/portfolio performance/i)
    })

    it('should provide accessible data table alternative', () => {
      render(<YourChart {...defaultProps} showDataTable={true} />)

      const dataTable = screen.getByRole('table', { name: /chart data/i })
      expect(dataTable).toBeInTheDocument()
    })

    it('should announce data changes to screen readers', async () => {
      const { rerender } = render(<YourChart {...defaultProps} />)

      const newData = [...mockPerformanceData, { date: '2024-01-16', value: 5000 }]
      rerender(<YourChart {...defaultProps} data={newData} />)

      await waitFor(() => {
        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveTextContent(/data updated/i)
      })
    })

    it('should support keyboard navigation', async () => {
      render(<YourChart {...defaultProps} />)

      const chart = screen.getByRole('img')
      chart.focus()

      fireEvent.keyDown(chart, { key: 'ArrowRight' })

      await waitFor(() => {
        // TODO: Verify focus moved to next data point
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid data gracefully', () => {
      const invalidData = [{ invalid: 'data' }]

      render(<YourChart {...defaultProps} data={invalidData} />)

      expect(screen.getByText(/unable to render chart/i)).toBeInTheDocument()
    })

    it('should show error message when chart fails to render', () => {
      // Mock console.error to suppress error output
      jest.spyOn(console, 'error').mockImplementation(() => {})

      // Force error by passing invalid props
      render(<YourChart {...defaultProps} data={null} />)

      expect(screen.getByText(/error loading chart/i)).toBeInTheDocument()

      console.error.mockRestore()
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<YourChart {...defaultProps} />)

      const renderCount = jest.fn()
      jest.spyOn(React, 'useEffect').mockImplementation(renderCount)

      // Rerender with same props
      rerender(<YourChart {...defaultProps} />)

      // Should not cause re-render if data hasn't changed
      expect(renderCount).toHaveBeenCalledTimes(1)
    })

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        date: `2024-01-${i + 1}`,
        value: Math.random() * 10000,
      }))

      const start = performance.now()
      render(<YourChart {...defaultProps} data={largeDataset} />)
      const end = performance.now()

      // Should render in reasonable time (< 1 second)
      expect(end - start).toBeLessThan(1000)
    })
  })
})
