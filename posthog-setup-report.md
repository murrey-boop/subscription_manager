<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into **Recurrly**, an Expo-based React Native subscription manager app using Clerk for authentication.

## What was done

- Installed `posthog-react-native` and required Expo peer dependencies (`expo-file-system`, `expo-application`, `expo-device`, `expo-localization`, `react-native-svg`)
- Created `app.config.js` to expose `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` as Expo config extras
- Created `lib/posthog.ts` — a singleton PostHog client configured via `expo-constants`
- Wrapped the app in `PostHogProvider` inside `app/_layout.tsx` with manual screen tracking for Expo Router
- Replaced incorrect `globalThis.posthog` usage (in `index.tsx` and `CreateSubscriptionModal.tsx`) with the proper `usePostHog()` hook
- Added `posthog.identify()` calls on sign-in and sign-up to correlate users across sessions
- Added `posthog.reset()` on sign-out to clear the user session

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signed in (password or MFA) | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User completed sign-up including email verification | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signed out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_created` | New subscription created with name, price, frequency, and category | `components/CreateSubscriptionModal.tsx` |
| `subscription_expanded` | Subscription card expanded on home screen | `app/(tabs)/index.tsx` |
| `subscription_collapsed` | Subscription card collapsed on home screen | `app/(tabs)/index.tsx` |
| `subscription_viewed` | Subscription detail screen opened | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/370837/dashboard/1434608
- **Sign-up to Subscription Conversion Funnel**: https://us.posthog.com/project/370837/insights/Qt94Sl6U
- **Daily Sign-ups and Sign-ins**: https://us.posthog.com/project/370837/insights/fA5hHd7p
- **Subscriptions Created by Category**: https://us.posthog.com/project/370837/insights/XNN8RQ6n
- **Daily User Churn (Sign-outs)**: https://us.posthog.com/project/370837/insights/FNCJNESP
- **Cumulative Subscriptions Created**: https://us.posthog.com/project/370837/insights/aW8OPNAi

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
