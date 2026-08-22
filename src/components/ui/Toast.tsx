import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { colors, radii, zIndex } from './tokens';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type ToastTone = 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  tone: ToastTone;
  title?: string;
  message: string;
  duration?: number;
  icon?: string;
}

interface ToastContextValue {
  toast: (message: string, options?: { tone?: ToastTone; title?: string; duration?: number; icon?: string }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

// ─────────────────────────────────────────────────────────────
// Toast appearance config
// ─────────────────────────────────────────────────────────────
const toneConfig: Record<ToastTone, { bg: string; icon: string }> = {
  success: { bg: colors.success,  icon: 'fa-circle-check' },
  danger:  { bg: colors.danger,   icon: 'fa-circle-xmark' },
  warning: { bg: colors.warning,  icon: 'fa-triangle-exclamation' },
  info:    { bg: colors.primary,  icon: 'fa-circle-info' },
};

// ─────────────────────────────────────────────────────────────
// Individual Toast Component
// ─────────────────────────────────────────────────────────────
const ToastCard: React.FC<{ item: ToastItem; onDismiss: (id: string) => void }> = ({ item, onDismiss }) => {
  const cfg = toneConfig[item.tone];
  return (
    <div
      className={`hims-toast hims-toast-${item.tone}`}
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: radii.lg,
        boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
        minWidth: '300px',
        maxWidth: '420px',
        background: cfg.bg,
        color: '#fff',
        pointerEvents: 'auto',
        animation: 'hims-toast-in 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Icon */}
      <i className={`fa-solid ${item.icon || cfg.icon}`} style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }} />

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.title && (
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{item.title}</div>
        )}
        <div style={{ fontSize: '13px', opacity: 0.92, lineHeight: 1.4 }}>{item.message}</div>
      </div>

      {/* Close */}
      <button
        onClick={() => onDismiss(item.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.75)',
          fontSize: '16px', padding: '0 0 0 4px', flexShrink: 0, marginTop: '-1px',
          transition: 'color 0.1s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'; }}
        aria-label="Dismiss notification"
      >
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
  }, []);

  const toast = useCallback((message: string, options?: {
    tone?: ToastTone; title?: string; duration?: number; icon?: string;
  }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const item: ToastItem = {
      id, message,
      tone: options?.tone ?? 'info',
      title: options?.title,
      duration: options?.duration ?? 4000,
      icon: options?.icon,
    };
    setToasts((prev) => [...prev.slice(-4), item]); // max 5 visible
    const timer = setTimeout(() => dismiss(id), item.duration);
    timers.current.set(id, timer);
  }, [dismiss]);

  const success = useCallback((m: string, t?: string) => toast(m, { tone: 'success', title: t }), [toast]);
  const error   = useCallback((m: string, t?: string) => toast(m, { tone: 'danger',  title: t }), [toast]);
  const warning = useCallback((m: string, t?: string) => toast(m, { tone: 'warning', title: t }), [toast]);
  const info    = useCallback((m: string, t?: string) => toast(m, { tone: 'info',    title: t }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss, dismissAll }}>
      {children}
      {/* Container */}
      <div
        className="hims-toast-container"
        style={{
          position: 'fixed', top: '72px', right: '20px',
          zIndex: zIndex.toast, display: 'flex', flexDirection: 'column', gap: '10px',
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────
// Global imperative toast (for use outside React components, e.g. AngularJS bridge)
// ─────────────────────────────────────────────────────────────
let _globalToast: ToastContextValue | null = null;

export function setGlobalToast(ctx: ToastContextValue) {
  _globalToast = ctx;
}

export const globalToast = {
  success: (m: string, t?: string) => _globalToast?.success(m, t),
  error:   (m: string, t?: string) => _globalToast?.error(m, t),
  warning: (m: string, t?: string) => _globalToast?.warning(m, t),
  info:    (m: string, t?: string) => _globalToast?.info(m, t),
};
