# Operations guide

## Daily monitoring

- Review Apps Script **Executions** for failed event handlers and triggers.
- Check the `Chatbot_Requests` and `Audit_Log` sheets for repeated failures.
- Confirm the time-driven expiry trigger is active and owned by a valid account.
- Review unexpectedly long-lived `Offered` and `Reserved` records.

## Common failure modes

### Missing Script Property

Run `setProjectConfiguration()` or add the missing value in Project Settings.

### Spreadsheet not found or access denied

Confirm the spreadsheet ID and that the Apps Script execution identity has access.

### Bot replies but allocation does not change

Run `validateProjectSetup()` and verify exact header names and supported status values.

### Offers never expire

Confirm the `checkExpiredOffers` trigger exists, has run recently, and uses the intended timer property.

### User cannot be identified

Google Chat events may not expose an email in every configuration. The current fallback is an email supplied in message text. Production should map the authenticated Chat user ID to an approved employee directory record.

## Data handling

- Restrict spreadsheet access to operational staff.
- Avoid copying production employee information into test environments.
- Define retention periods for request, response, occupancy, and audit records.
- Redact personal data from GitHub issues and screenshots.
