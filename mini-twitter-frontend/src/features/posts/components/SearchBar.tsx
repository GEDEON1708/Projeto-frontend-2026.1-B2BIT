import { Search } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full sm:max-w-[360px] sm:shrink-0">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por post..."
        className="h-11 w-full rounded-2xl border border-[#223656] bg-[#16253d] pl-11 pr-4 text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-brand-400 sm:h-12 sm:pl-12"
      />
    </div>
  );
}
