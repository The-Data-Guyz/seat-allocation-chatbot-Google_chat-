# Google Sheets schema

Header names are part of the application contract. Do not rename them without updating the source and migration notes.

## `Seats`

| Column | Purpose |
|---|---|
| `Seat_ID` | Unique seat identifier, such as `S101`. |
| `Floor` | Floor number. |
| `Seat_Name` | Human-readable seat name. |
| `Seat_Type` | Seat category. |
| `Seat_Status` | Current state, such as `Vacant`, `Offered`, `Reserved`, or `Occupied`. |
| `Current_Occupant` | Current employee name. |
| `Reserved_For` | Employee currently receiving or holding an offer. |
| `Last_Updated` | Last seat-state update time. |
| `Notes` | Operational notes. |

## `Queue`

| Column | Purpose |
|---|---|
| `Queue_ID` | Unique queue record ID. |
| `Queue_Position` | FIFO order value. |
| `Employee_Name` | Employee display name. |
| `Employee_Email` | Employee email and current lookup key. |
| `Queue_Status` | `Waiting`, `Offered`, `Reserved`, `Declined`, `Expired`, `Completed`, or similar. |
| `Allocated_Seat` | Offered or reserved seat ID. |
| `Offer_Time` | Time the offer was created. |
| `Requested_Time` | Time the queue request was created. |
| `Request_Source` | Origin, currently Google Chat or demo setup. |
| `Chat_User_ID` | Google Chat user resource name. |
| `Chat_Space_ID` | Google Chat space resource name. |
| `Notes` | Original request or operational notes. |

## `Occupancy_List`

Tracks active and released occupancy records. The active lookup currently expects `Occupancy_Status` to equal `Occupied`.

## `Offer_Responses`

Stores accepted and declined offer responses and the original message.

## `Retention_Responses`

Reserved for the retention workflow. Demo setup creates the table, but the current runtime does not yet process retention responses.

## `Chatbot_Requests`

Stores request metadata, action, status, and errors. Avoid logging unnecessary message content in production.

## `Audit_Log`

Reserved for broader workflow audit events.

## `System_Config`

Contains business configuration displayed in the spreadsheet. Runtime-critical configuration should remain in Apps Script Script Properties unless the application implements validated configuration loading from this sheet.
