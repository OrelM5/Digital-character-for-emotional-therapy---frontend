import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, title, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        PADDING_CLASSES[padding],
        className,
      ].join(' ')}
    >
      {title && (
        <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}
