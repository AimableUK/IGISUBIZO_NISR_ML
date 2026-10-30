# Security Policy

## Purpose

Mboni works with public statistical datasets, user accounts, and several connected services (web application, API, analytical service, PostgreSQL, and Redis). Security and responsible handling of data are important to the project.

## Reporting a Security Issue

If you discover a potential security vulnerability in Mboni, please report it privately rather than disclosing it publicly first.

**How to report:**

1. Use GitHub's private vulnerability reporting: open the repository's **Security** tab and select **Report a vulnerability**.
2. If that option is not available, contact the maintainers directly through their GitHub profiles:
   - [@AimableUK](https://github.com/AimableUK)
   - [@EnockHumure](https://github.com/EnockHumure)

   Do not post the details in a public issue. Ask for a private way to share them.

A useful report includes:

- A description of the issue.
- The affected component (web application, API, analytical service, database, or deployment).
- Steps to reproduce the issue.
- Potential impact.
- Any relevant logs or screenshots, with secrets and personal data removed.

We will review reports as soon as we can and keep you updated on the outcome.

## Sensitive Information

Do not commit the following to the repository:

- API keys
- Passwords
- Access tokens
- Database credentials
- Private keys
- Production environment variables
- Confidential datasets
- Personally identifiable information
- Other credentials or restricted information

Use environment variables for secrets. The root `.env` file must stay out of version control. Only `.env.example`, with placeholder values, belongs in the repository.

## Data Handling

Datasets and external resources must be used according to their applicable licenses, terms of use, privacy requirements, and any instructions provided by their owners.

Do not add private or restricted data to the repository without appropriate authorization. User account data and saved analyses handled by the application must not be shared outside the application.

## Dependencies

Project dependencies should be kept reasonably up to date. Known security issues in dependencies should be assessed and addressed when practical.

## Scope

This policy applies to Mboni's source code, infrastructure configuration, dependencies, APIs, datasets, and the deployed application at https://mboni-app.vercel.app.
