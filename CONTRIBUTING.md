# Contributing

Thank you for your interest in contributing to Mboni.

Mboni was initially developed for the NISR Big Data Hackathon and may continue to evolve beyond the hackathon as the project, team, and its stakeholders grow.

Contributions should follow the development and review practices below to keep the codebase reliable, maintainable, and easy to collaborate on.

## Development Areas

The application consists of three services:

- **Web** (`web/`): Next.js and TypeScript
- **API** (`api/`): Node.js, TypeScript, Prisma, PostgreSQL, and Redis
- **Model** (`model/`): Python analytical/model service, with its datasets in `model/data/`

Changes should be made in the appropriate part of the project while keeping interfaces between services consistent.

## Getting Started

The recommended development environment uses Docker Compose.

Install [pnpm](https://pnpm.io/) (use the version in the `packageManager` field of `package.json`) and start the development environment with:

```bash
pnpm run dev
```

Refer to the README for additional setup instructions, local service addresses, and troubleshooting.

## Branches

Do not push directly to `main`.

Create a dedicated branch for each feature, fix, or other meaningful change.

Examples:

```text
feature/prediction-dashboard
feature/model-api
fix/authentication-error
fix/model-timeout
```

## Pull Requests

Changes should be submitted through a Pull Request before being merged into `main`.

Pull Requests should:

- Clearly describe what was changed.
- Explain the reason for the change when useful.
- Keep changes focused and reviewable.
- Pass the required automated checks.
- Include relevant tests when applicable.
- Avoid introducing unrelated changes.

At least one appropriate team member or project maintainer should review significant changes before they are merged.

## Commit Messages

Use clear and descriptive commit messages.

Examples:

```text
feat: add prediction endpoint
fix: handle model timeout
refactor: simplify authentication middleware
test: add prediction service tests
docs: update development setup
```

## Code Quality

Before opening a Pull Request:

- Run the relevant tests.
- Run linting.
- Run type checking where applicable.
- Verify that the affected service builds successfully.
- Verify that service-to-service communication still works.
- Ensure no secrets or sensitive configuration are committed.

The API and web CI workflows run their typecheck and production build independently. Container images are published to GitHub Container Registry from pushes to `main` and version tags.

## Environment Variables

Never commit real credentials, API keys, passwords, access tokens, or other secrets.

Use `.env.example` to document required environment variables.

## Docker Networking

Inside Docker Compose, services reach each other by service name (`api`, `model`, `postgres`, `redis`), never `localhost`. Browser-facing URLs use `localhost` and the exposed port. Do not change service names, ports, or environment-variable conventions unless a change is required.

## Data

Datasets in `model/data/` must be listed in the README dataset inventory with their provider and source link. Do not add private, restricted, or personally identifiable data. See [SECURITY.md](SECURITY.md).

## Architecture Changes

Changes affecting communication between the frontend, backend, model, PostgreSQL, or Redis should be reviewed carefully because they may affect multiple parts of the system.

API contracts and model input/output formats should remain consistent unless the corresponding consumers are updated together.

## Future Contributors

As the project evolves, additional contributors or maintainers may be added. New contributors should follow this guide and any additional project documentation established by the maintainers.

## Maintainers

Project maintainers are responsible for reviewing contributions, maintaining the repository, and deciding whether proposed changes are appropriate for the project's goals.
