import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/settings — Get general app stats for settings page
 */
export async function GET() {
  try {
    const [totalUsers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { finalPrice: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers, totalProducts, totalOrders,
        totalRevenue: totalRevenue._sum.finalPrice || 0,
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'rzdkstore',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://rzdkstore.my.id',
        waNumber: process.env.NEXT_PUBLIC_WA_NUMBER || '6285111642004',
      },
    });
  } catch (error) {
    console.error('[GET_SETTINGS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

/**
 * POST /api/admin/settings — Send test email
 */
export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();
    if (!to) return NextResponse.json({ success: false, message: 'Email tujuan wajib' }, { status: 400 });

    const { sendNotificationEmail } = await import('@/lib/email');
    await sendNotificationEmail({
      to, name: 'Admin', title: 'Test Email dari rzdkstore',
      message: 'Ini adalah email test. Jika Anda menerima email ini, konfigurasi SMTP berjalan dengan baik.',
    });

    return NextResponse.json({ success: true, message: `Email test berhasil dikirim ke ${to}` });
  } catch (error) {
    console.error('[TEST_EMAIL_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengirim email. Periksa konfigurasi SMTP.' }, { status: 500 });
  }
}
