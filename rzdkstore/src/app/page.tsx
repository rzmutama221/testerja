export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-dark">
      <div className="text-center">
        <h1 className="font-heading text-heading-1 text-white mb-4">
          <span className="text-primary">rzdk</span>store
        </h1>
        <p className="text-body-base text-secondary-foreground mb-8">
          Langganan Premium, Harga Terjangkau
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-6 py-3 border border-dark-border text-white hover:bg-dark-card rounded-lg transition-colors"
          >
            Daftar
          </a>
        </div>
        <p className="text-body-xs text-muted-foreground mt-12">
          🚧 Landing page dalam pengembangan — Fase 1 Fondasi Project
        </p>
      </div>
    </main>
  );
}
