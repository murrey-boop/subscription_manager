import { create } from 'zustand';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setSubscriptionStatus: (id: string, status: string) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
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
}));