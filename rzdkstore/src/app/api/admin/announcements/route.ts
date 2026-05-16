import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { sendBulkNotification } from '@/lib/notifications';

/**
 * GET /api/admin/announcements — List semua announcement
 */
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { fullName: true, username: true } } },
    });
    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error('[GET_ANNOUNCEMENTS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

/**
 * POST /api/admin/announcements — Buat & publish announcement
 * Setelah dibuat, otomatis dispatch notifikasi ke target customers.
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, content, type, target, productIds, categoryIds, publishedAt, expiresAt } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, message: 'Judul dan konten wajib diisi' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title, content, type: type || 'INFO', target: target || 'ALL',
        productIds: productIds || null, categoryIds: categoryIds || null,
        isActive: true, publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null, createdBy: token.id as string,
      },
    });

    // Dispatch notifikasi ke target customers
    const targetUserIds = await getTargetUserIds(target, productIds, categoryIds);
    if (targetUserIds.length > 0) {
      sendBulkNotification(targetUserIds, {
        title: `📢 ${title}`,
        message: content.length > 200 ? content.substring(0, 200) + '...' : content,
        type: 'ANNOUNCEMENT',
        data: { announcementId: announcement.id },
        url: '/dashboard/notifikasi',
      }).catch((err) => console.error('[ANNOUNCEMENT_DISPATCH_ERROR]', err));
    }

    return NextResponse.json({
      success: true, data: announcement,
      message: `Announcement dibuat. Dikirim ke ${targetUserIds.length} customer.`,
    }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_ANNOUNCEMENT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat announcement' }, { status: 500 });
  }
}

async function getTargetUserIds(target: string, productIds: string[] | null, categoryIds: string[] | null): Promise<string[]> {
  if (target === 'ALL') {
    const users = await prisma.user.findMany({ where: { role: 'USER', emailVerified: true, isActive: true }, select: { id: true } });
    return users.map((u) => u.id);
  }
  if (target === 'SPECIFIC_PRODUCT' && productIds?.length) {
    const orders = await prisma.order.findMany({ where: { status: 'COMPLETED', variant: { productId: { in: productIds } } }, select: { userId: true }, distinct: ['userId'] });
    return orders.map((o) => o.userId);
  }
  if (target === 'SPECIFIC_CATEGORY' && categoryIds?.length) {
    const orders = await prisma.order.findMany({ where: { status: 'COMPLETED', variant: { product: { categoryId: { in: categoryIds } } } }, select: { userId: true }, distinct: ['userId'] });
    return orders.map((o) => o.userId);
  }
  return [];
}
