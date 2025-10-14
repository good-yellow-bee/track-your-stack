# Known Limitations - Track Your Stack v1.0

**Version**: 1.0
**Date**: 2025-10-12
**Status**: MVP Release
**Target Audience**: Beta users, developers, investors

---

## Overview

This document outlines the known limitations, missing features, and workarounds for Track Your Stack v1.0 (MVP). These limitations are documented transparently to set proper expectations with users and guide future development priorities.

**Version Scope**: This applies to the MVP release (Option B implementation path). See MASTER_PLAN_V2.md for the full roadmap addressing these limitations.

---

## 🔴 Critical Limitations

### 1. Tax Reporting - FIFO Only

**Limitation**: Only FIFO (First-In, First-Out) tax lot method is supported.

**Impact**:

- Cannot optimize tax strategy with LIFO or Specific ID
- May result in higher tax liability for users
- Not suitable for active traders with tax loss harvesting strategies

**Workaround**:

- Manual tax optimization with external tools (TurboTax, H&R Block)
- Export data to CSV and recalculate with preferred method

**Planned Fix**: Phase 2 (Full Roadmap) adds all tax lot methods

**Timeline**: 3-4 months post-MVP

---

### 2. No Dividend Tracking

**Limitation**: Dividends are not tracked or included in total return calculations.

**Impact**:

- **Total returns underreported by 30-40%** for dividend-paying stocks
- Cannot calculate dividend yield
- Misleading performance metrics for income-focused portfolios

**Workaround**:

- Manually track dividends in spreadsheet
- Use broker statements for accurate total returns
- Focus on price appreciation only (capital gains)

**Planned Fix**: Phase 2 (Full Roadmap)

**Timeline**: 2-3 months post-MVP (Iteration 1)

---

### 3. No Corporate Actions Support

**Limitation**: Stock splits, reverse splits, mergers, ticker changes are not automatically handled.

**Impact**:

- **Data corruption** when stock split occurs (quantity/price not adjusted)
- Manual correction required for each corporate action
- Risk of incorrect cost basis and tax reporting

**Workaround**:

- Monitor corporate actions manually (Yahoo Finance, broker alerts)
- Manually adjust quantity and price after splits
- Delete and re-add investment after ticker changes

**Planned Fix**: Phase 2 (Full Roadmap)

**Timeline**: 4-5 months post-MVP (Iteration 3)

---

### 4. No Multi-Factor Authentication (MFA)

**Limitation**: Only email/password authentication is available (via Google OAuth).

**Impact**:

- **Security risk** if credentials are compromised
- Not suitable for high-net-worth portfolios
- No compliance with enterprise security requirements

**Workaround**:

- Use strong, unique password (20+ characters)
- Enable Google Account MFA (protects OAuth flow)
- Monitor active sessions regularly

**Planned Fix**: Phase 0A (MVP Iteration) - HIGH PRIORITY

**Timeline**: 2 weeks post-MVP

---

### 5. Limited Audit Logging

**Limitation**: Only authentication events are logged (login, logout).

**Impact**:

- Cannot trace who made changes to portfolios
- Difficult to debug data issues
- No compliance trail for sensitive operations

**Workaround**:

- Export portfolio data regularly for backup
- Screenshot critical changes for personal records

**Planned Fix**: Phase 0A (MVP Iteration)

**Timeline**: 2 weeks post-MVP

---

## 🟡 High Priority Limitations

### 6. No Asset Allocation Visualization

**Limitation**: No pie charts or breakdown by asset type, sector, industry, or geography.

**Impact**:

- Cannot quickly assess portfolio diversification
- Difficult to identify concentration risk
- Universal feature among competitors (100% have this)

**Workaround**:

- Export to CSV and create charts in Excel/Google Sheets
- Use broker's asset allocation tools

**Planned Fix**: Phase 7 (Competitive Parity) - Week 21-22

**Timeline**: 5-6 months post-MVP (Iteration 2)

---

### 7. No Benchmarking

**Limitation**: Cannot compare portfolio performance against S&P 500, NASDAQ, or custom benchmarks.

**Impact**:

- Cannot answer "Am I beating the market?"
- No alpha/beta metrics
- Missing key performance context

**Workaround**:

- Manually compare returns with ETF performance (SPY, QQQ)
- Use Portfolio Visualizer for benchmark comparison

**Planned Fix**: Phase 7 (Competitive Parity) - Week 23-24

**Timeline**: 5-6 months post-MVP (Iteration 2)

