import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, WifiOff, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISSED_KEY = 'resqlink-pwa-install-dismissed';

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export const PWAInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsInstalled(isStandalone());
    const wasDismissed = window.localStorage.getItem(DISMISSED_KEY) === 'true';
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setMessage('RESQLINK was added to your home screen.');
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (isIOS() && !isStandalone() && !wasDismissed) setShowIOSGuide(true);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, 'true');
    setInstallPrompt(null);
    setShowIOSGuide(false);
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setMessage(choice.outcome === 'accepted' ? 'Installation accepted. RESQLINK will open from your home screen.' : 'Installation dismissed. You can use RESQLINK normally in your browser.');
  };

  if (isOffline) {
    return <div role="status" className="fixed bottom-4 left-4 z-[60] flex max-w-xs items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 shadow-lg"><WifiOff className="h-4 w-4 shrink-0" /> Offline: emergency APIs, GPS sync, and dispatch may be unavailable.</div>;
  }

  if (message) {
    return <div role="status" className="fixed bottom-4 right-4 z-[60] max-w-xs rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-lg">{message}<button type="button" onClick={() => setMessage(null)} className="ml-2 font-bold" aria-label="Dismiss installation message">×</button></div>;
  }

  if (isInstalled) return null;

  if (showIOSGuide) {
    return <div role="dialog" aria-labelledby="ios-install-title" className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md rounded-2xl border border-rose-300 bg-white p-4 text-slate-900 shadow-2xl">
      <div className="flex items-start justify-between gap-3"><div><h2 id="ios-install-title" className="font-bold">Add RESQLINK to Home Screen</h2><p className="mt-1 text-xs text-slate-600">For the supported iPhone/iPad flow, open this website in Safari.</p></div><button type="button" onClick={dismiss} aria-label="Dismiss installation guide"><X className="h-4 w-4" /></button></div>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-slate-700"><li>Tap Safari’s <strong>Share</strong> button.</li><li>Select <strong>Add to Home Screen</strong>.</li><li>Tap <strong>Add</strong> to confirm.</li></ol>
      <button type="button" onClick={dismiss} className="mt-3 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white">Got it</button>
    </div>;
  }

  if (!installPrompt) return null;

  return <div className="fixed bottom-4 right-4 z-[60] flex max-w-sm items-center gap-3 rounded-2xl border border-rose-300 bg-white p-3 text-slate-900 shadow-2xl">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white"><Download className="h-4 w-4" /></div>
    <div className="min-w-0 flex-1"><strong className="block text-sm">Install RESQLINK</strong><span className="text-[11px] text-slate-600">Launch the emergency assistance app from your home screen.</span></div>
    <button type="button" onClick={() => void install()} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">Install</button>
    <button type="button" onClick={dismiss} aria-label="Dismiss installation prompt" className="self-start text-slate-500"><ExternalLink className="h-3.5 w-3.5" /></button>
  </div>;
};
