# Automated Testing

Use **Vitest** for unit tests and **Playwright** for system/UI tests.
Run `packages/...` commands from the `CLR` repository root.

## Test coverage

| File | Level | Behavior |
| --- | --- | --- |
| `packages/React-frontend/src/utils/playback.test.js` | Unit | Four tests of `createShuffleOrder()` and `assertValidScreen()`: preserve indices, handle an empty queue, accept valid screens, reject invalid screens. |
| Same unit-test file | TDD/unit | A fifth test checks that shuffle keeps the current track first. |
| `tests/catalog.system.spec.js` | System | A signed-in search returns the expected cached song; a blank search returns HTTP 400 and the expected error. |
| `tests/auth.spec.js` | UI | Valid credentials open Home; invalid credentials show an error and leave the user signed out. |
| `tests/home.spec.js` | UI smoke | A signed-out visitor sees the app title and sign-in page. |

Unit tests isolate functions; system tests check backend components together;
UI tests check visible interactions. Login story: “As a user, I want to sign in
so I can access my music.”

## Unit-test setup and run

Install frontend dependencies, including Vitest:

```bash
npm --prefix packages/React-frontend install --save-dev vitest
```

In `packages/React-frontend/package.json`, use this test script:

```json
"test": "vitest run src"
```

Run all five unit tests:

```bash
npm --prefix packages/React-frontend test
```

The `src` filter excludes Playwright specs. No servers or database are needed.

## Playwright setup

Use Node 22.12+ or a compatible newer version. From your Playwright configuration’s folder:

```bash
npm install
npx playwright install chromium
```

Keep `testDir` pointing to `tests`. Copy `tests/.env.test.example` to
**`tests/.env.test`** and fill in:

| Variable | Value |
| --- | --- |
| `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` | A confirmed test account’s credentials. |
| `TEST_SUPABASE_URL` | The frontend's `VITE_SUPABASE_URL`. |
| `TEST_SUPABASE_PUBLISHABLE_KEY` | The frontend's public `VITE_SUPABASE_PUBLISHABLE_KEY`. |
| `TEST_EXPECTED_TRACK_TITLE`, `TEST_EXPECTED_TRACK_ARTIST` | Exact `title` and `artists` from a cached public MusicBrainz row (`source = 'musicbrainz'`, `owner_id = null`). |
| `TEST_CATALOG_QUERY` | Optional search text; defaults to the expected title. |
| `TEST_APP_URL`, `TEST_API_URL` | Defaults: `http://localhost:5173` and `http://localhost:5000`. |

Search once through the app to cache the song; choose a query returning it within
the first 20 results. Both services must use the same Supabase project. The helper
loads `.env.test`; keep it out of Git. Tests need no admin key.

## Run system and UI tests

Unless Playwright starts both servers, run these in separate terminals from `CLR`:

```bash
npm --prefix packages/React-frontend run dev
```

```bash
npm --prefix packages/Express-backend install
npm --prefix packages/Express-backend run dev
```

From your Playwright configuration’s folder:

```bash
npx playwright test --workers=1
```

For system tests only, append `tests/catalog.system.spec.js`.
Optional npm script in the package containing Playwright:

```json
"test:playwright": "playwright test --workers=1"
```

Run it with `npm run test:playwright`.

## TDD: keep the current song first when shuffling

- **Red:** Added a test calling `createShuffleOrder(4, 2)` and expecting index `2` first, with every index still present. Mocked randomness to zero; the original returned `1` first and failed.
- **Green:** Added the current-track parameter and swapped that track into the first position. All five unit tests passed.
- **Refactor:** Updated `App.jsx` to pass `playOrder[playPosition]` and removed its duplicate swapping logic. Tests remained passing.

## Requirements and limitations

Playwright needs running services, network access, Supabase, a test account, and
the cached song. Tests are independent, with no backend mocks. Blank search checks
authentication and validation; successful search also checks service/database logic.

Outages, rate limits, or changed data can cause failures. Future coverage:
uploads, ownership, sign-out, and playback.
