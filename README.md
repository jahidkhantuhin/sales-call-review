# sales-call-review

A Nuxt 2, TypeScript, and Vuetify workspace for reviewing and scoring sales calls, browsing client records, and checking scorer activity by client. Maintained by Jahid Khan Tuhin, full-stack JavaScript engineer.

## Showcase overview

![Sales Call Review demo showing the call queue, pending and reviewed calls, clients, score report, profile, and standalone player](docs/media/showcase-overview.gif)

[Browse the full-resolution screenshots](docs/media/screenshots), including all 28 seeded call detail pages.

## Run the local showcase

Use Node.js 22 and Yarn Classic. From the project folder, run:

```powershell
yarn install --frozen-lockfile --ignore-scripts
$env:SHOWCASE_MODE = 'true'
$env:NODE_OPTIONS = '--openssl-legacy-provider'
yarn dev
```

On Windows, the locked `vue-jest` dependency can fail while building `deasync` with `spawn EINVAL`. The command above skips dependency install scripts for the showcase. It keeps the lockfile in use. This setup is for running the app and generating the demo. The legacy Jest transformer may require a working `deasync` binary.

Open `http://localhost:3000`. The showcase starts with a synthetic Super admin named **Jahid Khan**. It requires no backend, login credentials, or external audio service. The Webpack 4 toolchain uses the OpenSSL compatibility option shown above. On Bash, use `NODE_OPTIONS=--openssl-legacy-provider yarn dev`.

For a static showcase, run `yarn generate-prod` with the same Node options and serve `dist/`. All seeded call detail URLs are included in the build.

### Windows install troubleshooting

If a previous `yarn install --frozen-lockfile` stopped with `deasync` or `spawn EINVAL`, rerun the install command above in the same project folder. Yarn may still print peer dependency warnings. A successful install ends with `Done`, after which you can run `yarn dev`.

## Walk through the app

| Screen | Route and example |
| --- | --- |
| Home | `/` links to Calls, Clients, and the Score Report. |
| Call queue | `/calls` lists synthetic calls. Select Northstar Downtown or open `/calls?location=1` to filter by location. |
| Score a call | `/call/2048` opens an unreviewed call with the original scoring form and procedure list. |
| Reviewed call | `/call/2047` displays an existing score. IDs `2021` through `2048` have seeded detail pages. |
| Clients | `/clients` lists sample businesses and account IDs. |
| Score report | `/reports/score-report` starts with recent sample activity. Change the date range or download a local CSV. |
| Profile | `/profile` displays the demo user and opens the existing editor. |
| Standalone player | `/player` or `/player?lead_id=2048` plays the local synthetic tone. |
| Auth screens | `/login`, `/forgot-password`, and `/reset-password` retain their forms. Their showcase actions are simulated. |
| Error layout | `/call/9999` shows the existing call-not-found path. |

## How the showcase works

- `plugins/showcase.ts` supplies a local authenticated session with the scopes the existing navigation and scoring screens expect. It also intercepts Axios through a local adapter. Unknown API requests return a local 404.
- `showcase/fixtures.ts` provides synthetic clients, locations, campaigns, calls, procedures, and the demo user. `showcase/api.ts` responds using the shapes already consumed by the Vuex stores and components.
- Scoring, profile edits, and the theme preference stay in memory for the current browser session and reset on refresh. Password recovery sends no email. The media is a locally bundled synthetic tone. Report times and rates are demonstration values.
- The workspace theme covers the existing layouts, filters, tables, dialogs, notifications, and call review controls. The Score Report shows scored calls by client using the same rows as its table.

## Restore backend authentication

Set `SHOWCASE_MODE=false` and provide the compatible backend base URL before starting or rebuilding. For local development in PowerShell:

```powershell
$env:SHOWCASE_MODE = 'false'
$env:BASE_URL_DEVELOPMENT = 'http://localhost:8000/api/v1'
$env:NODE_OPTIONS = '--openssl-legacy-provider'
yarn dev
```

This loads the original Nuxt Auth Laravel Sanctum strategy. Use `BASE_URL_STAGING` or `BASE_URL_PRODUCTION` for the corresponding scripts. Set `SHOWCASE_MODE=true` or remove the variable to return to the local showcase, then restart or rebuild.
