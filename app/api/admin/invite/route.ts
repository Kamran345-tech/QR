import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const permissionNames = new Set([
  "View dashboard",
  "Manage beats",
  "Manage workers",
  "Manage contact directory",
  "Manage QR codes",
  "View complaints",
  "Export data",
  "Manage admins",
  "Manage settings",
]);

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !publicKey || !secretKey) {
    return NextResponse.json(
      { error: "Supabase server configuration is incomplete." },
      { status: 503 }
    );
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const authClient = createClient(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  const adminClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role_label, permissions, is_active")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    (profile.role_label !== "Administrator" &&
      !(Array.isArray(profile.permissions) &&
        profile.permissions.includes("Manage admins")))
  ) {
    return NextResponse.json({ error: "You are not allowed to invite office users." }, { status: 403 });
  }

  let body: { email?: string; fullName?: string; roleLabel?: string; permissions?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const fullName = body.fullName?.trim();
  const roleLabel = body.roleLabel?.trim() || "Operations Manager";
  const permissions = Array.isArray(body.permissions)
    ? [...new Set(body.permissions.filter((value): value is string =>
        typeof value === "string" && permissionNames.has(value)
      ))]
    : [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName) {
    return NextResponse.json({ error: "A valid email and full name are required." }, { status: 400 });
  }

  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    { data: { full_name: fullName } }
  );

  if (inviteError || !invited.user) {
    return NextResponse.json(
      { error: inviteError?.message || "Could not send the invitation." },
      { status: 400 }
    );
  }

  const { error: insertError } = await adminClient.from("profiles").upsert({
    id: invited.user.id,
    full_name: fullName,
    email,
    role_label: roleLabel,
    permissions,
    is_active: true,
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Invitation was sent, but the profile could not be saved. " + insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, message: "Invitation sent.", email });
}
