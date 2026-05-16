import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { productSchema } from '@/lib/validations/product';

/**
 * GET /api/admin/products
 * List semua produk dengan kategori dan jumlah varian
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search };

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { id: true, name: true, icon: true } },
        _count: { select: { variants: true } },
      },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('[GET_PRODUCTS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data produk' }, { status: 500 });
  }
}

/**
 * POST /api/admin/products
 * Tambah produk baru
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slug, categoryId, ...data } = validation.data;

    // Cek slug duplikat
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ success: false, message: 'Slug sudah digunakan' }, { status: 409 });
    }

    // Cek kategori ada
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const product = await prisma.product.create({
      data: { ...data, slug, categoryId },
      include: { category: { select: { id: true, name: true, icon: true } } },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_PRODUCT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat produk' }, { status: 500 });
  }
}
