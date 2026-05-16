import webpush from 'web-push';

/**
 * Web Push Notification Service
 * Menggunakan VAPID keys dari environment variables.
 *
 * Setup:
 * 1. Generate keys: npx web-push generate-vapid-keys
 * 2. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL di .env
 */

// Konfigurasi VAPID
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@rzdkstore.my.id';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

/**
 * Kirim push notification ke satu subscription.
 * Returns true jika berhasil, false jika gagal.
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[PUSH] VAPID keys not configured, skipping push');
    return false;
  }

  try {
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      data: { url: payload.url || '/dashboard/notifikasi' },
      tag: payload.tag || 'rzdkstore-notification',
    });

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      pushPayload,
      { TTL: 60 * 60 } // 1 hour TTL
    );

    return true;
  } catch (error: any) {
    // 410 Gone means subscription is invalid/expired
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('[PUSH] Subscription expired or invalid:', subscription.endpoint.slice(0, 50));
    } else {
      console.error('[PUSH] Failed to send:', error.message);
    }
    return false;
  }
}

/**
 * Get public VAPID key untuk client-side subscription.
 */
export function getVapidPublicKey(): string {
  return vapidPublicKey;
}
