import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/auth';

/**
 * POST /api/auth/reset-password
 * Reset password user berdasarkan token.
 *
 * Body: { token: string, password: string, confirmPassword: string }
 *
 * Flow:
 * 1. Validasi token & password baru
 * 2. Cari token di database, cek valid/expired/used
 * 3. Hash password baru
 * 4. Update password user
 * 5. Mark token as used
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...passwordData } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token reset tidak ditemukan' },
        { status: 400 }
      );
    }

    // 1. Validasi password
    const validationResult = resetPasswordSchema.safeParse(passwordData);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors },
        { status: 400 }
      );
    }

    // 2. Cari token di database
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, message: 'Token reset tidak valid' },
        { status: 404 }
      );
    }

    if (resetRecord.used) {
      return NextResponse.json(
        { success: false, message: 'Token sudah digunakan. Silakan minta reset ulang.' },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Token sudah kedaluwarsa. Silakan minta reset ulang.' },
        { status: 400 }
      );
    }

    // 3. Hash password baru
    const hashedPassword = await bcrypt.hash(validationResult.data.password, 12);

    // 4 & 5. Update password + mark token as used (transaction)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset! Silakan login dengan password baru.',
    });
  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
