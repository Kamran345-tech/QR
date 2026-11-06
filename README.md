# Suthra Punjab Beat QR Management

Next.js office dashboard prototype for managing sanitation beats, individual worker profiles, reusable TM/FMO/Supervisor contacts, QR print jobs and public beat information.

## Implemented in the current UI

- Beat create/edit/delete, activate/deactivate and search
- Separate worker records: name, photo, designation, shift and attendance time
- Reusable contact directory for TM, FMO and Supervisor; selecting a saved contact fills the linked phone automatically
- Individual QR PNG download, QR print sheet and bulk ZIP download of all QR images
- Public beat profile layout and complaint form
- Complaint register and CSV export
- Admin user/role/permission management interface (prototype only)

## Production blockers — read before office use

The current UI still uses browser localStorage. The admin login and permission interface is **not secure authentication** and must not be treated as access control. User-created accounts in this preview do not have securely provisioned passwords or server-enforced permissions.

The public QR link currently serializes beat data into a URL. It is a preview mechanism, not a secure/shared data API. Worker photo data is not embedded in the QR URL because doing so would create oversized QR codes.

Before official use, complete all of the following:
1. Connect Neon PostgreSQL and set `DATABASE_URL` in Vercel.
2. Apply `database/schema.sql`.
3. Implement server-side CRUD APIs for beats, workers, contacts, complaints and feedback.
4. Implement secure admin authentication, password hashing, session cookies and server-side permission checks. Do not rely on localStorage or hidden UI controls for security.
5. Connect secure object storage for worker and complaint photos; store only image URLs in PostgreSQL.
6. Change QR payloads to stable public beat URLs (for example `/beat/<public-id>`) that fetch published beat data from the server.
7. Test public complaint submission, admin permissions, backups and mobile QR scans across separate devices.
8. Replace the temporary SP monogram with the original Suthra Punjab logo supplied by the user.

## Database

The schema now separates:
- `office_contacts`: reusable TM, FMO and Supervisor directory
- `beats`: beat identity and linked contacts
- `beat_workers`: one row per worker, including photo URL and attendance/shift fields
- `admin_users` and `admin_sessions`: secure account/session storage foundations
- `complaints` and `feedback`

## Development

```bash
npm install
npm run dev
```

Do not enter live citizen personal data into the browser-only preview.
