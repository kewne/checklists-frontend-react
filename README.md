# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Firebase Hosting Environments

This app uses SPA mode and deploys the static `build/client` directory to
Firebase Hosting. Both projects reuse the SPA rewrites in `firebase.json`.

| Environment | Firebase Project | Backend |
| --- | --- | --- |
| Production (default) | `checklists-486418` | `https://api.checklists.keeoon.dev/` |
| Staging | `checklists-staging-486418` | `https://checklists-staging-486418.ew.r.appspot.com/` |

Vite loads public browser configuration from `.env.production`, `.env.staging`,
or `.env.development` according to the selected mode. Ordinary `pnpm dev` keeps
the existing production Firebase and backend configuration; `pnpm dev:staging`
uses staging. Required settings are:

- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

These values are bundled into the browser app and are not secrets. Never put
passwords, private keys, or service-account credentials in `VITE_*` variables.
Local overrides belong in ignored `.env.local` or `.env.<mode>.local` files.
Shell variables override file values. Missing settings and mismatched project,
auth domain, or backend settings cause builds to fail. API links must use the
selected backend's HTTPS origin; links to another environment are rejected.

Build or develop with staging settings:

```bash
pnpm dev:staging
pnpm build:staging
```

For manual deployment, install the Firebase CLI and authenticate with an
account that can deploy Hosting to the target project:

```bash
npm install --global firebase-tools
firebase login
pnpm deploy:staging
```

The staging frontend is available at
<https://checklists-staging-486418.web.app> after deployment. For production,
use `pnpm deploy:production`. Both deploy commands rebuild the app and pass an
explicit project ID, regardless of the CLI's active project. Both modes share
`build/client`, so do not run builds or deployments concurrently. Selecting
`firebase deploy --project staging` alone does not switch the built app's
Firebase Authentication or backend configuration.

Before using staging, verify these external project/backend settings:

- Enable the app's sign-in providers in staging Firebase Authentication and
	authorize `checklists-staging-486418.web.app` as a domain.
- Configure the backend to accept tokens issued by staging Firebase
	Authentication, not production.
- Permit the staging Hosting origin through backend CORS, including the
	`Authorization` and `Content-Type` headers and the app's HTTP methods.
	Expose the `Location` response header for resource creation. Local development
	additionally needs its local origin permitted.
- Return relative HAL links or links using the staging backend origin.

Validate changes with `pnpm typecheck`, `pnpm build:staging`, and `pnpm build`.
After deployment, manually check login/logout, checklist and run operations,
sharing links, and reloading a nested URL. Browser network requests should use
only the selected backend and Firebase project.

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
