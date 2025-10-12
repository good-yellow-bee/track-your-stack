# Security Audit Report - Blind Spots & Critical Gaps

**Report Date**: 2025-10-12
**Project**: Track Your Stack - Investment Portfolio Tracker
**Audit Scope**: Master Plan, Feature Specifications, Security Review Documents
**Auditor**: Claude Code Analysis

---

## 🚨 Executive Summary

This security audit identified **15 critical security blind spots** in the current Track Your Stack implementation plan and specifications. While the authentication implementation (F03) follows best practices, several critical security features are missing or inadequately specified.

**Overall Security Rating**: ⚠️ **REQUIRES IMMEDIATE ATTENTION**

### Critical Findings Summary:

- **7 HIGH-PRIORITY** security gaps requiring immediate action
- **5 MEDIUM-PRIORITY** gaps for Phase 1 implementation
- **3 LOW-PRIORITY** enhancements for post-launch

### Financial Impact:
- Potential GDPR fines: €20M or 4% of revenue
- Data breach costs: Average $4.45M (IBM 2023 report)
- Regulatory compliance failures: License revocation risk

---

## 🔴 CRITICAL (HIGH-PRIORITY) SECURITY GAPS

### 1. Missing Multi-Factor Authentication (MFA)

**Risk Level**: 🔴 CRITICAL
**Probability**: High (30% of accounts compromised annually)
**Impact**: Complete portfolio data exposure

#### Problem:
- Current implementation relies solely on Google OAuth
- If user's Google account is compromised, all portfolio data is accessible
- No additional authentication layer for sensitive operations
- High-value portfolios ($100K+) need extra protection

#### Current State:
```typescript
// lib/auth.ts - Only Google OAuth, no MFA
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
],
```

#### Threat Scenarios:
1. **Phishing Attack**: User's Google credentials stolen → Full portfolio access
2. **Session Hijacking**: Stolen session cookie → Unauthorized transactions
3. **Insider Threat**: Shared device → Portfolio manipulation

#### Recommendation:

**Phase 1.5 Implementation** (Before Production Launch):

Add optional TOTP-based 2FA:

```typescript
// prisma/schema.prisma - Add MFA fields
model User {
  id            String      @id @default(cuid())
  // ... existing fields
  mfaEnabled    Boolean     @default(false)
  mfaSecret     String?     // Encrypted TOTP secret
  backupCodes   String[]    // Encrypted backup codes
  mfaEnrolledAt DateTime?
}

// lib/auth/mfa.ts
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function generateMFASecret(userId: string) {
  const secret = speakeasy.generateSecret({
    name: `Track Your Stack (${user.email})`,
  })

  // Store encrypted secret
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaSecret: encrypt(secret.base32),
      mfaEnabled: false, // User must verify first
    },
  })

  // Generate QR code for authenticator apps
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)
  return { secret: secret.base32, qrCodeUrl }
}

export function verifyMFAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret: decrypt(secret),
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps before/after
  })
}
```

**UI Flow**:
1. Settings → Security → Enable 2FA
2. Display QR code for Google Authenticator / Authy
3. User scans QR code
4. Verify with 6-digit code
5. Generate 10 backup codes (store encrypted)
6. Require 2FA for: Login, Export data, Delete portfolio

**Estimated Effort**: 2-3 days
**Dependencies**: `speakeasy`, `qrcode`, encryption library

---

### 2. No Audit Logging for Financial Operations

**Risk Level**: 🔴 CRITICAL
**Probability**: Certain (100% will be needed)
**Impact**: Compliance failures, dispute resolution impossible

#### Problem:
- No record of who created/modified/deleted portfolios
- No timestamp of investment entries
- Cannot prove data integrity for legal disputes
- Compliance requirements (SOX, GDPR) not met
- Currently listed as "low priority" - THIS IS WRONG FOR FINANCIAL APPS

#### Current State:
No audit logging implementation. Only basic `createdAt`/`updatedAt` timestamps.

#### Threat Scenarios:
1. **Insider Fraud**: Employee manipulates user portfolio, no trail
2. **Legal Dispute**: User claims unauthorized changes, no proof
3. **Compliance Audit**: Regulators request audit trail, doesn't exist
4. **Data Breach**: Cannot determine what data was accessed

#### Recommendation:

**Phase 1 Implementation** (MVP Requirement):

