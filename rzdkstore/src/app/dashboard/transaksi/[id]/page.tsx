'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

/**
 * Upload Proof Component — digunakan saat status APPROVED
 */
function UploadProofForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) {
      setError('Pilih file bukti pembayaran terlebih dahulu');
      return;
    }
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/orders/${orderId}/upload-proof`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => onSuccess(), 1500);
      } else {
        setError(data.message || 'Gagal upload');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setUploading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
        <p className="text-body-sm text-primary font-medium">Bukti pembayaran berhasil diupload!</p>
        <p className="text-body-xs text-muted-foreground mt-1">Menunggu verifikasi admin...</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 p-4 bg-dark rounded-lg border border-dashed border-dark-border">
      <p className="text-body-xs text-muted-foreground mb-3 text-center">
        Upload bukti transfer (JPG, PNG, WebP, PDF — max 5MB)
      </p>

      {error && (
        <p className="text-body-xs text-error text-center mb-2">{error}</p>
      )}

      <div className="flex flex-col items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={(e) => { setFile(e.target.files?.[0] || null); setError(''); }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 border border-dark-border text-white text-body-xs rounded-lg hover:bg-dark-card transition-colors"
        >
          {file ? file.name : 'Pilih File'}
        </button>

        {file && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-body-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {uploading ? 'Mengupload...' : 'Upload Bukti Bayar'}
          </button>
        )}
      </div>
    </div>
  );
}


interface OrderDetail {
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
  variant: {
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
  };
  fulfillment: {
    content: string;
    sentAt: string;
    isAuto: boolean;
  } | null;
  voucher: { code: string; discountType: string; discountValue: number } | null;
  guarantees: { id: string; status: string; createdAt: string }[];
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-body-xs border ${config.className}`}>
      {config.label}
    </span>
  );
};

interface StepInfo {
  label: string;
  statuses: string[];
}

