# Magic MCP Integration Checklist

**Complete Workflow for Adding Magic-Generated Components**

Last Updated: 2025-10-10

## Overview

This checklist ensures consistent, high-quality integration of Magic MCP-generated components into Track Your Stack. Follow every step for each new component.

---

## Phase 1: Pre-Generation Planning

### ☐ 1.1 Decision Validation

- [ ] Reviewed [UI Component Selection Guide](./ui-component-selection-guide.md)
- [ ] Confirmed Magic MCP is appropriate choice (not shadcn/ui or custom)
- [ ] Identified component category: Data Table | Chart | Form | Other
- [ ] Checked if similar component already exists in project

**Why Magic MCP?**
_Write brief justification:_

---

### ☐ 1.2 Requirements Definition

- [ ] Listed all required features (sorting, filtering, pagination, etc.)
- [ ] Defined data structure and types
- [ ] Identified user interactions (click, hover, drag, etc.)
- [ ] Specified responsive behavior (desktop, tablet, mobile)
- [ ] Listed accessibility requirements

**Feature List:**

```
- Feature 1: [Description]
- Feature 2: [Description]
- Feature 3: [Description]
```

---

### ☐ 1.3 Component Planning

- [ ] Determined component save location
  - `components/investment/` for investment-related
  - `components/portfolio/` for portfolio-related
  - `components/dashboard/` for dashboard widgets
  - `components/ui/` for shared utilities
- [ ] Defined component name (PascalCase)
- [ ] Defined file name (kebab-case)
- [ ] Reviewed existing naming conventions

**Planned Location:** `components/[category]/[component-name].tsx`

---

### ☐ 1.4 Command Preparation

- [ ] Reviewed [Magic Command Library](./magic-commands.md) for similar examples
- [ ] Drafted Magic MCP command with all specifications
- [ ] Included styling requirements (shadcn/ui theme, Tailwind)
- [ ] Specified accessibility needs
- [ ] Reviewed command for clarity and completeness

**Draft Command:**

```
/ui create [component description]
[Paste full command here]
```

---

## Phase 2: Generation and Review

### ☐ 2.1 Component Generation

- [ ] Executed Magic MCP command in Claude Code
- [ ] Reviewed generated component code for quality
- [ ] Verified TypeScript types are correct
- [ ] Checked import statements are valid
- [ ] Confirmed component structure makes sense

**Generation Date:** _____________________

---

### ☐ 2.2 Initial Code Review

- [ ] All TypeScript types defined properly
- [ ] No `any` types (or justified if necessary)
- [ ] Props interface is well-structured
- [ ] Component name matches conventions (PascalCase)
- [ ] Imports use absolute paths (`@/components/*`)
- [ ] No console.log statements
- [ ] No hardcoded values that should be props

---

### ☐ 2.3 Styling Review

- [ ] Uses shadcn/ui theme variables (`bg-primary`, `text-foreground`)
- [ ] No hardcoded Tailwind colors (`bg-blue-500`)
- [ ] Responsive classes included (`md:`, `lg:`)
- [ ] Hover states use theme colors (`hover:bg-primary/90`)
- [ ] Focus states visible and accessible
- [ ] Spacing is consistent with project standards

**Styling Adjustments Made:**

```
- Replaced bg-blue-500 with bg-primary
- Added responsive breakpoints
- Updated hover states
```

---

## Phase 3: Customization and Integration

### ☐ 3.1 Save to Project

- [ ] Saved component to planned location
- [ ] File name uses kebab-case: `component-name.tsx`
- [ ] Git status checked (on feature branch, not main)
- [ ] File added to version control

**Actual Path:** `components/[category]/[component-name].tsx`

---

### ☐ 3.2 Type Definitions

- [ ] Created or updated type definitions
- [ ] Uses Prisma types where applicable
- [ ] Props interface exported
- [ ] Return type inferred or explicitly defined
- [ ] All types documented with JSDoc if complex

**Props Interface:**

```tsx
interface ComponentNameProps {
  data: Type[]
  onAction?: (item: Type) => void
  isLoading?: boolean
}
```

---

### ☐ 3.3 Business Logic Integration

- [ ] Added necessary business logic from `lib/calculations/`
- [ ] Integrated custom hooks from `lib/hooks/`
- [ ] Added currency formatting with `formatCurrency()`
- [ ] Added date formatting with `formatDate()`
- [ ] Connected to Server Actions if needed

**Business Logic Added:**

```
- calculateGainLoss()
- formatCurrency()
- useCurrencyConversion()
```

---

### ☐ 3.4 Code Documentation

- [ ] Added JSDoc comment to component function
- [ ] Documented complex logic with inline comments
- [ ] Added usage example in JSDoc
- [ ] Explained non-obvious behavior
- [ ] Documented props with descriptions

**Example:**

