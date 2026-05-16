import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { productSchema } from '@/lib/validations/product';

/**
 * GET /api/admin/products/[id]
 * Detail produk beserta semua varian
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        variants: {
          orderBy: { price: 'asc' },
          include: {
            _count: { select: { stockItems: { where: { isUsed: false } } } },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('[GET_PRODUCT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data produk' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/products/[id]
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Cek slug duplikat (exclude current)
    const existingSlug = await prisma.product.findFirst({
      where: { slug, id: { not: params.id } },
    });
    if (existingSlug) {
      return NextResponse.json({ success: false, message: 'Slug sudah digunakan' }, { status: 409 });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { ...data, slug, categoryId },
      include: { category: { select: { id: true, name: true, icon: true } } },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('[UPDATE_PRODUCT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal update produk' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Cek apakah ada order terkait varian produk ini
    const orderCount = await prisma.order.count({
      where: { variant: { productId: params.id } },
    });
    if (orderCount > 0) {
      return NextResponse.json(
        { success: false, message: `Tidak bisa hapus: ada ${orderCount} order terkait produk ini` },
        { status: 400 }
      );
    }

    // Hapus varian dan stok items terlebih dahulu (cascade di schema)
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE_PRODUCT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal hapus produk' }, { status: 500 });
  }
}
