import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * PUT /api/admin/vouchers/[id] — Update voucher
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { code, description, discountType, discountValue, minPurchase, maxDiscount, usageLimit, validFrom, validUntil, isActive, applicableTo, productIds, categoryIds } = body;

    if (code) {
      const existing = await prisma.voucher.findFirst({ where: { code: code.toUpperCase(), id: { not: params.id } } });
      if (existing) return NextResponse.json({ success: false, message: 'Kode sudah digunakan' }, { status: 409 });
    }

    const data: any = {};
    if (code !== undefined) data.code = code.toUpperCase();
    if (description !== undefined) data.description = description || null;
    if (discountType !== undefined) data.discountType = discountType;
    if (discountValue !== undefined) data.discountValue = Number(discountValue);
    if (minPurchase !== undefined) data.minPurchase = Number(minPurchase);
    if (maxDiscount !== undefined) data.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (usageLimit !== undefined) data.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (validFrom !== undefined) data.validFrom = new Date(validFrom);
    if (validUntil !== undefined) data.validUntil = new Date(validUntil);
    if (isActive !== undefined) data.isActive = isActive;
    if (applicableTo !== undefined) data.applicableTo = applicableTo;
    if (productIds !== undefined) data.productIds = productIds;
    if (categoryIds !== undefined) data.categoryIds = categoryIds;

    const voucher = await prisma.voucher.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: voucher });
  } catch (error) {
    console.error('[UPDATE_VOUCHER_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal update voucher' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/vouchers/[id] — Hapus (hanya jika usedCount = 0)
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const voucher = await prisma.voucher.findUnique({ where: { id: params.id } });
    if (!voucher) return NextResponse.json({ success: false, message: 'Tidak ditemukan' }, { status: 404 });
    if (voucher.usedCount > 0) {
      return NextResponse.json({ success: false, message: `Sudah dipakai ${voucher.usedCount}x. Nonaktifkan saja.` }, { status: 400 });
    }
    await prisma.voucher.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Voucher dihapus' });
  } catch (error) {
    console.error('[DELETE_VOUCHER_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal hapus' }, { status: 500 });
  }
}
