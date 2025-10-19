import { z } from 'zod'

/**
 * Environment variable validation schema
 * Ensures all required environment variables are present and valid at startup
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  // Alpha Vantage API
  ALPHA_VANTAGE_API_KEY: z.string().min(1, 'ALPHA_VANTAGE_API_KEY is required'),

  // Redis (Upstash) - Optional for development, required for production
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Sentry (Optional)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Vercel Analytics (Optional)
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
})

/**
 * Validated environment variables
 * Use this instead of process.env to ensure type safety
 */
export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

/**
 * Validate and return environment variables
 * Throws detailed error if validation fails
 * @throws {Error} If required environment variables are missing or invalid
 */
export function getEnv(): Env {
  // Return cached result for performance
  if (cachedEnv) {
    return cachedEnv
  }

  try {
    cachedEnv = envSchema.parse(process.env)
    return cachedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err: z.ZodIssue) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n')

      throw new Error(
        `❌ Environment variable validation failed:\n\n${missingVars}\n\n` +
          `Please check your .env.local file and ensure all required variables are set.\n` +
          `See .env.example for reference.`
      )
    }
    throw error
  }
}

/**
 * Check if Redis is configured
 * Redis is optional in development but recommended for production
 */
export function isRedisConfigured(): boolean {
  const env = getEnv()
  return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
}

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  const env = getEnv()
  return !!env.SENTRY_DSN
}

/**
 * Validate environment on module import (fail fast)
 * Only validate in Node.js runtime (not in edge runtime)
 */
if (typeof window === 'undefined' && process.env.SKIP_ENV_VALIDATION !== 'true') {
  try {
    getEnv()
    console.log('✅ Environment variables validated successfully')
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Environment validation failed')
    process.exit(1)
  }
}
