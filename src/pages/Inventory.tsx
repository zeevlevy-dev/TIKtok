import { useEffect, useState } from 'react';
import { Search, Edit2, Check, X, Download, RefreshCw } from 'lucide-react';
import { apiService, Product, formatPrice, formatDate } from '../services/api';
import Toast from '../components/Toast';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.seller_sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadData = async () => {
    setLoading(true);
    const data = await apiService.getProducts();
    setProducts(data);
    setFilteredProducts(data);
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditValue(product.stock.toString());
  };

  const handleSave = async (product: Product) => {
    try {
      const newStock = parseInt(editValue);
      if (isNaN(newStock) || newStock < 0) {
        setToast({ message: 'Cantidad inválida', type: 'error' });
        return;
      }

      await apiService.updateInventory(product.id, product.sku_id, newStock);
      setProducts(products.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
      setEditingId(null);
      setToast({ message: 'Inventario actualizado', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al actualizar', type: 'error' });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const exportCSV = () => {
    const headers = ['Producto', 'SKU', 'Stock', 'Precio', 'Estado', 'Actualizado'];
    const rows = filteredProducts.map(p => [
      p.title,
      p.seller_sku,
      p.stock,
      p.price,
      getStatus(p.stock),
      formatDate(p.last_updated),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setToast({ message: 'CSV exportado', type: 'success' });
  };

  const getStatus = (stock: number) => {
    if (stock === 0) return 'AGOTADO';
    if (stock < 10) return 'BAJO';
    if (stock <= 20) return 'BAJO';
    return 'OK';
  };

  const getStatusColor = (stock: number) => {
    if (stock === 0) return 'bg-danger text-bg';
    if (stock <= 20) return 'bg-warning text-bg';
    return 'bg-accent text-bg';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text font-sans">Inventario</h1>
        <div className="bg-card p-6 rounded-lg border border-border animate-pulse">
          <div className="h-96 bg-border rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text font-sans">Inventario</h1>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-card border border-accent text-accent rounded-lg font-sans font-semibold hover:bg-accent hover:text-bg transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Exportar CSV
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-accent text-bg rounded-lg font-sans font-semibold hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            placeholder="Buscar por producto o SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-3 text-text font-sans focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-muted font-sans text-sm">Producto</th>
                <th className="text-left py-4 px-4 text-muted font-sans text-sm">SKU</th>
                <th className="text-left py-4 px-4 text-muted font-sans text-sm">Stock</th>
                <th className="text-left py-4 px-4 text-muted font-sans text-sm">Precio</th>
                <th className="text-left py-4 px-4 text-muted font-sans text-sm">Estado</th>
                <th className="text-left py-4 px-4 text-muted font-sans text-sm">Actualizado</th>
                <th className="text-left py-4 px-4 text-muted font-sans text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-border hover:bg-border/50 transition-colors">
                  <td className="py-4 px-4 text-text font-sans">{product.title}</td>
                  <td className="py-4 px-4 text-muted font-mono text-sm">{product.seller_sku}</td>
                  <td className="py-4 px-4">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-20 bg-bg border border-accent rounded px-2 py-1 text-text font-mono focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-text font-mono">{product.stock}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-text font-mono text-sm">{formatPrice(product.price)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold font-sans ${getStatusColor(product.stock)}`}>
                      {getStatus(product.stock)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-muted font-mono text-xs">{formatDate(product.last_updated)}</td>
                  <td className="py-4 px-4">
                    {editingId === product.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(product)}
                          className="p-2 bg-accent text-bg rounded hover:opacity-80 transition-opacity"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-danger text-bg rounded hover:opacity-80 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-accent hover:bg-accent hover:text-bg rounded transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted font-sans">No se encontraron productos</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
