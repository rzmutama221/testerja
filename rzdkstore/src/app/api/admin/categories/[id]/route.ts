import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/validations/product';

/**
 * GET /api/admin/categories/[id]
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('[GET_CATEGORY_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/categories/[id]
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Cek slug duplikat (exclude current)
    const existingSlug = await prisma.category.findFirst({
      where: { slug: validation.data.slug, id: { not: params.id } },
    });
    if (existingSlug) {
      return NextResponse.json({ success: false, message: 'Slug sudah digunakan' }, { status: 409 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('[UPDATE_CATEGORY_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal update kategori' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/categories/[id]
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Cek apakah masih ada produk di kategori ini
    const productCount = await prisma.product.count({ where: { categoryId: params.id } });
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, message: `Tidak bisa hapus: masih ada ${productCount} produk di kategori ini` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE_CATEGORY_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal hapus kategori' }, { status: 500 });
  }
}
