import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { useTranslations } from '../../lib/i18n';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Prevent closing via backdrop / Esc (e.g. while submitting). */
  dismissible?: boolean;
}

const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }: ModalProps) {
  const tUi = useTranslations('Ui');
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])');
      (el ?? panelRef.current)?.focus();
    }, 30);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      prevFocus?.focus?.();
    };
  }, [open, dismissible]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm" onClick={() => dismissible && onClose()} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className={`relative w-full ${widths[size]} max-h-[92vh] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl focus:outline-none`}>
            {(title || dismissible) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
                <div>
                  {title && (
                    <h2 id={titleId} className="font-serif text-xl font-bold text-brand-dark">
                      {title}
                    </h2>
                  )}
                  {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </div>
                {dismissible && (
                  <button
                    data-close
                    onClick={onClose}
                    aria-label={tUi('close')}
                    className="shrink-0 w-9 h-9 rounded-full bg-brand-cream text-brand-dark flex items-center justify-center hover:bg-brand-pinkDark/60 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <div className="px-6 py-4 overflow-y-auto">{children}</div>
            {footer && <div className="px-6 pb-6 pt-2 flex flex-wrap justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

interface ConfirmProps {
  open: boolean;
  title: ReactNode;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  loading,
  onConfirm,
  onClose
}: ConfirmProps) {
  const tUi = useTranslations('Ui');
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      dismissible={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel ?? tUi('cancel')}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel ?? tUi('confirm')}
          </Button>
        </>
      }>
      <div className="flex gap-4">
        <div
          className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-pink text-brand-gold'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-brand-dark text-lg">{title}</h3>
          {message && <div className="text-sm text-gray-600 mt-1">{message}</div>}
        </div>
      </div>
    </Modal>
  );
}