---

### 8. No Goal Tracking

**Limitation**: No retirement planning, FIRE calculator, or savings goals.

**Impact**:

- Cannot track progress toward financial goals
- No projection of future portfolio value
- Missing top use case for portfolio trackers (70%+ of competitors have this)

**Workaround**:

- Use standalone retirement calculators (FIRECalc, Personal Capital)
- Manual goal tracking in spreadsheet

**Planned Fix**: Phase 7 (Competitive Parity) - Week 27-29

**Timeline**: 6-7 months post-MVP (Iteration 4)

---

### 9. No Price Alerts

**Limitation**: No automated notifications when prices hit target thresholds.

**Impact**:

- Must manually check prices for buy/sell opportunities
- May miss trading opportunities
- Reduced user engagement

**Workaround**:

- Set up price alerts on trading platform or Yahoo Finance
- Check dashboard regularly

**Planned Fix**: Phase 7 (Competitive Parity) - Week 25-26

**Timeline**: 5-6 months post-MVP (Iteration 3)

---

### 10. No Rebalancing Recommendations

**Limitation**: No automated suggestions for rebalancing portfolio to target allocations.

**Impact**:

- Manual calculation of buy/sell quantities needed
- Time-consuming rebalancing process
- May miss optimal rebalancing opportunities

**Workaround**:

- Use Portfolio Visualizer's rebalancing tool
- Manual calculation with spreadsheet

**Planned Fix**: Phase 7 (Competitive Parity) - Week 25-26

**Timeline**: 5-6 months post-MVP (Iteration 3)

---

## 🟢 Medium Priority Limitations

### 11. Transaction Fees Not Tracked

**Limitation**: Purchase fees, commissions, and transaction costs are not included in cost basis.

**Impact**:

- Slightly inaccurate cost basis (typically <1% error)
- May overstate returns by small amount

**Workaround**:

- Manually add fees to purchase price when entering
- Use zero-commission brokers (Robinhood, Webull) where fees are minimal

**Planned Fix**: Phase 2 (Business Logic Improvements)

**Timeline**: 3-4 months post-MVP

---

### 12. No Multi-Currency Conversion History

**Limitation**: Currency conversions use current rates, not historical rates at purchase time.

**Impact**:

- Slightly inaccurate returns for multi-currency portfolios
- Cannot calculate true forex gains/losses

**Workaround**:

- Use single currency for all purchases when possible
- Manually track forex gains separately

**Planned Fix**: Phase 2 (Business Logic Improvements)

**Timeline**: 3-4 months post-MVP

---

### 13. No Short Positions

**Limitation**: Only long positions are supported (buying stocks/crypto).

**Impact**:

- Cannot track short selling strategies
- Not suitable for hedge fund or sophisticated traders

**Workaround**:

- Track short positions in separate tool or spreadsheet
- Use for long-only strategies

**Planned Fix**: Phase 2 (Business Logic Improvements) - Low Priority

**Timeline**: 6-8 months post-MVP (if requested)

---

### 14. No Margin Accounts

**Limitation**: Margin accounts, borrowed funds, and leverage are not supported.

**Impact**:

- Cannot track margin interest expenses
- No leverage calculation
- Not suitable for margin traders

**Workaround**:

- Track margin interest separately
- Calculate leveraged returns manually

**Planned Fix**: Phase 2 (Business Logic Improvements) - Low Priority

**Timeline**: 6-8 months post-MVP (if requested)

---

### 15. No Options Trading

**Limitation**: Options, futures, and derivatives are not supported.

**Impact**:

- Cannot track options strategies (covered calls, spreads, etc.)
- Not suitable for options traders

**Workaround**:

- Use specialized options tracking tools (OptionNet Explorer)
- Track stocks only in Track Your Stack

**Planned Fix**: Future consideration (requires significant effort)

**Timeline**: 12+ months (if significant user demand)

---

### 16. Limited Asset Types

**Limitation**: Only stocks, ETFs, mutual funds, and cryptocurrency are supported.

**Impact**:

- Cannot track bonds, real estate, commodities, private equity
- Not suitable for diversified portfolios beyond equities

**Workaround**:

- Track other assets in separate tools
- Use Track Your Stack for equities only

**Planned Fix**: Phase 7 (Competitive Parity) - If Requested

**Timeline**: 8-10 months post-MVP

---

### 17. No Mobile App

**Limitation**: Mobile web is responsive, but no native iOS/Android app.

