import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, TrendingUp, Settings, Zap } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventario' },
    { path: '/forecast', icon: TrendingUp, label: 'Forecast' },
    { path: '/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-60 bg-card border-r border-border fixed h-full flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Zap size={24} className="text-bg" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-sans text-text">Yesh Market</h1>
              <p className="text-xs text-muted font-mono">Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-sans ${
                  isActive
                    ? 'bg-accent text-bg font-semibold'
                    : 'text-muted hover:text-text hover:bg-border'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border">
          <p className="text-xs text-muted font-mono">v1.0.0</p>
        </div>
      </aside>

      <main className="ml-60 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