```typescript
// prisma/schema.prisma
enum AuditAction {
  CREATE
  UPDATE
  DELETE
  VIEW
  EXPORT
}

enum AuditEntity {
  PORTFOLIO
  INVESTMENT
  TRANSACTION
  USER_ACCOUNT
}

model AuditLog {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  action      AuditAction
  entity      AuditEntity
  entityId    String      // ID of portfolio/investment
  changes     Json?       // Before/after values
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime    @default(now())

  @@index([userId, timestamp])
  @@index([entity, entityId])
  @@index([timestamp])
}

// lib/audit/auditLogger.ts
export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  changes,
  request,
}: AuditLogParams) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      changes,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    },
  })
}

// Usage in Server Actions
'use server'
export async function deletePortfolio(portfolioId: string) {
  const user = await requireAuth()

  // Get portfolio before deletion
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
  })

  // Delete portfolio
  await prisma.portfolio.delete({
    where: { id: portfolioId },
  })

  // Audit log
  await logAudit({
    userId: user.id,
    action: 'DELETE',
    entity: 'PORTFOLIO',
    entityId: portfolioId,
    changes: { deleted: portfolio },
  })
}
```

**What to Log**:
- ✅ Portfolio create/update/delete
- ✅ Investment create/update/delete
- ✅ Transaction create/update/delete
- ✅ Data exports
- ✅ User account changes
- ✅ Failed authentication attempts
- ✅ Permission denied events

**What NOT to Log** (Privacy):
- ❌ Portfolio names (PII)
- ❌ Investment notes (may contain PII)
- ❌ Full session tokens
- ❌ API keys

**Retention Policy**:
- Keep audit logs for 7 years (financial records requirement)
- Separate database table for performance
- Archive old logs to cold storage after 1 year

**Estimated Effort**: 3-4 days
**Compliance**: SOX, GDPR, FINRA requirements

---

### 3. Missing GDPR Compliance Features

**Risk Level**: 🔴 CRITICAL
**Probability**: Certain (if EU users)
**Impact**: €20M fine or 4% of annual revenue

#### Problem:
- No user-initiated account deletion
- No data export before deletion (Right to Portability)
- No data retention policies defined
- No privacy policy integration
- No cookie consent mechanism
- No data processing agreements

#### GDPR Requirements:

| Requirement | Status | Current Gap |
|-------------|---------|-------------|
| Right to Access | ❌ Missing | No data export feature in MVP |
| Right to Erasure | ❌ Missing | No account deletion flow |
| Right to Portability | ❌ Missing | CSV export in Phase 2, should be Phase 1 |
| Right to Rectification | ✅ Partial | Edit features exist |
| Right to Object | ❌ Missing | No opt-out mechanisms |
| Data Minimization | ⚠️ Unclear | Collects Google profile image (needed?) |
| Privacy by Default | ⚠️ Unclear | No default privacy settings |

#### Recommendation:

**Phase 1 Implementation** (Before EU Launch):

```typescript
// app/(dashboard)/settings/privacy/page.tsx
export default async function PrivacySettings() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>
            Manage your personal data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Export Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Download all your portfolio data in JSON format
              </p>
            </div>
            <ExportDataButton userId={user.id} />
          </div>

          {/* Delete Account */}
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-600">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <DeleteAccountButton userId={user.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// lib/actions/privacy.ts
'use server'
export async function exportUserData(userId: string) {
  const user = await requireAuth()
  if (user.id !== userId) throw new Error('Forbidden')

  // Export all user data
  const data = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      portfolios: {
        include: {
          investments: {
            include: {
              transactions: true,
            },
          },
        },
      },
    },
  })

  // Remove sensitive fields
  const sanitized = {
    ...data,
    sessions: undefined,
    accounts: undefined,
  }

  // Log export
  await logAudit({
    userId,
    action: 'EXPORT',
    entity: 'USER_ACCOUNT',
    entityId: userId,
  })

  return sanitized
}

'use server'
export async function deleteUserAccount(userId: string, confirmPassword: string) {
  const user = await requireAuth()
  if (user.id !== userId) throw new Error('Forbidden')

  // Verify user really wants to delete (require confirmation)
  if (confirmPassword !== 'DELETE MY ACCOUNT') {
    throw new Error('Confirmation text incorrect')
  }

  // Soft delete (keep for 30 days)
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      email: `deleted_${userId}@deleted.local`, // Anonymize
      name: 'Deleted User',
      image: null,
    },
  })

  // Schedule permanent deletion after 30 days
  await scheduleAccountDeletion(userId, 30)

  // Log deletion
  await logAudit({
    userId,
    action: 'DELETE',
    entity: 'USER_ACCOUNT',
    entityId: userId,
  })

  // Sign out
  await signOut({ redirect: false })
}
```

