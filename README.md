# PGFinder

A responsive PG / hostel / flat marketplace starter built with HTML, CSS, vanilla JavaScript, Bootstrap 5, Vercel Functions, PostgreSQL, and Vercel Blob. No React, Express, Flask, or separate application server is used.

## Included
- Responsive public homepage, listings, property detail, login/signup, user dashboard, contact, FAQ, legal pages.
- Database-backed property search and filters, property detail API, enquiry submission, favourites, account profile.
- Admin dashboard with property management, enquiries, users, content sections, banners, FAQs, testimonials, media upload, and settings.
- PostgreSQL schema, migration/seed scripts, secure first-admin creation script.
- Password hashing, signed HttpOnly session cookie, server-side role checks, parameterized SQL, basic rate limiting, CSRF token checks on state-changing cookie-authenticated APIs, safe public property fields.
- Vercel Blob upload endpoint for admin media.
- PWA manifest and service worker.

## Requirements
- Node.js 20 LTS or newer and Git.
- A PostgreSQL database. Vercel does **not** provide a built-in PostgreSQL database; provision Neon or another supported provider through the Vercel Marketplace. Free-tier limits and billing policies can change.
- A Vercel account for deployment; GitHub account for source control.
- Vercel Blob store for persistent image uploads.

## Windows / VS Code: run locally
1. Install Node.js LTS and Git.
2. Extract `PGFinder.zip`, then open the `PGFinder` folder (the project root) in VS Code.
3. Open **Terminal → New Terminal** (PowerShell) and run:

   ```powershell
   npm install
   npm install -g vercel
   Copy-Item .env.example .env
   ```

4. Edit `.env`. Set `POSTGRES_URL` to your database connection string, `SESSION_SECRET` to a long random secret, and optionally `WHATSAPP_NUMBER`. Do not commit `.env`.
5. Provision PostgreSQL from Vercel dashboard → Storage/Marketplace → Neon (exact menu labels can change). Copy the connection string to local `.env`. For local database work, ensure the provider allows your local IP and use SSL as required by the provider.
6. Run migrations and seed sample development content:

   ```powershell
   npm run db:migrate
   npm run db:seed
   ```

7. Create the first admin securely (the script prompts for email and password; nothing is hardcoded):

   ```powershell
   npm run admin:create
   ```

8. Start Vercel's local development environment:

   ```powershell
   npx vercel dev
   ```

   If prompted to link a Vercel project, you can choose to skip linking for local development. Open **http://localhost:3000**.

9. Test homepage, listings, property details, registration/login, dashboard, admin at `/admin.html`, enquiries, and WhatsApp links. Image upload requires a valid `BLOB_READ_WRITE_TOKEN`; database features require `POSTGRES_URL`.
10. Stop with `Ctrl+C`. Restart with `npx vercel dev`.

## Database and deployment
- The schema is in `database/schema.sql`; migration script applies it and tracks migration names.
- Seed data is development/demo content only. Do not use it as real customer data.
- `npm run admin:create` creates an administrator using a prompted email and password.
- In Vercel, import the GitHub repository, select the repository root as project root, use the default Vercel build settings, and add `POSTGRES_URL`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`, `WHATSAPP_NUMBER`, and `SITE_URL` under Project Settings → Environment Variables.
- Provision the database integration in the Vercel dashboard, then run migrations against the production database from a secure local terminal configured with the production connection string. Back up production data first. Do not run the development seed script against production.
- Create the production admin with `npm run admin:create` while `POSTGRES_URL` points to production. Keep credentials private.
- Deploy via Vercel. Subsequent pushes to the configured production branch trigger automatic deployment.

## GitHub commands (PowerShell)
Create an **empty** GitHub repository first at https://github.com/new. Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPOSITORY_NAME` below.

```powershell
git init
git add .
git status
git commit -m "Build PGFinder website"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

For later changes:

```powershell
git add .
git status
git commit -m "Update PGFinder"
git push
```

If `origin` already exists, use `git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git` instead of `git remote add origin ...`.

## Production testing checklist
- [ ] Public routes and all navbar/footer links work.
- [ ] PG/hostel/flat filters and pagination return expected results.
- [ ] Public API responses contain no exact address, owner phone, private notes, or private property name.
- [ ] Registration/login/logout and password hashing work.
- [ ] Normal users are denied admin endpoints even if they call APIs directly.
- [ ] Favourites and own enquiry history work.
- [ ] Admin property create/edit/delete/publish and page-content operations work.
- [ ] Enquiries persist and status changes save.
- [ ] Vercel Blob upload works with configured token.
- [ ] WhatsApp number is configured and links open with encoded text.
- [ ] Mobile widths have no horizontal overflow.
- [ ] Environment variables exist in Production, Preview, and Development as needed.

## Current limitations / honest notes
- This is a functional baseline, not a substitute for a security audit. Rate limiting is in-memory and therefore best-effort on serverless instances; use a shared rate-limit store for production scale.
- Password reset email delivery, social login, transactional email/newsletter campaigns, and third-party WhatsApp delivery are not implemented. The UI explains/avoids promising these external integrations.
- Some admin areas use generic data-management screens and can be expanded as the product evolves. Admin actions are API-backed where exposed; external provider configuration is required for database and persistent media.
- The test suite performs basic smoke checks. Full browser end-to-end testing requires running against a configured database and Vercel local runtime.
