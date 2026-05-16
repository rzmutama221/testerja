import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * GET /api/guarantees — List klaim garansi milik user yang login
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const guarantees = await prisma.guarantee.findMany({
      where: { userId: token.id as string },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true, completedAt: true, expiredAt: true,
            variant: { select: { name: true, guaranteeDays: true, durationDays: true, product: { select: { name: true, category: { select: { icon: true } } } } } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: guarantees });
  } catch (error) {
    console.error('[GET_GUARANTEES_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data klaim' }, { status: 500 });
  }
}

/**
 * POST /api/guarantees — Customer submit klaim garansi baru
 * Body: FormData { orderId, description, file? (screenshot) }
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File | null;

    if (!orderId || !description) {
      return NextResponse.json({ success: false, message: 'Order ID dan deskripsi masalah wajib diisi' }, { status: 400 });
    }

    // Ambil order dan validasi
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: token.id as string, status: 'COMPLETED' },
      include: { variant: { select: { guaranteeDays: true, durationDays: true } } },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order tidak ditemukan atau belum selesai' }, { status: 404 });
    }

    // Kalkulasi guarantee_valid_until
    const guaranteeDays = order.variant.guaranteeDays ?? order.variant.durationDays;
    const completedAt = order.completedAt || order.createdAt;
    const guaranteeValidUntil = new Date(completedAt);
    guaranteeValidUntil.setDate(guaranteeValidUntil.getDate() + guaranteeDays);

    // Cek apakah masih dalam masa garansi
    if (guaranteeDays === 0 || new Date() > guaranteeValidUntil) {
      return NextResponse.json({ success: false, message: 'Masa garansi untuk order ini sudah habis' }, { status: 400 });
    }

    // Cek apakah sudah ada klaim terbuka
    const existingClaim = await prisma.guarantee.findFirst({
      where: { orderId, status: { in: ['OPEN', 'IN_REVIEW'] } },
    });
    if (existingClaim) {
      return NextResponse.json({ success: false, message: 'Sudah ada klaim garansi aktif untuk order ini' }, { status: 400 });
    }

    // Upload screenshot jika ada
    let attachmentUrl: string | null = null;
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ success: false, message: 'Format file harus JPG, PNG, atau WebP' }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, message: 'Ukuran file maksimal 5MB' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `guarantee-${orderId}-${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'guarantee');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      attachmentUrl = `/uploads/guarantee/${fileName}`;
    }

    // Buat klaim garansi
    const guarantee = await prisma.guarantee.create({
      data: {
        orderId,
        userId: token.id as string,
        description,
        attachmentUrl,
        status: 'OPEN',
        guaranteeValidUntil,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Klaim garansi berhasil diajukan! Menunggu review admin.', data: guarantee },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE_GUARANTEE_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengajukan klaim garansi' }, { status: 500 });
  }
}
