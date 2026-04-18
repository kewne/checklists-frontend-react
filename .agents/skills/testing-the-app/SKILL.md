---
name: testing-the-app
description: Verifies the application is suitable for deployment
---

Run the typechecker: `pnpm typecheck`.

Run end-to-end tests with Playwright: `pnpm test`.

For interactive testing: `pnpm test:ui`.

For debugging tests: `pnpm test:debug`.

Environment variables required for testing:
- `TEST_EMAIL`: Email address for test account
- `TEST_PASSWORD`: Password for test account

The test suite includes:
- Authentication flow tests (login, logout, session management)
- Navigation and routing tests (home page, login page, responsiveness)
- API integration tests (real API calls, error handling, authentication headers)
- Visual regression tests (screenshots, mobile/tablet layouts, component states)
