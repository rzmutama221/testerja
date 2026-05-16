import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/orders
 * List semua order untuk admin panel (dengan filter & search)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { username: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, username: true, whatsapp: true, email: true } },
          variant: {
            select: {
              id: true, name: true, price: true, durationDays: true,
              product: { select: { id: true, name: true, fulfillType: true, category: { select: { name: true, icon: true } } } },
            },
          },
          voucher: { select: { code: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[ADMIN_GET_ORDERS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data order' }, { status: 500 });
  }
}
