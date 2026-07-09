# Security policy

## Reporting a vulnerability

Report security issues privately to the project owner or organisation security contact. Do not create a public GitHub issue containing credentials, personal data, production identifiers, access-control weaknesses, or exploit details.

## Sensitive information

Never commit:

- OAuth tokens or `.clasprc.json`
- `.clasp.json` when the organisation treats Script IDs as internal metadata
- Spreadsheet IDs for production environments
- employee names, emails, Chat IDs, or occupancy exports
- screenshots containing personal or administrative information
- service-account keys or Google Cloud credentials

## Current security considerations

- Message-supplied email addresses are not sufficient identity verification.
- Multi-sheet updates are not transactional and currently lack locking.
- Logs and sheets contain personal and operational data.
- Trigger execution depends on the trigger owner's continued access.

The repository should remain private until the organisation completes a security and privacy review.
