# Production-hardening roadmap

## Priority 1

- Add `LockService` around queue insertion, allocation, acceptance, decline, release, and expiry operations.
- Bind employee actions to authenticated Chat identity rather than trusting a message-supplied email.
- Implement proactive Chat notifications for offers created by vacancy or expiry events.
- Add explicit state-transition validation to prevent invalid status combinations.
- Add central error logging that records both success and failure responses without exposing sensitive data.

## Priority 2

- Separate development, test, and production Apps Script projects and spreadsheets.
- Add a migration mechanism for sheet-schema changes.
- Compact or calculate queue position dynamically rather than using an ever-increasing value.
- Complete the retention workflow represented by the existing retention tables.
- Add admin commands and operational dashboards.

## Priority 3

- Move the runtime and datastore to Cloud Run/Cloud Functions plus a transactional database when volume, reliability, or governance requirements exceed Apps Script and Sheets capabilities.
- Add automated tests around pure parsing and state-transition logic by extracting them from Apps Script service calls.
- Add deployment automation after the organisation defines service-account, approval, and release controls.
