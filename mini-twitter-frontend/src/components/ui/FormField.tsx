import type { PropsWithChildren } from 'react';

type FormFieldProps = PropsWithChildren<{
  label: string;
  error?: string;
}>;

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-50">{label}</label>
      {children}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
