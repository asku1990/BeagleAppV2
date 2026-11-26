# Monthly PostgreSQL backups to Cloudflare R2

**Status: manual workflow implemented; setup and recovery check pending.** The source is the production Azure PostgreSQL database and the destination is a private R2 bucket. The monthly schedule stays disabled until the first successful recovery check. Local development uses seeded example data.

## Implementation plan

1. **Schedule the backup.** Add `.github/workflows/db-backup-r2.yml`, using `help-tool-v1/.github/workflows/db-backup-r2.yml` as the reference. Start with `workflow_dispatch` on `main`. After the recovery check below passes, add cron `0 2 1 * *` (02:00 UTC on the first of each month). Give backup runs their own concurrency group with `cancel-in-progress: false`.
2. **Connect to Azure.** Follow [the production deployment workflow](../../.github/workflows/deploy-azure-prod.yml): log in with OIDC, validate the direct TLS connection URL against the configured server and database, allow only the runner’s IPv4 address, and wait for a successful database connection. Use a separate rule named `github-actions-r2-backup` so deployment cleanup cannot remove backup access. Give the job `contents: read` and `id-token: write`.
3. **Create the recovery dump.** The workflow reads the source server’s major version from Azure, installs the matching PostgreSQL client, and cross-checks the version over SQL. Invoke [Beagle’s existing dump script](../../scripts/db/dump.sh) with an explicit file under the runner’s temporary directory, `CONFIRM_PROD=YES`, and `DUMP_INCLUDE_AUDIT_LOGS=1`. The last setting includes audit rows that ordinary development dumps omit. Keep Beagle’s SQL format so the existing restore command works; do not copy Help Tool’s public-schema filter.
4. **Close access and upload.** After the firewall rule creation is attempted, run cleanup even on failure and verify the rule is absent. Compress the completed SQL dump and upload it using the AWS CLI against the R2 S3 endpoint. Use a distinct key per run, e.g. `beagle/prod/beagle-<UTC timestamp>-<run ID>-<attempt>.sql.gz`. Fail the job on dump, cleanup, or upload failure; do not publish a partial dump. Log the object key without printing credentials.

## Setup instructions

1. **Cloudflare:** In R2, create a private bucket for Beagle production backups. Leave public access disabled. Create an R2 API token with **Object Read & Write** scoped to that bucket. Record the bucket name, S3 endpoint, access key ID, and secret access key. Use the endpoint Cloudflare shows for the bucket, including its jurisdiction if applicable.
2. **GitHub:** In the Beagle repository, open **Settings → Secrets and variables → Actions**. Add repository secrets `R2_BUCKET`, `R2_ENDPOINT` (full HTTPS endpoint), `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY`. In the upload step, map the key pair to `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, set the region to `auto`, and pass `R2_ENDPOINT` to `aws s3 cp --endpoint-url`.
3. **Azure:** Verify the existing deployment secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, and `AZURE_DATABASE_URL_UNPOOLED`, and variables `AZURE_POSTGRES_RESOURCE_GROUP`, `AZURE_POSTGRES_SERVER_NAME`, and `AZURE_POSTGRES_DATABASE_NAME`. Use a direct libpq connection URL on the standard PostgreSQL port (`5432`), with `sslmode` and, if needed, `sslrootcert` as the only query options. For certificate verification, point `sslrootcert` to a CA bundle available on the runner, such as `/etc/ssl/certs/ca-certificates.crt`. The SQL user must be able to read the tables and sequences being backed up. The existing main-branch OIDC identity needs the [documented firewall permissions](../azure-app-service-deployment.md#azure-permission-for-temporary-firewall-rules).
4. **First run:** Once the manual workflow is on `main`, select it under **Actions → Run workflow**. Confirm that the run succeeded, the temporary rule is absent from Azure, and the reported key exists in R2. If a run is interrupted and the rule remains, remove that specific backup rule after confirming no backup is active.

## Recovery check before enabling the schedule

Download the reported object from the private bucket. Save it as `tmp/db-dumps/recovery/beagle.sql.gz` under the repo root. Use a fresh, disposable local PostgreSQL database and point `.env.local` at it. A restore executes destructive SQL against the selected database.

```bash
# Verify that the displayed host and database are the intended local target.
pass-cli run --env-file .env.local -- node -e 'const u = new URL(process.env.DATABASE_URL); console.log(u.host, u.pathname)'
gzip -dk tmp/db-dumps/recovery/beagle.sql.gz
pass-cli run --env-file .env.local -- pnpm db:restore tmp/db-dumps/recovery/beagle.sql
```

Confirm the restore exits successfully, Prisma migration history is present, and representative records such as dogs and show entries can be read. Remove the recovery copy when finished. After this check passes, enable the monthly cron on `main`. Keep each successful backup unless a separate R2 lifecycle policy is agreed; the workflow should not delete older backups.
