# API Types

With Node.js 22 or newer, generate the API types after installing dependencies:

```bash
pnpm generate:api
```

This reads the hosted specification configured in restspec.config.yml and writes
app/lib/restspec-api.ts. The generated file is ignored by Git. Run this command
before development, builds, typechecking, or tests on a fresh checkout, and again
when the API specification changes. Generation requires network access and is not
run automatically by other commands.

# API Environment

Set `VITE_API_ENV` to a generated environment name (`local`, `staging`, or
`production`). The app uses that environment's URL from the generated API root;
`VITE_API_BASE_URL` is no longer used. Vite validates the selected environment
and its Firebase project and auth domain.

Development and production select `production`; staging selects `staging`.
To use a local API, override `VITE_API_ENV=local` in .env.development.local.

# End-to-End Tests

```bash
pnpm install
pnpm generate:api
pnpm exec playwright install chromium --with-deps
gcloud auth application-default login --no-launch-browser
pnpm test:e2e
```