**Impact**:

- Slightly reduced mobile experience vs native app
- No offline access
- No push notifications (relies on email)

**Workaround**:

- Use mobile web browser (fully functional)
- Add to home screen for app-like experience

**Planned Fix**: Future consideration (requires mobile development team)

**Timeline**: 12+ months (if significant user demand)

---

### 18. No Watchlist

**Limitation**: Cannot track tickers without purchasing them.

**Impact**:

- Cannot monitor potential investments before buying
- Must use external tools for research

**Workaround**:

- Use Yahoo Finance, TradingView, or Seeking Alpha for watchlists
- Add to portfolio with 0 shares (workaround, not ideal)

**Planned Fix**: Phase 4 (Strategic Features)

**Timeline**: 4-5 months post-MVP

---

### 19. No Advanced Charts

**Limitation**: Basic price history only. No technical indicators (RSI, MACD, Bollinger Bands).

**Impact**:

- Cannot perform technical analysis
- Must use external charting tools (TradingView)

**Workaround**:

- Use TradingView for charting
- Focus on fundamental analysis

**Planned Fix**: Low priority (not in current roadmap)

**Timeline**: 12+ months (if requested)

---

### 20. No CSV Export (Custom Format)

**Limitation**: CSV export is available but format is fixed (not customizable).

**Impact**:

- May not match format expected by tax software or other tools
- Manual reformatting required

**Workaround**:

- Export CSV and reformat in Excel/Google Sheets
- Use API (if technical) for custom data extraction

**Planned Fix**: Phase 3 (UX Quick Wins)

**Timeline**: 3-4 months post-MVP

---

### 21. No Bulk Editing

**Limitation**: Cannot edit multiple investments at once (must edit one at a time).

**Impact**:

- Time-consuming for large portfolios
- Tedious error corrections

**Workaround**:

- CSV import for bulk updates (delete and re-import)
- Edit individually

**Planned Fix**: Phase 3 (UX Quick Wins)

**Timeline**: 3-4 months post-MVP

---

### 22. No Performance Attribution

**Limitation**: Cannot see which holdings contributed most to gains/losses.

**Impact**:

- Difficult to identify best/worst performers over time
- Cannot attribute performance to specific sectors or strategies

**Workaround**:

- Sort investments by gain/loss percentage
- Manual calculation with spreadsheet

**Planned Fix**: Phase 7 (Competitive Parity) - Week 30

**Timeline**: 7-8 months post-MVP

---

### 23. No GDPR Compliance (EU Users)

**Limitation**: Not fully GDPR compliant (data export, right to be forgotten implemented but not certified).

**Impact**:

- Not suitable for EU users requiring GDPR compliance
- Potential legal risk for EU operations

**Workaround**:

- US users not affected
- EU users accept risk or use alternative tool

**Planned Fix**: Phase 1 (Security Foundation) - If Expanding to EU

**Timeline**: 4-6 months (only if targeting EU market)

---

### 24. No API Access

**Limitation**: No public API for programmatic access to portfolio data.

**Impact**:

- Cannot integrate with other tools or build custom apps
- Manual data export required

**Workaround**:

- CSV export for data extraction
- Contact support for bulk access (case-by-case)

**Planned Fix**: Future consideration

**Timeline**: 12+ months (if significant developer demand)

---

### 25. No Multi-User Accounts

**Limitation**: No shared portfolios, family accounts, or advisor access.

**Impact**:

- Each person needs separate account
- Cannot collaborate with financial advisor or spouse

**Workaround**:

- Share login credentials (not recommended)
- Export data to share

**Planned Fix**: Future consideration (requires significant architecture changes)

**Timeline**: 12+ months (if B2B demand)

---

## 📊 Data & Accuracy Limitations

### 26. Price Update Frequency

**Limitation**: Prices update every 15 minutes during market hours (Alpha Vantage free tier limitation).

**Impact**:

- Not suitable for day trading or real-time monitoring
- May show stale prices

**Workaround**:

- Use broker or Yahoo Finance for real-time quotes
- Check Track Your Stack for end-of-day analysis

**Planned Fix**: Premium tier with real-time data (if monetization)

**Timeline**: 6-12 months (requires paid API tier)

---

### 27. Limited Historical Data

**Limitation**: Price history limited to what Alpha Vantage provides (varies by ticker).

**Impact**:

- Cannot calculate returns for very old holdings
- Limited historical charting

**Workaround**:

