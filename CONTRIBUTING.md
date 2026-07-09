# Contributing

## Branching

Create a short-lived branch from the protected default branch:

```text
feature/short-description
fix/short-description
chore/short-description
```

## Development workflow

1. Create or use a non-production Apps Script project and spreadsheet.
2. Update `.clasp.json` locally with the development Script ID.
3. Make focused changes.
4. Run `npm run validate` and `validateProjectSetup()`.
5. Execute relevant functional scenarios from `docs/TESTING.md`.
6. Update documentation and `CHANGELOG.md` when behaviour changes.
7. Open a pull request with test evidence and rollback notes.

## Pull-request requirements

- No production IDs, employee data, tokens, credentials, or spreadsheet exports.
- At least one reviewer other than the author.
- Passing validation workflow.
- Test evidence for changed workflows.
- Clear operational and migration impact.

## Coding conventions

- Two-space indentation.
- Use descriptive service and repository function names.
- Access sheet columns by header map rather than fixed indexes.
- Keep Chat parsing, business logic, storage access, and deployment configuration separated.
- Return user-safe messages; write detailed diagnostics only to controlled logs.
