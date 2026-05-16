import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { getVapidPublicKey } from '@/lib/push';

/**
 * GET /api/notifications/subscribe — Get VAPID public key
 */
export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ success: false, message: 'Push notifications not configured' }, { status: 503 });
  }
  return NextResponse.json({ success: true, data: { publicKey } });
}

/**
 * POST /api/notifications/subscribe — Subscribe to push notifications
 * Body: { endpoint: string, keys: { p256dh: string, auth: string } }
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ success: false, message: 'Subscription data tidak lengkap' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: token.id as string },
      data: {
        pushSubscribed: true,
        pushEndpoint: endpoint,
        pushKeys: { p256dh: keys.p256dh, auth: keys.auth },
      },
    });

    return NextResponse.json({ success: true, message: 'Berhasil subscribe push notification' });
  } catch (error) {
    console.error('[SUBSCRIBE_PUSH_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal subscribe' }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications/subscribe — Unsubscribe from push
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await prisma.user.update({
      where: { id: token.id as string },
      data: { pushSubscribed: false, pushEndpoint: null, pushKeys: null },
    });

    return NextResponse.json({ success: true, message: 'Berhasil unsubscribe push notification' });
  } catch (error) {
    console.error('[UNSUBSCRIBE_PUSH_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal unsubscribe' }, { status: 500 });
  }
}
