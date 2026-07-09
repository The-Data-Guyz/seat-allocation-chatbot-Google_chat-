function allocateAllVacantSeats() {
  const ss = getAppSpreadsheet();

  const seatsSheet = ss.getSheetByName("Seats");
  const queueSheet = ss.getSheetByName("Queue");

  if (!seatsSheet || !queueSheet) return;

  const seatsHeaders = getHeaderMapFlexible(seatsSheet);
  const queueHeaders = getHeaderMapFlexible(queueSheet);

  const seatStatusCol = seatsHeaders["Seat_Status"];
  const reservedForCol = seatsHeaders["Reserved_For"];

  if (!seatStatusCol || !reservedForCol) {
    throw new Error("Seats sheet must contain Seat_Status and Reserved_For columns.");
  }

  const lastRow = seatsSheet.getLastRow();
  if (lastRow < 2) return;

  const seatData = seatsSheet.getRange(2, 1, lastRow - 1, seatsSheet.getLastColumn()).getValues();

  for (let i = 0; i < seatData.length; i++) {
    const row = seatData[i];
    const seatRow = i + 2;

    const status = String(row[seatStatusCol - 1] || "").trim();
    const reservedFor = String(row[reservedForCol - 1] || "").trim();

    if (status === "Vacant" && !reservedFor) {
      const nextEmployee = findFirstWaitingEmployee(queueSheet, queueHeaders);

      if (!nextEmployee) {
        return;
      }

      offerSeatToEmployee(seatsSheet, seatsHeaders, queueSheet, queueHeaders, seatRow, nextEmployee);
    }
  }
}

function offerSeatToEmployee(seatsSheet, seatsHeaders, queueSheet, queueHeaders, seatRow, employee) {
  const seatId = String(seatsSheet.getRange(seatRow, seatsHeaders["Seat_ID"]).getValue()).trim();

  seatsSheet.getRange(seatRow, seatsHeaders["Seat_Status"]).setValue("Offered");
  seatsSheet.getRange(seatRow, seatsHeaders["Reserved_For"]).setValue(employee.name);

  if (seatsHeaders["Current_Occupant"]) {
    seatsSheet.getRange(seatRow, seatsHeaders["Current_Occupant"]).clearContent();
  }

  if (seatsHeaders["Last_Updated"]) {
    seatsSheet.getRange(seatRow, seatsHeaders["Last_Updated"]).setValue(new Date());
  }

  queueSheet.getRange(employee.rowNumber, queueHeaders["Queue_Status"]).setValue("Offered");
  queueSheet.getRange(employee.rowNumber, queueHeaders["Allocated_Seat"]).setValue(seatId);

  if (queueHeaders["Offer_Time"]) {
    queueSheet.getRange(employee.rowNumber, queueHeaders["Offer_Time"]).setValue(new Date());
  }

  Logger.log("Seat " + seatId + " offered to " + employee.name);
}

function acceptSeatOffer(employeeEmail, optionalSeatId, originalMessage) {
  const ss = getAppSpreadsheet();

  const seatsSheet = ss.getSheetByName("Seats");
  const queueSheet = ss.getSheetByName("Queue");

  const seatsHeaders = getHeaderMapFlexible(seatsSheet);
  const queueHeaders = getHeaderMapFlexible(queueSheet);

  const offer = findOfferedQueueRowByEmail(queueSheet, queueHeaders, employeeEmail, optionalSeatId);

  if (!offer) {
    return { success: false, message: "I could not find an active seat offer for " + employeeEmail + "." };
  }

  const seatRow = findSeatRowById(seatsSheet, seatsHeaders, offer.seatId);

  if (!seatRow) {
    return { success: false, message: "Seat " + offer.seatId + " was not found in the Seats sheet." };
  }

  seatsSheet.getRange(seatRow, seatsHeaders["Seat_Status"]).setValue("Reserved");
  seatsSheet.getRange(seatRow, seatsHeaders["Reserved_For"]).setValue(offer.employeeName);

  if (seatsHeaders["Current_Occupant"]) {
    seatsSheet.getRange(seatRow, seatsHeaders["Current_Occupant"]).setValue(offer.employeeName);
  }

  if (seatsHeaders["Last_Updated"]) {
    seatsSheet.getRange(seatRow, seatsHeaders["Last_Updated"]).setValue(new Date());
  }

  queueSheet.getRange(offer.rowNumber, queueHeaders["Queue_Status"]).setValue("Reserved");
  queueSheet.getRange(offer.rowNumber, queueHeaders["Allocated_Seat"]).setValue(offer.seatId);

  appendOfferResponse(offer.employeeName, employeeEmail, offer.seatId, "Accept", originalMessage);
  createOrUpdateOccupancyRecord(offer.seatId, offer.employeeName, employeeEmail);

  return {
    success: true,
    message:
      "Seat confirmed ✅\n\n" +
      "Employee: " + offer.employeeName + "\n" +
      "Seat: " + offer.seatId
  };
}

