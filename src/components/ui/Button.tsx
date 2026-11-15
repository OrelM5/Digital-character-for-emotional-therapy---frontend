import { type ReactNode, type ElementType, type ComponentPropsWithRef } from 'react';
import { Loader2 } from 'lucide-react';

// ── Polymorphic helpers ───────────────────────────────────────────────────
type AsProp<C extends ElementType> = { as?: C };
type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P);
type PolymorphicComponentProp<C extends ElementType, Props = object> = Props &
  AsProp<C> &
  Omit<ComponentPropsWithRef<C>, PropsToOmit<C, Props>>;

// ── Button Props ──────────────────────────────────────────────────────────
interface ButtonOwnProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

type ButtonProps<C extends ElementType = 'button'> = PolymorphicComponentProp<C, ButtonOwnProps>;

const VARIANT_CLASSES: Record<NonNullable<ButtonOwnProps['variant']>, string> = {
  primary:
    'bg-therapy-medium text-white hover:bg-therapy-strong active:scale-95 shadow-sm',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:scale-95',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:scale-95',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-sm',
};

const SIZE_CLASSES: Record<NonNullable<ButtonOwnProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export function Button<C extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps<C>) {
  const Component = as ?? 'button';
  return (
    <Component
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled ?? loading}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </Component>
  );
}
