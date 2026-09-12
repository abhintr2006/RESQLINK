import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const roleSchema = z.enum(["admin", "patient", "hospital"]);

const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8).max(72),
  role: roleSchema,
});

const updateUserSchema = z.object({
  id: z.string().uuid(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9._-]+$/),
  role: roleSchema,
  password: z.string().max(72).optional(),
});

const deleteUserSchema = z.object({ id: z.string().uuid() });

export type ManagedUser = {
  id: string;
  username: string;
  role: "admin" | "patient" | "hospital";
  createdAt: string;
};

async function requireAdmin(context: { supabase: unknown; userId: string }) {
  const { supabase, userId } = context as {
    supabase: import("@supabase/supabase-js").SupabaseClient;
    userId: string;
  };

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw new Error("Unable to verify administrator access");
  if (!data) throw new Error("Forbidden");
}

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [
      { data: usersData, error: usersError },
      { data: profiles, error: profilesError },
      { data: roles, error: rolesError },
    ] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabaseAdmin
        .from("profiles")
        .select("id, username, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);

    if (usersError || profilesError || rolesError)
      throw new Error("Unable to load managed accounts");

    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
    const roleByUserId = new Map((roles ?? []).map((item) => [item.user_id, item.role]));

    return (usersData.users ?? [])
      .map((user): ManagedUser | null => {
        const role = roleByUserId.get(user.id);
        if (!role) return null;
        const profile = profileById.get(user.id);
        return {
          id: user.id,
          username:
            profile?.username ??
            user.user_metadata?.["username"] ??
            user.email?.split("@")[0] ??
            "operator",
          role,
          createdAt: profile?.created_at ?? user.created_at,
        };
      })
      .filter((user): user is ManagedUser => user !== null);
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => createUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const username = data.username.toLowerCase();

    const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (profileLookupError) throw new Error("Unable to check username availability");
    if (existingProfile) throw new Error("That operator ID is already in use");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: `${username}@resqlink.local`,
      password: data.password,
      email_confirm: true,
      user_metadata: { username },
    });
    if (createError || !created.user) throw new Error("Unable to create this account");

    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: created.user.id,
      role: data.role,
    });

    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error("Unable to assign the selected role");
    }

    return { ok: true };
  });

export const updateAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => updateUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (data.id === context.userId && data.role !== "admin") {
      throw new Error("You cannot remove Admin access from your own account");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const username = data.username.toLowerCase();
    const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", data.id)
      .maybeSingle();
    if (profileLookupError) throw new Error("Unable to check username availability");
    if (existingProfile) throw new Error("That operator ID is already in use");

    const authUpdate: { user_metadata: { username: string }; password?: string } = {
      user_metadata: { username },
    };
    if (data.password) authUpdate.password = data.password;
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(data.id, authUpdate);
    if (authError) throw new Error("Unable to update this account");

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ username })
      .eq("id", data.id);
    if (profileError) throw new Error("Unable to update the operator ID");

    const { error: deleteRoleError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.id);
    if (deleteRoleError) throw new Error("Unable to update the account role");
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.id, role: data.role });
    if (roleError) throw new Error("Unable to update the account role");

    return { ok: true };
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => deleteUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (data.id === context.userId) throw new Error("You cannot delete your own account");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error("Unable to delete this account");
    return { ok: true };
  });
