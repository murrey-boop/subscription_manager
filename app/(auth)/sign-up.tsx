import { Link } from 'expo-router'
import { Text, View } from 'react-native'

const signUp = () => {
  return (
    <View>
      <Text>sign-up</Text>
      <Link href="/(auth)/sign-in">Create Account</Link>
    </View>
  )
}

export default signUp