```tsx
/**
 * InvestmentDataTable Component
 *
 * Displays portfolio investments with sorting, filtering, and pagination.
 *
 * @example
 * ```tsx
 * <InvestmentDataTable
 *   investments={data}
 *   onRowClick={(inv) => router.push(`/investments/${inv.id}`)}
 * />
 * ```
 */
```

---

## Phase 4: Testing

### ☐ 4.1 Test File Creation

- [ ] Created test file: `__tests__/[component-name].test.tsx`
- [ ] Copied appropriate test template
- [ ] Updated test fixtures and mock data
- [ ] Removed inapplicable tests
- [ ] Added component-specific tests

**Test File:** `__tests__/[component-name].test.tsx`

---

### ☐ 4.2 Core Functionality Tests

- [ ] Rendering test (component renders without crashing)
- [ ] Props test (renders correctly with all props)
- [ ] Empty state test
- [ ] Loading state test
- [ ] Error state test

**Tests Written:** _____ / 5

---

### ☐ 4.3 Feature-Specific Tests

For **Data Tables:**

- [ ] Sorting tests (ascending, descending, multiple columns)
- [ ] Filtering tests (single, multi-select, clear)
- [ ] Search tests (debounced, clear, no results)
- [ ] Pagination tests (next, previous, page size)
- [ ] Row interaction tests (click, hover, expand)

For **Charts:**

- [ ] Data visualization tests
- [ ] Legend tests (show/hide, colors)
- [ ] Tooltip tests
- [ ] Date range tests
- [ ] Export tests

For **Forms:**

- [ ] Validation tests
- [ ] Submission tests
- [ ] Error handling tests
- [ ] Multi-step navigation tests

**Feature Tests Written:** _____ tests

---

### ☐ 4.4 Accessibility Tests

- [ ] jest-axe test (no violations)
- [ ] Keyboard navigation test
- [ ] ARIA labels test
- [ ] Screen reader announcements test
- [ ] Focus management test

**Accessibility Score:** ✅ Pass / ❌ Fail

---

### ☐ 4.5 Test Execution

- [ ] All tests pass: `pnpm test [component-name]`
- [ ] No console warnings or errors
- [ ] Test coverage > 80%
- [ ] No skipped tests without justification

**Test Results:**

```
Tests:       _____ passed, _____ total
Coverage:    _____ %
```

---

## Phase 5: Integration into Features

### ☐ 5.1 Component Usage

- [ ] Imported component in target page/feature
- [ ] Passed all required props
- [ ] Connected to data source (Server Component, API, etc.)
- [ ] Added error boundaries if necessary
- [ ] Wrapped with Suspense if async

**Usage Location:** `app/[path]/page.tsx`

---

### ☐ 5.2 Data Integration

- [ ] Connected to Prisma queries
- [ ] Added data transformations if needed
- [ ] Implemented error handling
- [ ] Added loading states
- [ ] Tested with real data

---

### ☐ 5.3 User Flow Testing

- [ ] Tested complete user journey
- [ ] Verified navigation works
- [ ] Tested with different data scenarios (empty, small, large datasets)
- [ ] Verified responsive behavior on multiple screen sizes
- [ ] Tested in different browsers (Chrome, Firefox, Safari)

**Devices Tested:**

- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Phase 6: Quality Assurance

### ☐ 6.1 Code Quality

- [ ] ESLint passes: `pnpm lint`
- [ ] TypeScript passes: `pnpm typecheck`
- [ ] Prettier formats correctly: `pnpm format:check`
- [ ] No unused imports or variables
- [ ] No TODO comments without issues created

**Quality Check Results:**

```
ESLint:     ✅ Pass / ❌ Fail
TypeScript: ✅ Pass / ❌ Fail
Prettier:   ✅ Pass / ❌ Fail
```

---

### ☐ 6.2 Performance Validation

- [ ] Component renders in < 100ms (for simple) or < 500ms (for complex)
- [ ] No unnecessary re-renders (use React DevTools Profiler)
- [ ] Memoization added where appropriate (`useMemo`, `useCallback`)
- [ ] Large lists virtualized if needed
- [ ] Images optimized (use Next.js Image component)

**Performance Metrics:**

```
Initial Render: _____ ms
Re-render:      _____ ms
Memory Usage:   _____ MB
```

---

### ☐ 6.3 Accessibility Validation

- [ ] Lighthouse Accessibility score > 90
- [ ] WAVE browser extension shows no errors
- [ ] Keyboard navigation works completely
- [ ] Screen reader tested (VoiceOver, NVDA, or JAWS)
- [ ] Color contrast ratios meet WCAG AA standards

**Lighthouse Score:** _____ / 100

---

### ☐ 6.4 Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Phase 7: Documentation

### ☐ 7.1 Code Documentation

- [ ] JSDoc comments added
- [ ] Complex logic explained
- [ ] Usage examples provided
- [ ] Props documented with descriptions

---

### ☐ 7.2 Project Documentation

