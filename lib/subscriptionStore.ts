import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setSubscriptionStatus: (id: string, status: string) => void;
}

const subscriptionStorage: StateStorage = {
  getItem: async (name) => {
    const value = await SecureStore.getItemAsync(name)
    return value ?? null
  },
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, value)
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name)
  },
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      subscriptions: HOME_SUBSCRIPTIONS,
      addSubscription: (subscription) =>
        set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),
      setSubscriptions: (subscriptions) => set({ subscriptions }),
      setSubscriptionStatus: (id, status) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === id ? { ...subscription, status } : subscription,
          ),
        })),
    }),
    {
      name: 'recurrly-subscriptions',
      storage: createJSONStorage(() => subscriptionStorage),
      partialize: (state) => ({ subscriptions: state.subscriptions }),
    },
  ),
)