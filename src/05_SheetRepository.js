function getNextQueuePosition(queueSheet, queueHeaders) {
  const lastRow = queueSheet.getLastRow();
  if (lastRow < 2) return 1;

  const positionCol = queueHeaders["Queue_Position"];
  const values = queueSheet.getRange(2, positionCol, lastRow - 1, 1).getValues().flat();

  let maxPosition = 0;

  values.forEach(value => {
    const numberValue = Number(value);
    if (!isNaN(numberValue) && numberValue > maxPosition) {
      maxPosition = numberValue;
    }
  });

  return maxPosition + 1;
}

function appendRowByHeaders(sheet, rowObject) {
  const headers = getHeaderMapFlexible(sheet);
  const newRow = new Array(sheet.getLastColumn()).fill("");

  Object.keys(rowObject).forEach(key => {
    if (headers[key]) {
      newRow[headers[key] - 1] = rowObject[key];
    }
  });

  sheet.appendRow(newRow);
}

function getHeaderMapFlexible(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};

  headers.forEach((header, index) => {
    const rawHeader = String(header).trim();
    const underscoreHeader = rawHeader.replace(/\s+/g, "_");

    map[rawHeader] = index + 1;
    map[underscoreHeader] = index + 1;
  });

  return map;
}

function makeId(prefix) {
  return prefix + Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMddHHmmssSSS"
  );
}

function findActiveQueueRowByEmail(queueSheet, queueHeaders, employeeEmail) {
  const lastRow = queueSheet.getLastRow();
  if (lastRow < 2) return null;

  const data = queueSheet.getRange(2, 1, lastRow - 1, queueSheet.getLastColumn()).getValues();
  const targetEmail = normaliseText(employeeEmail);
  const activeStatuses = ["waiting", "offered", "reserved"];

  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    const rowEmail = normaliseText(row[queueHeaders["Employee_Email"] - 1]);
    const rowStatus = String(row[queueHeaders["Queue_Status"] - 1] || "").trim();
    const rowSeat = queueHeaders["Allocated_Seat"]
      ? String(row[queueHeaders["Allocated_Seat"] - 1] || "").trim()
      : "";

    if (rowEmail === targetEmail && activeStatuses.includes(normaliseText(rowStatus))) {
      return {
        rowNumber: i + 2,
        status: rowStatus,
        seatId: rowSeat
      };
    }
  }

  return null;
}

function findOfferedQueueRowByEmail(queueSheet, queueHeaders, employeeEmail, optionalSeatId) {
  const lastRow = queueSheet.getLastRow();
  if (lastRow < 2) return null;

  const data = queueSheet.getRange(2, 1, lastRow - 1, queueSheet.getLastColumn()).getValues();
  const targetEmail = normaliseText(employeeEmail);
  const targetSeat = String(optionalSeatId || "").trim();

  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    const rowEmail = normaliseText(row[queueHeaders["Employee_Email"] - 1]);
    const rowStatus = normaliseText(row[queueHeaders["Queue_Status"] - 1]);
    const rowSeat = String(row[queueHeaders["Allocated_Seat"] - 1] || "").trim();

    if (rowEmail === targetEmail && rowStatus === "offered" && (!targetSeat || rowSeat === targetSeat)) {
      return {
        rowNumber: i + 2,
        employeeName: String(row[queueHeaders["Employee_Name"] - 1] || "").trim(),
        seatId: rowSeat
      };
    }
  }

  return null;
}

function findReservedQueueRowByEmail(queueSheet, queueHeaders, employeeEmail, seatId) {
  const lastRow = queueSheet.getLastRow();
  if (lastRow < 2) return null;

  const data = queueSheet.getRange(2, 1, lastRow - 1, queueSheet.getLastColumn()).getValues();
  const targetEmail = normaliseText(employeeEmail);
  const targetSeat = String(seatId || "").trim();

  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];

    if (
      normaliseText(row[queueHeaders["Employee_Email"] - 1]) === targetEmail &&
      normaliseText(row[queueHeaders["Queue_Status"] - 1]) === "reserved" &&
      String(row[queueHeaders["Allocated_Seat"] - 1] || "").trim() === targetSeat
    ) {
      return { rowNumber: i + 2 };
    }
  }

  return null;
}