- [ ] Added to component inventory (if maintaining one)
- [ ] Updated relevant user guide (`docs/user-guide/`)
- [ ] Added screenshots if UI component
- [ ] Updated changelog (`docs/changelog.md`)

**Documentation Updated:**

- [ ] User guide
- [ ] Changelog
- [ ] Component inventory
- [ ] Architecture docs

---

### ☐ 7.3 Screenshot Capture

For UI components:

- [ ] Captured default state screenshot
- [ ] Captured loading state
- [ ] Captured empty state
- [ ] Captured error state
- [ ] Captured mobile view
- [ ] Screenshots saved to `docs/[category]/screenshots/`

**Screenshots:** _____ captured

---

## Phase 8: Version Control and Review

### ☐ 8.1 Git Workflow

- [ ] All changes committed to feature branch (NOT main)
- [ ] Commit messages follow conventional commits format
- [ ] Commits are atomic (one logical change per commit)
- [ ] No merge conflicts
- [ ] Branch is up to date with main

**Branch Name:** `feature/[component-name]`

---

### ☐ 8.2 Pull Request Creation

- [ ] PR created with descriptive title
- [ ] PR description includes:
  - What was added/changed
  - Why this approach was taken
  - Screenshots (if UI change)
  - Testing performed
  - Related issues
- [ ] All CI checks pass
- [ ] No unrelated changes included

**PR Link:** [#_____](URL)

---

### ☐ 8.3 Code Review

- [ ] Requested review from team member(s)
- [ ] Addressed all review comments
- [ ] Re-requested review after changes
- [ ] Obtained approval(s)

**Reviewers:** _____________________

---

### ☐ 8.4 Final Checks Before Merge

- [ ] All tests pass
- [ ] All CI checks green
- [ ] No merge conflicts
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Feature branch up to date with main

---

## Phase 9: Deployment

### ☐ 9.1 Merge to Main

- [ ] PR merged via GitHub (not direct push)
- [ ] Feature branch deleted after merge
- [ ] Verified merge didn't break main branch
- [ ] CI/CD pipeline completed successfully

---

### ☐ 9.2 Production Verification

- [ ] Component works in production/staging
- [ ] No console errors in production
- [ ] Performance acceptable in production
- [ ] Analytics tracking works (if applicable)

---

### ☐ 9.3 Post-Deployment Monitoring

- [ ] Checked error monitoring (Sentry, etc.)
- [ ] Verified no new errors related to component
- [ ] Confirmed user interactions tracked properly
- [ ] Performance metrics within acceptable range

---

## Summary Checklist

Quick verification before marking complete:

- [ ] **Component generated** with Magic MCP
- [ ] **Styled consistently** with shadcn/ui theme
- [ ] **TypeScript types** properly defined
- [ ] **Tests written** and passing (>80% coverage)
- [ ] **Accessibility** validated (Lighthouse >90)
- [ ] **Responsive** on all device sizes
- [ ] **Documented** with JSDoc and project docs
- [ ] **Integrated** into feature successfully
- [ ] **Code reviewed** and approved
- [ ] **Deployed** to production successfully

---

## Common Pitfalls to Avoid

### ❌ Don't Do This

1. **Skip testing** - Always write tests before merging
2. **Hardcode colors** - Use theme variables only
3. **Work on main branch** - Always use feature branches
4. **Skip accessibility** - Test with keyboard and screen readers
5. **Ignore TypeScript errors** - Fix all type issues
6. **Commit untested code** - Run tests before committing
7. **Skip code review** - Always get review feedback
8. **Add without documentation** - Document all components

### ✅ Do This Instead

1. **Write tests first** or immediately after implementation
2. **Use theme variables** for all styling
3. **Create feature branch** before starting work
4. **Test accessibility** with tools and manual testing
5. **Fix all TypeScript** errors and warnings
6. **Run quality checks** before committing (`pnpm lint && pnpm typecheck && pnpm test`)
7. **Request review** from at least one team member
8. **Document as you build** to avoid forgetting details

---

## Tracking Progress

Use this checklist by creating a copy for each component:

```bash
# Create component-specific checklist
cp docs/architecture/magic-mcp-integration-checklist.md \
   docs/checklists/[component-name]-checklist.md

# Check off items as you complete them
# Commit checklist with component code
```

---

## Questions or Issues?

- **Documentation:** Check [Magic MCP Quick Start Guide](./magic-mcp-quickstart.md)
- **Commands:** Review [Magic Command Library](./magic-commands.md)
- **Templates:** Use [Component Templates](../../components/__templates/)
- **Testing:** Reference [Test Examples](__tests__/__examples__)
- **Team Help:** Ask in project Slack/Discord channel

---

**Completion Date:** _____________________

**Total Time:** _____ hours

**Notes:**

```
[Add any notes, learnings, or improvements for future components]
```

---

**Last Updated:** 2025-10-10
