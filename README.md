# Suthra Punjab Beat QR Management

Responsive Next.js app for sanitation beat records, QR print sheets, public beat information and complaint intake.

## Current preview functionality

- Beat create, edit, activate/deactivate, delete and search
- QR generation and printable bilingual beat sheet
- Public beat page opened from a QR link
- Team and supervisor details, vehicle and Google Maps link
- Public complaint form and complaint register
- CSV export for beats and complaints
- Browser localStorage demo mode

## Important deployment status

The current UI preview uses browser localStorage. This is **not yet the production data mode**:
- Browser records are not shared across devices or administrators.
- Complaint submissions are saved only in the visitor's browser.
- Photo selection currently records filenames only; it does not upload image bytes.
- Admin authentication and role permissions are not implemented.
- The Suthra Punjab logo is a temporary SP mark until the original logo can be extracted from the user's supplied sample.

Do not use this demo with live citizen data or as an official complaint-management system until the database, secure photo storage, authentication and operational workflows are enabled.

## Neon / PostgreSQL preparation

1. Create or connect a Neon PostgreSQL database to the Vercel project.
2. Add the Neon connection string as the encrypted Vercel environment variable `DATABASE_URL` for Production, Preview and Development.
3. Apply `database/schema.sql` to create the beats, complaints and feedback tables.
4. Implement and test the server-side database adapter and admin authentication before enabling shared mode.

## Local development

```bash
npm install
npm run dev
```

## Deploy

The GitHub repository is linked to Vercel. Pushes to `main` trigger deployments.

Project: https://vercel.com/pdfue/suthra-punjab-beat-qr
