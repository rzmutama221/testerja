import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { generateOrderId } from '@/lib/utils';

/**
 * GET /api/orders
 * List order user yang sedang login.
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { userId: token.id };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          select: {
            id: true, name: true, price: true, durationDays: true, guaranteeDays: true,
            product: { select: { id: true, name: true, logoUrl: true, fulfillType: true, category: { select: { name: true, icon: true } } } },
          },
        },
        voucher: { select: { code: true, discountType: true, discountValue: true } },
      },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('[GET_ORDERS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data order' }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Buat order baru.
 *
 * Body: { variantId, voucherCode?, additionalData? }
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { variantId, voucherCode, additionalData } = body;

    if (!variantId) {
      return NextResponse.json({ success: false, message: 'Varian produk wajib dipilih' }, { status: 400 });
    }

    // Ambil varian + produk
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || !variant.isActive || !variant.product.isActive) {
      return NextResponse.json({ success: false, message: 'Produk atau varian tidak tersedia' }, { status: 404 });
    }

    // Cek stok
    if (!variant.isUnlimited && variant.stock <= 0) {
      return NextResponse.json({ success: false, message: 'Stok habis untuk varian ini' }, { status: 400 });
    }

    // Validasi voucher
    let voucher = null;
    let discountAmount = 0;

    if (voucherCode) {
      voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
      if (!voucher || !voucher.isActive) {
        return NextResponse.json({ success: false, message: 'Kode voucher tidak valid' }, { status: 400 });
      }
      const now = new Date();
      if (now < voucher.validFrom || now > voucher.validUntil) {
        return NextResponse.json({ success: false, message: 'Voucher sudah expired' }, { status: 400 });
      }
      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        return NextResponse.json({ success: false, message: 'Voucher sudah mencapai batas penggunaan' }, { status: 400 });
      }
      if (variant.price < voucher.minPurchase) {
        return NextResponse.json({ success: false, message: `Minimum pembelian Rp ${voucher.minPurchase.toLocaleString()}` }, { status: 400 });
      }

      // Cek target
      if (voucher.applicableTo === 'SPECIFIC_PRODUCT') {
        const productIds = (voucher.productIds as string[]) || [];
        if (!productIds.includes(variant.product.id)) {
          return NextResponse.json({ success: false, message: 'Voucher tidak berlaku untuk produk ini' }, { status: 400 });
        }
      } else if (voucher.applicableTo === 'SPECIFIC_CATEGORY') {
        const categoryIds = (voucher.categoryIds as string[]) || [];
        if (!categoryIds.includes(variant.product.categoryId)) {
          return NextResponse.json({ success: false, message: 'Voucher tidak berlaku untuk kategori ini' }, { status: 400 });
        }
      }

      // Hitung diskon
      if (voucher.discountType === 'PERCENTAGE') {
        discountAmount = Math.floor(variant.price * voucher.discountValue / 100);
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) discountAmount = voucher.maxDiscount;
      } else {
        discountAmount = voucher.discountValue;
      }
      if (discountAmount > variant.price) discountAmount = variant.price;
    }

    // Hitung harga
    const finalPrice = variant.price - discountAmount;

    // Simpan order
    const orderId = generateOrderId();
    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: token.id as string,
        variantId,
        quantity: 1,
        unitPrice: variant.price,
        totalPrice: variant.price,
        voucherId: voucher?.id || null,
        discountAmount,
        finalPrice,
        status: 'PENDING_REVIEW',
        paymentMethod: 'QRIS_STATIC',
        adminNote: additionalData ? JSON.stringify(additionalData) : null,
      },
      include: {
        variant: { select: { name: true, price: true, product: { select: { name: true, fulfillType: true } } } },
      },
    });

    // Increment voucher
    if (voucher) {
      await prisma.voucher.update({ where: { id: voucher.id }, data: { usedCount: { increment: 1 } } });
    }

    return NextResponse.json(
      { success: true, message: 'Order berhasil dibuat! Menunggu persetujuan admin.', data: order },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE_ORDER_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat order' }, { status: 500 });
  }
}
