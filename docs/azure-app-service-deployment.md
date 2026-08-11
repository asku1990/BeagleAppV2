# Azure App Service deployment

Azure production is deployed from `main` by
`.github/workflows/deploy-azure-prod.yml`. The workflow can also be started
manually from `main`.

Vercel deployment remains separate. This workflow does not change Vercel,
domains, DNS, or database migrations.

The canonical production URL is `https://tietokanta.beaglejarjesto.fi`.
`https://www.tietokanta.beaglejarjesto.fi` is also bound to the App Service and
the Next.js application permanently redirects it to the canonical hostname
while preserving the requested path and query string. Keep TLS bindings active
for both hostnames so the redirect can be served over HTTPS.

## Build and deployment flow

The workflow:

1. installs Node.js 24 and pnpm 10.33.0;
2. runs `pnpm install --frozen-lockfile` and `pnpm db:generate`;
3. runs `pnpm build` without the test or coverage suites;
4. adds `public` and `.next/static` assets to the Next.js standalone output;
5. authenticates to Azure with GitHub OIDC; and
6. deploys `apps/web/.next/standalone` to the `Production` slot of
   `beagle-app-prod`.

The workflow does not run `pnpm db:deploy`. Production migration strategy is
handled separately.

## GitHub Actions configuration

OIDC authentication requires these repository secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

The application build also requires these repository-level GitHub Actions values:

- `BETTER_AUTH_SECRET` as a repository secret
- `AZURE_BETTER_AUTH_URL` as a repository variable, set to
  `https://tietokanta.beaglejarjesto.fi`

The build needs these values while collecting Next.js page data. The deployed
server reads its production values from Azure App Service settings at runtime.
The workflow maps `AZURE_BETTER_AUTH_URL` to `BETTER_AUTH_URL` only for the
Azure build. Keep any existing repository-level `BETTER_AUTH_URL` unchanged so
Vercel and other CI workflows continue to use their current URL.

Do not attach a GitHub Environment to this job without also replacing the
branch-based federated credential, because that changes the OIDC subject.

## Standalone package and startup

The monorepo tracing root places the standalone server at
`apps/web/server.js` inside the deployment package. The workflow configures the
Linux App Service startup command as:

```bash
node apps/web/server.js
```

Next.js reads the App Service-provided `PORT` variable and listens on
`0.0.0.0`; neither value needs a custom app setting.

Keep `SCM_DO_BUILD_DURING_DEPLOYMENT` absent or set to `false`. GitHub Actions
already creates a ready-to-run package, so App Service must not rebuild it.

## Azure App Service settings

Configure these settings on `beagle-app-prod` before the first runtime test:

- `DATABASE_URL`: Azure PostgreSQL connection string with the required SSL
  options
- `BETTER_AUTH_SECRET`: production signing secret, at least 32 characters
- `BETTER_AUTH_URL`: `https://tietokanta.beaglejarjesto.fi`
- `CORS_ORIGINS`: `https://tietokanta.beaglejarjesto.fi`
- `KOIRATIETOKANTA_RESULTS_API_SECRET`: required for the AJOK result integration

These settings are optional unless production overrides the application
defaults:

- `BETTER_AUTH_SESSION_EXPIRES_IN`
- `BETTER_AUTH_SESSION_UPDATE_AGE`
- `LOG_LEVEL`

Leave `NEXT_PUBLIC_API_URL` unset for the initial same-origin deployment. A
`NEXT_PUBLIC_*` value is embedded into browser code during the GitHub build, so
setting it only in App Service would not change the deployed client.

Ensure the Azure PostgreSQL firewall or private networking permits connections
from the App Service before testing database-backed routes.
