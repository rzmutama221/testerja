import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateExpiredDate } from '@/lib/utils';

/**
 * PATCH /api/admin/netflix/slots
 * Actions: assign, update, clear
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, action, ...data } = body;

    if (!slotId || !action) {
      return NextResponse.json({ success: false, message: 'slotId dan action wajib' }, { status: 400 });
    }

    const slot = await prisma.netflixSlot.findUnique({ where: { id: slotId }, include: { account: true } });
    if (!slot) return NextResponse.json({ success: false, message: 'Slot tidak ditemukan' }, { status: 404 });

    switch (action) {
      case 'assign': {
        const { orderId } = data;
        if (!orderId) return NextResponse.json({ success: false, message: 'orderId wajib' }, { status: 400 });
        if (slot.isOccupied) return NextResponse.json({ success: false, message: 'Slot sudah terisi' }, { status: 400 });

        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true, variant: true } });
        if (!order || order.status !== 'PROCESSING') return NextResponse.json({ success: false, message: 'Order tidak valid' }, { status: 400 });

        let additionalData: Record<string, string> = {};
        try { if (order.adminNote) additionalData = JSON.parse(order.adminNote); } catch {}

        const completedAt = new Date();
        const expiredAt = calculateExpiredDate(completedAt, order.variant.durationDays);

        await prisma.$transaction([
          prisma.netflixSlot.update({
            where: { id: slotId },
            data: {
              isOccupied: true, orderId, customerName: order.user.fullName, customerWa: order.user.whatsapp,
              deviceBrand: additionalData.deviceBrand || data.deviceBrand || null,
              deviceModel: additionalData.deviceModel || data.deviceModel || null,
              deviceType: additionalData.deviceType || data.deviceType || null,
              deviceOs: additionalData.deviceOs || data.deviceOs || null,
              loginCity: additionalData.loginCity || data.loginCity || null,
              profileName: data.profileName || null, startedAt: completedAt, expiredAt,
            },
          }),
          prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED', completedAt, expiredAt } }),
          prisma.orderFulfillment.create({
            data: {
              orderId,
              content: `Netflix Slot Assigned\nAkun: ${slot.account.label}\nProfil #${slot.profileNumber}\nAktif: ${completedAt.toLocaleDateString('id-ID')} - ${expiredAt.toLocaleDateString('id-ID')}`,
              isAuto: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: 'Slot berhasil di-assign' });
      }

      case 'update': {
        const updateData: any = {};
        if (data.profileName !== undefined) updateData.profileName = data.profileName;
        if (data.deviceBrand !== undefined) updateData.deviceBrand = data.deviceBrand;
        if (data.deviceModel !== undefined) updateData.deviceModel = data.deviceModel;
        if (data.deviceType !== undefined) updateData.deviceType = data.deviceType;
        if (data.deviceOs !== undefined) updateData.deviceOs = data.deviceOs;
        if (data.loginCity !== undefined) updateData.loginCity = data.loginCity;
        if (data.expiredAt !== undefined) updateData.expiredAt = new Date(data.expiredAt);
        await prisma.netflixSlot.update({ where: { id: slotId }, data: updateData });
        return NextResponse.json({ success: true, message: 'Slot berhasil diupdate' });
      }

      case 'clear': {
        await prisma.netflixSlot.update({
          where: { id: slotId },
          data: { isOccupied: false, orderId: null, customerName: null, customerWa: null, deviceBrand: null, deviceModel: null, deviceType: null, deviceOs: null, loginCity: null, profileName: null, startedAt: null, expiredAt: null },
        });
        return NextResponse.json({ success: true, message: 'Slot berhasil dikosongkan' });
      }

      default:
        return NextResponse.json({ success: false, message: `Action '${action}' tidak valid` }, { status: 400 });
    }
  } catch (error) {
    console.error('[NETFLIX_SLOT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal memproses aksi' }, { status: 500 });
  }
}
