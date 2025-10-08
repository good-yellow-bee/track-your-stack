# F01: Project Setup & Configuration

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 1-2 days
**Dependencies:** None

---

## 📋 Overview

Initialize the Next.js 15 project with TypeScript, Tailwind CSS, and all necessary dependencies. Configure development environment, linting, formatting, and set up project structure.

**What this enables:**
- Modern Next.js 15 App Router application
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui component library
- ESLint & Prettier for code quality
- Git repository with proper .gitignore

---

## 🎯 Acceptance Criteria

- [ ] Next.js 15 project created with App Router
- [ ] TypeScript configured and working
- [ ] Tailwind CSS installed and configured
- [ ] shadcn/ui initialized with base components
- [ ] All core dependencies installed
- [ ] ESLint configured with no errors
- [ ] Prettier configured and working
- [ ] `.env.local` template created
- [ ] Development server runs without errors
- [ ] Git repository initialized with initial commit
- [ ] README.md exists with setup instructions
- [ ] Project builds successfully

---

## 📦 Dependencies to Install

### Core Dependencies
```bash
pnpm add next@latest react@latest react-dom@latest
pnpm add @prisma/client @auth/prisma-adapter next-auth@beta
pnpm add zod react-hook-form @hookform/resolvers
pnpm add @tanstack/react-query axios
pnpm add recharts lucide-react
pnpm add date-fns clsx tailwind-merge
```

### Dev Dependencies
```bash
pnpm add -D prisma
pnpm add -D typescript @types/node @types/react @types/react-dom
pnpm add -D eslint eslint-config-next
pnpm add -D prettier prettier-plugin-tailwindcss
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### shadcn/ui Components (Initial Set)
```bash
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button input label card dialog form select table dropdown-menu
```

---

## 🔧 Implementation Steps

### Step 1: Create Next.js Project (30 min)

```bash
# Navigate to project directory
cd /Users/storm/PhpstormProjects/track-your-stack

# Initialize Next.js (interactive prompts)
npx create-next-app@latest . --typescript --tailwind --app --import-alias "@/*" --use-pnpm

