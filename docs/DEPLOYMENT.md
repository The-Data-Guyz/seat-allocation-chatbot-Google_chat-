# Deployment and rollback

## Environments

Use separate Apps Script projects and spreadsheets for development, test, and production. Each environment should have its own Script Properties and Google Chat API configuration.

## First-time connection

1. Copy `.clasp.json.example` to `.clasp.json`.
2. Insert the environment's Apps Script Script ID.
3. Run `npm install`, `npm run login`, `npm run validate`, and `npm run status`.
4. Create a backup/version in Apps Script before the first Git-controlled push.
5. Run `npm run push`.

## Configure Script Properties

Set:

- `SPREADSHEET_ID`
- `OFFER_RESPONSE_TIMER_MINUTES`

Then run `testSpreadsheetAccess()` and `validateProjectSetup()`.

## Configure triggers

Create a time-driven trigger for `checkExpiredOffers`. Confirm the trigger owner has access to the spreadsheet and remains an active account.

## Google Chat testing

1. In Apps Script, create or inspect a test deployment and copy the head deployment ID.
2. In the Google Cloud project, enable and configure the Google Chat API.
3. Select Apps Script as the connection type and enter the deployment ID.
4. Limit visibility to approved testers.
5. Test add-to-space, help, join queue, status, accept, decline, release, and expiry flows.

## Production release

1. Merge an approved pull request into the protected default branch.
2. Update `CHANGELOG.md`.
3. Run local validation.
4. Push the approved commit to the production Apps Script project.
5. Create a versioned Apps Script deployment.
6. Update the Google Chat API configuration when the deployment ID changes.
7. Perform smoke tests with non-sensitive test accounts.
8. Tag the Git commit using the same release version.

## Rollback

1. Identify the last known-good Git tag and Apps Script version.
2. Repoint the Google Chat API configuration to the known-good deployment, or restore the known-good commit and deploy a new version.
3. Confirm Script Properties and trigger ownership.
4. Run smoke tests.
5. Record the incident and rollback in `CHANGELOG.md` or the incident tracker.
