/**
 * Global TypeScript type definitions untuk rzdkstore.
 * Akan ditambahkan seiring pengembangan fitur.
 */

// Re-export Prisma generated types (akan tersedia setelah prisma generate)
// export type { User, Order, Product, ... } from '@prisma/client';

// Custom types yang digunakan di frontend
export type OrderStatusLabel = {
  status: string;
  label: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
};

export type NavItem = {
  title: string;
  href: string;
  icon?: string;
  badge?: number;
};