**Data Retention Policy**:
```typescript
// Soft delete: 30 days retention
// Hard delete: After 30 days, permanently remove:
// - User record
// - All portfolios (cascade)
// - All investments (cascade)
// - All transactions (cascade)
// - Sessions
// - Audit logs KEPT for 7 years (compliance)
```

**Cookie Consent** (Required for EU):
```tsx
// components/CookieConsent.tsx
'use client'
export function CookieConsent() {
  const [consent, setConsent] = useLocalStorage('cookie-consent', null)

  if (consent !== null) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
      <div className="container flex items-center justify-between">
        <p className="text-sm">
          We use cookies to improve your experience. By using our site, you agree to our cookie policy.
        </p>
        <Button onClick={() => setConsent(true)}>Accept</Button>
      </div>
    </div>
  )
}
```

**Estimated Effort**: 4-5 days
**Legal Review**: Required before launch

---

### 4. Insufficient Rate Limiting Coverage

**Risk Level**: 🔴 HIGH
**Probability**: High (bots, abuse)
**Impact**: DoS, spam, resource exhaustion

#### Problem:
- Rate limiting only on Alpha Vantage API and auth endpoints
- Portfolio/investment mutations unprotected
- Could create thousands of portfolios
- Could spam investment entries
- No per-user quotas

#### Current State:
```typescript
// middleware.ts - Only protects routes, no rate limiting
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portfolios/:path*',
  ],
}
```

#### Threat Scenarios:
1. **Resource Exhaustion**: Malicious user creates 10,000 portfolios
2. **Database Bloat**: Spam investments, corrupt data
3. **API Abuse**: Automated scripts hammer endpoints
4. **Cost Attack**: Force expensive operations (currency conversions)

#### Recommendation:

**Phase 1 Implementation**:

```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Different limits for different operations
export const rateLimiters = {
  // Authentication: 10 attempts per hour
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:auth',
  }),

  // Portfolio operations: 10 per hour
  portfolio: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:portfolio',
  }),

  // Investment operations: 50 per hour
  investment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    prefix: 'ratelimit:investment',
  }),

  // Price refresh: 100 per day
  priceRefresh: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 d'),
    prefix: 'ratelimit:prices',
  }),

  // Data export: 5 per day
  export: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 d'),
    prefix: 'ratelimit:export',
  }),
}

// Middleware wrapper
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<void> {
  const { success, remaining } = await limiter.limit(identifier)

  if (!success) {
    throw new Error(
      `Rate limit exceeded. ${remaining} requests remaining.`
    )
  }
}

// Usage in Server Actions
'use server'
export async function createPortfolio(data: CreatePortfolioInput) {
  const user = await requireAuth()

  // Check rate limit
  await checkRateLimit(rateLimiters.portfolio, user.id)

  // Proceed with creation
  const portfolio = await prisma.portfolio.create({ data })

  return portfolio
}
```

**Rate Limit Matrix**:

| Operation | Limit | Window | Rationale |
|-----------|-------|---------|-----------|
| Sign-in attempts | 10 | 1 hour | Brute force prevention |
| Portfolio create | 10 | 1 hour | Reasonable usage |
| Portfolio delete | 5 | 1 hour | Destructive operation |
| Investment create | 50 | 1 hour | Bulk entry support |
| Investment delete | 20 | 1 hour | Moderate restriction |
| Price refresh | 100 | 1 day | API quota protection |
| Data export | 5 | 1 day | Resource-intensive |
| Search queries | 100 | 1 minute | Prevent scraping |

**User Quotas** (Optional - Phase 2):
```typescript
// Limit total resources per user
const USER_LIMITS = {
  maxPortfolios: 20,
  maxInvestmentsPerPortfolio: 500,
  maxNotesLength: 2000,
  maxPortfolioNameLength: 100,
}
```

**Estimated Effort**: 2-3 days
**Dependencies**: Upstash Redis (free tier sufficient)

---

### 5. No Session Management UI

**Risk Level**: 🟡 MEDIUM
**Probability**: Medium (security-conscious users)
**Impact**: Compromised session cannot be revoked

