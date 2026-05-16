'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChatgptSlot {
  id: string;
  slotNumber: number;
  isOccupied: boolean;
  orderId: string | null;
  memberEmail: string | null;
  customerName: string | null;
  customerWa: string | null;
  invitedAt: string | null;
  expiredAt: string | null;
  order: { id: string; status: string } | null;
}

interface ChatgptAccount {
  id: string;
  label: string;
  email: string;
  password: string;
  maxMembers: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  slots: ChatgptSlot[];
}

interface ProcessingOrder {
  id: string;
  userId: string;
  status: string;
  finalPrice: number;
  createdAt: string;
  user: { fullName: string; whatsapp: string };
  variant: { name: string; durationDays: number; product: { name: string; slug: string } };
}

// ─── Helper ──────────────────────────────────────────────────────────────────
function getRemainingDays(expiredAt: string | null): number {
  if (!expiredAt) return 0;
  const now = new Date();
  const exp = new Date(expiredAt);
  const diff = exp.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getRemainingColor(days: number): string {
  if (days > 7) return '#22c55e';
  if (days >= 3) return '#eab308';
  return '#ef4444';
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminChatGPTPage() {
  const [accounts, setAccounts] = useState<ChatgptAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Account Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLabel, setFormLabel] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Assign Order
  const [assignSlotId, setAssignSlotId] = useState<string | null>(null);
  const [processingOrders, setProcessingOrders] = useState<ProcessingOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [assignMemberEmail, setAssignMemberEmail] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Edit Slot
  const [editSlotId, setEditSlotId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});

  // ─── Fetch Data ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/chatgpt');
      const json = await res.json();
      if (json.success) {
        setAccounts(json.data);
      } else {
        setError(json.message || 'Gagal memuat data');
      }
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Fetch Processing Orders ─────────────────────────────────────────────
  const fetchProcessingOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders?status=PROCESSING');
      const json = await res.json();
      if (json.success) {
        const chatgptOrders = (json.data || []).filter((o: ProcessingOrder) =>
          o.variant?.product?.name?.toLowerCase().includes('chatgpt') ||
          o.variant?.product?.slug?.toLowerCase().includes('chatgpt')
        );
        setProcessingOrders(chatgptOrders);
      }
    } catch { /* ignore */ }
  };

  // ─── Add Account ─────────────────────────────────────────────────────────
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: formLabel, email: formEmail, password: formPassword, notes: formNotes }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Akun berhasil ditambahkan');
        setShowAddForm(false);
        setFormLabel(''); setFormEmail(''); setFormPassword(''); setFormNotes('');
        fetchData();
      } else {
        setError(json.message || 'Gagal menambah akun');
      }
    } catch { setError('Gagal menambah akun'); }
    finally { setSubmitting(false); }
  };

  // ─── Delete Account ──────────────────────────────────────────────────────
  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Yakin hapus akun ini beserta semua slot-nya?')) return;
    try {
      const res = await fetch(`/api/admin/chatgpt/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { setSuccess('Akun berhasil dihapus'); fetchData(); }
      else { setError(json.message || 'Gagal menghapus akun'); }
    } catch { setError('Gagal menghapus akun'); }
  };

  // ─── Assign Order to Slot ────────────────────────────────────────────────
  const handleAssignOrder = async () => {
    if (!assignSlotId || !selectedOrderId) return;
    setAssignLoading(true);
    try {
      const res = await fetch('/api/admin/chatgpt/slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: assignSlotId, action: 'assign', orderId: selectedOrderId, memberEmail: assignMemberEmail || undefined }),
      });
      const json = await res.json();
      if (json.success) { setSuccess('Order berhasil di-assign'); setAssignSlotId(null); setSelectedOrderId(''); setAssignMemberEmail(''); fetchData(); }
      else { setError(json.message || 'Gagal assign order'); }
    } catch { setError('Gagal assign order'); }
    finally { setAssignLoading(false); }
  };

  // ─── Clear Slot ──────────────────────────────────────────────────────────
  const handleClearSlot = async (slotId: string) => {
    if (!confirm('Yakin kosongkan slot ini?')) return;
    try {
      const res = await fetch('/api/admin/chatgpt/slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, action: 'clear' }),
      });
      const json = await res.json();
      if (json.success) { setSuccess('Slot berhasil dikosongkan'); fetchData(); }
      else { setError(json.message || 'Gagal mengosongkan slot'); }
    } catch { setError('Gagal mengosongkan slot'); }
  };

  // ─── Update Slot ─────────────────────────────────────────────────────────
  const handleUpdateSlot = async () => {
    if (!editSlotId) return;
    try {
      const res = await fetch('/api/admin/chatgpt/slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: editSlotId, action: 'update', ...editData }),
      });
      const json = await res.json();
      if (json.success) { setSuccess('Slot berhasil diupdate'); setEditSlotId(null); setEditData({}); fetchData(); }
      else { setError(json.message || 'Gagal update slot'); }
    } catch { setError('Gagal update slot'); }
  };

  // ─── Summary Stats ───────────────────────────────────────────────────────
  const totalAccounts = accounts.length;
  const allSlots = accounts.flatMap(a => a.slots);
  const totalSlots = allSlots.length;
  const occupiedSlots = allSlots.filter(s => s.isOccupied).length;
  const emptySlots = totalSlots - occupiedSlots;
  const expiringSoon = allSlots.filter(s => s.isOccupied && s.expiredAt && getRemainingDays(s.expiredAt) < 7 && getRemainingDays(s.expiredAt) >= 0).length;

  // ─── Clear Messages ──────────────────────────────────────────────────────
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  // ─── Loading Skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '24px', background: '#171717', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ width: '200px', height: '32px', background: '#2c2c2c', borderRadius: '8px' }} />
          <div style={{ width: '120px', height: '36px', background: '#2c2c2c', borderRadius: '8px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height: '80px', background: '#2c2c2c', borderRadius: '8px', animation: 'pulse 2s infinite' }} />)}
        </div>
        {[1,2].map(i => (
          <div key={i} style={{ background: '#2c2c2c', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ width: '150px', height: '20px', background: '#3f3f46', borderRadius: '4px', marginBottom: '12px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[1,2,3,4].map(j => <div key={j} style={{ height: '120px', background: '#3f3f46', borderRadius: '8px' }} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#171717', minHeight: '100vh', color: 'white' }}>
      {/* Feedback */}
      {success && <div style={{ background: '#064e3b', border: '1px solid #01a35a', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', color: '#6ee7b7' }}>{success}</div>}
      {error && <div style={{ background: '#450a0a', border: '1px solid #ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', color: '#fca5a5' }}>{error}</div>}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Panel Slot ChatGPT</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: '#01a35a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {showAddForm ? 'Tutup Form' : 'Tambah Akun'}
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Akun', value: totalAccounts, color: '#60a5fa' },
          { label: 'Total Slot', value: totalSlots, color: '#a78bfa' },
          { label: 'Slot Terisi', value: occupiedSlots, color: '#f97316' },
          { label: 'Slot Kosong', value: emptySlots, color: '#22c55e' },
          { label: 'Expired < 7 Hari', value: expiringSoon, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#2c2c2c', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Add Account Form */}
      {showAddForm && (
        <form onSubmit={handleAddAccount} style={{ background: '#2c2c2c', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Tambah Akun ChatGPT</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '4px' }}>Label *</label>
              <input value={formLabel} onChange={e => setFormLabel(e.target.value)} required placeholder="e.g. ChatGPT Akun 1" style={{ width: '100%', padding: '10px 12px', background: '#3f3f46', border: '1px solid #52525b', borderRadius: '6px', color: 'white', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '4px' }}>Email *</label>
              <input value={formEmail} onChange={e => setFormEmail(e.target.value)} required type="email" placeholder="email@example.com" style={{ width: '100%', padding: '10px 12px', background: '#3f3f46', border: '1px solid #52525b', borderRadius: '6px', color: 'white', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '4px' }}>Password *</label>
              <input value={formPassword} onChange={e => setFormPassword(e.target.value)} required placeholder="Password akun" style={{ width: '100%', padding: '10px 12px', background: '#3f3f46', border: '1px solid #52525b', borderRadius: '6px', color: 'white', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginBottom: '4px' }}>Notes</label>
              <input value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Catatan tambahan" style={{ width: '100%', padding: '10px 12px', background: '#3f3f46', border: '1px solid #52525b', borderRadius: '6px', color: 'white', outline: 'none' }} />
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ marginTop: '16px', background: '#01a35a', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Menyimpan...' : 'Simpan Akun'}
          </button>
        </form>
      )}

      {/* Account List */}
      {accounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#a1a1aa' }}>Belum ada akun ChatGPT. Klik &quot;Tambah Akun&quot; untuk memulai.</div>
      ) : (
        accounts.map(account => (
          <div key={account.id} style={{ background: '#2c2c2c', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            {/* Account Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{account.label}</h3>
                <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{account.email} &bull; <span style={{ color: account.isActive ? '#22c55e' : '#ef4444' }}>{account.isActive ? 'Aktif' : 'Nonaktif'}</span></p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleDeleteAccount(account.id)} style={{ background: '#7f1d1d', color: '#fca5a5', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Hapus</button>
              </div>
            </div>

            {/* 4 Slot Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {account.slots.map(slot => {
                const remaining = getRemainingDays(slot.expiredAt);
                const isExpired = slot.isOccupied && remaining < 0;

                if (!slot.isOccupied) {
                  // Empty Slot
                  return (
                    <div key={slot.id} style={{ border: '2px solid #22c55e', borderRadius: '10px', padding: '16px', background: '#1a2e1a', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '4px' }}>Slot #{slot.slotNumber}</div>
                        <div style={{ fontSize: '14px', color: '#22c55e', fontWeight: 600 }}>Kosong</div>
                      </div>
                      <button
                        onClick={() => { setAssignSlotId(slot.id); fetchProcessingOrders(); }}
                        style={{ marginTop: '12px', background: '#01a35a', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                      >
                        Assign Order
                      </button>
                    </div>
                  );
                }

                // Occupied Slot
                return (
                  <div key={slot.id} style={{ border: `2px solid ${isExpired ? '#ef4444' : '#f97316'}`, borderRadius: '10px', padding: '16px', background: isExpired ? '#1a0a0a' : '#2a1a0a', minHeight: '120px' }}>
                    <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '8px' }}>Slot #{slot.slotNumber}</div>
                    <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>{slot.customerName}</strong></div>
                    <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '4px' }}>WA: {slot.customerWa || '-'}</div>
                    <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '4px' }}>Email Member: {slot.memberEmail || '-'}</div>
                    <div style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>Invited: {slot.invitedAt ? new Date(slot.invitedAt).toLocaleDateString('id-ID') : '-'}</div>
                    <div style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>Expired: {slot.expiredAt ? new Date(slot.expiredAt).toLocaleDateString('id-ID') : '-'}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: getRemainingColor(remaining), marginBottom: '8px' }}>
                      {isExpired ? 'EXPIRED' : `${remaining} hari tersisa`}
                    </div>

                    {/* Slot Actions */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => { setEditSlotId(slot.id); setEditData({ memberEmail: slot.memberEmail || '', expiredAt: slot.expiredAt ? slot.expiredAt.split('T')[0] : '' }); }} style={{ background: '#3f3f46', color: '#e4e4e7', padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button onClick={() => handleClearSlot(slot.id)} style={{ background: '#7f1d1d', color: '#fca5a5', padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Kosongkan</button>
                    </div>

                    {/* Edit Form Inline */}
                    {editSlotId === slot.id && (
                      <div style={{ marginTop: '12px', padding: '12px', background: '#3f3f46', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Edit Slot</div>
                        <input placeholder="Member Email" value={editData.memberEmail || ''} onChange={e => setEditData({ ...editData, memberEmail: e.target.value })} style={{ width: '100%', padding: '6px 8px', background: '#2c2c2c', border: '1px solid #52525b', borderRadius: '4px', color: 'white', marginBottom: '6px', fontSize: '11px', outline: 'none' }} />
                        <input type="date" value={editData.expiredAt || ''} onChange={e => setEditData({ ...editData, expiredAt: e.target.value })} style={{ width: '100%', padding: '6px 8px', background: '#2c2c2c', border: '1px solid #52525b', borderRadius: '4px', color: 'white', marginBottom: '8px', fontSize: '11px', outline: 'none' }} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={handleUpdateSlot} style={{ background: '#01a35a', color: 'white', padding: '4px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Simpan</button>
                          <button onClick={() => { setEditSlotId(null); setEditData({}); }} style={{ background: '#3f3f46', color: '#a1a1aa', padding: '4px 12px', borderRadius: '4px', border: '1px solid #52525b', cursor: 'pointer', fontSize: '11px' }}>Batal</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Assign Order Modal (Inline) */}
            {assignSlotId && account.slots.some(s => s.id === assignSlotId) && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#3f3f46', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Assign Order ke Slot</h4>
                {processingOrders.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#a1a1aa' }}>Tidak ada order ChatGPT PROCESSING saat ini.</p>
                ) : (
                  <>
                    <select value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: '#2c2c2c', border: '1px solid #52525b', borderRadius: '6px', color: 'white', marginBottom: '8px', outline: 'none' }}>
                      <option value="">-- Pilih Order --</option>
                      {processingOrders.map(o => (
                        <option key={o.id} value={o.id}>{o.user.fullName} — {o.variant.name} (Rp{o.finalPrice.toLocaleString('id-ID')})</option>
                      ))}
                    </select>
                    <input placeholder="Email Member (opsional)" value={assignMemberEmail} onChange={e => setAssignMemberEmail(e.target.value)} type="email" style={{ width: '100%', padding: '8px 12px', background: '#2c2c2c', border: '1px solid #52525b', borderRadius: '6px', color: 'white', marginBottom: '12px', outline: 'none', fontSize: '13px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleAssignOrder} disabled={!selectedOrderId || assignLoading} style={{ background: '#01a35a', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, opacity: (!selectedOrderId || assignLoading) ? 0.6 : 1 }}>{assignLoading ? 'Assigning...' : 'Assign'}</button>
                      <button onClick={() => { setAssignSlotId(null); setSelectedOrderId(''); setAssignMemberEmail(''); }} style={{ background: '#2c2c2c', color: '#a1a1aa', padding: '8px 16px', borderRadius: '6px', border: '1px solid #52525b', cursor: 'pointer', fontSize: '13px' }}>Batal</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
