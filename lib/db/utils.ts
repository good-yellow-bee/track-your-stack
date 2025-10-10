import { prisma } from '@/lib/prisma'

/**
 * Test database connection
 * @returns true if connection successful, false otherwise
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

/**
 * Get database health status
 * @returns Object with connection status and details
 */
export async function getDatabaseHealth() {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const duration = Date.now() - start

    return {
      status: 'healthy',
      responseTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Safely disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

/**
 * Get user's portfolio with authorization check
 * @param portfolioId - Portfolio ID
 * @param userId - User ID for authorization
 * @returns Portfolio with investments or null
 */
export async function getAuthorizedPortfolio(portfolioId: string, userId: string) {
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId: userId, // Authorization check
    },
    include: {
      investments: {
        include: {
          transactions: true,
        },
        orderBy: {
          ticker: 'asc',
        },
      },
    },
  })

  return portfolio
}

/**
 * Get all user portfolios
 * @param userId - User ID
 * @returns Array of portfolios with investment counts
 */
export async function getUserPortfolios(userId: string) {
  const portfolios = await prisma.portfolio.findMany({
    where: {
      userId: userId,
    },
    include: {
      _count: {
        select: {
          investments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return portfolios
}

/**
 * Check if user owns portfolio
 * @param portfolioId - Portfolio ID
 * @param userId - User ID
 * @returns true if user owns portfolio
 */
export async function userOwnsPortfolio(portfolioId: string, userId: string): Promise<boolean> {
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId: userId,
    },
    select: {
      id: true,
    },
  })

  return !!portfolio
}
