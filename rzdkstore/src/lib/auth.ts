import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

import type { NextAuthConfig } from 'next-auth';

/**
 * NextAuth.js v5 Configuration
 * Credentials Provider: username + password
 * Session Strategy: JWT
 * Custom pages: login, register
 */

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username dan password wajib diisi');
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        // Cari user berdasarkan username
        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) {
          throw new Error('Username tidak ditemukan');
        }

        // Cek apakah akun aktif
        if (!user.isActive) {
          throw new Error('Akun Anda telah dinonaktifkan. Hubungi admin.');
        }

        // Cek apakah email sudah terverifikasi
        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Password salah');
        }

        // Return user object (akan disimpan di JWT)
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },

  callbacks: {
    async jwt({ token, user }) {
      // Saat login pertama, tambahkan data user ke token
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      // Tambahkan data dari token ke session
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Jika url sudah merupakan relative path atau baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
