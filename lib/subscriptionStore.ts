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
    try {
      const value = await SecureStore.getItemAsync(name)
      return value ?? null
    } catch (error) {
      console.error(`[SecureStore] Failed to get item "${name}"`, error)
      return null
    }
  },
  setItem: async (name, value) => {
    try {
      const byteLength = new TextEncoder().encode(value).length
      const MAX_BYTES = 2000
      
      if (byteLength > MAX_BYTES) {
        console.error(
          `[SecureStore] Value for key "${name}" exceeds ${MAX_BYTES} bytes (${byteLength} bytes). Skipping write.`,
        )
        return
      }
      
      await SecureStore.setItemAsync(name, value)
    } catch (error) {
      console.error(`[SecureStore] Failed to set item "${name}"`, error)
    }
  },
  removeItem: async (name) => {
    try {
      await SecureStore.deleteItemAsync(name)
    } catch (error) {
      console.error(`[SecureStore] Failed to remove item "${name}"`, error)
    }
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