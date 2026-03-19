import type { PropsWithChildren } from 'react';

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  title: string;
  onClose: () => void;
}>;

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="panel w-full max-w-2xl p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#50698f] px-3 py-2 text-sm text-slate-100 transition hover:bg-white/5"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
