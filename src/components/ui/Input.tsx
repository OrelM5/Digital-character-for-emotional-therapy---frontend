import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';

interface BaseProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  as?: 'input' | 'textarea';
}

type InputProps = BaseProps &
  (
    | ({ as?: 'input' } & InputHTMLAttributes<HTMLInputElement>)
    | ({ as: 'textarea' } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  );

const BASE_CLASSES =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors';

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, hint, icon, as: Tag = 'input', className = '', ...rest }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {icon}
            </span>
          )}
          {Tag === 'textarea' ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={[BASE_CLASSES, icon ? 'pr-9' : '', error ? 'border-red-500' : '', className].join(' ')}
              rows={3}
              {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              className={[BASE_CLASSES, icon ? 'pr-9' : '', error ? 'border-red-500' : '', className].join(' ')}
              {...(rest as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
        </div>
        {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
