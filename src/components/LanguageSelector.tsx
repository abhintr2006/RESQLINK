import React, { useMemo, useState } from 'react';
import { Check, Languages, Search } from 'lucide-react';
import { useTranslation } from '../i18n';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage, languages } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? languages.filter((item) => `${item.name} ${item.nativeName} ${item.code}`.toLowerCase().includes(value)) : languages;
  }, [languages, query]);

  return <div className="relative">
    <button type="button" onClick={() => setOpen((current) => !current)} className={`flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 ${compact ? '' : 'sm:px-3'}`} aria-haspopup="listbox" aria-expanded={open} title="Select language">
      <Languages className="size-3.5 text-orange-600" /><span>{language.toUpperCase()}</span>
    </button>
    {open && <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-2xl" role="listbox" aria-label="Supported Indian languages">
      <div className="border-b border-slate-100 p-1.5"><div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">22 scheduled languages + English</div><div className="relative"><Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or script" className="h-8 w-full rounded-lg border border-slate-200 pl-7 pr-2 text-xs outline-none focus:border-orange-500" aria-label="Search languages" /></div></div>
      <div className="max-h-64 overflow-y-auto">{filtered.map((item) => <button type="button" role="option" aria-selected={item.code === language} key={item.code} onClick={() => { setLanguage(item.code); setOpen(false); setQuery(''); }} className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-orange-50 ${item.code === language ? 'bg-orange-50 text-orange-800' : 'text-slate-700'}`}><span><strong className="block text-xs">{item.nativeName}</strong><span className="text-[10px] text-slate-500">{item.name} · {item.region}</span></span>{item.code === language && <Check className="size-3.5" />}</button>)}{filtered.length === 0 && <p className="p-3 text-center text-xs text-slate-500">No supported language found.</p>}</div>
    </div>}
  </div>;
};
