// @ts-nocheck

/**
 * Performs a non-destructive validation of configuration and sheet headers.
 * Run this after setup and before deployment.
 */
function validateProjectSetup() {
  const requiredSheets = {
    Seats: [
      "Seat_ID", "Floor", "Seat_Name", "Seat_Type", "Seat_Status",
      "Current_Occupant", "Reserved_For", "Last_Updated", "Notes"
    ],
    Queue: [
      "Queue_ID", "Queue_Position", "Employee_Name", "Employee_Email",
      "Queue_Status", "Allocated_Seat", "Offer_Time", "Requested_Time",
      "Request_Source", "Chat_User_ID", "Chat_Space_ID", "Notes"
    ],
    Occupancy_List: [
      "Occupancy_ID", "Seat_ID", "Employee_Name", "Employee_Email",
      "Occupied_Time", "Released_Time", "Occupancy_Status",
      "Retention_Status", "Last_Reminder_Time", "Retention_Prompt_Time",
      "Release_Reason", "Notes"
    ],
    Offer_Responses: [
      "Response_ID", "Timestamp", "Employee_Name", "Employee_Email",
      "Seat_ID", "Response", "Response_Source", "Processed_Status", "Notes"
    ],
    Chatbot_Requests: [
      "Request_ID", "Timestamp", "Employee_Name", "Employee_Email",
      "Chat_User_ID", "Chat_Space_ID", "User_Message", "Bot_Response",
      "Action_Taken", "Status", "Error_Message"
    ]
  };

  const ss = getAppSpreadsheet();
  const failures = [];

  Object.keys(requiredSheets).forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      failures.push("Missing sheet: " + sheetName);
      return;
    }

    const headerMap = getHeaderMapFlexible(sheet);
    requiredSheets[sheetName].forEach(header => {
      if (!headerMap[header]) {
        failures.push("Missing header " + sheetName + "." + header);
      }
    });
  });

  if (failures.length > 0) {
    throw new Error("Project validation failed:\n- " + failures.join("\n- "));
  }

  const result = {
    spreadsheetName: ss.getName(),
    offerResponseTimerMinutes: getOfferResponseTimerMinutes(),
    status: "OK"
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}
