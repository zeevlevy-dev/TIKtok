import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { apiService, Product, formatPrice } from '../services/api';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await apiService.getProducts();
    setProducts(data);
    setLoading(false);
  };

  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockAlerts = products.filter(p => p.stock < 10).length;
  const projectedRevenue = products.reduce((sum, p) => sum + (p.stock * p.price * 0.7), 0);
  const outOfStock = products.filter(p => p.stock === 0);

  const salesData = Array.from({ length: 30 }, (_, i) => ({
    day: `Día ${i + 1}`,
    ventas: Math.floor(Math.random() * 20) + 5,
  }));

  const topProducts = [...products]
    .sort((a, b) => (b.stock * b.price) - (a.stock * a.price))
    .slice(0, 5)
    .map(p => ({
      name: p.title.length > 25 ? p.title.substring(0, 25) + '...' : p.title,
      valor: p.stock * p.price,
    }));

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text font-sans">Dashboard</h1>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card p-6 rounded-lg border border-border animate-pulse">
              <div className="h-20 bg-border rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {outOfStock.length > 0 && (
        <div className="bg-danger/10 border border-danger rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-danger" size={24} />
          <div>
            <p className="text-danger font-semibold font-sans">Productos Agotados</p>
            <p className="text-text text-sm">
              {outOfStock.length} producto{outOfStock.length > 1 ? 's' : ''} sin stock
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text font-sans">Dashboard</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-accent text-bg rounded-lg font-sans font-semibold hover:opacity-80 transition-opacity"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-lg border border-border hover:shadow-[0_0_20px_rgba(0,255,136,0.08)] transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm font-sans">Total Productos</p>
              <p className="text-3xl font-bold text-text font-mono mt-2">{totalProducts}</p>
            </div>
            <Package className="text-accent" size={32} />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border hover:shadow-[0_0_20px_rgba(0,255,136,0.08)] transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm font-sans">Total Unidades</p>
              <p className="text-3xl font-bold text-text font-mono mt-2">{totalUnits}</p>
            </div>
            <TrendingUp className="text-accent" size={32} />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border hover:shadow-[0_0_20px_rgba(0,255,136,0.08)] transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm font-sans">Alertas Stock Bajo</p>
              <p className="text-3xl font-bold text-warning font-mono mt-2">{lowStockAlerts}</p>
            </div>
            <AlertTriangle className="text-warning" size={32} />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border hover:shadow-[0_0_20px_rgba(0,255,136,0.08)] transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm font-sans">Ingresos Proyectados</p>
              <p className="text-2xl font-bold text-text font-mono mt-2">{formatPrice(projectedRevenue)}</p>
            </div>
            <DollarSign className="text-accent" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-bold text-text font-sans mb-4">Ventas Últimos 30 Días</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="day" stroke="#5a5a7a" style={{ fontSize: 12 }} />
              <YAxis stroke="#5a5a7a" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
                labelStyle={{ color: '#e8e8f0' }}
              />
              <Line type="monotone" dataKey="ventas" stroke="#00ff88" strokeWidth={2} dot={{ fill: '#00ff88' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-bold text-text font-sans mb-4">Top Productos por Valor</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="name" stroke="#5a5a7a" style={{ fontSize: 11 }} />
              <YAxis stroke="#5a5a7a" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
                labelStyle={{ color: '#e8e8f0' }}
              />
              <Bar dataKey="valor" fill="#00ff88" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
