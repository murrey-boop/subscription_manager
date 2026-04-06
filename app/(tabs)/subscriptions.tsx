import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Subscriptions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const { subscriptions, setSubscriptionStatus } = useSubscriptionStore();

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return subscriptions;
    }

    return subscriptions.filter((subscription) => {
      const searchableText = [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.paymentMethod,
        subscription.billing,
        subscription.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [searchQuery, subscriptions]);

  const handleSubscriptionPress = (subscriptionId: string) => {
    setExpandedSubscriptionId((currentId) =>
      currentId === subscriptionId ? null : subscriptionId,
    );
  };

  const handleToggleSubscriptionStatus = (subscription: Subscription) => {
    const nextStatus = subscription.status === "active" ? "paused" : "active";
    setSubscriptionStatus(subscription.id, nextStatus);
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-5 pt-5">
      <View className="mb-5 gap-3">
        <Text className="text-3xl font-sans-bold text-primary">Subscriptions</Text>
        <Text className="text-sm font-sans-medium text-muted-foreground">
          Search the sample catalog and expand any card for details.
        </Text>

        <View className="rounded-2xl border border-border bg-card px-4 py-3">
          <Text className="mb-2 text-sm font-sans-semibold text-primary">Search</Text>
          <TextInput
            className="text-base font-sans-medium text-primary"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, plan, category, payment, or status"
            placeholderTextColor="rgba(0, 0, 0, 0.45)"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-sans-medium text-muted-foreground">
            {filteredSubscriptions.length} subscription
            {filteredSubscriptions.length === 1 ? "" : "s"} found
          </Text>
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Text className="text-sm font-sans-semibold text-accent">Clear</Text>
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        className="flex-1"
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item.id)}
            onCancelPress={() => handleToggleSubscriptionStatus(item)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
        ListEmptyComponent={
          <View className="rounded-2xl border border-border bg-card p-5">
            <Text className="text-lg font-sans-bold text-primary">No matches found</Text>
            <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
              Try a different search term or clear the filter to see every subscription.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}