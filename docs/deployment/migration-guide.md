# Migration Guide - v1.1.0 Unique Constraints

**Version:** 1.1.0
**Date:** 2025-10-23
**Migration Name:** `add_unique_constraints`

## Overview

This migration adds unique constraints to prevent duplicate data:

- `Portfolio`: Unique combination of `userId` and `name`
- `Investment`: Unique combination of `portfolioId` and `ticker`

## Prerequisites

### 1. Check for Duplicate Data

Before running the migration, check if you have any duplicate data that would violate the constraints:

```sql
-- Check for duplicate portfolios (same user + name)
SELECT "userId", name, COUNT(*) as count
FROM "Portfolio"
GROUP BY "userId", name
HAVING COUNT(*) > 1;

-- Check for duplicate investments (same portfolio + ticker)
SELECT "portfolioId", ticker, COUNT(*) as count
FROM "Investment"
GROUP BY "portfolioId", ticker
HAVING COUNT(*) > 1;
```

### 2. Clean Up Duplicates (if any)

If duplicates exist, you'll need to merge or delete them before running the migration.

**Example cleanup for duplicate portfolios:**

```sql
-- Keep the oldest portfolio, delete newer ones
DELETE FROM "Portfolio" p1
WHERE EXISTS (
  SELECT 1 FROM "Portfolio" p2
  WHERE p2."userId" = p1."userId"
    AND p2.name = p1.name
    AND p2."createdAt" < p1."createdAt"
);
```

**Example cleanup for duplicate investments:**

```sql
-- For duplicate investments, you may want to aggregate them manually
-- This is more complex as you need to recalculate averageCostBasis
-- Contact your database administrator or use the application's aggregation logic
```

## Running the Migration

### Development Environment

```bash
# Ensure DATABASE_URL is set in .env.local
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/track_your_stack_dev"

# Run the migration
pnpm prisma migrate dev --name add_unique_constraints

# Verify the migration
pnpm prisma migrate status
```

### Staging Environment

```bash
# Set DATABASE_URL for staging
export DATABASE_URL="postgresql://..."

# Run the migration
pnpm prisma migrate deploy

# Verify
pnpm prisma migrate status
```

### Production Environment

**⚠️ IMPORTANT: Follow these steps carefully for production**

1. **Backup Database First**

   ```bash
   # Create a backup before migration
   pg_dump $DATABASE_URL > backup_before_v1.1.0_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test on Staging**
   - Run the migration on staging first
   - Verify application functionality
   - Check for any issues

3. **Schedule Maintenance Window**
   - This migration is fast (<1 second for most databases)
   - But users will be logged out due to cookie name change
   - Recommended: Deploy during low-traffic period

4. **Run Migration**

   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="postgresql://..."

   # Deploy migration
   pnpm prisma migrate deploy

   # Verify
   pnpm prisma migrate status
   ```

5. **Verify Constraints**
   ```sql
   -- Check that unique constraints were created
   SELECT
     tc.constraint_name,
     tc.table_name,
     kcu.column_name
   FROM information_schema.table_constraints tc
   JOIN information_schema.key_column_usage kcu
     ON tc.constraint_name = kcu.constraint_name
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_name IN ('Portfolio', 'Investment')
   ORDER BY tc.table_name, tc.constraint_name;
   ```

## Expected Results

After successful migration, you should see:

```
✔ Generated Prisma Client
✔ The migration has been applied successfully
```

The following constraints will be added:

- `Portfolio_userId_name_key` on `Portfolio(userId, name)`
- `Investment_portfolioId_ticker_key` on `Investment(portfolioId, ticker)`

## Rollback (if needed)

If you need to rollback the migration:

```bash
# Mark migration as rolled back
pnpm prisma migrate resolve --rolled-back add_unique_constraints

# Restore from backup
psql $DATABASE_URL < backup_before_v1.1.0_TIMESTAMP.sql
```

## Post-Migration Verification

### 1. Application Health Check

```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Expected: {"status":"ok"}
```

### 2. Test Duplicate Prevention

Try creating a duplicate portfolio or investment - it should fail gracefully:

```typescript
// Should return error: "A record with this information already exists"
await createPortfolio({ name: 'Existing Portfolio', baseCurrency: 'USD' })
```

### 3. Monitor Error Logs

Check for any P2002 errors in your logs. The application should handle them gracefully with automatic retry.

## Troubleshooting

### Error: "Unique constraint violation"

**Cause:** Duplicate data exists in the database

**Solution:** Run the duplicate check queries above and clean up duplicates before migrating

### Error: "Environment variable not found: DATABASE_URL"

**Cause:** DATABASE_URL is not set in your environment

**Solution:**

```bash
# Create .env.local with DATABASE_URL
echo 'DATABASE_URL="postgresql://..."' > .env.local

# Or export it
export DATABASE_URL="postgresql://..."
```

### Error: "Migration already applied"

**Cause:** Migration was already run

**Solution:** Check migration status:

```bash
pnpm prisma migrate status
```

## Impact on Users

### Cookie Name Change

Users will be logged out once after deployment because production cookies now use `__Secure-` prefix for enhanced security.

**User Experience:**

1. User visits site after deployment
2. Session cookie is invalid (old name)
3. User is redirected to sign-in page
4. User signs in again
5. New secure cookie is set

**Communication Template:**

> We've deployed a security update that requires all users to sign in again. This is a one-time occurrence and enhances the security of your session data.

## Performance Impact

- **Migration Time:** <1 second for databases with <100K records
- **Index Creation:** Unique constraints create indexes automatically
- **Query Performance:** Improved (unique indexes speed up lookups)
- **Application Performance:** No impact

## Support

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Review error logs for specific error codes
3. Ensure database backup is available
4. Contact your database administrator if needed

## Checklist

Before deployment:

- [ ] Database backup created
- [ ] Duplicate data checked and cleaned
- [ ] Migration tested on staging
- [ ] Maintenance window scheduled (if needed)
- [ ] User communication prepared
- [ ] Rollback plan ready

During deployment:

- [ ] DATABASE_URL environment variable set
- [ ] Migration executed successfully
- [ ] Constraints verified in database
- [ ] Application health check passed
- [ ] Error logs monitored

After deployment:

- [ ] Test duplicate prevention
- [ ] Monitor for P2002 errors
- [ ] Verify user sign-in flow
- [ ] Confirm no performance degradation
