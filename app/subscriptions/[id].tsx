import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams,Link } from 'expo-router'


  

const SubscriptionsDetails = () => {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>subscriptions Details : {id}</Text>
      <Link href="/">Go Back</Link>
    </View>
  )
}

export default SubscriptionsDetails