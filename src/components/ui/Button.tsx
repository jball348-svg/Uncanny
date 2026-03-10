import Link from 'next/link';
import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: 'primary' | 'secondary';
};

export function Button({ href, variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:pointer-events-none';
  const primaryClasses = 'bg-amber-600 text-white hover:bg-amber-700';
  const secondaryClasses = 'bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800';
  
  const classes = `${baseClasses} ${variant === 'primary' ? primaryClasses : secondaryClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
