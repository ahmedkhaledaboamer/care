import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useTranslations } from '../../lib/i18n';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: ReactNode;
}

interface ToastApi {
  success: (message: ReactNode) => void;
  error: (message: ReactNode) => void;
  info: (message: ReactNode) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const styles: Record<ToastKind, { icon: typeof Info; cls: string }> = {
  success: { icon: CheckCircle2, cls: 'text-brand-gold' },
  error: { icon: AlertCircle, cls: 'text-red-600' },
  info: { icon: Info, cls: 'text-brand-goldLight' }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const tUi = useTranslations('Ui');
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (kind: ToastKind, message: ReactNode) => {
      const id = nextId.current++;
      setItems((xs) => [...xs.slice(-3), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m)
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="fixed z-[10001] bottom-4 inset-x-4 sm:inset-x-auto sm:end-6 sm:bottom-6 flex flex-col gap-2 sm:w-96" aria-live="polite">
          <AnimatePresence initial={false}>
            {items.map((t) => {
              const { icon: Icon, cls } = styles[t.kind];
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  role={t.kind === 'error' ? 'alert' : 'status'}
                  className="flex items-start gap-3 bg-white rounded-2xl shadow-xl border border-brand-dark/5 px-4 py-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cls}`} />
                  <div className="flex-1 text-sm text-brand-dark">{t.message}</div>
                  <button onClick={() => dismiss(t.id)} aria-label={tUi('dismiss')} className="text-gray-400 hover:text-brand-dark">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
