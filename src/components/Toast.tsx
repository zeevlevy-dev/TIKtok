import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-accent/10 border-accent',
    error: 'bg-danger/10 border-danger',
    info: 'bg-blue-500/10 border-blue-500',
  }[type];

  const textColor = {
    success: 'text-accent',
    error: 'text-danger',
    info: 'text-blue-500',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 p-4 rounded-lg border ${bgColor} flex items-center gap-3 animate-slide-up z-50 max-w-sm`}>
      <Icon className={textColor} size={20} />
      <p className={`text-sm font-sans ${textColor}`}>{message}</p>
      <button onClick={onClose} className={`ml-2 ${textColor} hover:opacity-70`}>
        <X size={16} />
      </button>
    </div>
  );
}
