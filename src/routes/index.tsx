import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Enter your operator ID")
    .max(32, "Operator ID must be 32 characters or fewer")
    .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dots, hyphens, or underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  role: z.enum(["admin", "patient", "hospital"]),
});

const roles = [
  { value: "admin", label: "Admin", description: "Dispatch command center" },
  { value: "patient", label: "Patient", description: "Emergency assistance" },
  { value: "hospital", label: "Hospital", description: "Trauma intake" },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESQLINK Secure Login" },
      {
        name: "description",
        content: "Secure role-based access for RESQLINK emergency response operations.",
      },
      { property: "og:title", content: "RESQLINK Secure Login" },
      {
        property: "og:description",
        content: "Secure role-based access for RESQLINK emergency response operations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) void navigate({ to: "/dashboard", replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ username, password, role });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your sign-in details");
      return;
    }

    setIsSubmitting(true);
    const normalizedUsername = parsed.data.username.toLowerCase();
    const syntheticEmail = `${normalizedUsername}@resqlink.local`;
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: parsed.data.password,
    });

    if (signInError) {
      setError("The operator ID or password is incorrect.");
      setIsSubmitting(false);
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .maybeSingle();

    if (roleError || roleData?.role !== parsed.data.role) {
      await supabase.auth.signOut();
      setError("This account is not assigned to the selected access role.");
      setIsSubmitting(false);
      return;
    }

    await navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(360px,0.8fr)_minmax(520px,1.2fr)]">
      <section className="relative hidden overflow-hidden bg-sidebar px-10 py-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(var(--color-sidebar-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-sidebar-border)_1px,transparent_1px)] bg-size-[44px_44px]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-safety-orange text-safety-orange-foreground shadow-lg">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-tight text-sidebar-primary-foreground">
                RESQLINK
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-sidebar-muted">
                Emergency response network
              </div>
            </div>
          </div>
          <div className="mt-28 max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-safety-orange">
              Bengaluru · Secure access
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-sidebar-primary-foreground">
              Every second moves someone closer to help.
            </h1>
            <p className="mt-5 text-sm leading-7 text-sidebar-muted">
              A coordinated response layer for dispatch teams, patients, and trauma-care partners.
            </p>
          </div>
        </div>
        <div className="relative border-t border-sidebar-border pt-5 text-xs text-sidebar-muted">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-status-green" /> All systems operational
          </div>
          <p className="mt-2">Protected access · DPDP-aligned audit trails</p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-115">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-tight">RESQLINK</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Secure operations access
              </div>
            </div>
          </div>
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <LockKeyhole className="size-3.5" /> Operator sign-in
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Choose your access role and enter your RESQLINK credentials.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Access role
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {roles.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRole(item.value)}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-left transition-colors",
                      role === item.value
                        ? "border-primary bg-primary/5 ring-2 ring-ring/20"
                        : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm font-semibold" htmlFor="username">
              Operator ID
              <div className="relative mt-2">
                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  maxLength={32}
                  className="h-12 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                  placeholder="e.g. dispatch.alpha"
                />
              </div>
            </label>
            <label className="block text-sm font-semibold" htmlFor="password">
              Password
              <div className="relative mt-2">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  maxLength={72}
                  className="h-12 w-full rounded-lg border border-input bg-card pl-10 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs font-medium text-destructive"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying access…" : "Sign in securely"}
            </Button>
          </form>
          <p className="mt-8 text-center text-[11px] leading-5 text-muted-foreground">
            Access is provisioned by RESQLINK operations. Contact your system administrator if you
            need an account.
          </p>
        </div>
      </section>
    </main>
  );
}
