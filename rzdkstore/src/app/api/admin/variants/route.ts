import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { variantSchema } from '@/lib/validations/product';

/**
 * GET /api/admin/variants?productId=xxx
 * List semua varian per produk
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, message: 'productId diperlukan' }, { status: 400 });
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { price: 'asc' },
      include: {
        _count: { select: { stockItems: { where: { isUsed: false } } } },
      },
    });

    return NextResponse.json({ success: true, data: variants });
  } catch (error) {
    console.error('[GET_VARIANTS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data varian' }, { status: 500 });
  }
}

/**
 * POST /api/admin/variants
 * Tambah varian baru untuk produk
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = variantSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Cek produk ada
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const variant = await prisma.productVariant.create({ data });
    return NextResponse.json({ success: true, data: variant }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_VARIANT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat varian' }, { status: 500 });
  }
}
