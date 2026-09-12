import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShieldCheck, Plus, Pencil, Trash2, X, Check, LockKeyhole } from 'lucide-react';

export type ManagedRole = 'admin' | 'patient' | 'hospital';

export interface ManagedUser {
  id: string;
  username: string;
  role: ManagedRole;
  createdAt: string;
}

const DEFAULT_OPERATORS: ManagedUser[] = [
  { id: 'usr-01', username: 'dispatch.alpha', role: 'admin', createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'usr-02', username: 'apollo.trauma', role: 'hospital', createdAt: '2026-08-10T09:30:00.000Z' },
  { id: 'usr-03', username: 'manipal.intake', role: 'hospital', createdAt: '2026-08-15T11:15:00.000Z' },
  { id: 'usr-04', username: 'citizen.kiran', role: 'patient', createdAt: '2026-08-20T14:40:00.000Z' },
];

const STORAGE_KEY = 'resqlink_managed_operators';

const roleLabels: Record<ManagedRole, string> = {
  admin: 'Admin / Dispatch',
  patient: 'Citizen / Patient',
  hospital: 'Hospital ER',
};

export const OperatorAccountsManager: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_OPERATORS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<{ id?: string; username: string; password: string; role: ManagedRole }>({
    username: '',
    password: '',
    role: 'patient',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  const openCreate = () => {
    setForm({ username: '', password: '', role: 'patient' });
    setMessage('');
    setError('');
    setIsFormOpen(true);
  };

  const openEdit = (user: ManagedUser) => {
    setForm({ id: user.id, username: user.username, password: '', role: user.role });
    setMessage('');
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const cleanUsername = form.username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Operator ID must be at least 3 characters.');
      return;
    }

    if (form.id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === form.id ? { ...u, username: cleanUsername, role: form.role } : u))
      );
      setMessage(`Operator ${cleanUsername} updated.`);
    } else {
      if (users.some((u) => u.username === cleanUsername)) {
        setError('That operator ID is already in use.');
        return;
      }
      const newUser: ManagedUser = {
        id: `usr-${Date.now().toString(36)}`,
        username: cleanUsername,
        role: form.role,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      setMessage(`Operator ${cleanUsername} provisioned.`);
    }

    setIsFormOpen(false);
    setForm({ username: '', password: '', role: 'patient' });
  };

  const handleDelete = (user: ManagedUser) => {
    if (!window.confirm(`Delete operator ${user.username}? This cannot be undone.`)) return;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setMessage(`Account ${user.username} deleted.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <LockKeyhole className="size-3.5" /> Access Control & RBAC
          </div>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight">Operator Directory & Accounts</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage dispatchers, emergency trauma units, and authorized citizen accounts.
          </p>
        </div>
        <Button onClick={openCreate} className="cursor-pointer">
          <Plus className="mr-1.5 size-4" /> Add Operator Account
        </Button>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-status-green/30 bg-status-green/10 px-4 py-3 text-xs font-semibold text-status-green">
          <Check className="size-4" /> {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Operators List */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Active Credentials ({users.length})</CardTitle>
            <CardDescription className="text-xs">
              Cryptographically verified operators with access to Bengaluru Emergency Dispatch Network.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-lg border border-border/80 bg-background/50 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:border-primary/40 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0" />
                    <p className="font-mono text-sm font-bold text-foreground truncate">{user.username}</p>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Provisioned: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <Badge
                    variant={user.role === 'admin' ? 'default' : user.role === 'hospital' ? 'secondary' : 'outline'}
                    className="text-[10px] font-mono"
                  >
                    {roleLabels[user.role]}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 cursor-pointer"
                      title={`Edit ${user.username}`}
                      onClick={() => openEdit(user)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive cursor-pointer"
                      title={`Delete ${user.username}`}
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {isFormOpen ? (
          <Card className="border-border bg-card h-fit lg:sticky lg:top-4 animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">{form.id ? 'Edit Operator' : 'New Operator Account'}</CardTitle>
                <CardDescription className="text-xs">
                  {form.id ? 'Modify access role or ID' : 'Provision a new emergency terminal account'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="size-7" onClick={() => setIsFormOpen(false)}>
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Operator ID</label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="e.g. dispatch.bravo"
                    required
                    maxLength={32}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {form.id ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    required={!form.id}
                    minLength={6}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Access Role</label>
                  <Select
                    value={form.role}
                    onValueChange={(val: ManagedRole) => setForm((prev) => ({ ...prev, role: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin / Dispatch Command Center</SelectItem>
                      <SelectItem value="hospital">Hospital / Emergency Trauma Intake</SelectItem>
                      <SelectItem value="patient">Citizen / Emergency Assistance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button type="submit" className="w-full text-xs font-bold cursor-pointer">
                    {form.id ? 'Save Changes' : 'Create Account'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs cursor-pointer"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card/40 border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <ShieldCheck className="size-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">Operator Role Security</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                Roles define granular access to live emergency maps, hospital trauma radars, and dispatch telemetry.
              </p>
              <Button onClick={openCreate} variant="outline" size="sm" className="mt-4 text-xs cursor-pointer">
                <Plus className="mr-1.5 size-3.5" /> New Operator
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
