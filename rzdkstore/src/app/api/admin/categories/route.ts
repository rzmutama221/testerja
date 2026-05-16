import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/validations/product';

/**
 * GET /api/admin/categories
 * List semua kategori (dengan jumlah produk)
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('[GET_CATEGORIES_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Tambah kategori baru
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, icon, slug, sortOrder, isActive } = validation.data;

    // Cek slug duplikat
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Slug sudah digunakan' },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name, icon, slug, sortOrder, isActive },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_CATEGORY_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat kategori' },
      { status: 500 }
    );
  }
}