# Confirm prompts:
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? No
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? Yes (@/*)
# ✔ What import alias would you like configured? @/*
```

### Step 2: Install Core Dependencies (20 min)

```bash
# Authentication & Database
pnpm add @prisma/client @auth/prisma-adapter next-auth@beta
pnpm add -D prisma

# Form Handling & Validation
pnpm add zod react-hook-form @hookform/resolvers

# Data Fetching & State
pnpm add @tanstack/react-query axios

# Charts & Icons
pnpm add recharts lucide-react

# Utilities
pnpm add date-fns clsx tailwind-merge
```

### Step 3: Configure ESLint (15 min)

Create `.eslintrc.json`:
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "prefer-const": "error"
  }
}
```

### Step 4: Configure Prettier (10 min)

Create `.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Create `.prettierignore`:
```
.next
node_modules
.vercel
out
build
dist
```

### Step 5: Configure TypeScript (10 min)

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 6: Initialize shadcn/ui (20 min)

```bash
# Initialize shadcn/ui
pnpm dlx shadcn-ui@latest init

# Prompts:
# ✔ Would you like to use TypeScript? Yes
# ✔ Which style would you like to use? Default
# ✔ Which color would you like to use as base color? Slate
# ✔ Where is your global CSS file? app/globals.css
# ✔ Would you like to use CSS variables for colors? Yes
# ✔ Where is your tailwind.config.js located? tailwind.config.ts
# ✔ Configure the import alias for components? @/components
# ✔ Configure the import alias for utils? @/lib/utils

# Install initial components
pnpm dlx shadcn-ui@latest add button input label card dialog form select table dropdown-menu
```

### Step 7: Create Environment Variables Template (10 min)

Create `.env.example`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/track_your_stack"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with: openssl rand -base64 32"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="your_client_id_here"
GOOGLE_CLIENT_SECRET="your_client_secret_here"

# Alpha Vantage API (from alphavantage.co)
ALPHA_VANTAGE_API_KEY="your_api_key_here"
```

Create `.env.local` (not committed):
```bash
# Copy from .env.example and fill in actual values
cp .env.example .env.local
```

### Step 8: Add npm Scripts (10 min)

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

### Step 9: Create Basic Project Structure (15 min)

```bash
# Create directory structure
mkdir -p app/(auth)/auth/signin
mkdir -p app/(dashboard)/dashboard
mkdir -p app/(dashboard)/portfolios/[id]
mkdir -p app/api/auth/[...nextauth]
mkdir -p components/ui
mkdir -p components/portfolio
mkdir -p components/investment
mkdir -p components/layout
mkdir -p lib/actions
mkdir -p lib/api
mkdir -p lib/calculations
mkdir -p prisma
mkdir -p types
```

### Step 10: Create Utility Files (20 min)

Create `lib/utils.ts` (if not created by shadcn):
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Create `lib/constants.ts`:
```typescript
export const APP_NAME = "Track Your Stack"
export const APP_DESCRIPTION = "Investment Portfolio Tracker"

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
] as const

export const ASSET_TYPES = [
  { value: "STOCK", label: "Stock" },
  { value: "ETF", label: "ETF" },
  { value: "MUTUAL_FUND", label: "Mutual Fund" },
  { value: "CRYPTO", label: "Cryptocurrency" },
] as const

export const PRICE_CACHE_TTL = {
  STOCK: 15 * 60 * 1000, // 15 minutes
  CRYPTO: 5 * 60 * 1000, // 5 minutes
  CURRENCY: 60 * 60 * 1000, // 1 hour
} as const
```

### Step 11: Test Development Server (10 min)

```bash
# Start development server
pnpm dev

# Verify:
# - Server starts without errors
# - Opens http://localhost:3000
# - Default Next.js page loads
# - No console errors
```

### Step 12: Run Quality Checks (15 min)

```bash
# Type checking
pnpm typecheck
# Should pass with no errors

# Linting
pnpm lint
# Should pass with no errors

# Formatting check
pnpm format:check
# Should pass

# Build
pnpm build
# Should build successfully
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] Development server starts: `pnpm dev`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] Formatting is correct: `pnpm format:check`
- [ ] Project builds successfully: `pnpm build`
- [ ] Production server starts: `pnpm start`
- [ ] All directories created properly
- [ ] `.env.example` exists
- [ ] `.gitignore` properly configured

### Verification Commands
```bash
# All checks in one go
pnpm typecheck && pnpm lint && pnpm format:check && pnpm build
```

---

## 📚 Documentation Updates

### Files to Create/Update
- [ ] `README.md` - Add setup instructions
- [ ] `docs/architecture/project-structure.md` - Document folder organization
- [ ] `docs/changelog.md` - Add initial setup entry

### Changelog Entry
```markdown
## [0.1.0] - 2025-10-08

### Added
- Initial Next.js 15 project setup with TypeScript
- Tailwind CSS configuration
- shadcn/ui component library
- ESLint and Prettier configuration
- Project structure and directory organization
- Environment variables template
- Development scripts for building, linting, and formatting
```

---

## 🔀 Git Workflow

### Branch Name
```bash
git checkout -b feature/project-setup
```

### Commit Messages
```bash
git commit -m "chore: initialize Next.js 15 project with TypeScript

- Setup Next.js 15 with App Router
- Configure TypeScript with strict mode
- Add Tailwind CSS configuration
- Initialize shadcn/ui component library"

git commit -m "chore: configure development tools

- Add ESLint configuration
- Add Prettier configuration
- Setup pre-commit hooks
- Add npm scripts for development"

git commit -m "chore: create project structure

- Create directory structure for app routes
- Add utility files and constants
- Setup environment variables template
- Add initial documentation"
```

### Pull Request Template
```markdown
## F01: Project Setup & Configuration

### What does this PR do?
Initializes the Next.js 15 project with all necessary dependencies and configuration.

### Type of change
- [x] Initial setup
- [x] Configuration

### Checklist
- [x] Next.js 15 initialized
- [x] TypeScript configured
- [x] Tailwind CSS working
- [x] shadcn/ui initialized
- [x] ESLint configured
- [x] Prettier configured
- [x] Project structure created
- [x] Development server runs
- [x] Build succeeds

### Testing performed
- Verified dev server starts without errors
- Confirmed TypeScript compilation works
- Tested ESLint and Prettier
- Successfully built for production
```

---

## ⚠️ Common Issues & Solutions

### Issue: Module not found errors
**Solution:** Run `pnpm install` to ensure all dependencies are installed

### Issue: TypeScript errors after setup
**Solution:** Restart VS Code or run `pnpm typecheck` to regenerate types

### Issue: Prettier not formatting
**Solution:** Install Prettier extension in VS Code and enable "Format on Save"

### Issue: shadcn/ui components not found
**Solution:** Verify `components.json` was created and paths are correct

### Issue: Environment variables not loading
**Solution:** Restart dev server after creating `.env.local`

---

## 📦 Deliverables

After completing this feature, you should have:

- [x] Working Next.js 15 application
- [x] All dependencies installed
- [x] Development tools configured
- [x] Project structure created
- [x] Environment variables template
- [x] Git repository with initial commit
- [x] README with setup instructions

---

## 🔗 Related Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `tailwind.config.ts` - Tailwind configuration
- `next.config.js` - Next.js configuration
- `components.json` - shadcn/ui configuration

---

## ⏭️ Next Feature

After completing F01, proceed to:
→ [F02: Database Schema & Prisma](F02_database_schema.md)

---

**Status Legend:**
- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked
