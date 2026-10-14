import React, { useEffect, useState } from 'react';
import { Cookie, Settings2, X } from 'lucide-react';
import { clearOptionalConsent, readConsent, saveConsent, type ConsentPreferences } from '../services/consent';

type LegalKind = 'privacy' | 'cookies' | 'terms';

function openLegal(kind: LegalKind): void {
  window.dispatchEvent(new CustomEvent('resqlink:open-legal', { detail: kind }));
}

export const CookieConsentManager: React.FC = () => {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(() => readConsent());
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOpenSettings = () => {
      const current = readConsent();
      setPreferences(current);
      setFunctional(current?.functional ?? false);
      setIsCustomizing(true);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('resqlink:open-cookie-settings', handleOpenSettings);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('resqlink:open-cookie-settings', handleOpenSettings);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const save = (next: Pick<ConsentPreferences, 'functional' | 'analytics' | 'advertising'>) => {
    setPreferences(saveConsent(next));
    setIsCustomizing(false);
  };

  const acceptAll = () => save({ functional: true, analytics: false, advertising: false });
  const rejectOptional = () => {
    const next = clearOptionalConsent();
    setPreferences(next);
    setFunctional(false);
    setIsCustomizing(false);
  };

  const hasChoice = Boolean(preferences);
  const showPanel = !hasChoice || isCustomizing;

  return <>
    {showPanel && <div role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title" className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-3xl rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 shadow-2xl sm:p-5">
      <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Cookie className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h2 id="cookie-consent-title" className="text-sm font-bold sm:text-base">Privacy preferences</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">RESQLINK uses essential browser storage for authentication and core operation. A small functional preference can remember interface choices. We currently use no analytics or advertising trackers.</p></div>{isCustomizing && <button type="button" onClick={() => setIsCustomizing(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Close cookie preferences"><X className="h-4 w-4" /></button>}</div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]"><button type="button" onClick={() => openLegal('privacy')} className="font-bold text-orange-700 underline">Privacy Policy</button><button type="button" onClick={() => openLegal('cookies')} className="font-bold text-orange-700 underline">Cookie Policy</button></div>
        {isCustomizing && <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-start justify-between gap-3"><div><strong className="block text-xs">Strictly necessary</strong><span className="text-[11px] text-slate-600">Required for authentication, security, consent status, and core application behavior.</span></div><span className="text-[10px] font-bold uppercase text-slate-500">Always on</span></div><label className="flex cursor-pointer items-start justify-between gap-3 border-t border-slate-200 pt-2"><span><strong className="block text-xs">Functional</strong><span className="text-[11px] text-slate-600">Optional interface preferences such as dismissing the install prompt.</span></span><input type="checkbox" checked={functional} onChange={(event) => setFunctional(event.target.checked)} className="mt-1 h-4 w-4 accent-orange-600" /></label><div className="border-t border-slate-200 pt-2 text-[11px] text-slate-500"><strong className="text-slate-700">Analytics and advertising</strong> are not integrated in the inspected application and remain disabled.</div></div>}
        <div className="mt-4 flex flex-wrap items-center gap-2"><button type="button" onClick={acceptAll} className="rounded-xl bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700">Accept All</button><button type="button" onClick={rejectOptional} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Reject Optional</button><button type="button" onClick={() => setIsCustomizing(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Settings2 className="h-3.5 w-3.5" />Customize</button>{isCustomizing && <button type="button" onClick={() => save({ functional, analytics: false, advertising: false })} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">Save preferences</button>}</div>
      </div></div>
    </div>}
    {isOffline && <div role="status" className="fixed bottom-4 left-4 z-[65] max-w-xs rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 shadow-lg">Offline mode: emergency APIs, GPS sync, and dispatch may be unavailable.</div>}
  </>;
};
