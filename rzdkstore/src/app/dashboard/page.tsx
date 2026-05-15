export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-heading text-heading-2 text-white mb-2">Dashboard</h1>
      <p className="text-body-sm text-muted-foreground mb-8">
        Selamat datang di panel customer rzdkstore
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground">Total Order</p>
          <p className="font-heading text-heading-3 text-white mt-1">0</p>
        </div>
        <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground">Order Aktif</p>
          <p className="font-heading text-heading-3 text-primary mt-1">0</p>
        </div>
        <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-body-xs text-muted-foreground">Klaim Garansi</p>
          <p className="font-heading text-heading-3 text-white mt-1">0</p>
        </div>
      </div>
      <p className="text-body-xs text-muted-foreground mt-8">
        🚧 Dashboard lengkap akan diimplementasi di Fase 5
      </p>
    </div>
  );
}
