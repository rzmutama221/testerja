import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

/**
 * GET /api/admin/netflix
 * List semua akun head Netflix + slot profiles
 */
export async function GET() {
  try {
    const accounts = await prisma.netflixAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        slots: {
          orderBy: { profileNumber: 'asc' },
          include: { order: { select: { id: true, status: true } } },
        },
      },
    });

    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('[GET_NETFLIX_ACCOUNTS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

/**
 * POST /api/admin/netflix
 * Tambah akun head Netflix baru + otomatis buat 5 slot kosong
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, email, password, notes } = body;

    if (!label || !email || !password) {
      return NextResponse.json({ success: false, message: 'Label, email, dan password wajib diisi' }, { status: 400 });
    }

    const account = await prisma.netflixAccount.create({
      data: {
        label,
        email,
        password: encrypt(password),
        notes: notes || null,
        maxProfiles: 5,
        slots: {
          create: Array.from({ length: 5 }, (_, i) => ({
            profileNumber: i + 1,
            isOccupied: false,
          })),
        },
      },
      include: { slots: true },
    });

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_NETFLIX_ACCOUNT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat akun' }, { status: 500 });
  }
}
