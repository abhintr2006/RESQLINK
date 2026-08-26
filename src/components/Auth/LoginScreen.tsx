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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 shadow-lg shadow-rose-600/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">RESQLINK</h1>
          <p className="mt-2 text-sm text-slate-400">Secure Emergency Response Network</p>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-rose-500/10 p-2.5 text-rose-300"><LockKeyhole className="w-5 h-5" /></div>
            <div>
              <h2 className="font-bold text-lg">Sign in to RESQLINK</h2>
              <p className="text-xs text-slate-400">JWT-protected command and citizen portals</p>
            </div>
          </div>

          {error && <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{error}</div>}

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2" htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className="mb-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-rose-500" required />

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2" htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mb-6 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-rose-500" required />

          <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:from-rose-500 hover:to-rose-600 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400">
          <div className="mb-3 flex items-center gap-2 font-bold text-slate-300"><Radio className="w-3.5 h-3.5 text-rose-400" /> Demo accounts</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <button type="button" onClick={() => { setUsername('admin'); setPassword('admin123'); }} className="rounded-xl bg-slate-800 px-2 py-2 hover:bg-slate-700">admin</button>
            <button type="button" onClick={() => { setUsername('hospital'); setPassword('hospital123'); }} className="rounded-xl bg-slate-800 px-2 py-2 hover:bg-slate-700">hospital</button>
            <button type="button" onClick={() => { setUsername('patient'); setPassword('patient123'); }} className="rounded-xl bg-slate-800 px-2 py-2 hover:bg-slate-700">patient</button>
          </div>
        </div>
      </div>
    </div>
  );
};