const ORDER_STEPS: StepInfo[] = [
  { label: 'Order Dibuat', statuses: ['PENDING_REVIEW', 'APPROVED', 'WAITING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'PROCESSING', 'COMPLETED'] },
  { label: 'Admin Review', statuses: ['APPROVED', 'WAITING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'PROCESSING', 'COMPLETED'] },
  { label: 'Pembayaran', statuses: ['WAITING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'PROCESSING', 'COMPLETED'] },
  { label: 'Diproses', statuses: ['PROCESSING', 'COMPLETED'] },
  { label: 'Selesai', statuses: ['COMPLETED'] },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
      } else {
        setError(json.message || 'Order tidak ditemukan');
      }
    } catch (err) {
      setError('Gagal memuat data order');
    } finally {
      setLoading(false);
    }
  };

  const getActiveStep = (status: string): number => {
    if (['REJECTED', 'CANCELLED', 'REFUNDED'].includes(status)) return -1;
    for (let i = ORDER_STEPS.length - 1; i >= 0; i--) {
      if (ORDER_STEPS[i].statuses.includes(status)) return i;
    }
    return 0;
  };

  const parseAdditionalData = (adminNote: string | null): Record<string, string> | null => {
    if (!adminNote) return null;
    try {
      return JSON.parse(adminNote);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-sm text-muted-foreground">Memuat detail order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-body-sm text-red-400">{error || 'Order tidak ditemukan'}</p>
        <a
          href="/dashboard/transaksi"
          className="inline-block mt-4 text-body-sm text-primary hover:text-primary-hover transition-colors"
        >
          ← Kembali ke Transaksi
        </a>
      </div>
    );
  }

  const activeStep = getActiveStep(order.status);
  const additionalData = parseAdditionalData(order.adminNote);
  const isRejectedOrCancelled = ['REJECTED', 'CANCELLED', 'REFUNDED'].includes(order.status);

  return (
    <div>
      {/* Back Button */}
      <a
        href="/dashboard/transaksi"
        className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Transaksi
      </a>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-heading-3 text-white">Detail Order</h1>
          <p className="text-body-xs text-muted-foreground font-mono mt-1">{order.id}</p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Order Status Tracker */}
      {!isRejectedOrCancelled && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
          <h2 className="font-heading text-heading-4 text-white mb-6">Status Order</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-border" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${activeStep >= 0 ? (activeStep / (ORDER_STEPS.length - 1)) * 100 : 0}%` }}
            />

            {ORDER_STEPS.map((step, index) => {
              const isCompleted = index <= activeStep;
              const isCurrent = index === activeStep;

              return (
                <div key={step.label} className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-primary border-primary'
                        : 'bg-dark-card border-dark-border'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-dark-border" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-body-xs text-center whitespace-nowrap ${
                      isCompleted ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Info Card */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
        <h2 className="font-heading text-heading-4 text-white mb-4">Informasi Order</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-body-xs text-muted-foreground">Produk</p>
            <div className="flex items-center gap-2 mt-1">
              <span>{order.variant.product.category.icon}</span>
              <p className="text-body-sm text-white">{order.variant.product.name}</p>
            </div>
          </div>
          <div>
            <p className="text-body-xs text-muted-foreground">Varian</p>
            <p className="text-body-sm text-white mt-1">{order.variant.name}</p>
          </div>
          <div>
            <p className="text-body-xs text-muted-foreground">Harga</p>
            <p className="text-body-sm text-white mt-1">{formatRupiah(order.unitPrice)}</p>
          </div>
          <div>
            <p className="text-body-xs text-muted-foreground">Diskon</p>
            <p className="text-body-sm text-green-400 mt-1">
              {order.discountAmount > 0 ? `- ${formatRupiah(order.discountAmount)}` : '-'}
            </p>
          </div>
          <div>
            <p className="text-body-xs text-muted-foreground">Total Bayar</p>
            <p className="text-body-sm text-primary font-medium mt-1">{formatRupiah(order.finalPrice)}</p>
          </div>
          <div>
            <p className="text-body-xs text-muted-foreground">Tanggal Order</p>
            <p className="text-body-sm text-white mt-1">
              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {order.voucher && (
            <div>
              <p className="text-body-xs text-muted-foreground">Voucher</p>
              <p className="text-body-sm text-white mt-1">
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-body-xs">{order.voucher.code}</span>
              </p>
            </div>
          )}
          {order.expiredAt && (
            <div>
              <p className="text-body-xs text-muted-foreground">Berlaku Hingga</p>
              <p className="text-body-sm text-white mt-1">
                {new Date(order.expiredAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status-specific Content */}
      {/* APPROVED: Payment section */}
      {order.status === 'APPROVED' && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
          <h2 className="font-heading text-heading-4 text-white mb-4">Pembayaran</h2>
          <p className="text-body-sm text-muted-foreground mb-4">
            Silakan lakukan pembayaran menggunakan QRIS di bawah ini:
          </p>
          <div className="flex flex-col items-center gap-4">
            {/* QRIS Placeholder */}
            <div className="w-64 h-64 bg-dark rounded-xl border border-dark-border flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="text-body-xs text-muted-foreground">QRIS Payment</p>
              </div>
            </div>
            <p className="text-body-sm text-primary font-medium">{formatRupiah(order.finalPrice)}</p>

            {/* Upload Form */}
            <UploadProofForm orderId={order.id} onSuccess={fetchOrderDetail} />
          </div>
        </div>
      )}

      {/* COMPLETED: Fulfillment content */}
      {order.status === 'COMPLETED' && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
          <h2 className="font-heading text-heading-4 text-white mb-4">Fulfillment</h2>
          {order.fulfillment ? (
            <div className="p-4 bg-dark rounded-lg border border-dark-border">
              <pre className="text-body-sm text-white whitespace-pre-wrap break-words font-mono">
                {order.fulfillment.content}
              </pre>
              <p className="text-body-xs text-muted-foreground mt-3">
                Dikirim: {new Date(order.fulfillment.sentAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {order.fulfillment.isAuto && ' (Otomatis)'}
              </p>
            </div>
          ) : (
            <p className="text-body-sm text-muted-foreground">
              Konten fulfillment belum tersedia.
            </p>
          )}

          {/* Guarantee Button */}
          {order.variant.guaranteeDays && order.variant.guaranteeDays > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-border">
              <a
                href="/dashboard/garansi"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 text-yellow-400 text-body-sm font-medium rounded-lg hover:bg-yellow-500/20 transition-colors border border-yellow-500/30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Klaim Garansi
              </a>
              <p className="text-body-xs text-muted-foreground mt-2">
                Garansi berlaku {order.variant.guaranteeDays} hari sejak order selesai
              </p>
            </div>
          )}
        </div>
      )}

      {/* REJECTED: Show reason */}
      {order.status === 'REJECTED' && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 mb-6">
          <h2 className="font-heading text-heading-4 text-red-400 mb-2">Order Ditolak</h2>
          <p className="text-body-sm text-white">
            {order.rejectReason || 'Tidak ada alasan yang diberikan.'}
          </p>
        </div>
      )}

      {/* Additional Data */}
      {additionalData && Object.keys(additionalData).length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
          <h2 className="font-heading text-heading-4 text-white mb-4">Data Tambahan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {additionalData.deviceBrand && (
              <div>
                <p className="text-body-xs text-muted-foreground">Brand Device</p>
                <p className="text-body-sm text-white mt-0.5">{additionalData.deviceBrand}</p>
              </div>
            )}
            {additionalData.deviceModel && (
              <div>
                <p className="text-body-xs text-muted-foreground">Model Device</p>
                <p className="text-body-sm text-white mt-0.5">{additionalData.deviceModel}</p>
              </div>
            )}
            {additionalData.deviceType && (
              <div>
                <p className="text-body-xs text-muted-foreground">Tipe Device</p>
                <p className="text-body-sm text-white mt-0.5">{additionalData.deviceType}</p>
              </div>
            )}
            {additionalData.deviceOs && (
              <div>
                <p className="text-body-xs text-muted-foreground">OS Device</p>
                <p className="text-body-sm text-white mt-0.5">{additionalData.deviceOs}</p>
              </div>
            )}
            {additionalData.loginCity && (
              <div>
                <p className="text-body-xs text-muted-foreground">Kota Login</p>
                <p className="text-body-sm text-white mt-0.5">{additionalData.loginCity}</p>
              </div>
            )}
            {additionalData.memberEmail && (
              <div>
                <p className="text-body-xs text-muted-foreground">Email Member</p>
                <p className="text-body-sm text-white mt-0.5">{additionalData.memberEmail}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
