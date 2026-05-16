import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { variantSchema } from '@/lib/validations/product';

/**
 * PUT /api/admin/variants/[id]
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = variantSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: variant });
  } catch (error) {
    console.error('[UPDATE_VARIANT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal update varian' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/variants/[id]
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Cek apakah ada order terkait
    const orderCount = await prisma.order.count({ where: { variantId: params.id } });
    if (orderCount > 0) {
      return NextResponse.json(
        { success: false, message: `Tidak bisa hapus: ada ${orderCount} order menggunakan varian ini` },
        { status: 400 }
      );
    }

    await prisma.productVariant.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Varian berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE_VARIANT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal hapus varian' }, { status: 500 });
  }
}
