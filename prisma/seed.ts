import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created test user:', user.email)

  // Create a test portfolio
  const portfolio = await prisma.portfolio.upsert({
    where: { id: 'test-portfolio-1' },
    update: {},
    create: {
      id: 'test-portfolio-1',
      userId: user.id,
      name: 'My Investment Portfolio',
      baseCurrency: 'USD',
    },
  })

  console.log('✅ Created test portfolio:', portfolio.name)

  // Create test investments
  const appleInvestment = await prisma.investment.upsert({
    where: { id: 'test-investment-1' },
    update: {},
    create: {
      id: 'test-investment-1',
      portfolioId: portfolio.id,
      ticker: 'AAPL',
      assetName: 'Apple Inc.',
      assetType: 'STOCK',
      totalQuantity: 10,
      averageCostBasis: 150.0,
      purchaseCurrency: 'USD',
      currentPrice: 175.0,
      currentPriceCurrency: 'USD',
      priceUpdatedAt: new Date(),
    },
  })

  console.log('✅ Created test investment:', appleInvestment.ticker)

  // Create purchase transaction for Apple
  await prisma.purchaseTransaction.create({
    data: {
      investmentId: appleInvestment.id,
      quantity: 10,
      pricePerUnit: 150.0,
      currency: 'USD',
      purchaseDate: new Date('2024-01-15'),
      notes: 'Initial purchase',
    },
  })

  console.log('✅ Created purchase transaction for AAPL')

  // Create Bitcoin investment
  const bitcoinInvestment = await prisma.investment.upsert({
    where: { id: 'test-investment-2' },
    update: {},
    create: {
      id: 'test-investment-2',
      portfolioId: portfolio.id,
      ticker: 'BTC',
      assetName: 'Bitcoin',
      assetType: 'CRYPTO',
      totalQuantity: 0.5,
      averageCostBasis: 45000.0,
      purchaseCurrency: 'USD',
      currentPrice: 50000.0,
      currentPriceCurrency: 'USD',
      priceUpdatedAt: new Date(),
    },
  })

  console.log('✅ Created test investment:', bitcoinInvestment.ticker)

  // Create purchase transaction for Bitcoin
  await prisma.purchaseTransaction.create({
    data: {
      investmentId: bitcoinInvestment.id,
      quantity: 0.5,
      pricePerUnit: 45000.0,
      currency: 'USD',
      purchaseDate: new Date('2024-02-01'),
      notes: 'Crypto diversification',
    },
  })

  console.log('✅ Created purchase transaction for BTC')

  // Create currency rate cache
  await prisma.currencyRate.upsert({
    where: {
      fromCurrency_toCurrency: {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
      },
    },
    update: {},
    create: {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      rate: 0.92,
      fetchedAt: new Date(),
    },
  })

  console.log('✅ Created currency rate: USD -> EUR')

  // Create portfolio snapshot
  await prisma.portfolioSnapshot.create({
    data: {
      portfolioId: portfolio.id,
      totalValue: 27250.0, // (10 * 175) + (0.5 * 50000)
      baseCurrency: 'USD',
      snapshotDate: new Date(),
    },
  })

  console.log('✅ Created portfolio snapshot')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
