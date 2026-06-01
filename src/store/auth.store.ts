import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  permissionsSynced: boolean;
  setSession: (session: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  setAccessToken: (accessToken: string) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setPermissionsSynced: (permissionsSynced: boolean) => void;
  clearSession: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      permissionsSynced: false,
      setSession: (session) => set({ ...session, permissionsSynced: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),
      setPermissionsSynced: (permissionsSynced) => set({ permissionsSynced }),
      clearSession: () => {
        // Clear all state
        set({ accessToken: null, refreshToken: null, user: null, permissionsSynced: false });
        // Clear localStorage
        try {
          localStorage.removeItem('iitil-auth');
        } catch {
          // Ignore errors
        }
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated })
    }),
    {
      name: 'iitil-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);

export function useCurrentUser(): AuthUser | null {
  return useAuthStore((state) => state.user);
}
