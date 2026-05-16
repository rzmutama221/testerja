import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/admin/stock/[id]
 * Hapus 1 stok digital item (hanya yang belum terpakai)
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.productStockItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ success: false, message: 'Stok item tidak ditemukan' }, { status: 404 });
    }

    if (item.isUsed) {
      return NextResponse.json(
        { success: false, message: 'Tidak bisa hapus stok yang sudah terpakai' },
        { status: 400 }
      );
    }

    await prisma.productStockItem.delete({ where: { id: params.id } });

    // Update stok count di varian
    const availableCount = await prisma.productStockItem.count({
      where: { variantId: item.variantId, isUsed: false },
    });
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: availableCount },
    });

    return NextResponse.json({ success: true, message: 'Stok item berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE_STOCK_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal hapus stok item' }, { status: 500 });
  }
}
