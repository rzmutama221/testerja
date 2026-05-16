import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

/**
 * GET /api/admin/vouchers — List semua voucher dengan computed status
 */
export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } });
    const now = new Date();
    const enriched = vouchers.map((v) => ({
      ...v,
      computedStatus:
        !v.isActive ? 'INACTIVE' :
        now > v.validUntil ? 'EXPIRED' :
        now < v.validFrom ? 'SCHEDULED' :
        (v.usageLimit && v.usedCount >= v.usageLimit) ? 'USED_UP' : 'ACTIVE',
    }));
    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error('[GET_VOUCHERS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

/**
 * POST /api/admin/vouchers — Buat voucher baru
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code, description, discountType, discountValue, minPurchase,
      maxDiscount, usageLimit, validFrom, validUntil, isActive,
      applicableTo, productIds, categoryIds, autoGenerate,
    } = body;

    const voucherCode = autoGenerate
      ? `RZDK${crypto.randomBytes(3).toString('hex').toUpperCase()}`
      : code?.toUpperCase();

    if (!voucherCode) return NextResponse.json({ success: false, message: 'Kode voucher wajib' }, { status: 400 });
    if (!discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json({ success: false, message: 'Tipe diskon, nilai, dan masa berlaku wajib' }, { status: 400 });
    }

    const existing = await prisma.voucher.findUnique({ where: { code: voucherCode } });
    if (existing) return NextResponse.json({ success: false, message: 'Kode sudah digunakan' }, { status: 409 });

    const voucher = await prisma.voucher.create({
      data: {
        code: voucherCode, description: description || null, discountType,
        discountValue: Number(discountValue), minPurchase: Number(minPurchase) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        validFrom: new Date(validFrom), validUntil: new Date(validUntil),
        isActive: isActive !== false, applicableTo: applicableTo || 'ALL',
        productIds: productIds || null, categoryIds: categoryIds || null,
      },
    });

    return NextResponse.json({ success: true, data: voucher }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_VOUCHER_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat voucher' }, { status: 500 });
  }
}
