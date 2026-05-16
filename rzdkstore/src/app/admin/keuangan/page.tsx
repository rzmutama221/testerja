'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FinanceData {
  summary: {
    revenueThisMonth: number;
    revenueLastMonth: number;
    ordersThisMonth: number;
    totalDiscount: number;
    revenueAllTime: number;
  };
  chartData: { label: string; value: number }[];
  topProducts: {
    rank: number;
    name: string;
    category: string;
    categoryIcon: string;
    variant: string;
    orders: number;
    revenue: number;
  }[];
  categoryBreakdown: {
    name: string;
    icon: string;
    revenue: number;
    orders: number;
  }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getGrowthPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// ─── Skeleton Components ─────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5 animate-pulse"
      style={{ backgroundColor: '#2c2c2c' }}
    >
      <div className="h-3 w-24 rounded" style={{ backgroundColor: '#3f3f46' }} />
      <div className="h-7 w-32 rounded mt-3" style={{ backgroundColor: '#3f3f46' }} />
      <div className="h-3 w-20 rounded mt-2" style={{ backgroundColor: '#3f3f46' }} />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div
      className="rounded-xl p-6 animate-pulse"
      style={{ backgroundColor: '#2c2c2c', height: '320px' }}
    >
      <div className="h-4 w-40 rounded mb-4" style={{ backgroundColor: '#3f3f46' }} />
      <div className="flex items-end gap-1 h-56">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              backgroundColor: '#3f3f46',
              height: `${Math.random() * 60 + 20}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div
      className="rounded-xl p-6 animate-pulse"
      style={{ backgroundColor: '#2c2c2c' }}
    >
      <div className="h-4 w-48 rounded mb-4" style={{ backgroundColor: '#3f3f46' }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 rounded mb-2" style={{ backgroundColor: '#3f3f46' }} />
      ))}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function AdminKeuanganPage() {
  const now = new Date();
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        period,
        year: String(year),
        ...(period === 'daily' ? { month: String(month) } : {}),
      });
      const res = await fetch(`/api/admin/finance?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat data keuangan');
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [period, month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Growth calculation ──────────────────────────────────────────────────
  const growth = data
    ? getGrowthPercent(data.summary.revenueThisMonth, data.summary.revenueLastMonth)
    : 0;
  const growthPositive = growth >= 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#171717' }}>
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-heading text-heading-2 text-white mb-1">
          Laporan Keuangan
        </h1>
        <p className="text-body-sm" style={{ color: '#71717a' }}>
          Lihat laporan pendapatan, order, dan performa produk
        </p>
      </div>

      {/* ─── Period Tabs + Controls ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: '#2c2c2c' }}>
          <button
            onClick={() => setPeriod('daily')}
            className="px-4 py-2 text-body-sm font-medium transition-colors"
            style={{
              backgroundColor: period === 'daily' ? '#01a35a' : 'transparent',
              color: period === 'daily' ? '#fff' : '#71717a',
            }}
          >
            Harian
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className="px-4 py-2 text-body-sm font-medium transition-colors"
            style={{
              backgroundColor: period === 'monthly' ? '#01a35a' : 'transparent',
              color: period === 'monthly' ? '#fff' : '#71717a',
            }}
          >
            Bulanan
          </button>
        </div>

        {/* Month selector (only for daily) */}
        {period === 'daily' && (
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg px-3 py-2 text-body-sm text-white border-none outline-none"
            style={{ backgroundColor: '#2c2c2c' }}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        )}

        {/* Year input */}
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          min={2020}
          max={2099}
          className="rounded-lg px-3 py-2 text-body-sm text-white border-none outline-none w-24"
          style={{ backgroundColor: '#2c2c2c' }}
        />
      </div>

      {/* ─── Error State ──────────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl p-4 mb-6 text-body-sm"
          style={{ backgroundColor: '#2c2c2c', color: '#ef4444' }}
        >
          {error}
          <button
            onClick={fetchData}
            className="ml-3 underline"
            style={{ color: '#01a35a' }}
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* ─── Loading Skeletons ────────────────────────────────────────────── */}
      {loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonChart />
          <div className="mt-6">
            <SkeletonTable />
          </div>
        </>
      )}

      {/* ─── Data Content ─────────────────────────────────────────────────── */}
      {!loading && data && (
        <>
          {/* ─── Summary Stat Cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Pendapatan Bulan Ini */}
            <div className="rounded-xl p-5" style={{ backgroundColor: '#2c2c2c' }}>
              <p className="text-body-xs" style={{ color: '#71717a' }}>
                Pendapatan Bulan Ini
              </p>
              <p className="font-heading text-heading-3 text-white mt-1">
                {formatRupiah(data.summary.revenueThisMonth)}
              </p>
              <p
                className="text-body-xs mt-1"
                style={{ color: growthPositive ? '#01a35a' : '#ef4444' }}
              >
                {growthPositive ? '▲' : '▼'} {Math.abs(growth).toFixed(1)}% vs bulan lalu
              </p>
            </div>

            {/* Order Bulan Ini */}
            <div className="rounded-xl p-5" style={{ backgroundColor: '#2c2c2c' }}>
              <p className="text-body-xs" style={{ color: '#71717a' }}>
                Order Bulan Ini
              </p>
              <p className="font-heading text-heading-3 text-white mt-1">
                {data.summary.ordersThisMonth.toLocaleString('id-ID')}
              </p>
              <p className="text-body-xs mt-1" style={{ color: '#71717a' }}>
                total transaksi
              </p>
            </div>

            {/* Total Diskon Diberikan */}
            <div className="rounded-xl p-5" style={{ backgroundColor: '#2c2c2c' }}>
              <p className="text-body-xs" style={{ color: '#71717a' }}>
                Total Diskon Diberikan
              </p>
              <p className="font-heading text-heading-3 text-white mt-1">
                {formatRupiah(data.summary.totalDiscount)}
              </p>
              <p className="text-body-xs mt-1" style={{ color: '#71717a' }}>
                potongan harga
              </p>
            </div>

            {/* Pendapatan All Time */}
            <div className="rounded-xl p-5" style={{ backgroundColor: '#2c2c2c' }}>
              <p className="text-body-xs" style={{ color: '#71717a' }}>
                Pendapatan All Time
              </p>
              <p className="font-heading text-heading-3 text-white mt-1">
                {formatRupiah(data.summary.revenueAllTime)}
              </p>
              <p className="text-body-xs mt-1" style={{ color: '#71717a' }}>
                sejak toko berdiri
              </p>
            </div>
          </div>

          {/* ─── Revenue Chart (div-based bar chart) ────────────────────── */}
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#2c2c2c' }}>
            <h2 className="font-heading text-heading-4 text-white mb-4">
              {period === 'daily'
                ? `Pendapatan Harian — ${MONTH_NAMES[month - 1]} ${year}`
                : `Pendapatan Bulanan — ${year}`}
            </h2>

            {data.chartData.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-body-sm" style={{ color: '#71717a' }}>
                  Belum ada data untuk periode ini
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-[2px] h-56 overflow-x-auto pb-6 relative">
                {(() => {
                  const maxVal = Math.max(...data.chartData.map((d) => d.value), 1);
                  return data.chartData.map((item, idx) => {
                    const heightPercent = (item.value / maxVal) * 100;
                    return (
                      <div
                        key={idx}
                        className="flex-1 min-w-[12px] flex flex-col items-center justify-end h-full relative group"
                      >
                        {/* Bar */}
                        <div
                          className="w-full rounded-t transition-all duration-200 min-h-[2px]"
                          style={{
                            height: `${Math.max(heightPercent, 1)}%`,
                            backgroundColor: '#01a35a',
                            opacity: 0.85,
                          }}
                          title={`${item.label}: ${formatRupiah(item.value)}`}
                        />
                        {/* X-axis label */}
                        <span
                          className="absolute -bottom-5 text-center whitespace-nowrap"
                          style={{
                            fontSize: '9px',
                            color: '#71717a',
                            maxWidth: '24px',
                            overflow: 'hidden',
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* ─── Top Products Table ─────────────────────────────────────── */}
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#2c2c2c' }}>
            <h2 className="font-heading text-heading-4 text-white mb-4">
              Top 10 Produk (Bulan Ini)
            </h2>

            {data.topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-24">
                <p className="text-body-sm" style={{ color: '#71717a' }}>
                  Belum ada data produk
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #3f3f46' }}>
                      <th className="text-body-xs py-3 px-2" style={{ color: '#71717a' }}>
                        #
                      </th>
                      <th className="text-body-xs py-3 px-2" style={{ color: '#71717a' }}>
                        Produk
                      </th>
                      <th className="text-body-xs py-3 px-2" style={{ color: '#71717a' }}>
                        Varian
                      </th>
                      <th className="text-body-xs py-3 px-2 text-right" style={{ color: '#71717a' }}>
                        Order
                      </th>
                      <th className="text-body-xs py-3 px-2 text-right" style={{ color: '#71717a' }}>
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((product) => (
                      <tr
                        key={product.rank}
                        style={{ borderBottom: '1px solid #3f3f46' }}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <td className="text-body-sm text-white py-3 px-2">
                          {product.rank}
                        </td>
                        <td className="text-body-sm text-white py-3 px-2">
                          <span className="mr-2">{product.categoryIcon}</span>
                          {product.name}
                        </td>
                        <td className="text-body-sm py-3 px-2" style={{ color: '#71717a' }}>
                          {product.variant || '-'}
                        </td>
                        <td className="text-body-sm text-white py-3 px-2 text-right">
                          {product.orders}
                        </td>
                        <td className="text-body-sm text-white py-3 px-2 text-right">
                          {formatRupiah(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ─── Category Breakdown ─────────────────────────────────────── */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#2c2c2c' }}>
            <h2 className="font-heading text-heading-4 text-white mb-4">
              Breakdown Kategori
            </h2>

            {data.categoryBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-24">
                <p className="text-body-sm" style={{ color: '#71717a' }}>
                  Belum ada data kategori
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.categoryBreakdown.map((cat) => (
                  <div
                    key={cat.name}
                    className="rounded-lg p-4"
                    style={{ backgroundColor: '#3f3f46' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-heading text-body-sm text-white">
                        {cat.name}
                      </span>
                    </div>
                    <p className="text-body-sm text-white">
                      {formatRupiah(cat.revenue)}
                    </p>
                    <p className="text-body-xs" style={{ color: '#71717a' }}>
                      {cat.orders} order
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Empty State (no data, not loading, no error) ─────────────── */}
      {!loading && !data && !error && (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-body-sm" style={{ color: '#71717a' }}>
            Tidak ada data yang tersedia
          </p>
        </div>
      )}
    </div>
  );
}
