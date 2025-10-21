'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface TableHighlightContextType {
  highlightedTicker: string | null
  setHighlightedTicker: (ticker: string | null) => void
}

const TableHighlightContext = createContext<TableHighlightContextType | undefined>(undefined)

export function TableHighlightProvider({ children }: { children: ReactNode }) {
  const [highlightedTicker, setHighlightedTicker] = useState<string | null>(null)

  return (
    <TableHighlightContext.Provider value={{ highlightedTicker, setHighlightedTicker }}>
      {children}
    </TableHighlightContext.Provider>
  )
}

export function useTableHighlight() {
  const context = useContext(TableHighlightContext)
  if (context === undefined) {
    throw new Error('useTableHighlight must be used within a TableHighlightProvider')
  }
  return context
}
