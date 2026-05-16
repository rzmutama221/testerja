'use client';

import { useEffect, useState } from 'react';

/**
 * Admin Dashboard — Overview Page
 *
 * Menampilkan summary cards real-time:
 * - Order hari ini, pending review, payment uploaded, processing
 * - Revenue hari ini
 * - Total customers, total produk
 * - Klaim garansi terbuka, stok rendah alert
 */

interface DashboardData {
  totalCustomers: number;
  totalProducts: number;
  totalActiveVariants: number;
  ordersToday: number;
  ordersPendingReview: number;
  ordersPaymentUploaded: number;
  ordersProcessing: number;
  ordersCompletedToday: number;
  openGuarantees: number;
  lowStockVariants: number;
  revenueToday: number;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    // Auto refresh setiap 30 detik
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/admin/dashboard');
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-heading-2 text-white mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-5 bg-dark-card border border-dark-border rounded-xl animate-pulse">
              <div className="h-3 bg-dark-border rounded w-24 mb-3" />
              <div className="h-7 bg-dark-border rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="font-heading text-heading-2 text-white mb-2">Admin Dashboard</h1>
        <p className="text-body-sm text-error">Gagal memuat data dashboard</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-heading-2 text-white">Admin Dashboard</h1>
          <p className="text-body-sm text-muted-foreground">Ringkasan aktivitas toko hari ini</p>
        </div>
        <span className="text-body-xs text-muted-foreground">Auto-refresh: 30s</span>
      </div>

      {/* Alert: Perlu Perhatian */}
      {(data.ordersPendingReview > 0 || data.ordersPaymentUploaded > 0 || data.openGuarantees > 0) && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-xl">
          <p className="text-body-sm font-medium text-warning mb-1">Perlu Perhatian</p>
          <div className="flex flex-wrap gap-4 text-body-xs text-muted-foreground">
            {data.ordersPendingReview > 0 && (
              <span>{data.ordersPendingReview} order menunggu review</span>
            )}
            {data.ordersPaymentUploaded > 0 && (
              <span>{data.ordersPaymentUploaded} bukti bayar perlu diverifikasi</span>
            )}
            {data.openGuarantees > 0 && (
              <span>{data.openGuarantees} klaim garansi terbuka</span>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue Hari Ini" value={formatRupiah(data.revenueToday)} color="green" />
        <StatCard label="Order Masuk Hari Ini" value={data.ordersToday.toString()} color="blue" />
        <StatCard label="Selesai Hari Ini" value={data.ordersCompletedToday.toString()} color="green" />
        <StatCard label="Sedang Diproses" value={data.ordersProcessing.toString()} color="yellow" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending Review" value={data.ordersPendingReview.toString()} color={data.ordersPendingReview > 0 ? 'yellow' : 'gray'} />
        <StatCard label="Verifikasi Bayar" value={data.ordersPaymentUploaded.toString()} color={data.ordersPaymentUploaded > 0 ? 'yellow' : 'gray'} />
        <StatCard label="Klaim Garansi" value={data.openGuarantees.toString()} color={data.openGuarantees > 0 ? 'red' : 'gray'} />
        <StatCard label="Stok Rendah" value={data.lowStockVariants.toString()} color={data.lowStockVariants > 0 ? 'red' : 'gray'} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground mb-1">Total Customer</p>
          <p className="font-heading text-heading-3 text-white">{data.totalCustomers}</p>
        </div>
        <div className="p-5 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground mb-1">Total Produk Aktif</p>
          <p className="font-heading text-heading-3 text-white">{data.totalProducts}</p>
        </div>
        <div className="p-5 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground mb-1">Total Varian Aktif</p>
          <p className="font-heading text-heading-3 text-white">{data.totalActiveVariants}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
}) {
  const colorMap = {
    green: 'text-primary',
    blue: 'text-info',
    yellow: 'text-warning',
    red: 'text-error',
    gray: 'text-white',
  };

  return (
    <div className="p-5 bg-dark-card border border-dark-border rounded-xl">
      <p className="text-body-xs text-muted-foreground mb-1">{label}</p>
      <p className={`font-heading text-heading-3 ${colorMap[color]}`}>{value}</p>
    </div>
  );
}
