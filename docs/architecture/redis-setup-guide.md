# Redis Setup Guide

## Overview

Track Your Stack uses Redis (via Upstash) for distributed locking and rate limiting in production environments. Redis is **optional in development** (the app falls back to in-memory implementations) but **required for production** to ensure correct behavior across multiple server instances.

## Why Redis?

### Problems Solved

1. **Distributed Locks:** Prevents race conditions when multiple server instances try to update the same cached data simultaneously
2. **Rate Limiting:** Ensures accurate rate limit tracking across server restarts and serverless function invocations
3. **Serverless Compatibility:** Works perfectly with Vercel, AWS Lambda, and other serverless platforms

### Without Redis (Development)

- In-memory locks (works only within single process)
- In-memory rate limiting (resets on server restart)
- Suitable for local development only

### With Redis (Production)

- Distributed locks across all server instances
- Persistent rate limiting across deployments
- Production-ready distributed system

## Upstash Redis Setup

### Why Upstash?

- **Serverless-native:** REST API works perfectly with edge functions
- **Free tier:** 10,000 commands/day free
- **Global replication:** Low latency worldwide
- **No connection pooling needed:** HTTP-based, no persistent connections

### Step 1: Create Upstash Account

1. Go to [https://console.upstash.com/](https://console.upstash.com/)
2. Sign up with GitHub, Google, or email
3. Verify your email address

### Step 2: Create Redis Database

1. Click **"Create Database"**
2. Configure your database:
   - **Name:** `track-your-stack-prod` (or your preferred name)
   - **Type:** Regional (cheaper) or Global (lower latency worldwide)
   - **Region:** Choose closest to your deployment region
     - Vercel US East: `us-east-1`
     - Vercel EU: `eu-west-1`
     - Vercel Asia: `ap-southeast-1`
   - **Eviction:** No eviction (we manage TTLs ourselves)
3. Click **"Create"**

### Step 3: Get Connection Details

1. Click on your newly created database
2. Scroll to **"REST API"** section
3. Copy the following:
   - **UPSTASH_REDIS_REST_URL:** `https://your-instance.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN:** `AX...` (long token string)

### Step 4: Add to Environment Variables

**Local Development (`.env.local`):**

```bash
# Optional - app works without Redis in development
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token_here"
```

**Vercel Production:**

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add both variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Select **Production** environment
5. Click **Save**

**Other Platforms:**

- **Netlify:** Site settings → Environment variables
- **AWS Lambda:** Environment variables in Lambda configuration
- **Railway:** Variables tab in project settings

## Verification

### Check Redis Connection

Run the app and check logs:

```bash
pnpm dev
```

Look for:

```
✅ Environment variables validated successfully
```

If Redis is configured, distributed locks and rate limiting will use Redis. Otherwise, they'll fall back to in-memory implementations.

### Test Redis Functionality

1. **Test Distributed Locks:**

   ```typescript
   import { withLock } from '@/lib/cache/distributedLock'

   await withLock('test-lock', async () => {
     console.log('Lock acquired!')
   })
   ```

2. **Test Rate Limiting:**

   ```typescript
   import { checkRateLimit } from '@/lib/api/rateLimiter'

   const result = await checkRateLimit('test-user')
   console.log('Rate limit:', result)
   ```

## Redis Key Structure

All keys are namespaced with `tys:` prefix:

```
tys:lock:currency:USD:EUR          # Distributed lock for USD/EUR rate
tys:ratelimit:alphavantage:global  # Alpha Vantage API rate limit
tys:ratelimit:user:123:CREATE_PORTFOLIO  # User-specific rate limit
tys:price:AAPL                     # Stock price cache (future)
tys:currency:USD:EUR               # Currency rate cache (future)
```

## Monitoring

### Upstash Dashboard

Monitor Redis usage in Upstash console:

- **Commands:** Total API calls
- **Storage:** Data size
- **Latency:** Request duration
- **Errors:** Failed requests

### Application Logs

Check structured logs for Redis operations:

```typescript
import { logger } from '@/lib/logger'

logger.debug({ key: 'lock:test' }, 'Lock acquired')
logger.warn({ key: 'ratelimit:user:123' }, 'Rate limit exceeded')
```

## Troubleshooting

### "Redis not configured" Warning

**Symptom:** App works but logs show fallback to in-memory implementations.

**Solution:** Add Redis environment variables. This is **OK in development** but **required in production**.

### "Failed to acquire lock" Error

**Symptom:** Lock acquisition times out after 5 seconds.

**Possible Causes:**

1. Another process holds the lock (wait and retry)
2. Redis connection issue (check Upstash dashboard)
3. Lock not released properly (check for errors in previous operation)

**Solution:**

```typescript
// Increase timeout if needed
await acquireLock('my-key', { maxWaitTime: 10000 })
```

### Rate Limit Errors

**Symptom:** Users getting 429 errors unexpectedly.

**Possible Causes:**

1. Rate limits too strict for your use case
2. User making legitimate rapid requests
3. Redis quota exceeded (check Upstash dashboard)

**Solution:** Adjust limits in `lib/middleware/rateLimiter.ts`:

```typescript
export const RATE_LIMITS = {
  CREATE_PORTFOLIO: { limit: 20, window: '1 m' }, // Increased from 10
  // ...
}
```

### Redis Connection Timeout

**Symptom:** Slow response times or timeouts.

**Possible Causes:**

1. Redis instance in wrong region (high latency)
2. Network issues
3. Upstash service degradation

**Solution:**

1. Check Upstash status page
2. Consider upgrading to Global database for lower latency
3. App will fall back to in-memory if Redis is unavailable

## Cost Estimation

### Upstash Free Tier

- **10,000 commands/day** free
- **256 MB storage** free
- **Max 1,000 commands/second**

### Typical Usage (Track Your Stack)

**Per User Session:**

- 1 rate limit check per Server Action: ~10 commands
- 1 distributed lock per currency update: ~2 commands
- Total: ~12 commands per active session

**Estimated Monthly Usage:**

- 100 active users/day
- 10 actions per user per day
- 100 × 10 × 30 = 30,000 commands/month
- **Well within free tier** (300,000 commands/month)

### When to Upgrade

Consider paid tier when:

- More than 300 active users/day
- Need global replication for lower latency
- Need higher throughput (>1,000 commands/second)
- Need more than 256 MB storage

**Paid Tier:** Starting at $10/month for 1M commands

## Best Practices

### 1. Always Use Try-Catch

```typescript
try {
  await withLock('my-key', async () => {
    // Critical section
  })
} catch (error) {
  logger.error({ error }, 'Lock operation failed')
  // Handle gracefully
}
```

### 2. Set Appropriate Timeouts

```typescript
// Short timeout for non-critical operations
await acquireLock('cache:update', { timeout: 5000 })

// Longer timeout for critical operations
await acquireLock('payment:process', { timeout: 30000 })
```

### 3. Monitor Redis Usage

Set up alerts in Upstash:

- Command count approaching limit
- Storage approaching limit
- High error rate

### 4. Test Fallback Behavior

Ensure app works without Redis:

```bash
# Remove Redis variables temporarily
unset UPSTASH_REDIS_REST_URL
unset UPSTASH_REDIS_REST_TOKEN

# Test app
pnpm dev
```

### 5. Use Descriptive Lock Keys

```typescript
// Good: Descriptive and unique
await withLock('currency:USD:EUR:update', async () => { ... })

// Bad: Too generic
await withLock('update', async () => { ... })
```

## Security

### Protect Redis Credentials

- **Never commit** Redis credentials to Git
- **Use environment variables** only
- **Rotate tokens** if exposed
- **Restrict access** to Upstash console

### Network Security

Upstash Redis uses:

- **TLS encryption** for all connections
- **Token-based authentication**
- **IP allowlisting** (optional, in paid tier)

## Alternative Redis Providers

While we recommend Upstash for serverless, you can use other providers:

### Redis Cloud

- Traditional Redis (TCP)
- Requires connection pooling
- Better for long-running servers

### AWS ElastiCache

- VPC-only (not suitable for serverless)
- Good for AWS-native deployments

### DigitalOcean Managed Redis

- Traditional Redis (TCP)
- Good for DigitalOcean App Platform

**Note:** Using non-Upstash providers requires modifying `lib/cache/redis.ts` to use `ioredis` instead of `@upstash/redis`.

## Support

- **Upstash Documentation:** [https://docs.upstash.com/redis](https://docs.upstash.com/redis)
- **Upstash Discord:** [https://discord.gg/upstash](https://discord.gg/upstash)
- **Track Your Stack Issues:** [GitHub Issues](https://github.com/yourusername/track-your-stack/issues)
