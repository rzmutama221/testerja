import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/customers — List all customers with stats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = { role: 'USER' };
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { username: { contains: search } },
        { email: { contains: search } },
        { whatsapp: { contains: search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, fullName: true, username: true, email: true, whatsapp: true,
        emailVerified: true, isActive: true, createdAt: true,
        _count: { select: { orders: true, guarantees: true } },
      },
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error('[GET_CUSTOMERS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/customers — Suspend/activate customer
 * Body: { userId: string, action: 'suspend' | 'activate' }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    if (!userId || !action) return NextResponse.json({ success: false, message: 'userId dan action wajib' }, { status: 400 });

    if (action === 'suspend') {
      await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
      return NextResponse.json({ success: true, message: 'Akun berhasil di-suspend' });
    }
    if (action === 'activate') {
      await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
      return NextResponse.json({ success: true, message: 'Akun berhasil diaktifkan kembali' });
    }

    return NextResponse.json({ success: false, message: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('[PATCH_CUSTOMER_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal memproses' }, { status: 500 });
  }
}