function declineSeatOffer(employeeEmail, optionalSeatId, originalMessage) {
  const ss = getAppSpreadsheet();

  const seatsSheet = ss.getSheetByName("Seats");
  const queueSheet = ss.getSheetByName("Queue");

  const seatsHeaders = getHeaderMapFlexible(seatsSheet);
  const queueHeaders = getHeaderMapFlexible(queueSheet);

  const offer = findOfferedQueueRowByEmail(queueSheet, queueHeaders, employeeEmail, optionalSeatId);

  if (!offer) {
    return { success: false, message: "I could not find an active seat offer for " + employeeEmail + "." };
  }

  const seatRow = findSeatRowById(seatsSheet, seatsHeaders, offer.seatId);

  queueSheet.getRange(offer.rowNumber, queueHeaders["Queue_Status"]).setValue("Declined");

  appendOfferResponse(offer.employeeName, employeeEmail, offer.seatId, "Decline", originalMessage);

  if (seatRow) {
    seatsSheet.getRange(seatRow, seatsHeaders["Seat_Status"]).setValue("Vacant");

    if (seatsHeaders["Reserved_For"]) {
      seatsSheet.getRange(seatRow, seatsHeaders["Reserved_For"]).clearContent();
    }

    if (seatsHeaders["Current_Occupant"]) {
      seatsSheet.getRange(seatRow, seatsHeaders["Current_Occupant"]).clearContent();
    }

    if (seatsHeaders["Last_Updated"]) {
      seatsSheet.getRange(seatRow, seatsHeaders["Last_Updated"]).setValue(new Date());
    }
  }

  allocateAllVacantSeats();

  return {
    success: true,
    message: "No worries. Seat " + offer.seatId + " has been declined and returned to the queue."
  };
}

function releaseSeatForEmployee(employeeEmail, optionalSeatId) {
  const ss = getAppSpreadsheet();

  const seatsSheet = ss.getSheetByName("Seats");
  const queueSheet = ss.getSheetByName("Queue");
  const occupancySheet = ss.getSheetByName("Occupancy_List");

  const seatsHeaders = getHeaderMapFlexible(seatsSheet);
  const queueHeaders = getHeaderMapFlexible(queueSheet);
  const occupancyHeaders = getHeaderMapFlexible(occupancySheet);

  const occupancy = findActiveOccupancyByEmail(occupancySheet, occupancyHeaders, employeeEmail, optionalSeatId);

  if (!occupancy) {
    return { success: false, message: "I could not find an active occupied seat for " + employeeEmail + "." };
  }

  occupancySheet.getRange(occupancy.rowNumber, occupancyHeaders["Occupancy_Status"]).setValue("Released");

  if (occupancyHeaders["Released_Time"]) {
    occupancySheet.getRange(occupancy.rowNumber, occupancyHeaders["Released_Time"]).setValue(new Date());
  }

  if (occupancyHeaders["Release_Reason"]) {
    occupancySheet.getRange(occupancy.rowNumber, occupancyHeaders["Release_Reason"]).setValue("Released via Google Chat");
  }

  const seatRow = findSeatRowById(seatsSheet, seatsHeaders, occupancy.seatId);

  if (seatRow) {
    seatsSheet.getRange(seatRow, seatsHeaders["Seat_Status"]).setValue("Vacant");

    if (seatsHeaders["Current_Occupant"]) {
      seatsSheet.getRange(seatRow, seatsHeaders["Current_Occupant"]).clearContent();
    }

    if (seatsHeaders["Reserved_For"]) {
      seatsSheet.getRange(seatRow, seatsHeaders["Reserved_For"]).clearContent();
    }

    if (seatsHeaders["Last_Updated"]) {
      seatsSheet.getRange(seatRow, seatsHeaders["Last_Updated"]).setValue(new Date());
    }
  }

  const queueRow = findReservedQueueRowByEmail(queueSheet, queueHeaders, employeeEmail, occupancy.seatId);

  if (queueRow) {
    queueSheet.getRange(queueRow.rowNumber, queueHeaders["Queue_Status"]).setValue("Completed");
  }

  allocateAllVacantSeats();

  return {
    success: true,
    message: "Seat " + occupancy.seatId + " has been released ✅"
  };
}