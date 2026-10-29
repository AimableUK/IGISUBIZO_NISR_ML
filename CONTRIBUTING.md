# Contributing

Thank you for your interest in contributing to this project.

Mboni was initially developed for the NISR Big Data Hackathon and may
continue to evolve beyond the hackathon as the project, team, and its
stakeholders grow.

Contributions should follow the development and review practices described
below to keep the codebase reliable, maintainable, and easy to collaborate on.

## Development Areas

The active application currently consists of two services:

- Web: Next.js and TypeScript
- API: Node.js, TypeScript, Prisma, PostgreSQL, and Redis
- Model: a Docker template is present in `model/`, but the ML application
  source and inference contract have not yet been added.

Changes should be made in the appropriate part of the project while keeping
interfaces between services consistent.

## Getting Started

The recommended development environment uses Docker Compose.

Install pnpm 12.8.2 and start the development environment with:

pnpm run dev

Refer to the README for additional project-specific setup instructions.

## Branches

Do not push directly to `main`.

Create a dedicated branch for each feature, fix, or other meaningful change.

Examples:

feature/prediction-dashboard
feature/model-api
fix/authentication-error
fix/model-timeout

## Pull Requests

Changes should be submitted through a Pull Request before being merged into
`main`.

Pull Requests should:

- Clearly describe what was changed.
- Explain the reason for the change when useful.
- Keep changes focused and reviewable.
- Pass the required automated checks.
- Include relevant tests when applicable.
- Avoid introducing unrelated changes.

At least one appropriate team member or project maintainer should review
significant changes before they are merged.

## Commit Messages

Use clear and descriptive commit messages.

Examples:

feat: add prediction endpoint
fix: handle model timeout
refactor: simplify authentication middleware
test: add prediction service tests
docs: update development setup

## Code Quality

Before opening a Pull Request:

- Run the relevant tests.
- Run linting.
- Run type checking where applicable.
- Verify that the affected service builds successfully.
- Verify that service-to-service communication still works.
- Ensure no secrets or sensitive configuration are committed.

The API and web CI workflows run their typecheck and production build
independently. Container images are published to GitHub Container Registry
from pushes to `main` and version tags.

## Environment Variables

Never commit real credentials, API keys, passwords, access tokens, or other
secrets.

Use `.env.example` to document required environment variables.

## Architecture Changes

Changes affecting communication between the frontend, backend, model,
PostgreSQL, or Redis should be reviewed carefully because they may affect
multiple parts of the system.

API contracts and model input/output formats should remain consistent unless
the corresponding consumers are updated together.

## Future Contributors

As the project evolves, additional contributors or maintainers may be added.
New contributors should follow this guide and any additional project
documentation established by the maintainers.

## Maintainers

Project maintainers are responsible for reviewing contributions, maintaining
the repository, and deciding whether proposed changes are appropriate for
the project's goals.
