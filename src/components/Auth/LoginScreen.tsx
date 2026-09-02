import React, { FormEvent, useState } from 'react';
import { LockKeyhole, Radio, ShieldAlert, Building2, Users, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useResqLink } from '../../context/ResqLinkContext';

export const LoginScreen: React.FC = () => {
  const { login } = useResqLink();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = async (user: string, pass: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      await login(user, pass);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 shadow-2xl shadow-rose-600/40 ring-1 ring-white/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
              RESQLINK
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Urban AI Emergency CAD &amp; Multi-Role Lifeline • KSSEM Bengaluru
            </p>
          </div>
        </div>

        {/* Double-Bezel Login Card */}
        <div className="double-bezel shadow-2xl">
          <div className="double-bezel-inner p-7 space-y-6 bg-slate-950/90">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
              <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-rose-300">
                <LockKeyhole className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Sign in to Portal</h2>
                <p className="text-xs text-slate-400">JWT-authenticated access control</p>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200 leading-relaxed font-medium">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin, hospital, or patient"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-100 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-inner"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-100 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-inner"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 px-4 py-3.5 text-xs font-black text-white shadow-xl shadow-rose-600/30 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating…' : 'Sign in to Dashboard'}
              </button>
            </form>
          </div>
        </div>

        {/* 1-Click Demo Quick Access Cards */}
        <div className="double-bezel shadow-xl">
          <div className="double-bezel-inner p-5 space-y-3 bg-slate-950/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                1-Click Instant Demo Portals
              </span>
              <span className="text-[10px] font-semibold text-emerald-400">Offline Ready</span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                type="button"
                onClick={() => quickLogin('admin', 'admin123')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-100">Admin Command CAD</div>
                    <div className="text-[10px] text-slate-400">All-Access Superuser (Fleet Map, EEG, Twilio)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => quickLogin('hospital', 'hospital123')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-100">Hospital ER Staff</div>
                    <div className="text-[10px] text-slate-400">Inbound Ambulance Radar &amp; ICU Bed Controller</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => quickLogin('patient', 'patient123')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-100">Citizen / Patient</div>
                    <div className="text-[10px] text-slate-400">1-Tap Emergency SOS, Live Tracker &amp; Medical ID</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
