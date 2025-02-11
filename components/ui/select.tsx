import { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`
        block w-full rounded-md border border-slate-700 
        bg-slate-900 text-white
        px-3 py-2
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        hover:border-slate-600
        appearance-none
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  return (
    <option 
      value={value} 
      className="bg-slate-900 text-white py-1 px-2"
      style={{ backgroundColor: '#0f172a', color: 'white' }}
    >
      {children}
    </option>
  );
}

export function SelectTrigger({ children, className = '', ...props }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}

export function SelectContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function SelectValue({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 