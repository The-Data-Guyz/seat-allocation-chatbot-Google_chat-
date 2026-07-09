# Test plan

Use a dedicated test spreadsheet. Demo setup functions clear and rebuild application sheets.

## Automated repository checks

```bash
npm install
npm run validate
```

This validates JavaScript syntax and the Apps Script manifest JSON. It does not execute Apps Script services locally.

## Apps Script checks

Run these from the Apps Script editor:

```javascript
testSpreadsheetAccess();
validateProjectSetup();
```

Review **Executions** and Cloud Logging for failures.

## Functional scenarios

| ID | Scenario | Expected result |
|---|---|---|
| T01 | `help` | Bot returns supported commands. |
| T02 | Join with an empty queue and vacant seat | Employee is added and immediately receives an offer. |
| T03 | Join when all seats are occupied | Employee remains `Waiting` with a queue position. |
| T04 | Duplicate active join | Bot rejects the duplicate and returns existing status. |
| T05 | Accept a valid offer | Seat becomes `Reserved`, queue becomes `Reserved`, occupancy record is created. |
| T06 | Decline a valid offer | Queue becomes `Declined`, seat becomes `Vacant`, next waiting employee is offered the seat. |
| T07 | Release an occupied seat | Occupancy becomes `Released`, queue becomes `Completed`, seat is reallocated if possible. |
| T08 | Offer expires | Queue becomes `Expired`, seat becomes `Vacant`, next employee is offered the seat. |
| T09 | Multiple vacant seats | Seats are offered in sheet order to employees in queue-position order. |
| T10 | Missing or malformed email | Bot requests a valid email and makes no state change. |
| T11 | Concurrent joins/releases | No duplicate seat allocation; currently expected to expose the need for locking. |
| T12 | Removed/renamed required header | `validateProjectSetup()` reports the exact missing header. |

## Regression evidence

For each release, retain:

- Git commit/tag
- Test spreadsheet identifier in the internal change record, not a public issue
- Test date and tester
- Scenario results
- Apps Script deployment/version
- Known defects accepted for release
