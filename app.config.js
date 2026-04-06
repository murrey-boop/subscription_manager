const { expo } = require('./app.json')

export default {
  expo: {
    ...expo,
    plugins: [...(expo.plugins || []), 'expo-localization'],
    extra: {
      ...expo.extra,
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
    },
  },
}
