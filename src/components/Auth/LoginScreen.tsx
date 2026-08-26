import React, { FormEvent, useState } from 'react';
import { LockKeyhole, Radio, ShieldAlert } from 'lucide-react';
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

  const fillDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 shadow-lg shadow-rose-600/30">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">RESQLINK</h1>
          <p className="mt-2 text-sm text-slate-400">Secure Emergency Response Network</p>
        </div>

        {/* Sign-in card */}
        <form onSubmit={submit} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl" noValidate>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-rose-500/10 p-2.5 text-rose-300">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Sign in to RESQLINK</h2>
              <p className="text-xs text-slate-400">JWT-protected command and citizen portals</p>
            </div>
          </div>

          {/* Error region — announced by screen readers */}
          <div aria-live="polite" aria-atomic="true">
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
              >
                {error}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2"
              htmlFor="username"
            >
              Username
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
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter password"
              required
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:from-rose-500 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Demo accounts card */}
        <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-300">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            Demo accounts — click to prefill
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs text-slate-400">
            {[
              { user: 'admin',    pass: 'admin123',    label: 'Admin' },
              { user: 'hospital', pass: 'hospital123', label: 'Hospital' },
              { user: 'patient',  pass: 'patient123',  label: 'Patient' },
            ].map(({ user, pass, label }) => (
              <button
                key={user}
                type="button"
                onClick={() => fillDemo(user, pass)}
                className="min-h-[44px] rounded-xl bg-slate-800 px-2 py-2 transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              >
                <span className="block font-semibold text-slate-200">{label}</span>
                <span className="block text-slate-500">{user}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
