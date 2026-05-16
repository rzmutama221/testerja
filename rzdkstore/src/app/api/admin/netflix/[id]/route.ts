import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

/**
 * PUT /api/admin/netflix/[id] — Update akun head Netflix
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { label, email, password, notes, isActive } = body;

    const data: any = {};
    if (label !== undefined) data.label = label;
    if (email !== undefined) data.email = email;
    if (password) data.password = encrypt(password);
    if (notes !== undefined) data.notes = notes;
    if (isActive !== undefined) data.isActive = isActive;

    const account = await prisma.netflixAccount.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    console.error('[UPDATE_NETFLIX_ACCOUNT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal update akun' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/netflix/[id] — Hapus akun (hanya jika semua slot kosong)
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const occupiedSlots = await prisma.netflixSlot.count({ where: { accountId: params.id, isOccupied: true } });
    if (occupiedSlots > 0) {
      return NextResponse.json({ success: false, message: `Tidak bisa hapus: masih ada ${occupiedSlots} slot terisi` }, { status: 400 });
    }
    await prisma.netflixAccount.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Akun Netflix berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE_NETFLIX_ACCOUNT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal hapus akun' }, { status: 500 });
  }
}
