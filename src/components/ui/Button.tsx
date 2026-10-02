import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark' | 'outline-danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand-gold to-brand-goldLight text-white shadow-md shadow-brand-gold/20 hover:shadow-lg hover:shadow-brand-gold/30',
  secondary: 'bg-white text-brand-dark border border-brand-dark/10 hover:border-brand-gold/50 hover:bg-brand-cream',
  ghost: 'text-brand-dark hover:bg-brand-dark/5',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  'outline-danger': 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  dark: 'bg-brand-dark text-white hover:bg-brand-dark/90'
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-6 text-sm gap-2',
  lg: 'h-13 py-3.5 px-8 text-base gap-2',
  icon: 'h-10 w-10 justify-center'
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', block = false, className = '') {
  return `inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${variants[variant]} ${sizes[size]} ${block ? 'w-full' : ''} ${className}`;
}

/** A router link styled as a button. */
export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...rest
}: LinkProps & { variant?: Variant; size?: Size; block?: boolean }) {
  return <Link className={buttonClass(variant, size, block, className)} {...rest} />;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, block, className = '', disabled, children, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, block, className)}
      {...rest}>
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
});
