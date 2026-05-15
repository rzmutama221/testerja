import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { sendVerificationEmail } from '@/lib/email';

/**
 * POST /api/auth/register
 * Registrasi user baru dengan validasi lengkap.
 *
 * Flow:
 * 1. Validasi input dengan Zod
 * 2. Cek apakah username/email sudah dipakai
 * 3. Hash password dengan bcrypt
 * 4. Simpan user ke database (emailVerified: false)
 * 5. Buat token verifikasi email (expired 24 jam)
 * 6. Kirim email verifikasi
 * 7. Return success response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validasi input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors },
        { status: 400 }
      );
    }

    const { fullName, username, email, whatsapp, password } = validationResult.data;

    // 2. Cek duplikasi username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: 'Username sudah digunakan', errors: { username: ['Username sudah digunakan'] } },
        { status: 409 }
      );
    }

    // 3. Cek duplikasi email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar', errors: { email: ['Email sudah terdaftar'] } },
        { status: 409 }
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Simpan user
    const user = await prisma.user.create({
      data: {
        fullName,
        username,
        email,
        whatsapp,
        password: hashedPassword,
        role: 'USER',
        emailVerified: false,
        isActive: true,
      },
    });

    // 6. Buat token verifikasi email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // 7. Kirim email verifikasi
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rzdkstore.my.id';
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    await sendVerificationEmail({
      to: email,
      name: fullName,
      verificationUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
