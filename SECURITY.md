# Security Policy

## Supported Versions

Security fixes are currently developed against the `main` branch.

## Reporting a Vulnerability

Please do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability reporting for this repository when available. If private reporting is unavailable, contact the repository maintainers through the email listed on the GitHub profile for `@suv27` and include:

- A clear description of the issue and its impact
- The affected file, endpoint, or workflow
- Reproduction steps or a minimal proof of concept
- Any suggested mitigation

Please allow maintainers reasonable time to investigate and release a fix before publicly disclosing the issue.

## Automated Checks

Pull requests and pushes to `main` run the CI and security workflows in `.github/workflows/`. These include TypeScript tests/builds, Gitleaks secret scanning, npm dependency auditing, and CodeQL analysis.
