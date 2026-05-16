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

interface ActiveOrder extends Order {
  remainingDays: number;
}

export default function AkunAktifPage() {
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        const now = new Date();
        const active: ActiveOrder[] = json.data
          .filter((order: Order) => {
            return (
              order.status === 'COMPLETED' &&
              order.expiredAt &&
              new Date(order.expiredAt) > now
            );
          })
          .map((order: Order) => {
            const expiredAt = new Date(order.expiredAt!);
            const diffMs = expiredAt.getTime() - now.getTime();
            const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            return { ...order, remainingDays };
          });
        setActiveOrders(active);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingColor = (days: number): string => {
    if (days > 7) return 'text-green-400';
    if (days >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRemainingBg = (days: number): string => {
    if (days > 7) return 'bg-green-500/10 border-green-500/20';
    if (days >= 3) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-sm text-muted-foreground">Memuat akun aktif...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-heading-2 text-white mb-2">Akun Aktif</h1>
      <p className="text-body-sm text-muted-foreground mb-6">
        Daftar produk yang sedang aktif dan masa berlakunya
      </p>

      {activeOrders.length === 0 ? (
        <div className="text-center py-12 bg-dark-card border border-dark-border rounded-xl">
          <div className="w-16 h-16 rounded-full bg-dark flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-body-sm text-muted-foreground">Belum ada akun aktif</p>
          <a
            href="/dashboard/produk"
            className="inline-block mt-3 text-body-sm text-primary hover:text-primary-hover transition-colors"
          >
            Mulai berlangganan →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="bg-dark-card border border-dark-border rounded-xl overflow-hidden"
            >
              <div className="p-5">
                {/* Product Info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{order.variant.product.category.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-body-sm text-white truncate">
                      {order.variant.product.name}
                    </h3>
                    <p className="text-body-xs text-muted-foreground mt-0.5">
                      {order.variant.name}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-body-xs text-muted-foreground">Mulai</p>
                    <p className="text-body-sm text-white mt-0.5">
                      {order.completedAt
                        ? new Date(order.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-body-xs text-muted-foreground">Berakhir</p>
                    <p className="text-body-sm text-white mt-0.5">
                      {new Date(order.expiredAt!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Remaining Days */}
                <div className={`p-3 rounded-lg border ${getRemainingBg(order.remainingDays)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-body-xs text-muted-foreground">Sisa waktu</span>
                    <span className={`text-body-sm font-medium ${getRemainingColor(order.remainingDays)}`}>
                      {order.remainingDays} hari
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 w-full h-1.5 bg-dark rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        order.remainingDays > 7
                          ? 'bg-green-400'
                          : order.remainingDays >= 3
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                      }`}
                      style={{
                        width: `${Math.min(100, (order.remainingDays / order.variant.durationDays) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Expand/Detail Button */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full mt-4 py-2 text-body-xs text-primary hover:text-primary-hover transition-colors flex items-center justify-center gap-1"
                >
                  {expandedOrder === order.id ? 'Sembunyikan Detail' : 'Lihat Detail'}
                  <svg
                    className={`w-3 h-3 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expanded Detail */}
              {expandedOrder === order.id && (
                <div className="px-5 pb-5 border-t border-dark-border pt-4">
                  <div className="space-y-2 text-body-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="text-white font-mono">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durasi</span>
                      <span className="text-white">{order.variant.durationDays} hari</span>
                    </div>
                    {order.variant.guaranteeDays && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Garansi</span>
                        <span className="text-white">{order.variant.guaranteeDays} hari</span>
                      </div>
                    )}
                  </div>
                  <a
                    href={`/dashboard/transaksi/${order.id}`}
                    className="block mt-3 text-center py-2 bg-primary/10 text-primary text-body-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Lihat Order Lengkap
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
