import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, Messaging, isSupported } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDgZJ30ZCd9jsdjiTv2mA97X5Hc1IQ4r_4',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'zelvira-a92ab.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zelvira-a92ab',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'zelvira-a92ab.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '668652429293',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:668652429293:web:a56c43e79dade1273b11e4',
};

export const VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  'BLVRm9pLRHOiV-R0cPw2wCQzbO_NC-mcajcb1hui0-0irmZmW-UVxAnC6DJGXkMbN81RLFRMHQwOrIv07DQkiTY';

let app: FirebaseApp | undefined;

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported();
  if (!supported) return null;
  const firebaseApp = getFirebaseApp();
  return getMessaging(firebaseApp);
};

export const requestNotificationPermissionAndGetToken = async (): Promise<string | null> => {
  try {
    if (typeof window === 'undefined') return null;

    if (!('Notification' in window)) {
      console.warn('[FCM] This browser does not support desktop notifications.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission was not granted:', permission);
      return null;
    }

    // Register service worker if supported
    let registration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('[FCM] Firebase Messaging is not supported in this environment.');
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.warn('[FCM] No registration token available.');
      return null;
    }
  } catch (err) {
    console.error('[FCM] An error occurred while retrieving token:', err);
    return null;
  }
};
