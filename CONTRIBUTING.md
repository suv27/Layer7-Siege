# Contributing

## Development Checks

Install dependencies and run the checks relevant to a change before opening a pull request:

```bash
cd backend && npm ci && npm test && npm run build
cd ../frontend && npm ci && npm run lint && npm run build
cd .. && bash scripts/e2e-smoke.sh
```

The repository's GitHub Actions workflows run these checks on pull requests. They also run Gitleaks, npm dependency audits, and CodeQL.

## Pull Requests

- Keep changes focused and explain the user-visible or security impact.
- Add or update tests for behavior changes.
- Do not commit credentials, tokens, local environment files, build output, or dependencies.
- Update documentation when setup, behavior, or security controls change.
- Every pull request requires approval from a Code Owner before it can merge. The current Code Owner is `@suv27`, defined in [.github/CODEOWNERS](.github/CODEOWNERS).
- Repository administrators must enable branch protection for `main` with required Code Owner review and required status checks. `CODEOWNERS` defines who may approve; GitHub branch protection enforces that approval is mandatory.

## Security Issues

Follow [the security policy](SECURITY.md) for vulnerability reports instead of opening a public issue.

## Python Security Tools

Layer7-Siege currently contains JavaScript and TypeScript only, so Bandit and Ruff are not included in the workflows. If Python code is added later, add a dedicated Python job with pinned tooling and its own lockfile before merging that code.
