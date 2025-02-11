import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const variantStyles = {
  default: 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20 hover:shadow-blue-400/30',
  outline: 'border border-slate-800 text-white/80 hover:bg-slate-800 hover:text-white',
  ghost: 'text-white/80 hover:bg-slate-800 hover:text-white'
};

const sizeStyles = {
  default: 'px-4 py-2',
  sm: 'px-3 py-1.5 text-sm',
  lg: 'px-5 py-2.5'
};

export function Button({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'default',
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`
        rounded-md font-semibold transition-all
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
} 