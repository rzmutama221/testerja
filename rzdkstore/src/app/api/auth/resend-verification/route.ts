import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

/**
 * POST /api/auth/resend-verification
 * Kirim ulang email verifikasi.
 *
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    // Cari user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Jangan bocorkan info apakah email terdaftar atau tidak
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, link verifikasi telah dikirim.',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terverifikasi. Silakan login.' },
        { status: 400 }
      );
    }

    // Buat token baru
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // Kirim email (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rzdkstore.my.id';
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.fullName,
        verificationUrl,
      });
    } catch (emailError) {
      console.warn('[RESEND_VERIFICATION] Email could not be sent:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Jika SMTP sudah dikonfigurasi, link verifikasi telah dikirim. Alternatif: aktifkan manual via phpMyAdmin.',
    });
  } catch (error) {
    console.error('[RESEND_VERIFICATION_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
