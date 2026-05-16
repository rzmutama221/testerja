import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/products
 * Public API — List semua produk aktif dengan varian aktif.
 * Digunakan oleh customer dashboard untuk browse & order.
 *
 * Query params:
 * - categoryId: filter by category
 * - search: search by product name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search };

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        category: { select: { id: true, name: true, icon: true, slug: true } },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          select: {
            id: true,
            name: true,
            price: true,
            durationDays: true,
            stock: true,
            isUnlimited: true,
            guaranteeDays: true,
          },
        },
      },
    });

    // Juga fetch kategori aktif untuk filter
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, icon: true, slug: true },
    });

    return NextResponse.json({ success: true, data: { products, categories } });
  } catch (error) {
    console.error('[GET_PUBLIC_PRODUCTS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data produk' }, { status: 500 });
  }
}
