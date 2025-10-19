/**
 * Content Security Policy (CSP) configuration
 * Protects against XSS, clickjacking, and other code injection attacks
 */

export interface CSPDirectives {
  'default-src'?: string[]
  'script-src'?: string[]
  'style-src'?: string[]
  'img-src'?: string[]
  'font-src'?: string[]
  'connect-src'?: string[]
  'frame-src'?: string[]
  'frame-ancestors'?: string[]
  'object-src'?: string[]
  'base-uri'?: string[]
  'form-action'?: string[]
  'upgrade-insecure-requests'?: boolean
}

/**
 * Build CSP header value from directives
 */
export function buildCSP(directives: CSPDirectives): string {
  const cspParts: string[] = []

  for (const [key, value] of Object.entries(directives)) {
    if (value === true) {
      // Boolean directives (e.g., upgrade-insecure-requests)
      cspParts.push(key)
    } else if (Array.isArray(value) && value.length > 0) {
      // Array directives
      cspParts.push(`${key} ${value.join(' ')}`)
    }
  }

  return cspParts.join('; ')
}

/**
 * Development CSP - More permissive for hot reload and dev tools
 */
export const developmentCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Required for Next.js dev mode
    "'unsafe-inline'", // Required for Next.js dev mode
    'https://vercel.live', // Vercel toolbar
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components, Tailwind
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:', // Allow all HTTPS images (Google profile pictures, etc.)
  ],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'",
    'https://vercel.live', // Vercel toolbar
    'https://*.vercel.app', // Vercel preview deployments
    'wss://*.vercel.app', // WebSocket for hot reload
  ],
  'frame-src': ["'self'", 'https://vercel.live'],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
}

/**
 * Production CSP - Strict security policy
 */
export const productionCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Nonce will be added dynamically in middleware if needed
    'https://vercel.live', // Vercel toolbar (optional in production)
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://lh3.googleusercontent.com', // Google profile pictures
    'https://*.vercel-insights.com', // Vercel analytics
  ],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'",
    'https://*.vercel-insights.com', // Vercel analytics
    'https://vitals.vercel-insights.com', // Vercel Web Vitals
  ],
  'frame-src': ["'none'"],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': true, // Force HTTPS
}

/**
 * Get CSP for current environment
 */
export function getCSP(isDevelopment: boolean = false): string {
  return buildCSP(isDevelopment ? developmentCSP : productionCSP)
}
