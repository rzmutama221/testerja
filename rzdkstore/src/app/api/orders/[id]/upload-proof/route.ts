import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/orders/[id]/upload-proof
 * Customer upload bukti pembayaran.
 *
 * Menerima FormData dengan field 'file' (jpg/png/pdf, max 5MB).
 * Hanya bisa dilakukan saat status APPROVED.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Cek order milik user ini
    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: token.id as string },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order tidak ditemukan' }, { status: 404 });
    }

    if (order.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, message: 'Upload bukti hanya bisa dilakukan saat order sudah disetujui admin' },
        { status: 400 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'File bukti pembayaran wajib diupload' }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.' },
        { status: 400 }
      );
    }

    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      );
    }

    // Simpan file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${params.id}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs');

    // Buat directory jika belum ada
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/payment-proofs/${fileName}`;

    // Update order
    await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'PAYMENT_UPLOADED',
        paymentProof: publicPath,
        paymentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.',
      data: { paymentProof: publicPath },
    });
  } catch (error) {
    console.error('[UPLOAD_PROOF_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal upload bukti pembayaran' }, { status: 500 });
  }
}
