import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, Link } from 'expo-router'
import { usePostHog } from 'posthog-react-native'

const SubscriptionsDetails = () => {
  const { id } = useLocalSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('subscription_viewed', { subscription_id: id });
  }, [id, posthog]);

  return (
    <View>
      <Text>subscriptions Details : {id}</Text>
      <Link href="/">Go Back</Link>
    </View>
  )
}

export default SubscriptionsDetails
