import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

/**
 * GET /api/orders/[id]
 * Detail order (milik user yang login).
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: token.id as string },
      include: {
        variant: {
          select: {
            id: true, name: true, price: true, durationDays: true, guaranteeDays: true,
            product: { select: { id: true, name: true, logoUrl: true, fulfillType: true, category: { select: { name: true, icon: true } } } },
          },
        },
        fulfillment: { select: { content: true, sentAt: true, isAuto: true } },
        voucher: { select: { code: true, discountType: true, discountValue: true } },
        guarantees: { select: { id: true, status: true, createdAt: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('[GET_ORDER_DETAIL_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data order' }, { status: 500 });
  }
}
