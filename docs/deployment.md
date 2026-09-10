# Production deployment — API + Postgres

Status: **prepared, not deployed.** The host is not chosen yet (2026-08-04), so
nothing below has run against a real server. Everything here is host-agnostic
and was exercised locally; what is untested is called out as such.

The public site is already on Vercel. This document is about the other half:
the NestJS API and its database, which today run on a developer laptop behind a
temporary tunnel.

---

## Before anything else: who owns the account

**The hosting account goes in the client's name.** She is the data controller —
the medical documents patients upload (§11.14) are hers to answer for, and an
account in an agency's name makes that relationship wrong on paper and awkward
in practice. Set it up with her card, add us as a collaborator.

This also decides the region: **the server must be in the EU.** Special-category
health data, and `/gdpr` already tells visitors it stays in the EU.

---

## What runs

```
docker compose -f docker-compose.prod.yml up -d
```

| Service | What it is |
|---|---|
| `postgres` | Postgres 16, no published port |
| `api` | NestJS, bound to `127.0.0.1:3333` |
| `backup` | nightly `pg_dump` + a tar of the uploaded files, 14-day rotation |

TLS is **not** in this stack. Terminate it in front — Caddy, nginx, or whatever
the platform provides — and proxy to `127.0.0.1:3333`. The API speaks plain
HTTP and must never be exposed directly.

Prisma migrations run on container start (see `docker/Dockerfile.api`), so a
deploy applies pending migrations by itself.

---

## Environment

`docker-compose.prod.yml` uses `${VAR:?…}` for everything that must not have a
default, so the stack **refuses to start** rather than booting with
`olesia/olesia`. Verified: it fails with a named variable when the env is
missing, and validates when it is supplied.

Required:

| Variable | Notes |
|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | |
| `CORS_ORIGINS` | exact origins, comma-separated, no wildcards |
| `PUBLIC_API_URL` | the API's own public origin — builds file URLs |
| `PUBLIC_SITE_URL` | the **site's** origin — builds the patient upload link |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | at least 32 characters, random, and different from each other — the API exits at boot otherwise |
| `COOKIE_SECURE` | defaults to `true`; only set it to `false` for local HTTP |

Optional but wanted before launch: `CALENDLY_*` (booking is dead without them),
`SMTP_*` + `LEADS_NOTIFY_EMAIL` (without these nothing is emailed — leads are
still saved, and the back office says the mail did not go), `RECAPTCHA_SECRET`
(empty disables verification entirely).

`MEDICAL_UPLOAD_RETENTION_DAYS` defaults to 180 — **a placeholder**, pending the
client's and her lawyer's answer on how long medical files may be kept.

The frontend on Vercel needs `API_URL` and `NEXT_PUBLIC_API_URL` pointed at the
new API origin, then a redeploy.

---

## Backups

`docker/backup.sh` runs nightly in the `backup` service and writes to the
`backups` volume:

- `db-<stamp>.sql.gz` — schema-scoped `pg_dump`
- `files-<stamp>.tar.gz` — `private-uploads/` and `uploads/`

Both, deliberately: a dump alone restores appointments that reference analyses
nobody can open any more. Files are written under a `.part` name and renamed on
success, so a truncated dump never sits there looking like safety. Rotation
keeps 14 days.

**Restore drill — do this after the first deploy, and after any Postgres major
upgrade:**

```
docker compose -f docker-compose.prod.yml exec backup \
  sh /usr/local/bin/restore.sh /backups/db-<stamp>.sql.gz /backups/files-<stamp>.tar.gz
```

Point `PGDATABASE` at a scratch database for a drill. Verified locally on
2026-08-04 against the dev Postgres: dropped the `Service` table and deleted an
uploaded file, restored, and both came back — 7 service rows and the file's
contents. A backup nobody has restored is a hope, not a backup; record the date
of the last successful drill here.

**Not done: off-site copies.** A backup on the same disk as the database
survives a bad migration, not a dead server or a closed account. Once the host
exists, sync the `backups` volume to object storage **in the EU**.

---

## Losing the second factor as the only administrator

Two-factor authentication is per account, and an admin can clear it for someone
else (`POST /api/users/:id/2fa/reset`, admin only, never on oneself). With a
single admin account there is nobody to ask, so the way back in is the database.

The recovery codes come first: eight of them are shown once at enrolment and any
unused one works in the code field at login. Only when those are gone too:

```sql
-- Clears the second factor for one account. The password is unchanged, so the
-- next login is email + password alone, and enrolment starts again from the
-- Securitate page.
UPDATE "User"
SET "totpSecret" = NULL,
    "totpEnabled" = false,
    "totpEnabledAt" = NULL,
    "totpRecoveryCodes" = '{}',
    "totpFailedCount" = 0,
    "totpLockedUntil" = NULL
WHERE email = 'the.address@example.com';
```

Run it through the compose stack, against the running database:

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

The same statement without the `totpSecret` line, keeping only
`"totpFailedCount" = 0, "totpLockedUntil" = NULL`, lifts the lock that five
wrong codes in a row put on an account. That lock doubles from one minute to a
ceiling of fifteen and clears itself; it is worth waiting rather than reaching
for SQL.

Whoever runs this can read every patient record in the same session, so it is a
last resort, not a support procedure. Note the date and the reason somewhere the
client can see it.

---

## Still open

- **Host not chosen** — deferred 2026-08-04 pending Sergiu's clarification.
- **Off-site backup target** — needs the host first.
- **Malware scanning** for patient uploads (§11.14): nothing in the stack scans
  files. The mitigations that do exist are that uploads are never executed and
  never served from the public static route. Wire ClamAV here.
- **Retention period** is a placeholder.
- **Restore drill against production** — untested by definition until there is
  a production.
