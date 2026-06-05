#!/usr/bin/env node
/**
 * Create a Bazoo Claims admin account.
 *
 * Usage:
 *   npm run create-admin
 *   npm run create-admin -- --email you@example.com --password 'SecretPass123!' --name "Your Name"
 *   npm run create-admin -- --mode supabase
 *   npm run create-admin -- --force
 *
 * Modes:
 *   local (default) — writes to data/admin-db.json; login works when Supabase is not primary
 *   supabase        — creates Supabase Auth user + staff row (needs working Supabase project)
 */

import { createClient } from "@supabase/supabase-js";
import { randomBytes, scryptSync } from "crypto";
import { readFileSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(ROOT, "data", "admin-db.json");

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(ROOT, name);
    try {
      const raw = readFileSyncSafe(file);
      if (!raw) continue;
      for (const line of raw.split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq <= 0) continue;
        const key = t.slice(0, eq).trim();
        let val = t.slice(eq + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
      }
    } catch {
      // ignore missing files
    }
  }
}

function readFileSyncSafe(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const out = { mode: "local", force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--mode" && argv[i + 1]) out.mode = argv[++i];
    else if (a === "--email" && argv[i + 1]) out.email = argv[++i];
    else if (a === "--password" && argv[i + 1]) out.password = argv[++i];
    else if (a === "--name" && argv[i + 1]) out.name = argv[++i];
    else if (a === "--force") out.force = true;
    else if (a === "--help" || a === "-h") out.help = true;
  }
  return out;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function newId(prefix) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function normalizeSupabaseUrl(raw) {
  const t = raw?.trim();
  if (!t) return null;
  try {
    return new URL(t).origin;
  } catch {
    return t.replace(/\/+$/, "") || null;
  }
}

function defaultDb() {
  return {
    version: 2,
    staff: [],
    claims: [],
    invoices: [],
    invoiceTemplates: [],
    activity: [],
    companyProfile: {
      legalName: "Bazoo Accident Management",
      tradingName: "Bazoo Claims",
      addressLines: ["Enter your registered office address in Admin → Settings"],
      city: "",
      postcode: "",
      country: "United Kingdom",
      phone: "",
      email: "",
      website: "",
      vatNumber: "",
      companyNumber: "",
      logoPath: "/logo-bazoo.png",
    },
    enquiries: [],
    vendors: [],
  };
}

async function readDb() {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return { ...defaultDb(), ...parsed, version: 2 };
  } catch {
    return defaultDb();
  }
}

