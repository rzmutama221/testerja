'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type NotificationType =
  | 'ORDER'
  | 'PAYMENT'
  | 'FULFILLMENT'
  | 'GUARANTEE'
  | 'ANNOUNCEMENT'
  | 'SYSTEM';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    orderId?: string;
    [key: string]: unknown;
  };
}

type FilterTab = 'ALL' | NotificationType;

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Order', value: 'ORDER' },
  { label: 'Payment', value: 'PAYMENT' },
  { label: 'Fulfillment', value: 'FULFILLMENT' },
  { label: 'Guarantee', value: 'GUARANTEE' },
  { label: 'Announcement', value: 'ANNOUNCEMENT' },
  { label: 'System', value: 'SYSTEM' },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'ORDER':
      return <ClipboardIcon />;
    case 'PAYMENT':
      return <DollarIcon />;
    case 'FULFILLMENT':
      return <CheckIcon />;
    case 'GUARANTEE':
      return <ShieldIcon />;
    case 'ANNOUNCEMENT':
      return <MegaphoneIcon />;
    case 'SYSTEM':
      return <BellIcon />;
    default:
      return <BellIcon />;
  }
}

function getTypeColor(type: NotificationType): string {
  switch (type) {
    case 'ORDER':
      return '#3b82f6';
    case 'PAYMENT':
      return '#eab308';
    case 'FULFILLMENT':
      return '#01a35a';
    case 'GUARANTEE':
      return '#a855f7';
    case 'ANNOUNCEMENT':
      return '#f97316';
    case 'SYSTEM':
      return '#6b7280';
    default:
      return '#6b7280';
  }
}

// ─── Time Ago Helper ─────────────────────────────────────────────────────────

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffWeeks < 4) return `${diffWeeks} minggu lalu`;
  return `${diffMonths} bulan lalu`;
}