- Manually enter historical prices if needed
- Accept limited history for new investments

**Planned Fix**: Low priority (API limitation)

**Timeline**: Requires alternative data provider (future)

---

### 28. No Delisted Stock Support

**Limitation**: Cannot track delisted stocks (bankruptcies, acquisitions).

**Impact**:

- Holdings disappear from API data
- Cannot calculate final returns on delisted positions

**Workaround**:

- Mark as sold before delisting
- Manual record of delisting event

**Planned Fix**: Phase 2 (Corporate Actions) - Delisting Handler

**Timeline**: 4-5 months post-MVP

---

## 🔒 Security & Privacy Limitations

### 29. No Session Device Management

**Limitation**: Cannot see active sessions or revoke access from specific devices.

**Impact**:

- If credentials compromised, cannot force logout of attacker
- No visibility into unauthorized access

**Workaround**:

- Change password regularly
- Monitor account activity

**Planned Fix**: Phase 1 (Security Foundation) - Week 3

**Timeline**: 3-4 weeks post-MVP

---

### 30. No Two-Person Authorization

**Limitation**: No approval workflow for critical actions (large sales, account deletion).

**Impact**:

- Single person can make irreversible changes
- No protection against accidental deletions

**Workaround**:

- Export backups regularly
- Be cautious with delete operations

**Planned Fix**: Future consideration (enterprise feature)

**Timeline**: 12+ months (if enterprise demand)

---

## 💰 Monetization & Business Limitations

### 31. No Premium Tiers

**Limitation**: All features are free (for now).

**Impact**:

- No revenue model
- Sustainability unclear
- May introduce paywalls in future

**Workaround**:

- Enjoy free access during beta
- Provide feedback to influence future pricing

**Planned Fix**: Freemium model (after beta validation)

**Timeline**: 6-12 months (after product-market fit)

---

### 32. No Customer Support

**Limitation**: Limited support (email only, no live chat or phone).

**Impact**:

- Slow response to issues
- No immediate help for urgent problems

**Workaround**:

- Check documentation and FAQs first
- Use community Discord/forum (if available)

**Planned Fix**: Improved support with growth

**Timeline**: Scales with user base

---

## 🎯 User Experience Limitations

### 33. No Onboarding Tutorial

**Limitation**: No interactive guide for new users.

**Impact**:

- Steeper learning curve
- May miss key features

**Workaround**:

- Read documentation
- Watch video tutorials (if available)

**Planned Fix**: Phase 3 (UX Quick Wins)

**Timeline**: 3-4 months post-MVP

---

### 34. No Dark Mode

**Limitation**: Light mode only.

**Impact**:

- Eye strain for night use
- Preference for dark theme not accommodated

**Workaround**:

- Use browser extensions for dark mode (may not work perfectly)
- Adjust screen brightness

**Planned Fix**: Phase 3 (UX Quick Wins)

**Timeline**: 3-4 months post-MVP

---

### 35. No Keyboard Shortcuts

**Limitation**: No keyboard shortcuts for power users.

**Impact**:

- Mouse-only navigation
- Slower workflow for frequent users

**Workaround**:

- Use mouse or touchpad

**Planned Fix**: Phase 3 (UX Quick Wins) - Low Priority

**Timeline**: 6-8 months post-MVP

---

## 📱 Mobile & Accessibility Limitations

### 36. Limited Accessibility

**Limitation**: Basic WCAG 2.1 compliance only (not AA/AAA certified).

**Impact**:

- May not be fully accessible for users with disabilities
- Screen reader experience not optimized

**Workaround**:

- Use assistive technologies (screen readers work but not optimized)
- Contact support for accessibility help

**Planned Fix**: Phase 3 (UX Quick Wins) - Accessibility Sprint

**Timeline**: 3-4 months post-MVP

---

### 37. No Offline Mode

**Limitation**: Requires internet connection (no offline access).

**Impact**:

- Cannot view portfolio without connection
- No offline data entry

**Workaround**:

- Use mobile data or WiFi
- Take screenshots for offline reference

**Planned Fix**: Low priority (PWA caching possible)

**Timeline**: 8-12 months (if requested)

---

## 📈 Reporting & Analytics Limitations

### 38. No Custom Reports

**Limitation**: Cannot create custom reports or scheduled exports.

**Impact**:

- Limited to built-in reports
- Manual export required

**Workaround**:

- Export CSV and create custom reports in Excel
- Use third-party BI tools (if API available)

