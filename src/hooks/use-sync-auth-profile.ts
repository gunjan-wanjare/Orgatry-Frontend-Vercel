import { useEffect, useRef } from 'react';
import { authApi } from '@/services/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

export function useSyncAuthProfile() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const user = useAuthStore((state) => state.user);
  const permissionsSynced = useAuthStore((state) => state.permissionsSynced);
  const setSession = useAuthStore((state) => state.setSession);
  const setPermissionsSynced = useAuthStore((state) => state.setPermissionsSynced);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated || permissionsSynced) {
      return;
    }

    if (!refreshToken || !user) {
      setPermissionsSynced(true);
      return;
    }

    if (hasSyncedRef.current) {
      return;
    }

    hasSyncedRef.current = true;

    void authApi
      .refresh(refreshToken)
      .then((session) => {
        setSession(session);
      })
      .catch(() => {
        setPermissionsSynced(true);
      });
  }, [hasHydrated, permissionsSynced, refreshToken, user, setSession, setPermissionsSynced]);
}