async function writeDb(db) {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

async function createLocalAdmin({ email, password, name, force }) {
  const db = await readDb();
  const existing = db.staff.find((s) => s.email === email);
  if (existing && !force) {
    console.error(`\n❌ Staff already exists for ${email}. Use --force to replace the password.\n`);
    process.exit(1);
  }

  const now = new Date().toISOString();
  const staff = {
    id: existing?.id ?? newId("staff"),
    name,
    email,
    passwordHash: hashPassword(password),
    role: "admin",
    active: true,
    createdAt: existing?.createdAt ?? now,
    authUserId: undefined,
  };

  if (existing) {
    db.staff = db.staff.map((s) => (s.email === email ? staff : s));
  } else {
    db.staff.push(staff);
  }

  db.activity.unshift({
    id: newId("act"),
    at: now,
    actorId: staff.id,
    actorName: staff.name,
    action: existing ? "Admin password reset (script)" : "Admin created (script)",
    entityType: "system",
    detail: email,
  });

  await writeDb(db);

  console.log("\n✅ Local admin ready\n");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   DB file:  ${DB_PATH}`);
  console.log("\n   Login: http://localhost:3000/admin/login");
  console.log("\n   For local password login, ensure .env.local has:");
  console.log("   - ADMIN_SUPABASE_AUTH_ONLY=false");
  console.log("   - NEXT_PUBLIC_SUPABASE_URL commented out (or invalid Supabase disabled)");
  console.log("   Then restart: npm run dev\n");
}

async function createSupabaseAdmin({ email, password, name, force }) {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    console.error("\n❌ Supabase mode needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local\n");
    process.exit(1);
  }

  const supa = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Quick connectivity check
  const ping = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: serviceKey },
  }).catch((e) => ({ ok: false, error: e }));
  if (!ping.ok && ping.error) {
    console.error(`\n❌ Cannot reach Supabase at ${url}`);
    console.error(`   ${ping.error.message ?? ping.error}`);
    console.error("\n   Create a project at https://supabase.com, run supabase/migrations/*.sql,");
    console.error("   update .env.local with the new URL and keys, or use: npm run create-admin (local mode)\n");
    process.exit(1);
  }

  const db = await readDb();
  const existing = db.staff.find((s) => s.email === email);
  if (existing && !force) {
    console.error(`\n❌ Staff already exists for ${email}. Use --force to recreate (deletes old Supabase user if linked).\n`);
    process.exit(1);
  }

  if (existing?.authUserId && force) {
    await supa.auth.admin.deleteUser(existing.authUserId);
  }

  const { data: authData, error: authError } = await supa.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user?.id) {
    const msg = authError?.message ?? "Could not create Supabase user";
    if (/already registered|already exists|duplicate/i.test(msg)) {
      console.error(`\n❌ ${msg}`);
      console.error("   Sign in at /admin/login with that email, or use --force with a new email.\n");
    } else {
      console.error(`\n❌ Supabase Auth error: ${msg}\n`);
    }
    process.exit(1);
  }

  const now = new Date().toISOString();
  const staff = {
    id: existing?.id ?? newId("staff"),
    name,
    email,
    passwordHash: "",
    role: "admin",
    active: true,
    createdAt: existing?.createdAt ?? now,
    authUserId: authData.user.id,
  };

  if (existing) {
    db.staff = db.staff.map((s) => (s.email === email ? staff : s));
  } else {
    db.staff.push(staff);
  }

  db.activity.unshift({
    id: newId("act"),
    at: now,
    actorId: staff.id,
    actorName: staff.name,
    action: "Admin created via script (Supabase)",
    entityType: "system",
    detail: email,
  });

  await writeDb(db);

  // Also persist staff to Supabase if tables exist
  const { error: staffErr } = await supa.from("staff").upsert({
    id: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role,
    active: staff.active,
    password_hash: null,
    auth_user_id: staff.authUserId,
    created_at: staff.createdAt,
    updated_at: now,
  });

  if (staffErr) {
    console.warn(`\n⚠️  Supabase staff table write failed: ${staffErr.message}`);
    console.warn("   Run migrations in supabase/migrations/ (001 → 004) in the SQL editor.\n");
  }

  console.log("\n✅ Supabase admin created\n");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("\n   Login: https://www.bazooclaims.com/admin/login");
  console.log("   (or http://localhost:3000/admin/login locally)\n");
}

function printHelp() {
  console.log(`
Bazoo Claims — create admin

  npm run create-admin
  npm run create-admin -- --email support@bazooclaims.com --password 'YourPass123!' --name "Bazoo Admin"
  npm run create-admin -- --mode supabase
  npm run create-admin -- --force

Options:
  --mode local|supabase   local = data/admin-db.json (default)
  --email                 default: ADMIN_BOOTSTRAP_EMAIL or support@bazooclaims.com
  --password              default: ADMIN_BOOTSTRAP_PASSWORD or prompts you must pass 8+ chars
  --name                  default: ADMIN_BOOTSTRAP_NAME or "Bazoo Admin"
  --force                 replace existing account with same email
`);
}

async function main() {
  loadEnvFiles();
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const email = (args.email ?? process.env.ADMIN_BOOTSTRAP_EMAIL ?? "support@bazooclaims.com")
    .trim()
    .toLowerCase();
  const password = args.password ?? process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "ChangeMe123!";
  const name = args.name ?? process.env.ADMIN_BOOTSTRAP_NAME ?? "Bazoo Admin";

  if (password.length < 8) {
    console.error("\n❌ Password must be at least 8 characters. Use --password 'YourPass123!'\n");
    process.exit(1);
  }

  const mode = args.mode === "supabase" ? "supabase" : "local";
  console.log(`\nCreating admin (${mode} mode)…`);

  if (mode === "supabase") {
    await createSupabaseAdmin({ email, password, name, force: args.force });
  } else {
    await createLocalAdmin({ email, password, name, force: args.force });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
