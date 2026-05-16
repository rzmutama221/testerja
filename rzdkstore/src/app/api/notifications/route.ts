import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

/**
 * GET /api/notifications — List notifikasi user yang login
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { userId: token.id as string };
    if (type) where.type = type;
    if (unreadOnly) where.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: token.id as string, isRead: false },
      }),
    ]);

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    console.error('[GET_NOTIFICATIONS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil notifikasi' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications — Mark as read
 * Body: { ids: string[] } or { all: true }
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    if (body.all) {
      await prisma.notification.updateMany({
        where: { userId: token.id as string, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca' });
    }

    if (body.ids && Array.isArray(body.ids)) {
      await prisma.notification.updateMany({
        where: { id: { in: body.ids }, userId: token.id as string },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Notifikasi ditandai sudah dibaca' });
    }

    return NextResponse.json({ success: false, message: 'ids atau all wajib' }, { status: 400 });
  } catch (error) {
    console.error('[MARK_READ_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal update notifikasi' }, { status: 500 });
  }
}
