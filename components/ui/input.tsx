import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        block w-full rounded-md border border-gray-200 
        px-3 py-2 text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
        ${className}
      `}
      {...props}
    />
  );
} 