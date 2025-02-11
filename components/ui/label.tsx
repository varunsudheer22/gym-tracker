import { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className = '', ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-gray-900 mb-1.5 ${className}`}
      {...props}
    />
  );
} 