**Planned Fix**: Phase 4 (Strategic Features)

**Timeline**: 4-6 months post-MVP

---

### 39. No Annotations or Notes

**Limitation**: Cannot add notes to investments or transactions.

**Impact**:

- Cannot document investment thesis or reasons for trades
- No context for future reference

**Workaround**:

- Keep separate notes in Notion, Evernote, or Google Docs

**Planned Fix**: Phase 4 (Strategic Features)

**Timeline**: 5-6 months post-MVP

---

### 40. No Time-Weighted Returns (TWR)

**Limitation**: Only money-weighted returns (MWR) are calculated.

**Impact**:

- Cannot accurately compare performance with benchmarks
- Distorted by contribution timing

**Workaround**:

- Use MWR for personal tracking (still valuable)
- Calculate TWR manually if needed

**Planned Fix**: Phase 7 (Competitive Parity) - Performance Attribution

**Timeline**: 7-8 months post-MVP

---

## 🔧 Technical Limitations

### 41. No Data Versioning

**Limitation**: No audit trail of historical changes to investments or portfolios.

**Impact**:

- Cannot see history of edits
- Difficult to debug data issues
- No "undo" for accidental changes

**Workaround**:

- Export data before making changes
- Be careful with edits

**Planned Fix**: Phase 1 (Security Foundation) - Audit Logging

**Timeline**: 3-4 weeks post-MVP

---

### 42. Single Database (No Sharding)

**Limitation**: All data in single PostgreSQL database.

**Impact**:

- Performance may degrade with >100K users
- No geographic data isolation

**Workaround**:

- Not a concern for beta (<10K users)

**Planned Fix**: Future scaling (only if significant growth)

**Timeline**: 12+ months (only if needed)

---

## 🌍 Internationalization Limitations

### 43. English Only

**Limitation**: UI is English only (no translations).

**Impact**:

- Not accessible for non-English speakers

**Workaround**:

- Use browser translation (imperfect)

**Planned Fix**: Future (if international expansion)

**Timeline**: 12+ months (if targeting non-English markets)

---

### 44. US Tax Focus

**Limitation**: Tax reporting follows US tax rules (IRS).

**Impact**:

- Not suitable for non-US tax residents
- No support for UK, Canada, Australia, etc. tax rules

**Workaround**:

- Use for tracking only, calculate taxes separately

**Planned Fix**: Future (if international expansion)

**Timeline**: 12+ months (requires tax expertise per country)

---

## 🚨 Disclaimer

⚠️ **Important Legal Disclaimer**

Track Your Stack v1.0 is provided "AS IS" for informational and portfolio tracking purposes only. It is NOT:

- **Tax advice** - Consult a qualified CPA or tax advisor for tax filing
- **Investment advice** - Not a substitute for professional financial advice
- **Guaranteed accuracy** - Data may contain errors or inaccuracies
- **Real-time data** - Prices may be delayed or stale
- **Production-ready** - Beta software with known limitations

**By using Track Your Stack, you agree**:

- To independently verify all calculations and data
- Not to rely solely on this tool for tax reporting
- Not to hold Track Your Stack liable for errors or losses
- That this is beta software and may contain bugs

---

## Feedback & Feature Requests

We welcome feedback on these limitations!

**How to request features:**

1. Submit GitHub issue: [github.com/yourusername/track-your-stack/issues](https://github.com/yourusername/track-your-stack/issues)
2. Email: [support@trackyourstack.com](mailto:support@trackyourstack.com)
3. Discord community: [discord.gg/trackyourstack](https://discord.gg/trackyourstack)

**Priority factors:**

- Number of users requesting feature
- Business impact (tax reporting > cosmetic improvements)
- Implementation effort (quick wins prioritized)
- Competitive necessity (must-have vs nice-to-have)

---

## Version History

| Version       | Date       | Major Changes                                      |
| ------------- | ---------- | -------------------------------------------------- |
| 1.0 (MVP)     | 2025-10-12 | Initial release with 44 known limitations          |
| 1.1 (planned) | 2025-11    | MFA, audit logging, dividend tracking              |
| 2.0 (planned) | 2026-01    | Tax reporting, corporate actions, asset allocation |

---

**Last Updated**: 2025-10-12
**Next Review**: After MVP beta launch (user feedback)
**Owner**: Product Team
**Related**: [MASTER_PLAN_V2.md](./MASTER_PLAN_V2.md), [PROJECT_STATUS.md](./PROJECT_STATUS.md)
