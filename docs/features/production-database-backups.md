# Production database backups

Beagle backs up its production Azure PostgreSQL database to a private Cloudflare R2 bucket. The [GitHub Actions workflow](../../.github/workflows/db-backup-r2.yml) is scheduled for **02:00 UTC on the first of each month** on the default branch (`main`). To run an extra backup, open **Actions → Back up production PostgreSQL to R2 → Run workflow** and select `main`.

## What the backup contains

Each object is a gzip-compressed SQL dump of the database schema and data, including audit events. The workflow uses [Beagle’s dump script](../../scripts/db/dump.sh) and a PostgreSQL client matching the source server’s major version. Each run gets a distinct object key:

```text
beagle/prod/beagle-<UTC timestamp>-<run ID>-<attempt>.sql.gz
```

The workflow does not delete older backups. Any retention policy is configured separately in R2.

## Configuration

In Cloudflare R2, use a private bucket with public access disabled and an **Object Read & Write** API token scoped to that bucket. In GitHub, under **Settings → Secrets and variables → Actions**, set these repository secrets:

| Secret                 | Value                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| `R2_BUCKET`            | Bucket name                                                      |
| `R2_ENDPOINT`          | Base HTTPS S3 endpoint, including the jurisdiction if applicable |
| `R2_ACCESS_KEY_ID`     | R2 Access Key ID                                                 |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Access Key                                             |

The workflow reuses the [production deployment’s Azure settings](../azure-app-service-deployment.md#github-actions-configuration) for OIDC and PostgreSQL. Its OIDC identity needs the [firewall permissions](../azure-app-service-deployment.md#azure-permission-for-temporary-firewall-rules), and the SQL user needs read access to the tables and sequences being backed up. `AZURE_DATABASE_URL_UNPOOLED` must target the configured database directly on port `5432`, with `sslmode` and optional `sslrootcert` as the only query options. For certificate verification, point `sslrootcert` at a CA bundle available on the runner, such as `/etc/ssl/certs/ca-certificates.crt`.

## Verify a backup run

The workflow opens a temporary Azure firewall rule, `github-actions-r2-backup`, for the runner’s IPv4 address. It attempts cleanup even if the dump fails and uploads only after the dump succeeds and the rule’s absence is verified.

Check that the GitHub Actions run succeeded, the log says **Temporary PostgreSQL firewall rule removal verified**, and the reported object key exists in R2. If an interrupted run leaves the rule in place, confirm no backup is active before removing that specific rule in Azure.

## Recovery check

Download the reported object from the private bucket and save it as `tmp/db-dumps/recovery/beagle.sql.gz` under the repo root. Point `.env.local` at the intended local PostgreSQL database. Use an empty database to test a restore from scratch, or your normal local database if you intend to replace its data.

```bash
gzip -t tmp/db-dumps/recovery/beagle.sql.gz
pass-cli run --env-file .env.local -- node -e 'const u = new URL(process.env.DATABASE_URL); console.log(u.host, u.pathname)'
```

Only proceed if the archive check passes and the displayed host and database are the intended local target. The restore drops and recreates objects in that database.

```bash
gzip -dk tmp/db-dumps/recovery/beagle.sql.gz
pass-cli run --env-file .env.local -- pnpm db:restore tmp/db-dumps/recovery/beagle.sql
```

Confirm the command reports `Restore completed from: ...`, Prisma migration history is present, and representative records such as dogs and show entries can be read. Remove the downloaded and unpacked dump files when finished.
