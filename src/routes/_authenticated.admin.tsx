import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser,
  type ManagedUser,
} from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";

type Role = ManagedUser["role"];
type FormState = { id?: string; username: string; password: string; role: Role };

const emptyForm: FormState = { username: "", password: "", role: "patient" };

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  patient: "Patient",
  hospital: "Hospital",
};

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "RESQLINK Admin Access" },
      { name: "description", content: "Manage RESQLINK operator accounts and access roles." },
      { property: "og:title", content: "RESQLINK Admin Access" },
      {
        property: "og:description",
        content: "Manage RESQLINK operator accounts and access roles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const fetchUsers = useServerFn(listAdminUsers);
  const createUser = useServerFn(createAdminUser);
  const updateUser = useServerFn(updateAdminUser);
  const deleteUser = useServerFn(deleteAdminUser);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setUsers(await fetchUsers());
    } catch {
      setError("Only Admin accounts can open this panel.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const openCreate = () => {
    setForm(emptyForm);
    setMessage("");
    setError("");
    setIsFormOpen(true);
  };

  const openEdit = (user: ManagedUser) => {
    setForm({ id: user.id, username: user.username, password: "", role: user.role });
    setMessage("");
    setError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (!isSaving) setIsFormOpen(false);
  };

  const saveUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");
    try {
      if (form.id) {
        await updateUser({
          data: {
            id: form.id,
            username: form.username,
            role: form.role,
            password: form.password || undefined,
          },
        });
        setMessage("Account updated.");
      } else {
        await createUser({
          data: { username: form.username, password: form.password, role: form.role },
        });
        setMessage("Account created.");
      }
      setIsFormOpen(false);
      setForm(emptyForm);
      await loadUsers();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this account.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeUser = async (user: ManagedUser) => {
    if (!window.confirm(`Delete ${user.username}? This cannot be undone.`)) return;
    setMessage("");
    setError("");
    try {
      await deleteUser({ data: { id: user.id } });
      setMessage("Account deleted.");
      await loadUsers();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete this account.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-tight">RESQLINK</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Admin access
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void navigate({ to: "/dashboard" })}>
            <ArrowLeft className="size-4" />
            Dashboard
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-12">
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Access control
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
                Users and roles
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Create operator accounts, update access, or remove access instantly.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Add account
            </Button>
          </div>

          {message && (
            <p className="mb-4 rounded-md border border-status-green/30 bg-status-green/10 px-3 py-2 text-sm text-status-green">
              {message}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Operator directory</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading accounts…"
                  : `${users.length} managed account${users.length === 1 ? "" : "s"}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {!isLoading && users.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No managed accounts found.
                </p>
              )}
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{user.username}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Added {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <Badge variant="outline">{roleLabels[user.role]}</Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${user.username}`}
                        onClick={() => openEdit(user)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${user.username}`}
                        onClick={() => void removeUser(user)}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {isFormOpen && (
          <Card className="h-fit lg:sticky lg:top-6">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>{form.id ? "Edit account" : "New account"}</CardTitle>
                <CardDescription>
                  {form.id ? "Update identity or access." : "Provision a secure operator login."}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close form" onClick={closeForm}>
                <X />
              </Button>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={saveUser}>
                <label className="block text-sm font-semibold" htmlFor="managed-username">
                  Operator ID
                  <Input
                    id="managed-username"
                    className="mt-2"
                    value={form.username}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, username: event.target.value }))
                    }
                    placeholder="e.g. dispatch.alpha"
                    maxLength={32}
                    required
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="managed-password">
                  {form.id ? "New password (optional)" : "Password"}
                  <Input
                    id="managed-password"
                    className="mt-2"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder={form.id ? "Leave blank to keep current" : "At least 8 characters"}
                    minLength={form.id ? undefined : 8}
                    maxLength={72}
                    required={!form.id}
                  />
                </label>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Access role</p>
                  <Select
                    value={form.role}
                    onValueChange={(value: Role) =>
                      setForm((current) => ({ ...current, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving…" : form.id ? "Save changes" : "Create account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
