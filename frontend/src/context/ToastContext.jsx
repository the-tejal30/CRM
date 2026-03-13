import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import CloseIcon from '../icons/CloseIcon';

// Module-level singleton so axios interceptor (outside React tree) can push toasts
let _addToast = null;
export const pushToast = (type, message) => _addToast?.(type, message);

const TYPE_STYLES = {
  success: { bar: '#10b981', bg: '#fff', textColor: '#0f172a' },
  error:   { bar: '#f43f5e', bg: '#fff', textColor: '#0f172a' },
  info:    { bar: '#6366f1', bg: '#fff', textColor: '#0f172a' },
};

const TYPE_ICONS = {
  success: (
    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#dcfce7' }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5.5 10L11 3.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  ),
  error: (
    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#ffe4e6' }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 3L10 10M10 3L3 10" stroke="#e11d48" strokeWidth="2" strokeLinecap="round"/></svg>
    </div>
  ),
  info: (
    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#e0e7ff' }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="1" fill="#4f46e5"/><rect x="5.75" y="6" width="1.5" height="5" rx="0.75" fill="#4f46e5"/></svg>
    </div>
  ),
};

function ToastItem({ toast, onRemove }) {
  const s = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
  return (
    <div
      className="flex items-center gap-3 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden"
      style={{ minWidth: '280px', maxWidth: '360px' }}
      role="alert"
    >
      <div className="w-1 self-stretch flex-shrink-0 rounded-l-xl" style={{ backgroundColor: s.bar }} />
      <div className="flex items-center gap-2.5 flex-1 py-3 pr-1 min-w-0">
        {TYPE_ICONS[toast.type]}
        <p className="text-sm font-medium text-slate-800 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-2 text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 mr-1"
      >
        <CloseIcon size={13} />
      </button>
    </div>
  );
}

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const toast = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error', msg),
    info:    (msg) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto animate-slide-in-right">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
