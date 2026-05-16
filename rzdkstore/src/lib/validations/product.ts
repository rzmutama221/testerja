import { z } from 'zod';

/**
 * Validation schemas untuk manajemen produk (admin).
 */

// --- KATEGORI ---
export const categorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(100),
  icon: z.string().min(1, 'Icon/emoji wajib diisi').max(10),
  slug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan dash'),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// --- PRODUK ---
export const productSchema = z.object({
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  name: z.string().min(2, 'Nama produk minimal 2 karakter').max(200),
  slug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan dash'),
  logoUrl: z.string().min(1, 'Logo URL wajib diisi'),
  description: z.string().optional(),
  fulfillType: z.enum(['AUTO', 'MANUAL', 'SLOT']),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export type ProductInput = z.infer<typeof productSchema>;

// --- VARIAN ---
export const variantSchema = z.object({
  productId: z.string().min(1, 'Product ID wajib'),
  name: z.string().min(2, 'Nama varian minimal 2 karakter').max(200),
  price: z.number().int().min(1000, 'Harga minimal Rp 1.000'),
  durationDays: z.number().int().min(1, 'Durasi minimal 1 hari'),
  stock: z.number().int().min(0).default(0),
  isUnlimited: z.boolean().default(false),
  isActive: z.boolean().default(true),
  guaranteeDays: z.number().int().min(0).nullable().optional(),
  notes: z.string().optional(),
});

export type VariantInput = z.infer<typeof variantSchema>;

// --- STOK DIGITAL ---
export const stockItemSchema = z.object({
  variantId: z.string().min(1, 'Variant ID wajib'),
  content: z.string().min(1, 'Konten stok wajib diisi'),
});

export const bulkStockSchema = z.object({
  variantId: z.string().min(1, 'Variant ID wajib'),
  items: z.array(z.string().min(1)).min(1, 'Minimal 1 item stok'),
});

export type StockItemInput = z.infer<typeof stockItemSchema>;
export type BulkStockInput = z.infer<typeof bulkStockSchema>;
