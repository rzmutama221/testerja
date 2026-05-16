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

type FilterTab = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

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

export default function TransaksiPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

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

  const filterOrders = (orders: Order[]): Order[] => {
    switch (activeTab) {
      case 'pending':
        return orders.filter((o) =>
          ['PENDING_REVIEW', 'APPROVED', 'WAITING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'PROCESSING'].includes(o.status)
        );
      case 'active':
        return orders.filter(
          (o) => o.status === 'COMPLETED' && o.expiredAt && new Date(o.expiredAt) > new Date()
        );
      case 'completed':
        return orders.filter(
          (o) => o.status === 'COMPLETED' && (!o.expiredAt || new Date(o.expiredAt) <= new Date())
        );
      case 'cancelled':
        return orders.filter((o) => ['REJECTED', 'CANCELLED', 'REFUNDED'].includes(o.status));
      default:
        return orders;
    }
  };

  const filteredOrders = filterOrders(orders);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Aktif' },
    { key: 'completed', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-sm text-muted-foreground">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-heading-2 text-white mb-2">Riwayat Transaksi</h1>
      <p className="text-body-sm text-muted-foreground mb-6">
        Daftar semua order yang pernah kamu buat
      </p>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-dark-card border border-dark-border text-muted-foreground hover:text-white hover:border-primary/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-dark-card border border-dark-border rounded-xl">
          <div className="w-16 h-16 rounded-full bg-dark flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-body-sm text-muted-foreground">Belum ada transaksi</p>
          <a
            href="/dashboard/produk"
            className="inline-block mt-3 text-body-sm text-primary hover:text-primary-hover transition-colors"
          >
            Mulai belanja →
          </a>
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-dark-border text-body-xs text-muted-foreground font-medium">
            <div className="col-span-2">No Order</div>
            <div className="col-span-3">Produk</div>
            <div className="col-span-2">Varian</div>
            <div className="col-span-2">Harga</div>
            <div className="col-span-1">Tanggal</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Orders */}
          <div className="divide-y divide-dark-border">
            {filteredOrders.map((order) => (
              <a
                key={order.id}
                href={`/dashboard/transaksi/${order.id}`}
                className="block p-4 hover:bg-dark/50 transition-colors"
              >
                {/* Desktop Row */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2">
                    <p className="text-body-xs text-white font-mono truncate">{order.id}</p>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{order.variant.product.category.icon}</span>
                      <p className="text-body-sm text-white truncate">{order.variant.product.name}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-body-sm text-muted-foreground truncate">{order.variant.name}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-body-sm text-white">{formatRupiah(order.finalPrice)}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-body-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Mobile Row */}
                <div className="md:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{order.variant.product.category.icon}</span>
                        <p className="text-body-sm text-white truncate">{order.variant.product.name}</p>
                      </div>
                      <p className="text-body-xs text-muted-foreground mt-1">
                        {order.variant.name} • {formatRupiah(order.finalPrice)}
                      </p>
                      <p className="text-body-xs text-muted-foreground mt-0.5">
                        {order.id} • {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
