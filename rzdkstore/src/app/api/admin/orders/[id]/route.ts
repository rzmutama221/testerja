import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { calculateExpiredDate } from '@/lib/utils';

/**
 * GET /api/admin/orders/[id]
 * Detail order untuk admin
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, fullName: true, username: true, whatsapp: true, email: true } },
        variant: {
          include: {
            product: { select: { id: true, name: true, fulfillType: true, category: { select: { name: true, icon: true } } } },
          },
        },
        fulfillment: true,
        voucher: { select: { code: true, discountType: true, discountValue: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('[ADMIN_GET_ORDER_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Admin actions: approve, reject, verify_payment, reject_payment, fulfill_manual, fulfill_auto
 *
 * Body: { action: string, ...actionData }
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action, ...actionData } = body;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        variant: { include: { product: true, stockItems: { where: { isUsed: false }, take: 1 } } },
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order tidak ditemukan' }, { status: 404 });
    }

    switch (action) {
      // ============================================
      // ACTION: APPROVE ORDER (admin ACC stok)
      // ============================================
      case 'approve': {
        if (order.status !== 'PENDING_REVIEW') {
          return NextResponse.json({ success: false, message: 'Order bukan status PENDING_REVIEW' }, { status: 400 });
        }

        await prisma.order.update({
          where: { id: params.id },
          data: { status: 'APPROVED', adminNote: actionData.note || null },
        });

        return NextResponse.json({ success: true, message: 'Order disetujui. Customer dapat melakukan pembayaran.' });
      }

      // ============================================
      // ACTION: REJECT ORDER (stok habis / alasan lain)
      // ============================================
      case 'reject': {
        if (order.status !== 'PENDING_REVIEW') {
          return NextResponse.json({ success: false, message: 'Order bukan status PENDING_REVIEW' }, { status: 400 });
        }

        if (!actionData.reason) {
          return NextResponse.json({ success: false, message: 'Alasan penolakan wajib diisi' }, { status: 400 });
        }

        await prisma.order.update({
          where: { id: params.id },
          data: { status: 'REJECTED', rejectReason: actionData.reason },
        });

        return NextResponse.json({ success: true, message: 'Order ditolak.' });
      }

      // ============================================
      // ACTION: VERIFY PAYMENT (admin confirm bukti bayar valid)
      // ============================================
      case 'verify_payment': {
        if (order.status !== 'PAYMENT_UPLOADED') {
          return NextResponse.json({ success: false, message: 'Order bukan status PAYMENT_UPLOADED' }, { status: 400 });
        }

        const fulfillType = order.variant.product.fulfillType;

        // Jika AUTO: langsung fulfill
        if (fulfillType === 'AUTO') {
          const stockItem = order.variant.stockItems[0];
          if (!stockItem) {
            // Fallback ke PROCESSING jika stok habis
            await prisma.order.update({
              where: { id: params.id },
              data: { status: 'PROCESSING', paymentAt: new Date() },
            });
            return NextResponse.json({ success: true, message: 'Pembayaran verified. Stok AUTO habis, status: PROCESSING.' });
          }

          // Decrypt content & fulfill
          const decryptedContent = decrypt(stockItem.content);
          const completedAt = new Date();
          const expiredAt = calculateExpiredDate(completedAt, order.variant.durationDays);

          await prisma.$transaction([
            prisma.order.update({
              where: { id: params.id },
              data: { status: 'COMPLETED', paymentAt: new Date(), completedAt, expiredAt },
            }),
            prisma.orderFulfillment.create({
              data: { orderId: params.id, content: decryptedContent, isAuto: true },
            }),
            prisma.productStockItem.update({
              where: { id: stockItem.id },
              data: { isUsed: true, usedAt: new Date(), orderId: params.id },
            }),
            prisma.productVariant.update({
              where: { id: order.variantId },
              data: { stock: { decrement: 1 } },
            }),
          ]);

          return NextResponse.json({ success: true, message: 'Pembayaran verified & produk AUTO terkirim ke customer.' });
        }

        // Jika MANUAL atau SLOT: ke PROCESSING
        await prisma.order.update({
          where: { id: params.id },
          data: { status: 'PROCESSING', paymentAt: new Date() },
        });

        return NextResponse.json({ success: true, message: 'Pembayaran verified. Silakan proses fulfillment.' });
      }

      // ============================================
      // ACTION: REJECT PAYMENT (bukti bayar tidak valid)
      // ============================================
      case 'reject_payment': {
        if (order.status !== 'PAYMENT_UPLOADED') {
          return NextResponse.json({ success: false, message: 'Order bukan status PAYMENT_UPLOADED' }, { status: 400 });
        }

        await prisma.order.update({
          where: { id: params.id },
          data: { status: 'APPROVED', adminNote: actionData.reason || 'Bukti pembayaran ditolak. Silakan upload ulang.' },
        });

        return NextResponse.json({ success: true, message: 'Bukti bayar ditolak. Customer diminta upload ulang.' });
      }

      // ============================================
      // ACTION: FULFILL MANUAL (admin kirim info produk ke customer)
      // ============================================
      case 'fulfill_manual': {
        if (order.status !== 'PROCESSING') {
          return NextResponse.json({ success: false, message: 'Order bukan status PROCESSING' }, { status: 400 });
        }

        if (!actionData.content) {
          return NextResponse.json({ success: false, message: 'Konten fulfillment wajib diisi' }, { status: 400 });
        }

        const completedAt = new Date();
        const expiredAt = calculateExpiredDate(completedAt, order.variant.durationDays);

        await prisma.$transaction([
          prisma.order.update({
            where: { id: params.id },
            data: { status: 'COMPLETED', completedAt, expiredAt },
          }),
          prisma.orderFulfillment.create({
            data: { orderId: params.id, content: actionData.content, isAuto: false, sentBy: actionData.adminId || null },
          }),
        ]);

        return NextResponse.json({ success: true, message: 'Produk berhasil dikirim ke customer.' });
      }

      default:
        return NextResponse.json({ success: false, message: `Action '${action}' tidak dikenali` }, { status: 400 });
    }
  } catch (error) {
    console.error('[ADMIN_PATCH_ORDER_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal memproses action' }, { status: 500 });
  }
}
