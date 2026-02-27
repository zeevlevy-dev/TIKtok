import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, Calendar, Package, ShoppingCart } from 'lucide-react';
import { apiService, Product, calculateForecast, formatDate } from '../services/api';

export default function Forecast() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await apiService.getProducts();
    setProducts(data);
    if (data.length > 0) {
      setSelectedProduct(data[0]);
    }
    setLoading(false);
  };

  const generateSalesHistory = () => {
    return Array.from({ length: 30 }, () => Math.floor(Math.random() * 5) + 1);
  };

  const salesHistory = generateSalesHistory();
  const forecast = selectedProduct ? calculateForecast(selectedProduct.stock, salesHistory) : null;

  const getFillColor = (stock: number) => {
    if (stock > 20) return '#00ff88';
    if (stock >= 10) return '#ffb800';
    return '#ff3b5c';
  };

  const chartData = forecast?.curve.map(point => ({
    ...point,
    color: getFillColor(point.stock),
  })) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text font-sans">Forecast</h1>
        <div className="bg-card p-6 rounded-lg border border-border animate-pulse">
          <div className="h-96 bg-border rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text font-sans">Pronóstico de Inventario</h1>

      <div className="bg-card p-6 rounded-lg border border-border">
        <label className="block text-muted font-sans text-sm mb-2">Seleccionar Producto</label>
        <select
          value={selectedProduct?.id || ''}
          onChange={e => {
            const product = products.find(p => p.id === e.target.value);
            setSelectedProduct(product || null);
          }}
          className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-sans focus:outline-none focus:border-accent transition-colors"
        >
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && forecast && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-[0_0_20px_rgba(0,255,136,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Package className="text-accent" size={20} />
                <p className="text-muted text-sm font-sans">Stock Actual</p>
              </div>
              <p className="text-3xl font-bold text-text font-mono">{selectedProduct.stock}</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-[0_0_20px_rgba(0,255,136,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="text-accent" size={20} />
                <p className="text-muted text-sm font-sans">Ventas Promedio/Día</p>
              </div>
              <p className="text-3xl font-bold text-text font-mono">{forecast.avgDaily.toFixed(1)}</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-[0_0_20px_rgba(0,255,136,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="text-warning" size={20} />
                <p className="text-muted text-sm font-sans">Días hasta Agotamiento</p>
              </div>
              <p className="text-3xl font-bold text-warning font-mono">
                {forecast.daysUntilOut === 999 ? '∞' : forecast.daysUntilOut}
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-[0_0_20px_rgba(0,255,136,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-accent" size={20} />
                <p className="text-muted text-sm font-sans">Cantidad Sugerida</p>
              </div>
              <p className="text-3xl font-bold text-text font-mono">{forecast.suggestedQty}</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text font-sans mb-2">Fecha Estimada de Reorden</h2>
              <p className="text-muted font-sans text-sm">
                {formatDate(forecast.reorderDate.toISOString())}
                <span className="ml-2 text-warning">
                  (Se recomienda reordenar 14 días antes del agotamiento)
                </span>
              </p>
            </div>

            <h2 className="text-xl font-bold text-text font-sans mb-4">Proyección de Stock (60 días)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#ffb800" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#ff3b5c" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis
                  dataKey="day"
                  stroke="#5a5a7a"
                  style={{ fontSize: 12 }}
                  label={{ value: 'Días', position: 'insideBottom', offset: -5, fill: '#5a5a7a' }}
                />
                <YAxis
                  stroke="#5a5a7a"
                  style={{ fontSize: 12 }}
                  label={{ value: 'Unidades', angle: -90, position: 'insideLeft', fill: '#5a5a7a' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121a',
                    border: '1px solid #1e1e2e',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#e8e8f0' }}
                />
                <ReferenceLine y={20} stroke="#00ff88" strokeDasharray="3 3" label="Zona Segura" />
                <ReferenceLine y={10} stroke="#ffb800" strokeDasharray="3 3" label="Zona Precaución" />
                <Area
                  type="monotone"
                  dataKey="stock"
                  stroke="#00ff88"
                  strokeWidth={2}
                  fill="url(#colorStock)"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-accent"></div>
                <span className="text-sm text-muted font-sans">Zona Segura (&gt; 20)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-warning"></div>
                <span className="text-sm text-muted font-sans">Zona Precaución (10-20)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-danger"></div>
                <span className="text-sm text-muted font-sans">Zona Crítica (&lt; 10)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
