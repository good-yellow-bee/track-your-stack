/**
 * Standard result type for Server Actions
 * Provides consistent API contracts across all server actions
 */
export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Type guard to check if action succeeded
 */
export function isActionSuccess<T>(result: ActionResult<T>): result is ActionResult<T> & {
  success: true
  data: T
} {
  return result.success === true && result.data !== undefined
}

/**
 * Type guard to check if action failed
 */
export function isActionError<T>(result: ActionResult<T>): result is ActionResult<T> & {
  success: false
  error: string
} {
  return result.success === false && result.error !== undefined
}
