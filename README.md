# Suthra Punjab Beat QR Management

Next.js office dashboard prototype for managing sanitation beats, individual worker profiles, reusable TM/FMO/Supervisor contacts, QR print jobs and public beat information.

## Current implementation status

- Supabase project environment variables are configured in Vercel.
- Supabase JavaScript SDK and browser client are installed.
- `/api/health/supabase` checks the database connection and the `beats` table.
- `/api/admin/invite` sends an Auth invitation only after verifying an active administrator and their permissions.
- The Supabase schema is versioned at `supabase/schema.sql`.
- Existing dashboard screens still use browser localStorage and are not yet connected to the shared database.

## Important: not production-ready yet

Do not enter live citizen personal data or rely on the current localStorage login as office access control. The current UI still uses browser-local data, and its login/permission interface is a prototype. Secure Supabase Auth and server-enforced permissions must be integrated into the dashboard before official use.

## Supabase database

The SQL schema was applied in the Supabase SQL Editor and is also maintained in `supabase/schema.sql`. It includes:

- `profiles`: office users linked to Supabase Auth, roles and permissions
- `office_contacts`: reusable TM, FMO and Supervisor directory
- `beats`: beat identity, location, status and linked contacts
- `beat_workers`: individual workers with photo URL, designation, shift and attendance time
- `complaints` and `feedback`: public submissions and office review
- Row Level Security policies for public reads/submissions and permission-controlled office access

No sample beats or worker records are inserted.

## Remaining work before office use

1. Create the first administrator profile linked to a Supabase Auth user.
2. Replace localStorage login with Supabase Auth session handling.
3. Connect beat, worker, contact, complaint and feedback screens to Supabase CRUD operations.
4. Enforce permissions on every server-side operation, not only by hiding dashboard tabs.
5. Change QR codes to stable public beat URLs that load current server-side data.
6. Add and test complaint photo uploads (maximum three images), validation and abuse protection.
7. Test access from separate devices, mobile QR scans, backups and account recovery.

## Development

```bash
npm install
npm run dev
```
