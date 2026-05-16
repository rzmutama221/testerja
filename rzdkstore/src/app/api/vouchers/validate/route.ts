import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

/**
 * POST /api/vouchers/validate
 * Customer validates voucher code before submitting order.
 * Body: { code: string, variantId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { code, variantId } = await request.json();
    if (!code || !variantId) {
      return NextResponse.json({ success: false, message: 'Kode voucher dan variantId wajib' }, { status: 400 });
    }

    const voucher = await prisma.voucher.findUnique({ where: { code: code.toUpperCase() } });
    if (!voucher || !voucher.isActive) {
      return NextResponse.json({ success: false, message: 'Kode voucher tidak valid' }, { status: 404 });
    }

    const now = new Date();
    if (now < voucher.validFrom || now > voucher.validUntil) {
      return NextResponse.json({ success: false, message: 'Voucher sudah expired atau belum aktif' }, { status: 400 });
    }
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({ success: false, message: 'Voucher sudah mencapai batas penggunaan' }, { status: 400 });
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant) return NextResponse.json({ success: false, message: 'Varian tidak ditemukan' }, { status: 404 });

    if (variant.price < voucher.minPurchase) {
      return NextResponse.json({ success: false, message: `Minimum pembelian Rp ${voucher.minPurchase.toLocaleString('id-ID')}` }, { status: 400 });
    }

    if (voucher.applicableTo === 'SPECIFIC_PRODUCT') {
      const ids = (voucher.productIds as string[]) || [];
      if (!ids.includes(variant.product.id)) {
        return NextResponse.json({ success: false, message: 'Voucher tidak berlaku untuk produk ini' }, { status: 400 });
      }
    } else if (voucher.applicableTo === 'SPECIFIC_CATEGORY') {
      const ids = (voucher.categoryIds as string[]) || [];
      if (!ids.includes(variant.product.categoryId)) {
        return NextResponse.json({ success: false, message: 'Voucher tidak berlaku untuk kategori ini' }, { status: 400 });
      }
    }

    let discountAmount = 0;
    if (voucher.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor(variant.price * voucher.discountValue / 100);
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) discountAmount = voucher.maxDiscount;
    } else {
      discountAmount = voucher.discountValue;
    }
    if (discountAmount > variant.price) discountAmount = variant.price;

    return NextResponse.json({
      success: true,
      data: {
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        discountAmount,
        originalPrice: variant.price,
        finalPrice: variant.price - discountAmount,
        description: voucher.description,
      },
    });
  } catch (error) {
    console.error('[VALIDATE_VOUCHER_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal validasi voucher' }, { status: 500 });
  }
}
