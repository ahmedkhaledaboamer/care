import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const base =
  'w-full rounded-xl border bg-white px-4 text-sm text-brand-dark placeholder:text-gray-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500';

function fieldClass(error?: string) {
  return `${base} ${error ? 'border-red-400 focus:ring-red-300' : 'border-brand-dark/15'}`;
}

interface WrapperProps {
  id: string;
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({ id, label, error, hint, required, children, className = '' }: WrapperProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-brand-dark mb-1.5">
          {label}
          {required && <span className="text-red-500 ms-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Common = { label?: ReactNode; error?: string; hint?: ReactNode; wrapperClassName?: string };

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Common & { icon?: ReactNode }>(
  function Input({ label, error, hint, wrapperClassName, icon, id, className = '', required, ...rest }, ref) {
    const auto = useId();
    const fid = id || auto;
    return (
      <FieldWrapper id={fid} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
        <div className="relative">
          {icon && <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>}
          <input
            ref={ref}
            id={fid}
            required={required}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
            className={`${fieldClass(error)} h-11 ${icon ? 'ps-10' : ''} ${className}`}
            {...rest}
          />
        </div>
      </FieldWrapper>
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & Common>(function Textarea(
  { label, error, hint, wrapperClassName, id, className = '', required, ...rest },
  ref
) {
  const auto = useId();
  const fid = id || auto;
  return (
    <FieldWrapper id={fid} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={fid}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={`${fieldClass(error)} py-3 min-h-[110px] ${className}`}
        {...rest}
      />
    </FieldWrapper>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & Common>(function Select(
  { label, error, hint, wrapperClassName, id, className = '', required, children, ...rest },
  ref
) {
  const auto = useId();
  const fid = id || auto;
  return (
    <FieldWrapper id={fid} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <select
        ref={ref}
        id={fid}
        required={required}
        aria-invalid={!!error || undefined}
        className={`${fieldClass(error)} h-11 pe-9 appearance-none bg-no-repeat bg-[length:16px] bg-[position:right_0.75rem_center] rtl:bg-[position:left_0.75rem_center] bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")] ${className}`}
        {...rest}>
        {children}
      </select>
    </FieldWrapper>
  );
});
