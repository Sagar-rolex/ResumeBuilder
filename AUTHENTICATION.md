# Authentication

The app uses MongoDB users with bcrypt password hashes and JWT bearer tokens. Set `MONGODB_URI` and `JWT_SECRET` in `server/.env`; use a randomly generated JWT secret of at least 32 characters. The server waits for MongoDB before listening and exits if the connection fails. Configure `CLIENT_URL` for the deployed frontend origin. The client uses `VITE_BASE_URL` (for example `http://localhost:3000/api`).

## Regular users

Register and sign in at `POST /api/users/register` and `POST /api/users/login`. Public registration always assigns the `user` role, hashes passwords with bcrypt, and returns a JWT. The client stores the token and sends it as `Authorization: Bearer <token>`. Protected `/app` pages require a signed-in user; backend resume routes also require a valid active account.

## Administrators

Admin sign-in is `POST /api/admin/login`. It checks the same password hash and issues the same JWT format, but requires a MongoDB account whose role is `admin`. Public registration and login never create or promote admins.

To provision the first administrator, set `ADMIN_EMAIL`, `ADMIN_NAME`, and a unique `ADMIN_PASSWORD` of at least 12 characters in the server environment, then run `npm run seed:admin` from `server/`. The seed does not change an existing account or password. If the email already belongs to a regular user, it stops without modifying that account; promote only through an explicitly reviewed database operation. Remove the temporary `ADMIN_PASSWORD` environment variable after provisioning.

Admin pages are guarded in the client, and all `/api/admin` management endpoints enforce the role in the backend. Do not put admin credentials in client code.

Open the admin sign-in page at `/admin/login` (the legacy `/admin-login` URL redirects there). After signing in, `/admin/dashboard` provides navigation to the overview, user management, templates, analytics, activity logs, and settings. The server exposes protected admin APIs under `/api/admin`; template administration is under `/api/admin/templates`. Public template selection uses `/api/templates` and includes published custom templates. New administrator accounts should be provisioned with the seed script above rather than public signup.

The template catalog supports published data-only variants of the existing 26 renderers (accent color and approved font configuration). A new structural renderer still requires a frontend code change. Analytics tracks public client page navigations and aggregates registrations, resume creation, and active-user metrics; distinct visitor counts are approximate.

## Local verification status (2026-11-09)

- Existing `server/.env` contains `MONGODB_URI` and `JWT_SECRET`; its JWT secret is shorter than the recommended 32 characters. Secret contents are intentionally not recorded here.
- Atlas connectivity was attempted; the configured cluster SRV DNS query timed out (`querySrv ETIMEOUT`). The prior server started listening before database connection completed; startup now waits for the database and exits after the configured timeout.
- Restore Atlas DNS/network reachability (cluster status, DNS SRV resolution, firewall/VPN and Atlas network access list) before starting the backend. No user records were read or changed during this audit.
- Admin provisioning has not been run because no admin credentials were supplied.
- Login requests against real user/admin records and browser workflows remain unverified until MongoDB is reachable and test accounts are available.
- Client production build passed. Lint failed on 17 existing non-auth issues. Backend syntax checks passed. The local browser URL timed out, so actual UI workflows remain unverified.
- Follow-up on 2026-11-10: Build Resume and hero CTA browser checks now route to the public signup form and retain their post-auth destination. The footer CTA and dashboard private preview/create flow were repaired. Actual signup/login and MongoDB resume persistence remain blocked by the repeated Atlas DNS timeout. Client build passed; lint currently reports 15 unrelated existing issues.
- Admin panel completion on 2026-11-10: the client production build and targeted ESLint checks passed; backend JavaScript syntax checks passed; direct admin middleware checks returned 403 for a regular user, allowed an admin, and returned 401 without a token. Live admin login, user/template changes, and analytics queries remain unverified because Atlas SRV resolution timed out and no admin test credentials were available. The client build reports a large JavaScript chunk warning; code splitting was not part of this change.