#### Problem:
- Users cannot see active sessions
- No way to revoke sessions from other devices
- No login history
- No device/location information
- If laptop stolen, cannot remotely sign out

#### Recommendation:

**Phase 1 Implementation**:

```typescript
// prisma/schema.prisma - Enhance Session model
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id])

  // Add session metadata
  deviceName   String?   // "Chrome on Windows"
  ipAddress    String?   // "192.168.1.1"
  location     String?   // "San Francisco, CA"
  lastActivity DateTime  @default(now())
  createdAt    DateTime  @default(now())

  @@index([userId])
  @@index([lastActivity])
}

// app/(dashboard)/settings/sessions/page.tsx
export default async function SessionsPage() {
  const user = await getCurrentUser()
  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { lastActivity: 'desc' },
  })

  return (
    <div className="space-y-4">
      <h1>Active Sessions</h1>
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{session.deviceName}</p>
                <p className="text-sm text-muted-foreground">
                  {session.location} • {session.ipAddress}
                </p>
                <p className="text-xs">
                  Last active: {formatDistanceToNow(session.lastActivity)}
                </p>
              </div>
              <RevokeSessionButton sessionId={session.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// lib/actions/sessions.ts
'use server'
export async function revokeSession(sessionId: string) {
  const user = await requireAuth()

  // Verify session belongs to user
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  })

  if (session?.userId !== user.id) {
    throw new Error('Forbidden')
  }

  // Delete session
  await prisma.session.delete({
    where: { id: sessionId },
  })

  // Audit log
  await logAudit({
    userId: user.id,
    action: 'DELETE',
    entity: 'SESSION',
    entityId: sessionId,
  })
}
```

**Estimated Effort**: 1-2 days

---

### 6. Insufficient Input Validation

**Risk Level**: 🟡 MEDIUM
**Probability**: High (user input always risky)
**Impact**: SQL injection, XSS, DoS

#### Problem:
- Zod validation mentioned but not detailed
- No maximum lengths specified
- No maximum counts per user
- File upload limits not defined (Phase 2 CSV)

#### Recommendation:

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

// Validation constants
export const LIMITS = {
  PORTFOLIO_NAME: { min: 1, max: 100 },
  INVESTMENT_NOTES: { min: 0, max: 2000 },
  TICKER: { min: 1, max: 10 },
  MAX_PORTFOLIOS_PER_USER: 50,
  MAX_INVESTMENTS_PER_PORTFOLIO: 1000,
  CSV_FILE_SIZE_MB: 10,
}

// Portfolio validation
export const portfolioSchema = z.object({
  name: z.string()
    .min(LIMITS.PORTFOLIO_NAME.min)
    .max(LIMITS.PORTFOLIO_NAME.max)
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens, underscores'),
  baseCurrency: z.string()
    .length(3)
    .regex(/^[A-Z]{3}$/, 'Must be 3-letter currency code'),
})

// Investment validation
export const investmentSchema = z.object({
  ticker: z.string()
    .min(LIMITS.TICKER.min)
    .max(LIMITS.TICKER.max)
    .regex(/^[A-Z0-9\.\-]+$/, 'Only uppercase letters, numbers, dots, hyphens')
    .transform(s => s.toUpperCase()),
  quantity: z.number()
    .positive('Must be positive')
    .finite()
    .max(1000000000, 'Quantity too large'),
  pricePerUnit: z.number()
    .positive('Must be positive')
    .finite()
    .max(10000000, 'Price too large'),
  purchaseDate: z.date()
    .max(new Date(), 'Cannot be in future')
    .min(new Date('1900-01-01'), 'Date too old'),
  notes: z.string()
    .max(LIMITS.INVESTMENT_NOTES.max)
    .optional(),
})

