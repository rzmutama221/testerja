import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/guarantees — List semua klaim garansi (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const guarantees = await prisma.guarantee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, username: true, whatsapp: true, email: true } },
        order: {
          select: {
            id: true, completedAt: true, expiredAt: true, finalPrice: true,
            variant: { select: { name: true, guaranteeDays: true, durationDays: true, product: { select: { name: true, category: { select: { icon: true, name: true } } } } } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: guarantees });
  } catch (error) {
    console.error('[ADMIN_GET_GUARANTEES_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data klaim' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/guarantees — Admin actions: approve, reject, resolve
 * Body: { guaranteeId, action, adminNote?, newExpiredAt? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { guaranteeId, action, adminNote, newExpiredAt } = body;

    if (!guaranteeId || !action) {
      return NextResponse.json({ success: false, message: 'guaranteeId dan action wajib' }, { status: 400 });
    }

    const guarantee = await prisma.guarantee.findUnique({
      where: { id: guaranteeId },
      include: { order: true },
    });

    if (!guarantee) {
      return NextResponse.json({ success: false, message: 'Klaim tidak ditemukan' }, { status: 404 });
    }

    switch (action) {
      case 'approve': {
        await prisma.guarantee.update({
          where: { id: guaranteeId },
          data: { status: 'APPROVED', adminNote: adminNote || null },
        });
        return NextResponse.json({ success: true, message: 'Klaim disetujui.' });
      }

      case 'resolve': {
        await prisma.guarantee.update({
          where: { id: guaranteeId },
          data: { status: 'RESOLVED', adminNote: adminNote || null, resolvedAt: new Date() },
        });

        // Extend expired if specified
        if (newExpiredAt && guarantee.order) {
          await prisma.order.update({
            where: { id: guarantee.orderId },
            data: { expiredAt: new Date(newExpiredAt) },
          });
        }

        return NextResponse.json({ success: true, message: 'Klaim garansi selesai diproses.' });
      }

      case 'reject': {
        if (!adminNote) {
          return NextResponse.json({ success: false, message: 'Alasan penolakan wajib diisi' }, { status: 400 });
        }
        await prisma.guarantee.update({
          where: { id: guaranteeId },
          data: { status: 'REJECTED', adminNote },
        });
        return NextResponse.json({ success: true, message: 'Klaim garansi ditolak.' });
      }

      default:
        return NextResponse.json({ success: false, message: `Action '${action}' tidak valid` }, { status: 400 });
    }
  } catch (error) {
    console.error('[ADMIN_PATCH_GUARANTEE_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal memproses klaim' }, { status: 500 });
  }
}
