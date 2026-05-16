import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { bulkStockSchema } from '@/lib/validations/product';

/**
 * GET /api/admin/stock?variantId=xxx
 * List stok digital per varian
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');

    if (!variantId) {
      return NextResponse.json({ success: false, message: 'variantId diperlukan' }, { status: 400 });
    }

    const stockItems = await prisma.productStockItem.findMany({
      where: { variantId },
      orderBy: [{ isUsed: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        isUsed: true,
        usedAt: true,
        orderId: true,
        createdAt: true,
        // Jangan expose content langsung (encrypted), hanya preview
        content: true,
      },
    });

    // Hitung statistik
    const total = stockItems.length;
    const available = stockItems.filter((i) => !i.isUsed).length;
    const used = stockItems.filter((i) => i.isUsed).length;

    return NextResponse.json({
      success: true,
      data: {
        stats: { total, available, used },
        items: stockItems.map((item) => ({
          ...item,
          // Tampilkan preview content (20 karakter pertama + ...)
          contentPreview: item.content.length > 20 ? item.content.substring(0, 20) + '...' : item.content,
        })),
      },
    });
  } catch (error) {
    console.error('[GET_STOCK_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data stok' }, { status: 500 });
  }
}

/**
 * POST /api/admin/stock
 * Bulk import stok digital (satu item per baris)
 *
 * Body: { variantId: string, items: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = bulkStockSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { variantId, items } = validation.data;

    // Cek varian ada
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant) {
      return NextResponse.json({ success: false, message: 'Varian tidak ditemukan' }, { status: 404 });
    }

    // Cek tipe produk harus AUTO
    if (variant.product.fulfillType !== 'AUTO') {
      return NextResponse.json(
        { success: false, message: 'Stok digital hanya untuk produk tipe AUTO' },
        { status: 400 }
      );
    }

    // Encrypt dan simpan setiap item
    const createdItems = await prisma.productStockItem.createMany({
      data: items.map((content) => ({
        variantId,
        content: encrypt(content.trim()),
        isUsed: false,
      })),
    });

    // Update stok count di varian
    const availableCount = await prisma.productStockItem.count({
      where: { variantId, isUsed: false },
    });
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: availableCount },
    });

    return NextResponse.json(
      { success: true, message: `${createdItems.count} stok berhasil ditambahkan`, count: createdItems.count },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE_STOCK_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal menambahkan stok' }, { status: 500 });
  }
}
