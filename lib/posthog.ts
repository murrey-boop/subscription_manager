import Constants from 'expo-constants'
import PostHog from 'posthog-react-native'

// Configuration loaded from app.config.js extras via expo-constants
// Environment variables are read at build time in app.config.js
const apiKey = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined
const posthogDebug = Constants.expoConfig?.extra?.posthogDebug === true
const isPostHogConfigured = !!(apiKey && apiKey !== 'phc_your_project_token_here' && host)

if (!isPostHogConfigured) {
  console.warn(
    'PostHog project token or host not configured. Analytics will be disabled. ' +
      'Set POSTHOG_PROJECT_TOKEN and POSTHOG_HOST in your .env file to enable analytics.'
  )
}

export const posthog = new PostHog(apiKey || 'placeholder_key', {
  // host is always sourced from environment via app.config.js extras
  ...(host ? { host } : {}),
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,
  preloadFeatureFlags: true,
  sendFeatureFlagEvent: true,
  featureFlagsRequestTimeoutMs: 10000,
  requestTimeout: 10000,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
})

if (__DEV__ && posthogDebug) {
  posthog.debug()
}