function findSeatRowById(seatsSheet, seatsHeaders, seatId) {
  const lastRow = seatsSheet.getLastRow();
  if (lastRow < 2) return null;

  const seatIdCol = seatsHeaders["Seat_ID"];
  const values = seatsSheet.getRange(2, seatIdCol, lastRow - 1, 1).getValues();

  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(seatId).trim()) {
      return i + 2;
    }
  }

  return null;
}

function findActiveOccupancyByEmail(occupancySheet, occupancyHeaders, employeeEmail, optionalSeatId) {
  const lastRow = occupancySheet.getLastRow();
  if (lastRow < 2) return null;

  const data = occupancySheet.getRange(2, 1, lastRow - 1, occupancySheet.getLastColumn()).getValues();
  const targetEmail = normaliseText(employeeEmail);
  const targetSeat = String(optionalSeatId || "").trim();

  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];

    const rowEmail = normaliseText(row[occupancyHeaders["Employee_Email"] - 1]);
    const rowStatus = normaliseText(row[occupancyHeaders["Occupancy_Status"] - 1]);
    const rowSeat = String(row[occupancyHeaders["Seat_ID"] - 1] || "").trim();

    if (rowEmail === targetEmail && rowStatus === "occupied" && (!targetSeat || rowSeat === targetSeat)) {
      return {
        rowNumber: i + 2,
        seatId: rowSeat
      };
    }
  }

  return null;
}

function createOrUpdateOccupancyRecord(seatId, employeeName, employeeEmail) {
  const ss = getAppSpreadsheet();
  const occupancySheet = ss.getSheetByName("Occupancy_List");

  if (!occupancySheet) return;

  appendRowByHeaders(occupancySheet, {
    Occupancy_ID: makeId("O"),
    Seat_ID: seatId,
    Employee_Name: employeeName,
    Employee_Email: employeeEmail,
    Occupied_Time: new Date(),
    Released_Time: "",
    Occupancy_Status: "Occupied",
    Retention_Status: "",
    Last_Reminder_Time: "",
    Retention_Prompt_Time: "",
    Release_Reason: "",
    Notes: "Created by Google Chat"
  });
}

function appendOfferResponse(employeeName, employeeEmail, seatId, response, originalMessage) {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName("Offer_Responses");

  if (!sheet) return;

  appendRowByHeaders(sheet, {
    Response_ID: makeId("R"),
    Timestamp: new Date(),
    Employee_Name: employeeName,
    Employee_Email: employeeEmail,
    Seat_ID: seatId,
    Response: response,
    Response_Source: "Google Chat",
    Processed_Status: "Processed",
    Notes: originalMessage
  });
}

function findFirstWaitingEmployee(queueSheet, queueHeaders) {
  const lastRow = queueSheet.getLastRow();
  if (lastRow < 2) return null;

  const data = queueSheet.getRange(2, 1, lastRow - 1, queueSheet.getLastColumn()).getValues();
  const waiting = [];

  data.forEach((row, index) => {
    const status = normaliseText(row[queueHeaders["Queue_Status"] - 1]);

    if (status === "waiting") {
      waiting.push({
        rowNumber: index + 2,
        position: Number(row[queueHeaders["Queue_Position"] - 1]) || index + 1,
        name: String(row[queueHeaders["Employee_Name"] - 1] || "").trim(),
        email: String(row[queueHeaders["Employee_Email"] - 1] || "").trim()
      });
    }
  });

  if (waiting.length === 0) return null;

  waiting.sort((a, b) => a.position - b.position);
  return waiting[0];
}