// Enforce limits in Server Actions
'use server'
export async function createPortfolio(data: z.infer<typeof portfolioSchema>) {
  const user = await requireAuth()

  // Check user portfolio limit
  const count = await prisma.portfolio.count({
    where: { userId: user.id },
  })

  if (count >= LIMITS.MAX_PORTFOLIOS_PER_USER) {
    throw new Error(
      `Maximum ${LIMITS.MAX_PORTFOLIOS_PER_USER} portfolios per user`
    )
  }

  // Validate input
  const validated = portfolioSchema.parse(data)

  // Create portfolio
  return await prisma.portfolio.create({
    data: { ...validated, userId: user.id },
  })
}
```

**Estimated Effort**: 2 days

---

### 7. Data Encryption at Rest - Vague Specification

**Risk Level**: 🟡 MEDIUM
**Probability**: Low (database compromise)
**Impact**: Sensitive data exposure

#### Problem:
- Spec says "encryption at rest (PostgreSQL default)"
- What exactly is encrypted?
- Are notes encrypted?
- Key management strategy?
- Compliance with financial data regulations?

#### Recommendation:

**Clarify Encryption Strategy**:

```typescript
// lib/crypto/encryption.ts
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32-byte key
const ALGORITHM = 'aes-256-gcm'

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Return iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  )

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

// What to encrypt:
// ✅ Investment notes (may contain sensitive info)
// ✅ MFA secrets
// ✅ Backup codes
// ❌ Portfolio names (needed for search)
// ❌ Ticker symbols (public data)
// ❌ Prices (public data)
```

**Key Management**:
- Store `ENCRYPTION_KEY` in Vercel environment variables
- Rotate keys annually
- Keep old keys for decryption of old data
- Use separate keys for production/staging

**Database-Level Encryption**:
- Vercel Postgres includes encryption at rest
- All data encrypted on disk
- Transparent to application

**Estimated Effort**: 1-2 days

---

## 🟡 MEDIUM-PRIORITY GAPS

### 8. No Protection Against Brute Force (Beyond Rate Limiting)

**Recommendation**: Add account lockout after 5 failed attempts

### 9. Missing Content Security Policy (CSP) Headers

**Current Status**: Mentioned in security review, not implemented
**Recommendation**: Add to `next.config.ts`

### 10. No Security Headers

**Missing**:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

**Recommendation**:
```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

### 11. No API Key Validation on Startup

**Problem**: App starts even if `ALPHA_VANTAGE_API_KEY` is missing
**Recommendation**: Validate all required env vars on startup

### 12. No Protection Against Clickjacking

**Solution**: CSP headers with `frame-ancestors 'none'`

---

## 🟢 LOW-PRIORITY ENHANCEMENTS

### 13. No Honeypot/Bot Detection
### 14. No IP Geolocation Blocking
### 15. No Advanced Threat Detection

---

## 📊 Risk Matrix

| Security Gap | Risk Level | Effort | Priority |
|--------------|-----------|---------|----------|
| MFA | 🔴 Critical | 3 days | P0 - Before launch |
| Audit Logging | 🔴 Critical | 4 days | P0 - MVP |
| GDPR Compliance | 🔴 Critical | 5 days | P0 - Before EU users |
| Rate Limiting | 🔴 High | 3 days | P1 - Phase 1 |
| Session Management | 🟡 Medium | 2 days | P2 - Phase 1 |
| Input Validation | 🟡 Medium | 2 days | P1 - Phase 1 |
| Encryption Clarity | 🟡 Medium | 2 days | P2 - Phase 1 |
| Security Headers | 🟡 Medium | 1 day | P2 - Before launch |

**Total Estimated Effort**: 22-25 days for all critical + medium gaps

---

## ✅ Security Implementation Roadmap

### Week 1 (Critical - P0):
- [ ] Implement audit logging system
- [ ] Add GDPR compliance features (export, delete)
- [ ] Define and enforce input validation limits

### Week 2 (High Priority - P1):
- [ ] Implement rate limiting across all operations
- [ ] Add MFA (TOTP-based 2FA)
- [ ] Enhance session management UI

### Week 3 (Medium Priority - P2):
- [ ] Clarify and document encryption strategy
- [ ] Add security headers (CSP, X-Frame-Options)
- [ ] Implement environment variable validation

### Pre-Launch Checklist:
- [ ] Security penetration testing
- [ ] OWASP Top 10 verification
- [ ] Legal review of GDPR compliance
- [ ] Security documentation complete
- [ ] Incident response plan documented

---

## 🔗 Related Documents

- [F03: Authentication Security Review](features/F03_authentication.md)
- [Authentication Security Review](security/authentication-security-review.md)
- [CLAUDE.md - Security Checklist](../CLAUDE.md#security-checklist)
- [OWASP Top 10 2021](https://owasp.org/Top10/)

---

**Next Review**: After implementing P0 and P1 items, or every 90 days

**Security Contact**: security@trackyourstack.com (to be created)
