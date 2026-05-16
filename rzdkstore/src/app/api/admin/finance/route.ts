import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/finance
 * Financial reports: daily, monthly, product breakdown, summary
 *
 * Query params:
 * - period: 'daily' | 'monthly'
 * - year: number (defaults current year)
 * - month: number (for daily view of specific month)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;

    // --- OVERALL SUMMARY ---
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    const startOfLastMonth = new Date(year, month - 2, 1);
    const endOfLastMonth = new Date(year, month - 1, 0, 23, 59, 59);

    const [summaryThisMonth, summaryLastMonth, totalAllTime] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'COMPLETED', completedAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { finalPrice: true, discountAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED', completedAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { finalPrice: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { finalPrice: true, discountAmount: true },
        _count: true,
      }),
    ]);

    const summary = {
      thisMonth: {
        revenue: summaryThisMonth._sum.finalPrice || 0,
        discount: summaryThisMonth._sum.discountAmount || 0,
        orders: summaryThisMonth._count,
      },
      lastMonth: {
        revenue: summaryLastMonth._sum.finalPrice || 0,
        orders: summaryLastMonth._count,
      },
      allTime: {
        revenue: totalAllTime._sum.finalPrice || 0,
        discount: totalAllTime._sum.discountAmount || 0,
        orders: totalAllTime._count,
      },
      growthPercent: summaryLastMonth._sum.finalPrice
        ? Math.round(((summaryThisMonth._sum.finalPrice || 0) - (summaryLastMonth._sum.finalPrice || 0)) / (summaryLastMonth._sum.finalPrice || 1) * 100)
        : 0,
    };

    // --- DAILY DATA (specific month) ---
    let dailyData: { date: string; revenue: number; orders: number }[] = [];
    if (period === 'daily') {
      const completedOrders = await prisma.order.findMany({
        where: { status: 'COMPLETED', completedAt: { gte: startOfMonth, lte: endOfMonth } },
        select: { finalPrice: true, completedAt: true },
      });

      const dayMap: Record<string, { revenue: number; orders: number }> = {};
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        dayMap[key] = { revenue: 0, orders: 0 };
      }

      completedOrders.forEach((order) => {
        if (order.completedAt) {
          const key = order.completedAt.toISOString().slice(0, 10);
          if (dayMap[key]) {
            dayMap[key].revenue += order.finalPrice;
            dayMap[key].orders += 1;
          }
        }
      });

      dailyData = Object.entries(dayMap).map(([date, data]) => ({ date, ...data }));
    }

    // --- MONTHLY DATA (12 months of the year) ---
    let monthlyData: { month: number; monthLabel: string; revenue: number; orders: number }[] = [];
    if (period === 'monthly') {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);

      const yearOrders = await prisma.order.findMany({
        where: { status: 'COMPLETED', completedAt: { gte: startOfYear, lte: endOfYear } },
        select: { finalPrice: true, completedAt: true },
      });

      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const monthMap: Record<number, { revenue: number; orders: number }> = {};
      for (let m = 0; m < 12; m++) monthMap[m] = { revenue: 0, orders: 0 };

      yearOrders.forEach((order) => {
        if (order.completedAt) {
          const m = order.completedAt.getMonth();
          monthMap[m].revenue += order.finalPrice;
          monthMap[m].orders += 1;
        }
      });

      monthlyData = Object.entries(monthMap).map(([m, data]) => ({
        month: Number(m) + 1,
        monthLabel: monthLabels[Number(m)],
        ...data,
      }));
    }

    // --- PRODUCT BREAKDOWN (top 10 by revenue this month) ---
    const productBreakdown = await prisma.order.groupBy({
      by: ['variantId'],
      where: { status: 'COMPLETED', completedAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { finalPrice: true },
      _count: true,
      orderBy: { _sum: { finalPrice: 'desc' } },
      take: 10,
    });

    const variantIds = productBreakdown.map((p) => p.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, name: true, product: { select: { name: true, category: { select: { icon: true } } } } },
    });
    const variantMap = Object.fromEntries(variants.map((v) => [v.id, v]));

    const topProducts = productBreakdown.map((p) => {
      const variant = variantMap[p.variantId];
      return {
        productName: variant?.product.name || 'Unknown',
        variantName: variant?.name || 'Unknown',
        categoryIcon: variant?.product.category.icon || '',
        revenue: p._sum.finalPrice || 0,
        orders: p._count,
      };
    });

    // --- CATEGORY BREAKDOWN ---
    const categoryBreakdown = await prisma.order.findMany({
      where: { status: 'COMPLETED', completedAt: { gte: startOfMonth, lte: endOfMonth } },
      select: { finalPrice: true, variant: { select: { product: { select: { category: { select: { id: true, name: true, icon: true } } } } } } },
    });

    const categoryMap: Record<string, { name: string; icon: string; revenue: number; orders: number }> = {};
    categoryBreakdown.forEach((order) => {
      const cat = order.variant.product.category;
      if (!categoryMap[cat.id]) categoryMap[cat.id] = { name: cat.name, icon: cat.icon, revenue: 0, orders: 0 };
      categoryMap[cat.id].revenue += order.finalPrice;
      categoryMap[cat.id].orders += 1;
    });
    const categoryData = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      data: { summary, dailyData, monthlyData, topProducts, categoryData, period, year, month },
    });
  } catch (error) {
    console.error('[ADMIN_FINANCE_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data keuangan' }, { status: 500 });
  }
}
