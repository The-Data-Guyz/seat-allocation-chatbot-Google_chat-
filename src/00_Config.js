// @ts-nocheck

/**
 * Central project configuration.
 *
 * Runtime-specific values are stored in Apps Script Script Properties rather
 * than committed to source control.
 */
const DEFAULT_OFFER_RESPONSE_TIMER_MINUTES = 2;

function getRequiredScriptProperty_(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);

  if (!value) {
    throw new Error(
      "Missing Script Property: " + key +
      ". Add it in Apps Script Project Settings or run setProjectConfiguration()."
    );
  }

  return value;
}

function getOfferResponseTimerMinutes() {
  const rawValue = PropertiesService.getScriptProperties()
    .getProperty("OFFER_RESPONSE_TIMER_MINUTES");
  const parsedValue = Number(rawValue || DEFAULT_OFFER_RESPONSE_TIMER_MINUTES);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error("OFFER_RESPONSE_TIMER_MINUTES must be a positive number.");
  }

  return parsedValue;
}

function getAppSpreadsheet() {
  return SpreadsheetApp.openById(getRequiredScriptProperty_("SPREADSHEET_ID"));
}

/**
 * Run once from the Apps Script editor to initialise project configuration.
 * Do not commit real IDs or credentials to this repository.
 */
function setProjectConfiguration(spreadsheetId, offerResponseTimerMinutes) {
  if (!spreadsheetId || !String(spreadsheetId).trim()) {
    throw new Error("A spreadsheet ID is required.");
  }

  const timerMinutes = Number(
    offerResponseTimerMinutes || DEFAULT_OFFER_RESPONSE_TIMER_MINUTES
  );

  if (!Number.isFinite(timerMinutes) || timerMinutes <= 0) {
    throw new Error("Offer response timer must be a positive number.");
  }

  PropertiesService.getScriptProperties().setProperties({
    SPREADSHEET_ID: String(spreadsheetId).trim(),
    OFFER_RESPONSE_TIMER_MINUTES: String(timerMinutes)
  });

  console.log("Project configuration saved.");
}

function testSpreadsheetAccess() {
  const ss = getAppSpreadsheet();
  console.log("Connected to spreadsheet: " + ss.getName());
}
