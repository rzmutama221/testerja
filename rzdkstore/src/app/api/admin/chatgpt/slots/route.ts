import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateExpiredDate } from '@/lib/utils';

/**
 * PATCH /api/admin/chatgpt/slots — Actions: assign, update, clear
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, action, ...data } = body;

    if (!slotId || !action) return NextResponse.json({ success: false, message: 'slotId dan action wajib' }, { status: 400 });

    const slot = await prisma.chatgptSlot.findUnique({ where: { id: slotId }, include: { account: true } });
    if (!slot) return NextResponse.json({ success: false, message: 'Slot tidak ditemukan' }, { status: 404 });

    switch (action) {
      case 'assign': {
        const { orderId } = data;
        if (!orderId) return NextResponse.json({ success: false, message: 'orderId wajib' }, { status: 400 });
        if (slot.isOccupied) return NextResponse.json({ success: false, message: 'Slot sudah terisi' }, { status: 400 });

        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true, variant: true } });
        if (!order || order.status !== 'PROCESSING') return NextResponse.json({ success: false, message: 'Order tidak valid' }, { status: 400 });

        // Parse member email from additionalData
        let additionalData: Record<string, string> = {};
        try { if (order.adminNote) additionalData = JSON.parse(order.adminNote); } catch {}

        const memberEmail = additionalData.memberEmail || data.memberEmail || '';
        const completedAt = new Date();
        const expiredAt = calculateExpiredDate(completedAt, order.variant.durationDays);

        await prisma.$transaction([
          prisma.chatgptSlot.update({
            where: { id: slotId },
            data: {
              isOccupied: true, orderId, customerName: order.user.fullName, customerWa: order.user.whatsapp,
              memberEmail, invitedAt: completedAt, expiredAt,
            },
          }),
          prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED', completedAt, expiredAt } }),
          prisma.orderFulfillment.create({
            data: {
              orderId,
              content: `ChatGPT Business Slot Assigned\nAkun: ${slot.account.label}\nSlot #${slot.slotNumber}\nEmail: ${memberEmail}\nAktif: ${completedAt.toLocaleDateString('id-ID')} - ${expiredAt.toLocaleDateString('id-ID')}\n\nSilakan cek email Anda untuk invitation ke workspace ChatGPT Business.`,
              isAuto: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: 'Slot ChatGPT berhasil di-assign' });
      }

      case 'update': {
        const updateData: any = {};
        if (data.memberEmail !== undefined) updateData.memberEmail = data.memberEmail;
        if (data.expiredAt !== undefined) updateData.expiredAt = new Date(data.expiredAt);
        await prisma.chatgptSlot.update({ where: { id: slotId }, data: updateData });
        return NextResponse.json({ success: true, message: 'Slot berhasil diupdate' });
      }

      case 'clear': {
        await prisma.chatgptSlot.update({
          where: { id: slotId },
          data: { isOccupied: false, orderId: null, customerName: null, customerWa: null, memberEmail: null, invitedAt: null, expiredAt: null },
        });
        return NextResponse.json({ success: true, message: 'Slot berhasil dikosongkan' });
      }

      default:
        return NextResponse.json({ success: false, message: `Action '${action}' tidak valid` }, { status: 400 });
    }
  } catch (error) {
    console.error('[CHATGPT_SLOT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal memproses aksi' }, { status: 500 });
  }
}
