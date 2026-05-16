import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

/**
 * GET /api/admin/chatgpt — List semua akun head ChatGPT + slots
 */
export async function GET() {
  try {
    const accounts = await prisma.chatgptAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        slots: {
          orderBy: { slotNumber: 'asc' },
          include: { order: { select: { id: true, status: true } } },
        },
      },
    });
    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('[GET_CHATGPT_ACCOUNTS_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

/**
 * POST /api/admin/chatgpt — Tambah akun head ChatGPT + buat 4 slot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, email, password, notes } = body;

    if (!label || !email || !password) {
      return NextResponse.json({ success: false, message: 'Label, email, dan password wajib' }, { status: 400 });
    }

    const account = await prisma.chatgptAccount.create({
      data: {
        label, email, password: encrypt(password), notes: notes || null, maxMembers: 4,
        slots: {
          create: Array.from({ length: 4 }, (_, i) => ({ slotNumber: i + 1, isOccupied: false })),
        },
      },
      include: { slots: true },
    });

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_CHATGPT_ACCOUNT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat akun' }, { status: 500 });
  }
}
