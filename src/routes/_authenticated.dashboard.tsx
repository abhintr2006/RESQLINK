import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "patient" | "hospital";

const roleContent: Record<Role, { label: string; title: string; description: string }> = {
  admin: {
    label: "Admin command center",
    title: "Coordinate every response from one place.",
    description: "Monitor active incidents, dispatch teams, and keep hospital partners aligned.",
  },
  patient: {
    label: "Patient assistance",
    title: "Help is connected and moving.",
    description: "View your emergency request and stay connected with the response team.",
  },
  hospital: {
    label: "Hospital intake",
    title: "Prepare for the next arrival.",
    description: "Review incoming cases and coordinate trauma-care capacity with dispatch.",
  },
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "RESQLINK Dashboard" },
      { name: "description", content: "Role-based RESQLINK emergency response dashboard." },
      { property: "og:title", content: "RESQLINK Dashboard" },
      { property: "og:description", content: "Role-based RESQLINK emergency response dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const content = roleContent[role ?? "admin"];

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (active && roleData?.role && roleData.role in roleContent) {
        setRole(roleData.role as Role);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/", replace: true });
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
                {content.label}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Bengaluru response network
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">{content.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button>Open {content.label}</Button>
            {role === "admin" && (
              <Button asChild variant="outline">
                <Link to="/admin">
                  <Settings2 className="size-4" />
                  Manage accounts
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/">Return to login</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
