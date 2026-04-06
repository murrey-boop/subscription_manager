import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Insights() {
  const insights = useMemo(() => {
    const activeSubscriptions = HOME_SUBSCRIPTIONS.filter(
      (subscription) => subscription.status === "active",
    );

    const monthlySpend = activeSubscriptions.reduce((total, subscription) => {
      if (subscription.billing === "Yearly") {
        return total + subscription.price / 12;
      }

      return total + subscription.price;
    }, 0);

    const yearlySpend = activeSubscriptions.reduce((total, subscription) => {
      if (subscription.billing === "Yearly") {
        return total + subscription.price;
      }

      return total + subscription.price * 12;
    }, 0);

    const categoryTotals = HOME_SUBSCRIPTIONS.reduce<Record<string, number>>((acc, subscription) => {
      const category = subscription.category || "Other";
      acc[category] = (acc[category] || 0) + subscription.price;
      return acc;
    }, {});

    const statusTotals = HOME_SUBSCRIPTIONS.reduce<Record<string, number>>((acc, subscription) => {
      const status = subscription.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const upcomingRenewals = [...HOME_SUBSCRIPTIONS]
      .filter((subscription) => !!subscription.renewalDate)
      .sort((a, b) => dayjs(a.renewalDate).valueOf() - dayjs(b.renewalDate).valueOf())
      .slice(0, 3);

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    return {
      monthlySpend,
      yearlySpend,
      activeCount: activeSubscriptions.length,
      totalCount: HOME_SUBSCRIPTIONS.length,
      categoryTotals,
      statusTotals,
      upcomingRenewals,
      topCategory,
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="mb-5 gap-2">
          <Text className="text-3xl font-sans-bold text-primary">Insights</Text>
          <Text className="text-sm font-sans-medium text-muted-foreground">
            A quick summary of your current subscription portfolio.
          </Text>
        </View>

        <View className="auth-card mt-0">
          <Text className="text-sm font-sans-semibold text-muted-foreground">Estimated monthly spend</Text>
          <Text className="mt-2 text-4xl font-sans-extrabold text-primary">
            {formatCurrency(insights.monthlySpend, "USD")}
          </Text>
          <Text className="mt-3 text-sm font-sans-medium text-muted-foreground">
            Annualized projection: {formatCurrency(insights.yearlySpend, "USD")}
          </Text>
        </View>

        <View className="mt-5 flex-row gap-4">
          <View className="auth-card mt-0 flex-1">
            <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">Active</Text>
            <Text className="mt-1 text-3xl font-sans-bold text-primary">{insights.activeCount}</Text>
          </View>
          <View className="auth-card mt-0 flex-1">
            <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">Total</Text>
            <Text className="mt-1 text-3xl font-sans-bold text-primary">{insights.totalCount}</Text>
          </View>
        </View>

        <View className="auth-card">
          <Text className="text-lg font-sans-bold text-primary">Category Breakdown</Text>
          <View className="mt-4 gap-3">
            {Object.entries(insights.categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([category, total]) => (
                <View key={category} className="flex-row items-center justify-between">
                  <Text className="text-sm font-sans-medium text-muted-foreground">{category}</Text>
                  <Text className="text-base font-sans-bold text-primary">{formatCurrency(total, "USD")}</Text>
                </View>
              ))}
          </View>
          {insights.topCategory && (
            <Text className="mt-4 text-sm font-sans-semibold text-accent">
              Highest spend category: {insights.topCategory[0]}
            </Text>
          )}
        </View>

        <View className="auth-card">
          <Text className="text-lg font-sans-bold text-primary">Status Distribution</Text>
          <View className="mt-4 gap-3">
            {Object.entries(insights.statusTotals).map(([status, count]) => (
              <View key={status} className="flex-row items-center justify-between">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  {formatStatusLabel(status)}
                </Text>
                <Text className="text-base font-sans-bold text-primary">{count}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="auth-card">
          <Text className="text-lg font-sans-bold text-primary">Upcoming Renewals</Text>
          <View className="mt-4 gap-3">
            {insights.upcomingRenewals.map((subscription) => (
              <View key={subscription.id} className="flex-row items-center justify-between">
                <View className="mr-3 flex-1">
                  <Text numberOfLines={1} className="text-base font-sans-semibold text-primary">
                    {subscription.name}
                  </Text>
                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    {formatSubscriptionDateTime(subscription.renewalDate)}
                  </Text>
                </View>
                <Text className="text-base font-sans-bold text-primary">
                  {formatCurrency(subscription.price, subscription.currency)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}