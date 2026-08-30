import React, { FormEvent, useState } from 'react';
import {
  LockKeyhole,
  Radio,
  ShieldAlert,
  Key,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Building2,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useResqLink } from '../../context/ResqLinkContext';

export const LoginScreen: React.FC = () => {
  const { login } = useResqLink();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
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

  const fillDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12 bg-tactical-grid relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 shadow-xl shadow-rose-600/30 ring-1 ring-white/20">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white font-mono">RESQLINK</h1>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 text-rose-300">
              CAD TERMINAL
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-medium">Urban Emergency Response &amp; AI Dispatch System</p>
        </div>

        {/* Double-bezel Sign-in card */}
        <div className="double-bezel">
          <form onSubmit={submit} className="double-bezel-inner p-6 shadow-2xl" noValidate>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2 text-rose-300">
                  <LockKeyhole className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">AUTHENTICATION</h2>
                  <p className="text-[11px] font-mono text-slate-400">JWT 256-Bit Encrypted Session</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>

            {/* Error region */}
            <div aria-live="polite" aria-atomic="true">
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/50 px-3.5 py-2.5 text-xs text-rose-200 font-mono"
                >
                  {error}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1.5"
                htmlFor="username"
              >
                OPERATOR ID / USERNAME
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter username"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50"
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1.5"
                htmlFor="password"
              >
                ACCESS KEY / PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/90 pl-3.5 pr-10 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition cursor-pointer rounded-lg hover:bg-slate-800"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 px-4 py-3 text-xs font-mono font-bold text-white shadow-lg shadow-rose-600/30 transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'AUTHENTICATING SECURE SESSION…' : 'INITIALIZE COMMAND SESSION'}
            </button>
          </form>
        </div>

        {/* Demo fast-login cards */}
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="mb-2.5 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3 h-3 text-rose-400" />
              QUICK LAUNCH PRESETS
            </span>
            <span>CLICK TO FILL</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { user: 'admin',    pass: 'admin123',    label: 'ADMIN CAD', icon: Radio, color: 'text-rose-400' },
              { user: 'hospital', pass: 'hospital123', label: 'HOSPITAL', icon: Building2, color: 'text-indigo-400' },
              { user: 'patient',  pass: 'patient123',  label: 'CITIZEN', icon: Users, color: 'text-emerald-400' },
            ].map(({ user, pass, label, icon: Icon, color }) => (
              <button
                key={user}
                type="button"
                onClick={() => fillDemo(user, pass)}
                className={`p-2 rounded-xl bg-slate-950/80 border transition-all hover:bg-slate-800/90 text-left cursor-pointer group ${
                  username === user ? 'border-rose-500/60 bg-rose-950/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3 h-3 ${color}`} />
                  <span className="font-mono font-bold text-[10px] text-slate-200">{label}</span>
                </div>
                <div className="font-mono text-[9px] text-slate-500 group-hover:text-slate-400">{user}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Governance note */}
        <div className="mt-4 text-center text-[10px] font-mono text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>India DPDP Act 2023 &bull; KSSEM Emergency Response Lab</span>
        </div>
      </div>
    </div>
  );
};
