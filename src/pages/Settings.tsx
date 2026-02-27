import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Copy, Save } from 'lucide-react';
import { apiService } from '../services/api';
import Toast from '../components/Toast';

export default function Settings() {
  const [apiStatus, setApiStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    checkStatus();
    const savedToken = localStorage.getItem('tiktok_token');
    if (savedToken) {
      setNewToken(savedToken);
    }
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const status = await apiService.getStatus();
      setApiStatus(status);
    } catch (error) {
      setApiStatus({ ok: false, message: 'Error de conexión' });
    }
    setLoading(false);
  };

  const handleUpdateToken = async () => {
    if (!newToken.trim()) {
      setToast({ message: 'Ingresa un token válido', type: 'error' });
      return;
    }

    try {
      await apiService.updateToken(newToken);
      localStorage.setItem('tiktok_token', newToken);
      localStorage.setItem('tiktok_token_date', new Date().toISOString());
      setToast({ message: 'Token actualizado correctamente', type: 'success' });
      setTimeout(checkStatus, 1000);
    } catch (error) {
      setToast({ message: 'Error al actualizar el token', type: 'error' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copiado al portapapeles', type: 'info' });
  };

  const getTokenAge = () => {
    const savedDate = localStorage.getItem('tiktok_token_date');
    if (!savedDate) return null;
    const date = new Date(savedDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tokenAge = getTokenAge();
  const tokenExpiringSoon = tokenAge !== null && tokenAge > 6;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text font-sans">Configuración</h1>

      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text font-sans">Estado de API</h2>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="px-4 py-2 bg-accent text-bg rounded-lg font-sans font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </div>

        {apiStatus && (
          <div className={`flex items-center gap-3 p-4 rounded-lg ${apiStatus.ok ? 'bg-accent/10' : 'bg-danger/10'}`}>
            {apiStatus.ok ? (
              <CheckCircle className="text-accent" size={24} />
            ) : (
              <XCircle className="text-danger" size={24} />
            )}
            <div>
              <p className={`font-semibold font-sans ${apiStatus.ok ? 'text-accent' : 'text-danger'}`}>
                {apiStatus.ok ? 'Conectado' : 'Desconectado'}
              </p>
              <p className="text-muted text-sm">{apiStatus.message}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold text-text font-sans mb-4">Información del Token</h2>

        {tokenExpiringSoon && (
          <div className="mb-4 bg-warning/10 border border-warning rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="text-warning" size={24} />
            <p className="text-warning font-sans">
              Tu token expira pronto. Genera uno nuevo.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-muted font-sans text-sm mb-2">Token Actual</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono text-sm overflow-hidden">
                {newToken ? `${newToken.substring(0, 20)}••••••••` : 'No configurado'}
              </div>
              {newToken && (
                <button
                  onClick={() => copyToClipboard(newToken)}
                  className="p-3 text-accent hover:bg-accent hover:text-bg rounded-lg transition-all"
                >
                  <Copy size={18} />
                </button>
              )}
            </div>
            {tokenAge !== null && (
              <p className="text-muted text-xs mt-2 font-mono">
                Guardado hace {tokenAge} día{tokenAge !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div>
            <label className="block text-muted font-sans text-sm mb-2">Actualizar Access Token</label>
            <textarea
              value={newToken}
              onChange={e => setNewToken(e.target.value)}
              placeholder="Pega tu nuevo token aquí..."
              rows={3}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono text-sm focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleUpdateToken}
            className="w-full px-4 py-3 bg-accent text-bg rounded-lg font-sans font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Guardar Token
          </button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold text-text font-sans mb-4">Marketplaces</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-bg rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <CheckCircle className="text-bg" size={20} />
              </div>
              <div>
                <p className="text-text font-sans font-semibold">TikTok Shop</p>
                <p className="text-muted text-sm">Activo</p>
              </div>
            </div>
            <span className="text-accent font-mono text-sm">✓</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-bg rounded-lg border border-border opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-bg text-xl">🔜</span>
              </div>
              <div>
                <p className="text-text font-sans font-semibold">Mercado Libre</p>
                <p className="text-muted text-sm">Próximamente</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-bg rounded-lg border border-border opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-bg text-xl">🔜</span>
              </div>
              <div>
                <p className="text-text font-sans font-semibold">Amazon MX</p>
                <p className="text-muted text-sm">Próximamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
