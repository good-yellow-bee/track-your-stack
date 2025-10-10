# Track Your Stack 📊

A modern investment portfolio tracking application built with Next.js 15, TypeScript, and PostgreSQL.

## Features

- 📈 **Real-time Price Updates** - Live market data via Alpha Vantage API
- 💰 **Multi-Currency Support** - Track investments in any major currency
- 📊 **Smart Aggregation** - Automatic average cost basis calculation
- 🎯 **Multi-Asset Support** - Stocks, ETFs, mutual funds, and cryptocurrency
- 📉 **Gains/Loss Tracking** - Comprehensive performance analytics
- 🥧 **Visual Analytics** - Interactive pie charts and performance tracking

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Backend:** Next.js Server Actions + API Routes
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** NextAuth.js v5 (Google OAuth)
- **Market Data:** Alpha Vantage API
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL database
- Google OAuth credentials
- Alpha Vantage API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/track-your-stack.git
cd track-your-stack

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
pnpm prisma generate
pnpm prisma db push

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/track_your_stack"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with: openssl rand -base64 32"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Alpha Vantage API
ALPHA_VANTAGE_API_KEY="your_alpha_vantage_api_key"
```

### Getting API Keys

1. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Alpha Vantage:**
   - Register at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Get free API key (500 calls/day, 5 calls/minute)

## Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier

# Database
pnpm prisma generate       # Generate Prisma Client
pnpm prisma migrate dev    # Create migration
pnpm prisma studio         # Open database GUI

# Testing
pnpm test                  # Run unit tests
pnpm test:watch            # Run tests in watch mode
pnpm test:coverage         # Run tests with coverage
pnpm test:ui               # Open Vitest UI
pnpm test:e2e              # Run E2E tests
pnpm test:e2e:ui           # Run E2E tests in UI mode
pnpm test:all              # Run all tests (unit + E2E)
```

## Project Structure

```
track-your-stack/
├── app/                      # Next.js App Router
├── components/               # React components
├── lib/                      # Utilities and business logic
├── prisma/                   # Database schema and migrations
├── docs/                     # Living documentation
├── claudedocs/               # Project specifications
└── public/                   # Static assets
```

## Testing

Track Your Stack uses **Vitest** for unit/integration testing and **Playwright** for E2E testing.

### Unit & Integration Tests

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Open Vitest UI
pnpm test:ui
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run E2E tests in debug mode
pnpm test:e2e:debug

# View test report
pnpm test:e2e:report
```

### Test Coverage

Minimum coverage thresholds:

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

View coverage report: `open coverage/index.html`

### Testing Documentation

- **Unit Testing Guide:** [docs/testing/unit-testing.md](./docs/testing/unit-testing.md)
- **E2E Testing Guide:** [docs/testing/e2e-testing.md](./docs/testing/e2e-testing.md)

## Documentation

- **User Guide:** [docs/user-guide/](./docs/user-guide/)
- **API Documentation:** [docs/api/](./docs/api/)
- **Architecture:** [docs/architecture/](./docs/architecture/)
- **Testing:** [docs/testing/](./docs/testing/)
- **Developer Guide:** [CLAUDE.md](./CLAUDE.md)

## Development Workflow

1. Create feature branch: `git checkout -b feature/<name>`
2. Implement feature with tests
3. Run checks: `pnpm lint && pnpm typecheck && pnpm test`
4. Update documentation and capture screenshots
5. Merge to main after testing

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Market data provided by [Alpha Vantage](https://www.alphavantage.co/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)

## Support

For support, please open an issue in the GitHub repository.

---

**Status:** 🚧 In Development

**Last Updated:** October 2025
