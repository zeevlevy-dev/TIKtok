export interface Product {
  id: string;
  title: string;
  sku_id: string;
  seller_sku: string;
  stock: number;
  price: number;
  currency: string;
  warehouse_id: string;
  status: string;
  last_updated: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_URL}/api/products/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getStatus(): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/api/status`);
      return await response.json();
    } catch (error) {
      return { ok: false, message: 'Error de conexión' };
    }
  },

  async updateInventory(productId: string, skuId: string, quantity: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/inventory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, sku_id: skuId, quantity }),
    });
    if (!response.ok) throw new Error('Failed to update inventory');
  },

  async updateToken(token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/update-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error('Failed to update token');
  },
};

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function calculateForecast(currentStock: number, salesHistory: number[]) {
  const last7 = salesHistory.slice(-7);
  const avgDaily = last7.reduce((a, b) => a + b, 0) / Math.max(last7.length, 1);
  const daysUntilOut = avgDaily > 0 ? Math.floor(currentStock / avgDaily) : 999;
  const reorderDate = new Date();
  reorderDate.setDate(reorderDate.getDate() + Math.max(daysUntilOut - 14, 0));
  const suggestedQty = Math.ceil(avgDaily * 30);

  const curve = Array.from({ length: 60 }, (_, i) => ({
    day: i + 1,
    stock: Math.max(0, currentStock - avgDaily * i),
  }));

  return { avgDaily, daysUntilOut, reorderDate, suggestedQty, curve };
}
