# Project TODO

## Before production

- Replace the generated sample analysis engine with licensed, documented NISR data sources.
- Configure production PostgreSQL, Redis, domain, TLS proxy, email sender, and environment secrets.
- Review the privacy and terms pages for the actual deployment and data practices.
- Run accessibility testing with assistive technology and verify Kinyarwanda speech support.
- Add API integration and browser end-to-end coverage for asking, saving, and reopening analyses.

## Model service

- Add the actual Python application, dependency manifest, model artifacts, and documented inference request/response contract to `model/`.
- Connect the API to the model service only after that contract is defined.
- Add the model service to development/production Compose and a model CI workflow once it can build and run.

## Repository operations

- Configure GitHub branch protection and required API/web checks on `main`.
- Configure production deployment after the hosting target and credentials are selected.
