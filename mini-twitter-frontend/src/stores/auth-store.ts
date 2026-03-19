import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '../features/auth/api/types';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (payload: { token: string; user: AuthUser }) => void;
  clearSession: () => void;
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: 'mini-twitter-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useAuthStore = authStore;
