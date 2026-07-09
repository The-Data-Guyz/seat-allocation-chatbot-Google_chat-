function setupDemoData_OneVacancyEmptyQueue() {
  setupDemoData_("ONE_VACANCY_EMPTY_QUEUE");
}

function setupDemoData_AllOccupiedWithQueue() {
  setupDemoData_("ALL_OCCUPIED_WITH_QUEUE");
}

function setupDemoData_MultiVacancyWithQueue() {
  setupDemoData_("MULTI_VACANCY_WITH_QUEUE");
}

function setupDemoData_(mode) {
  const ss = getAppSpreadsheet();

  const headers = {
    Seats: [
      "Seat_ID",
      "Floor",
      "Seat_Name",
      "Seat_Type",
      "Seat_Status",
      "Current_Occupant",
      "Reserved_For",
      "Last_Updated",
      "Notes"
    ],
    Queue: [
      "Queue_ID",
      "Queue_Position",
      "Employee_Name",
      "Employee_Email",
      "Queue_Status",
      "Allocated_Seat",
      "Offer_Time",
      "Requested_Time",
      "Request_Source",
      "Chat_User_ID",
      "Chat_Space_ID",
      "Notes"
    ],
    Occupancy_List: [
      "Occupancy_ID",
      "Seat_ID",
      "Employee_Name",
      "Employee_Email",
      "Occupied_Time",
      "Released_Time",
      "Occupancy_Status",
      "Retention_Status",
      "Last_Reminder_Time",
      "Retention_Prompt_Time",
      "Release_Reason",
      "Notes"
    ],
    Offer_Responses: [
      "Response_ID",
      "Timestamp",
      "Employee_Name",
      "Employee_Email",
      "Seat_ID",
      "Response",
      "Response_Source",
      "Processed_Status",
      "Notes"
    ],
    Retention_Responses: [
      "Retention_Response_ID",
      "Timestamp",
      "Employee_Name",
      "Employee_Email",
      "Seat_ID",
      "Response",
      "Response_Source",
      "Processed_Status",
      "Notes"
    ],
    Chatbot_Requests: [
      "Request_ID",
      "Timestamp",
      "Employee_Name",
      "Employee_Email",
      "Chat_User_ID",
      "Chat_Space_ID",
      "User_Message",
      "Bot_Response",
      "Action_Taken",
      "Status",
      "Error_Message"
    ],
    Audit_Log: [
      "Log_ID",
      "Timestamp",
      "Workflow",
      "Action",
      "Employee_Name",
      "Employee_Email",
      "Seat_ID",
      "Status",
      "Message",
      "Error_Details"
    ],
    System_Config: [
      "Config_Key",
      "Config_Value",
      "Description",
      "Last_Updated"
    ]
  };

  const vacantSeatIds = getDemoVacantSeats_(mode);
  const seats = buildDemoSeats_(vacantSeatIds);
  const occupancy = buildDemoOccupancyRows_(seats);
  const queue = buildDemoQueueRows_(mode);
  const config = buildDemoConfigRows_();

  writeSheet_(ss, "Seats", headers.Seats, seats);
  writeSheet_(ss, "Queue", headers.Queue, queue);
  writeSheet_(ss, "Occupancy_List", headers.Occupancy_List, occupancy);
  writeSheet_(ss, "Offer_Responses", headers.Offer_Responses, []);
  writeSheet_(ss, "Retention_Responses", headers.Retention_Responses, []);
  writeSheet_(ss, "Chatbot_Requests", headers.Chatbot_Requests, []);
  writeSheet_(ss, "Audit_Log", headers.Audit_Log, []);
  writeSheet_(ss, "System_Config", headers.System_Config, config);

  Logger.log("Demo data created for mode: " + mode);
}

function getDemoVacantSeats_(mode) {
  if (mode === "ONE_VACANCY_EMPTY_QUEUE") {
    return new Set(["S101"]);
  }

  if (mode === "MULTI_VACANCY_WITH_QUEUE") {
    return new Set(["S101", "S102", "S201"]);
  }

  return new Set();
}

