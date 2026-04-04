import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView =styled(RNSafeAreaView)

export default function App() {
  return (
    <SafeAreaView className="flex-1  bg-background">
      <Text className="text-7xl font-sans-extrabold text-success">
        Home
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">
        <Text>Go to Onboarding</Text>
      </Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">
        <Text className="justify-center items-center flex-1">Go to Sign In</Text>
      </Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">
        <Text className="justify-center items-center flex-1">Go to Sign Up</Text>
      </Link>
      <Link href ="/app/subsscription/spotify">Spotify Subscription</Link>
      <Link 
          href={{
            pathname:"/subscriptions/[id]",
            params:{id:"claude" }
          }}
      >Claude Subscription</Link>  
    </SafeAreaView>
  );
}