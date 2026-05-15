import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { sendResetPasswordEmail } from '@/lib/email';

/**
 * POST /api/auth/forgot-password
 * Kirim link reset password ke email user.
 *
 * Flow:
 * 1. Validasi email
 * 2. Cari user (jangan bocorkan jika tidak ada)
 * 3. Buat token reset (expired 1 jam)
 * 4. Kirim email dengan link reset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validasi
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // 2. Cari user — selalu return sukses untuk security
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.isActive) {
      // 3. Buat token reset password (expired 1 jam)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      // 4. Kirim email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rzdkstore.my.id';
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

      await sendResetPasswordEmail({
        to: user.email,
        name: user.fullName,
        resetUrl,
      });
    }

    // Selalu return sukses (jangan bocorkan apakah email terdaftar)
    return NextResponse.json({
      success: true,
      message: 'Jika email terdaftar, link reset password telah dikirim. Cek inbox/spam Anda.',
    });
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
