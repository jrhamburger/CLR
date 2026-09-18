# Contributing

## Setup
1. Clone the repo
2. `cd packages/React-frontend && npm install`
3. `cd packages/Express-backend && npm install`

## Code Style
We use Prettier and ESLint. Config is in each package's root.

Before committing:
npm run format
Style rules (see .prettierrc):
- 2-space indentation
- Semicolons required
- Double quotes
- No trailing commas

## Branching
- `main` — stable, working code only
- Feature branches: `feature/short-description`

## Commits
- Write clear, present-tense messages (e.g. "add login form", not "added login form")

## Pull Requests
- Open a PR into `main` before merging
- At least one teammate reviews before merge