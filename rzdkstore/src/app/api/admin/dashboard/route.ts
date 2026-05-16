import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/dashboard
 * Summary data untuk admin dashboard
 */
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalProducts,
      totalActiveVariants,
      ordersToday,
      ordersPendingReview,
      ordersPaymentUploaded,
      ordersProcessing,
      ordersCompletedToday,
      openGuarantees,
      lowStockVariants,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.count({ where: { isActive: true } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.order.count({ where: { status: 'PAYMENT_UPLOADED' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'COMPLETED', completedAt: { gte: today } } }),
      prisma.guarantee.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } }),
      prisma.productVariant.count({
        where: { isActive: true, isUnlimited: false, stock: { lte: 2 } },
      }),
    ]);

    // Pendapatan hari ini
    const revenueToday = await prisma.order.aggregate({
      where: { status: 'COMPLETED', completedAt: { gte: today } },
      _sum: { finalPrice: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        totalActiveVariants,
        ordersToday,
        ordersPendingReview,
        ordersPaymentUploaded,
        ordersProcessing,
        ordersCompletedToday,
        openGuarantees,
        lowStockVariants,
        revenueToday: revenueToday._sum.finalPrice || 0,
      },
    });
  } catch (error) {
    console.error('[ADMIN_DASHBOARD_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data dashboard' }, { status: 500 });
  }
}
