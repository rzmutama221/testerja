export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-dark">
      {/* Sidebar - akan diimplementasi di Fase 5 */}
      <aside className="hidden md:flex w-64 flex-col bg-dark-card border-r border-dark-border p-4">
        <div className="mb-8">
          <h2 className="font-heading text-heading-4 text-white">
            <span className="text-primary">rzdk</span>store
          </h2>
        </div>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="text-body-sm text-white hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Dashboard</a>
          <a href="/dashboard/produk" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Produk</a>
          <a href="/dashboard/transaksi" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Transaksi</a>
          <a href="/dashboard/akun-aktif" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Akun Aktif</a>
          <a href="/dashboard/garansi" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Garansi</a>
          <a href="/dashboard/notifikasi" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Notifikasi</a>
          <a href="/dashboard/profil" className="text-body-sm text-muted-foreground hover:text-primary-hover px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">Profil</a>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
