import prisma from '@/lib/prisma';
import { sendPushNotification, type PushPayload } from '@/lib/push';
import { sendNotificationEmail } from '@/lib/email';

/**
 * Notification Dispatcher
 *
 * Logic:
 * 1. Selalu simpan ke tabel notifications (in-app)
 * 2. Coba kirim push notification jika user subscribe
 * 3. Fallback ke email jika push gagal atau user belum subscribe
 */

export interface NotificationPayload {
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'FULFILLMENT' | 'GUARANTEE' | 'ANNOUNCEMENT' | 'SYSTEM';
  data?: Record<string, any>;
  url?: string;
}

/**
 * Kirim notifikasi ke satu user.
 * Otomatis handle: in-app + push + email fallback.
 */
export async function sendNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        pushSubscribed: true,
        pushEndpoint: true,
        pushKeys: true,
      },
    });

    if (!user) {
      console.warn(`[NOTIFICATION] User ${userId} not found`);
      return;
    }

    let pushSent = false;
    let emailSent = false;

    // 1. Coba kirim push notification
    if (user.pushSubscribed && user.pushEndpoint && user.pushKeys) {
      const pushPayload: PushPayload = {
        title: payload.title,
        body: payload.message,
        url: payload.url || '/dashboard/notifikasi',
        tag: `${payload.type}-${Date.now()}`,
      };

      const keys = user.pushKeys as { p256dh: string; auth: string };
      pushSent = await sendPushNotification(
        { endpoint: user.pushEndpoint, keys },
        pushPayload
      );

      // Jika push gagal (subscription expired), unsubscribe user
      if (!pushSent) {
        await prisma.user.update({
          where: { id: userId },
          data: { pushSubscribed: false, pushEndpoint: null, pushKeys: null },
        });
      }
    }

    // 2. Fallback ke email jika push tidak terkirim
    if (!pushSent) {
      try {
        await sendNotificationEmail({
          to: user.email,
          name: user.fullName,
          title: payload.title,
          message: payload.message,
          actionUrl: payload.url
            ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://rzdkstore.my.id'}${payload.url}`
            : undefined,
          actionText: payload.url ? 'Lihat Detail' : undefined,
        });
        emailSent = true;
      } catch (emailError) {
        console.error('[NOTIFICATION] Email fallback failed:', emailError);
      }
    }

    // 3. Selalu simpan ke tabel notifications (in-app)
    await prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data || null,
        isRead: false,
        pushSent,
        emailSent,
      },
    });
  } catch (error) {
    console.error('[NOTIFICATION] Failed to send notification:', error);
  }
}

/**
 * Kirim notifikasi ke banyak user sekaligus.
 */
export async function sendBulkNotification(
  userIds: string[],
  payload: NotificationPayload
): Promise<void> {
  // Batch process, max 10 concurrent
  const batchSize = 10;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map((userId) => sendNotification(userId, payload))
    );
  }
}
