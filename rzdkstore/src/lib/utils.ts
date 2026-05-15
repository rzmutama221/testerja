import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility untuk menggabungkan Tailwind CSS classes secara aman.
 * Menggunakan clsx + tailwind-merge untuk handle conflict.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka menjadi format Rupiah.
 * Contoh: 15000 → "Rp 15.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate Order ID dengan format ORD-YYYYMMDD-XXXX
 */
export function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `ORD-${dateStr}-${random}`;
}

/**
 * Menghitung tanggal expired berdasarkan tanggal mulai + durasi hari.
 */
export function calculateExpiredDate(startDate: Date, durationDays: number): Date {
  const expDate = new Date(startDate);
  expDate.setDate(expDate.getDate() + durationDays);
  return expDate;
}

/**
 * Cek apakah tanggal masih valid (belum expired).
 */
export function isNotExpired(expiredAt: Date | null): boolean {
  if (!expiredAt) return false;
  return new Date() < new Date(expiredAt);
}

/**
 * Hitung sisa hari dari sekarang ke tanggal expired.
 */
export function getRemainingDays(expiredAt: Date | null): number {
  if (!expiredAt) return 0;
  const now = new Date();
  const exp = new Date(expiredAt);
  const diffMs = exp.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