function buildDemoSeats_(vacantSeatIds) {
  const rows = [];
  const now = new Date();

  const floorPlan = [
    { floor: 1, count: 10 },
    { floor: 2, count: 20 },
    { floor: 3, count: 15 }
  ];

  floorPlan.forEach(plan => {
    for (let i = 1; i <= plan.count; i++) {
      const seatId = "S" + plan.floor + String(i).padStart(2, "0");
      const isVacant = vacantSeatIds.has(seatId);

      rows.push([
        seatId,
        plan.floor,
        "Floor " + plan.floor + " Desk " + i,
        "Desk",
        isVacant ? "Vacant" : "Occupied",
        isVacant ? "" : "Employee " + seatId,
        "",
        now,
        isVacant ? "Demo vacant seat" : "Demo occupied seat"
      ]);
    }
  });

  return rows;
}

function buildDemoOccupancyRows_(seatRows) {
  const rows = [];
  const now = new Date();

  seatRows.forEach((seatRow, index) => {
    const seatId = seatRow[0];
    const seatStatus = seatRow[4];
    const employeeName = seatRow[5];

    if (seatStatus !== "Occupied") return;

    const occupiedMinutesAgo = 30 + (index % 6) * 30;
    const occupiedTime = new Date(now.getTime() - occupiedMinutesAgo * 60 * 1000);

    rows.push([
      "O" + String(index + 1).padStart(3, "0"),
      seatId,
      employeeName,
      employeeName.toLowerCase().replace(/\s+/g, ".") + "@example.com",
      occupiedTime,
      "",
      "Occupied",
      "",
      "",
      "",
      "",
      "Demo occupancy record"
    ]);
  });

  return rows;
}

function buildDemoQueueRows_(mode) {
  if (mode === "ONE_VACANCY_EMPTY_QUEUE") {
    return [];
  }

  const now = new Date();

  const people = [
    ["Priya Singh", "priya.singh@example.com"],
    ["Chunhao Li", "chunhao.li@example.com"],
    ["Rohan Patel", "rohan.patel@example.com"],
    ["Sarah Nguyen", "sarah.nguyen@example.com"],
    ["James Wilson", "james.wilson@example.com"]
  ];

  const queueSize = mode === "ALL_OCCUPIED_WITH_QUEUE" ? 3 : 5;

  return people.slice(0, queueSize).map((person, index) => {
    return [
      "Q" + String(index + 1).padStart(3, "0"),
      index + 1,
      person[0],
      person[1],
      "Waiting",
      "",
      "",
      now,
      "Demo Setup",
      "",
      "",
      "Demo waiting employee"
    ];
  });
}

function buildDemoConfigRows_() {
  const now = new Date();

  return [
    [
      "OFFER_RESPONSE_TIMER_MINUTES",
      String(getOfferResponseTimerMinutes()),
      "Time allowed for employee to accept or decline a seat offer",
      now
    ],
    [
      "RETENTION_PROMPT_AFTER_MINUTES",
      "120",
      "Time after which occupant receives a reminder",
      now
    ],
    [
      "RETENTION_RESPONSE_TIMER_MINUTES",
      "2",
      "Demo timer for retention response",
      now
    ]
  ];
}

function writeSheet_(ss, sheetName, headers, rows) {
  const sheet = getOrCreateSheet_(ss, sheetName);

  // Clear old content, formatting, and dropdown/data validation rules
  const fullRange = sheet.getRange(
    1,
    1,
    sheet.getMaxRows(),
    sheet.getMaxColumns()
  );

  fullRange.clearContent();
  fullRange.clearFormat();
  fullRange.clearDataValidations();

  // Write headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.setFrozenRows(1);

  // Write rows
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  
  applyDemoFormats_(sheet, headers, rows.length + 1);
    
  sheet.autoResizeColumns(1, headers.length);
}
function applyDemoFormats_(sheet, headers, rowCount) {
  const floorCol = headers.indexOf("Floor") + 1;

  if (floorCol > 0 && rowCount > 1) {
    sheet.getRange(2, floorCol, rowCount - 1, 1).setNumberFormat("0");
  }

  const dateHeaders = [
    "Last_Updated",
    "Requested_Time",
    "Offer_Time",
    "Occupied_Time",
    "Released_Time",
    "Timestamp",
    "Last_Reminder_Time",
    "Retention_Prompt_Time",
    "Last_Updated"
  ];

  dateHeaders.forEach(headerName => {
    const col = headers.indexOf(headerName) + 1;

    if (col > 0 && rowCount > 1) {
      sheet.getRange(2, col, rowCount - 1, 1).setNumberFormat("dd/mm/yyyy hh:mm:ss");
    }
  });
}

function getOrCreateSheet_(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  return sheet;
}