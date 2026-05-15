export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-dark">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-dark-card border-r border-dark-border p-4">
        <div className="mb-8">
          <h2 className="font-heading text-heading-4 text-white">
            <span className="text-primary">rzdk</span>store
          </h2>
          <span className="text-body-xs text-muted-foreground">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-2">
          <a href="/admin" className="text-body-sm text-white hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Dashboard</a>
          <a href="/admin/transaksi" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Transaksi</a>
          <a href="/admin/produk" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Produk</a>
          <a href="/admin/customers" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Customers</a>
          <a href="/admin/netflix" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Netflix</a>
          <a href="/admin/chatgpt" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">ChatGPT</a>
          <a href="/admin/keuangan" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Keuangan</a>
          <a href="/admin/voucher" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Voucher</a>
          <a href="/admin/announcement" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Announcement</a>
          <a href="/admin/garansi" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Garansi</a>
          <a href="/admin/payment-settings" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Payment Settings</a>
          <a href="/admin/pengaturan" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Pengaturan</a>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
