import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'danger';
    fullWidth?: boolean;
  }
>;

export function Button({
  children,
  variant = 'primary',
  className = '',
  fullWidth,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'primary-button',
    ghost: 'ghost-button',
    danger:
      'inline-flex h-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60',
  };

  return (
    <button
      className={`${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
