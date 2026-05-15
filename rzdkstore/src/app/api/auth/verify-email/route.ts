import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/auth/verify-email?token=xxxxx
 * Verifikasi email user berdasarkan token.
 *
 * Flow:
 * 1. Ambil token dari query params
 * 2. Cari token di database
 * 3. Cek apakah token valid (belum used, belum expired)
 * 4. Set user.emailVerified = true
 * 5. Mark token sebagai used
 * 6. Return success
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token verifikasi tidak ditemukan' },
        { status: 400 }
      );
    }

    // Cari token di database
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, message: 'Token verifikasi tidak valid' },
        { status: 404 }
      );
    }

    // Cek apakah token sudah digunakan
    if (verification.used) {
      return NextResponse.json(
        { success: false, message: 'Token sudah digunakan. Silakan login.' },
        { status: 400 }
      );
    }

    // Cek apakah token sudah expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Token sudah kedaluwarsa. Silakan minta verifikasi ulang.' },
        { status: 400 }
      );
    }

    // Update: set emailVerified = true & mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Email berhasil diverifikasi! Silakan login.',
    });
  } catch (error) {
    console.error('[VERIFY_EMAIL_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
