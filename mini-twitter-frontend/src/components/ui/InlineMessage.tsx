type InlineMessageProps = {
  message: string;
  tone?: 'error' | 'success' | 'info';
};

export function InlineMessage({ message, tone = 'error' }: InlineMessageProps) {
  const tones = {
    error: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    info: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>{message}</div>;
}
