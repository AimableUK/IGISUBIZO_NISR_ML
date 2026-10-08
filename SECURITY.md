# Security Policy

## Purpose

Security and responsible handling of data are important considerations for
this project.

The project may interact with datasets, APIs, and other resources that can
contain sensitive or restricted information. Contributors should take
appropriate care when handling such resources.

## Reporting a Security Issue

If you discover a potential security vulnerability, please report it
privately to the project maintainers rather than publicly disclosing the
issue first.

A useful report should include:

- A description of the issue.
- The affected component.
- Steps to reproduce the issue.
- Potential impact.
- Any relevant logs or screenshots.

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

Use environment variables for secrets and keep local `.env` files out of
version control.

## Data Handling

Datasets and external resources must be used according to their applicable
licenses, terms of use, privacy requirements, and any instructions provided
by their respective owners.

Do not introduce private or restricted data into the repository without
appropriate authorization.

## Dependencies

Project dependencies should be kept reasonably up to date. Known security
issues in dependencies should be assessed and addressed when practical.

## Scope

This policy applies to the project's source code, infrastructure
configuration, dependencies, APIs, datasets, and other resources maintained
within the project.