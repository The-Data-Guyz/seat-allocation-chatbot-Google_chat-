# Architecture

## Purpose

The project provides a Google Chat interface for an office seat queue. Google Sheets is the operational datastore and Google Apps Script contains the application logic.

## Components

| Component | Responsibility |
|---|---|
| `01_ChatHandlers.js` | Receives Google Chat events and routes supported commands. |
| `02_MessageParser.js` | Extracts message text, sender details, email addresses, names, and seat IDs. |
| `03_QueueService.js` | Adds employees to the queue and returns queue status. |
| `04_SeatService.js` | Offers, accepts, declines, allocates, and releases seats. |
| `05_SheetRepository.js` | Encapsulates header mapping, row lookup, ID creation, and append operations. |
| `06_AuditLogging.js` | Records chatbot request activity. |
| `07_Triggers.js` | Expires old offers and reallocates released seats. |
| `08_DemoSetup.js` | Rebuilds sheets with repeatable test data. |
| `09_ProjectValidation.js` | Performs non-destructive configuration and schema checks. |

## Request flow

1. Google Chat invokes an Apps Script event handler.
2. The handler normalises and classifies the message.
3. A service performs the requested queue or seat operation.
4. Repository functions read or update Google Sheets using header names rather than fixed column numbers.
5. The handler returns a Chat-compatible reply object.
6. A separate time-driven trigger checks and expires unanswered offers.

## Data consistency model

Google Sheets is treated as the source of truth. Updates currently occur across multiple sheets without a transaction boundary. A failure between writes can leave temporary inconsistencies, and simultaneous events can allocate the same resource. Production hardening should use `LockService`, re-check state after acquiring a lock, and centralise state transitions.

## Trust boundaries

- Chat messages and message-supplied email addresses are untrusted input.
- Script Properties contain deployment configuration.
- Sheets contain employee and operational data.
- GitHub must contain code and documentation only, not live data or credentials.
