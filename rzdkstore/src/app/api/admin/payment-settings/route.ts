import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * GET /api/admin/payment-settings — Get current payment configuration
 */
export async function GET() {
  try {
    let settings = await prisma.paymentSetting.findUnique({ where: { id: 'singleton' } });

    // Auto-create singleton jika belum ada
    if (!settings) {
      settings = await prisma.paymentSetting.create({
        data: { id: 'singleton' },
      });
    }

    // Jangan expose secret keys
    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        gatewayApiKey: settings.gatewayApiKey ? '••••••••' + settings.gatewayApiKey.slice(-4) : null,
        gatewaySecretKey: settings.gatewaySecretKey ? '••••••••' + settings.gatewaySecretKey.slice(-4) : null,
      },
    });
  } catch (error) {
    console.error('[GET_PAYMENT_SETTINGS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil pengaturan' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/payment-settings — Update payment configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      qrisIsActive, gatewayIsActive, gatewayProvider,
      gatewayApiKey, gatewaySecretKey, activeMethod, paymentTimeoutHours,
    } = body;

    const data: any = {};
    if (qrisIsActive !== undefined) data.qrisIsActive = qrisIsActive;
    if (gatewayIsActive !== undefined) data.gatewayIsActive = gatewayIsActive;
    if (gatewayProvider !== undefined) data.gatewayProvider = gatewayProvider || null;
    if (gatewayApiKey && !gatewayApiKey.startsWith('••••')) data.gatewayApiKey = gatewayApiKey;
    if (gatewaySecretKey && !gatewaySecretKey.startsWith('••••')) data.gatewaySecretKey = gatewaySecretKey;
    if (activeMethod !== undefined) data.activeMethod = activeMethod;
    if (paymentTimeoutHours !== undefined) data.paymentTimeoutHours = Number(paymentTimeoutHours);

    const settings = await prisma.paymentSetting.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    });

    return NextResponse.json({ success: true, data: settings, message: 'Pengaturan berhasil disimpan' });
  } catch (error) {
    console.error('[UPDATE_PAYMENT_SETTINGS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan pengaturan' }, { status: 500 });
  }
}

/**
 * POST /api/admin/payment-settings — Upload QRIS image
 * FormData with field 'file'
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'File QRIS wajib diupload' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Format file harus JPG, PNG, atau WebP' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, 'qrisrzdkstore.png');
    await writeFile(filePath, buffer);

    const publicPath = '/uploads/qrisrzdkstore.png';

    await prisma.paymentSetting.upsert({
      where: { id: 'singleton' },
      update: { qrisImagePath: publicPath },
      create: { id: 'singleton', qrisImagePath: publicPath },
    });

    return NextResponse.json({
      success: true,
      message: 'Gambar QRIS berhasil diupdate',
      data: { qrisImagePath: publicPath },
    });
  } catch (error) {
    console.error('[UPLOAD_QRIS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal upload QRIS' }, { status: 500 });
  }
}
