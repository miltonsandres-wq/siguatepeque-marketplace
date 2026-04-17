import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="hidden md:block bg-slate-900/50 backdrop-blur-md border-t border-white/5 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏔️</span>
            <span className="font-bold text-white">Sigua</span>
            <span className="font-bold text-primary-500">Market</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/#categorias" className="text-sm text-slate-400 hover:text-white transition-colors">
              Categorías
            </Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Registrar Negocio
            </Link>
          </nav>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SiguaMarket · Siguatepeque, Comayagua
          </p>
        </div>
      </div>
    </footer>
  )
}