// ─── URL Base64 Helper ───────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [pushSubscribed, setPushSubscribed] = useState<boolean | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // ─── Fetch notifications ────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') {
        params.set('type', activeFilter);
      }
      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat notifikasi');
      const data = await res.json();
      setNotifications(data.notifications ?? data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ─── Check push subscription status ────────────────────────────────────────

  useEffect(() => {
    async function checkPushStatus() {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          setPushSubscribed(false);
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setPushSubscribed(!!subscription);
      } catch {
        setPushSubscribed(false);
      }
    }
    checkPushStatus();
  }, []);

  // ─── Subscribe to push ─────────────────────────────────────────────────────

  const subscribePush = async () => {
    try {
      setPushLoading(true);

      // 1. Fetch VAPID public key
      const keyRes = await fetch('/api/notifications/subscribe');
      if (!keyRes.ok) throw new Error('Gagal mendapatkan VAPID key');
      const { publicKey } = await keyRes.json();

      // 2. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Izin notifikasi ditolak');
      }

      // 3. Register service worker & get push subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 4. Send subscription to server
      const subRes = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!subRes.ok) throw new Error('Gagal menyimpan subscription');

      setPushSubscribed(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengaktifkan push notification';
      alert(message);
    } finally {
      setPushLoading(false);
    }
  };

  // ─── Unsubscribe from push ─────────────────────────────────────────────────

  const unsubscribePush = async () => {
    try {
      setPushLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      await fetch('/api/notifications/subscribe', { method: 'DELETE' });
      setPushSubscribed(false);
    } catch {
      alert('Gagal menonaktifkan push notification');
    } finally {
      setPushLoading(false);
    }
  };

  // ─── Mark single notification as read ──────────────────────────────────────

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Silently fail for individual reads
    }
  };

  // ─── Mark all as read ──────────────────────────────────────────────────────

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      alert('Gagal menandai semua dibaca');
    } finally {
      setMarkingAll(false);
    }
  };

  // ─── Handle notification click ─────────────────────────────────────────────

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.data?.orderId) {
      window.location.href = `/dashboard/transaksi/${notification.data.orderId}`;
    }
  };

  // ─── Computed values ───────────────────────────────────────────────────────

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      style={{ backgroundColor: '#171717', color: '#ffffff' }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="font-heading text-heading-2"
              style={{ fontSize: '1.5rem', fontWeight: 700 }}
            >
              Notifikasi
            </h1>
            {unreadCount > 0 && (
              <span
                className="text-body-xs font-heading"
                style={{
                  backgroundColor: '#01a35a',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: '2px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={markAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="text-body-sm font-heading"
            style={{
              color: unreadCount === 0 ? '#6b7280' : '#01a35a',
              background: 'none',
              border: 'none',
              cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              opacity: markingAll ? 0.5 : 1,
            }}
          >
            {markingAll ? 'Memproses...' : 'Tandai Semua Dibaca'}
          </button>
        </div>

        {/* ─── Push Notification Banner ────────────────────────────────────── */}
        {pushSubscribed === false && (
          <div
            style={{
              backgroundColor: '#1e3a5f',
              border: '1px solid #2563eb',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
            }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div style={{ color: '#60a5fa' }}>
                <BellIcon />
              </div>
              <p className="text-body-sm" style={{ color: '#bfdbfe', fontSize: '0.875rem' }}>
                Aktifkan notifikasi browser untuk update real-time
              </p>
            </div>
            <button
              onClick={subscribePush}
              disabled={pushLoading}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: pushLoading ? 'not-allowed' : 'pointer',
                opacity: pushLoading ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
              className="font-heading"
            >
              {pushLoading ? 'Mengaktifkan...' : 'Aktifkan Notifikasi'}
            </button>
          </div>
        )}

        {pushSubscribed === true && (
          <div className="flex items-center gap-2" style={{ padding: '0.25rem 0' }}>
            <span className="text-body-xs" style={{ color: '#01a35a', fontSize: '0.8125rem' }}>
              Push notification aktif ✓
            </span>
            <button
              onClick={unsubscribePush}
              disabled={pushLoading}
              className="text-body-xs"
              style={{
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textDecoration: 'underline',
                opacity: pushLoading ? 0.5 : 1,
              }}
            >
              Nonaktifkan
            </button>
          </div>
        )}

        {/* ─── Filter Tabs ─────────────────────────────────────────────────── */}
        <div
          className="flex gap-1 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className="font-heading text-body-sm"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor:
                  activeFilter === tab.value ? '#01a35a' : '#2c2c2c',
                color: activeFilter === tab.value ? '#ffffff' : '#9ca3af',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Content ─────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              style={{
                width: '2rem',
                height: '2rem',
                border: '3px solid #3f3f46',
                borderTop: '3px solid #01a35a',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p className="text-body-sm" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Memuat notifikasi...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              backgroundColor: '#2c2c2c',
              border: '1px solid #dc2626',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <p className="text-body-sm" style={{ color: '#fca5a5', fontSize: '0.875rem' }}>
              {error}
            </p>
            <button
              onClick={fetchNotifications}
              className="font-heading text-body-sm"
              style={{
                marginTop: '0.75rem',
                color: '#01a35a',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div
            style={{
              backgroundColor: '#2c2c2c',
              borderRadius: '0.75rem',
              padding: '3rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                margin: '0 auto 1rem',
                backgroundColor: '#3f3f46',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
              }}
            >
              <BellIcon />
            </div>
            <p
              className="font-heading text-heading-4"
              style={{ color: '#9ca3af', fontSize: '1rem', fontWeight: 600 }}
            >
              Belum ada notifikasi
            </p>
            <p className="text-body-xs" style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Notifikasi baru akan muncul di sini
            </p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNotificationClick(notification);
                  }
                }}
                style={{
                  backgroundColor: notification.read ? '#2c2c2c' : '#1f2937',
                  border: `1px solid ${notification.read ? '#3f3f46' : '#374151'}`,
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  cursor: notification.data?.orderId ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                }}
                className="hover:opacity-90"
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '0.5rem',
                      backgroundColor: `${getTypeColor(notification.type)}20`,
                      color: getTypeColor(notification.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="font-heading text-heading-4"
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: notification.read ? 400 : 700,
                          color: '#ffffff',
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <div
                            style={{
                              width: '0.5rem',
                              height: '0.5rem',
                              borderRadius: '50%',
                              backgroundColor: '#01a35a',
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <p
                      className="text-body-sm"
                      style={{
                        color: '#9ca3af',
                        fontSize: '0.8125rem',
                        marginTop: '0.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                      }}
                    >
                      {notification.message}
                    </p>
                    <p
                      className="text-body-xs"
                      style={{
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
