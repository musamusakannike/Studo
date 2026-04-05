import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastListener: ((toast: Toast) => void) | null = null;

export const showToast = (type: ToastType, message: string, duration = 3000) => {
  const toast: Toast = {
    id: Date.now().toString(),
    type,
    message,
    duration,
  };
  
  if (toastListener) {
    toastListener(toast);
  }
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    
    if (toast.duration) {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    }
  }, [removeToast]);

  toastListener = addToast;

  return { toasts, removeToast };
};
