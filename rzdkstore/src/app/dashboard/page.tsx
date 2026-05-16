'use client';

import { useEffect, useState } from 'react';

interface OrderVariant {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  guaranteeDays: number | null;
  product: {
    id: string;
    name: string;
    logoUrl: string;
    fulfillType: string;
    category: { name: string; icon: string };
  };
}

interface Order {
  id: string;
  userId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  status: string;
  rejectReason: string | null;
  adminNote: string | null;
  paymentProof: string | null;
  paymentAt: string | null;
  completedAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  variant: OrderVariant;
  voucher: { code: string; discountType: string; discountValue: number } | null;
}

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING_REVIEW: { label: 'Pending Review', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    APPROVED: { label: 'Disetujui', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    WAITING_PAYMENT: { label: 'Menunggu Pembayaran', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    PAYMENT_UPLOADED: { label: 'Bukti Dikirim', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    PAYMENT_VERIFIED: { label: 'Pembayaran Verified', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    PROCESSING: { label: 'Diproses', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    COMPLETED: { label: 'Selesai', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    REJECTED: { label: 'Ditolak', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    CANCELLED: { label: 'Dibatalkan', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    REFUNDED: { label: 'Refund', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-body-xs border ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => o.status === 'COMPLETED' && o.expiredAt && new Date(o.expiredAt) > new Date()
  ).length;
  const pendingOrders = orders.filter(
    (o) => o.status === 'PENDING_REVIEW' || o.status === 'PROCESSING'
  ).length;

  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Greeting */}
      <h1 className="font-heading text-heading-2 text-white mb-2">
        Halo, Customer! 👋
      </h1>
      <p className="text-body-sm text-muted-foreground mb-8">
        Selamat datang kembali di rzdkstore
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-xs text-muted-foreground">Total Order</p>
              <p className="font-heading text-heading-3 text-white mt-1">{totalOrders}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-xs text-muted-foreground">Order Aktif</p>
              <p className="font-heading text-heading-3 text-primary mt-1">{activeOrders}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-xs text-muted-foreground">Menunggu Proses</p>
              <p className="font-heading text-heading-3 text-yellow-400 mt-1">{pendingOrders}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="font-heading text-heading-4 text-white mb-4">Transaksi Terakhir</h2>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-body-sm text-muted-foreground">Belum ada transaksi</p>
            <a
              href="/dashboard/produk"
              className="inline-block mt-3 text-body-sm text-primary hover:text-primary-hover transition-colors"
            >
              Mulai belanja →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <a
                key={order.id}
                href={`/dashboard/transaksi/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-dark/50 transition-colors border border-transparent hover:border-dark-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-body-xs">{order.variant.product.category.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-sm text-white truncate">
                      {order.variant.product.name}
                    </p>
                    <p className="text-body-xs text-muted-foreground">
                      {order.id} • {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-3">
                  {getStatusBadge(order.status)}
                </div>
              </a>
            ))}
          </div>
        )}

        {orders.length > 5 && (
          <div className="mt-4 pt-4 border-t border-dark-border text-center">
            <a
              href="/dashboard/transaksi"
              className="text-body-sm text-primary hover:text-primary-hover transition-colors"
            >
              Lihat semua transaksi →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
