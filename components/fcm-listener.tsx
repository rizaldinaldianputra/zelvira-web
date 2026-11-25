'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';

export function FcmListener() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initFcm = async () => {
      if (typeof window === 'undefined') return;

      // Only attempt permission and token sync if user is logged in
      // Guest visitors DO NOT download or evaluate Firebase messaging bundle
      if (!authService.isLoggedIn()) return;

      try {
        const { getFirebaseMessaging, requestNotificationPermissionAndGetToken } = await import('@/lib/firebase');
        const { onMessage } = await import('firebase/messaging');

        const token = await requestNotificationPermissionAndGetToken();
        if (token) {
          await authService.updateFcmToken(token);
        }

        const messaging = await getFirebaseMessaging();
        if (messaging) {
          unsubscribe = onMessage(messaging, (payload) => {
            console.log('[FCM] Foreground notification received:', payload);
            const title = payload.notification?.title || payload.data?.title || 'Notifikasi Baru';
            const body = payload.notification?.body || payload.data?.body || '';

            const route = payload.data?.route;
            toast(title, {
              description: body,
              action: route
                ? {
                    label: 'Lihat',
                    onClick: () => {
                      window.location.href = route;
                    },
                  }
                : undefined,
            });
          });
        }
      } catch (err) {
        console.error('[FCM] Error setting up FCM in listener:', err);
      }
    };

    initFcm();

    const handleAuthChange = () => {
      initFcm();
    };

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return null;
}
