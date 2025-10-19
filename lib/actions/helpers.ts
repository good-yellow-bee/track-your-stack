/**
 * Reusable helper functions for server actions
 * Reduces code duplication and improves maintainability
 */

import { prisma } from '@/lib/prisma'

/**
 * Verify portfolio ownership
 * @param portfolioId - Portfolio ID to verify
 * @param userId - User ID to check ownership against
 * @returns true if user owns the portfolio
 * @throws Error if portfolio not found
 */
export async function verifyPortfolioOwnership(
  portfolioId: string,
  userId: string
): Promise<boolean> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    select: { userId: true },
  })

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  return portfolio.userId === userId
}

/**
 * Check if investment exists in portfolio
 * @param portfolioId - Portfolio ID
 * @param ticker - Investment ticker symbol
 * @returns Existing investment or null
 */
export async function findExistingInvestment(portfolioId: string, ticker: string) {
  return prisma.investment.findFirst({
    where: {
      portfolioId,
      ticker,
    },
  })
}
