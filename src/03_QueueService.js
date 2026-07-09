function addEmployeeToQueue(employeeName, employeeEmail, chatUserId, chatSpaceId, originalMessage) {
  const ss = getAppSpreadsheet();
  const queueSheet = ss.getSheetByName("Queue");

  if (!queueSheet) {
    return { success: false, message: "Queue sheet was not found." };
  }

  const queueHeaders = getHeaderMapFlexible(queueSheet);
  const existing = findActiveQueueRowByEmail(queueSheet, queueHeaders, employeeEmail);

  if (existing) {
    return {
      success: false,
      message:
        employeeName + ", you already have an active queue record.\n\n" +
        "Status: " + existing.status + "\n" +
        "Allocated seat: " + (existing.seatId || "Not allocated yet")
    };
  }

  const nextPosition = getNextQueuePosition(queueSheet, queueHeaders);

  appendRowByHeaders(queueSheet, {
    Queue_ID: makeId("Q"),
    Queue_Position: nextPosition,
    Employee_Name: employeeName,
    Employee_Email: employeeEmail,
    Queue_Status: "Waiting",
    Allocated_Seat: "",
    Offer_Time: "",
    Requested_Time: new Date(),
    Request_Source: "Google Chat",
    Chat_User_ID: chatUserId,
    Chat_Space_ID: chatSpaceId,
    Notes: originalMessage
  });

  logChatbotRequest(employeeName, employeeEmail, chatUserId, chatSpaceId, originalMessage, "Add_To_Queue", "Success", "");

  allocateAllVacantSeats();

  const updated = findActiveQueueRowByEmail(queueSheet, queueHeaders, employeeEmail);

  if (updated && normaliseText(updated.status) === "offered") {
    return {
      success: true,
      message:
        "Done, " + employeeName + ". You have been added to the queue.\n\n" +
        "Good news — a seat is available and has been offered to you.\n" +
        "Seat: " + updated.seatId + "\n\n" +
        "Reply with:\n" +
        "accept seat " + updated.seatId + " " + employeeEmail + "\n\n" +
        "or:\n" +
        "decline seat " + updated.seatId + " " + employeeEmail
    };
  }

  return {
    success: true,
    message:
      "Done, " + employeeName + ". You have been added to the seat queue.\n\n" +
      "Queue position: " + nextPosition + "\n" +
      "Status: Waiting"
  };
}

function getQueueStatus(employeeEmail) {
  const ss = getAppSpreadsheet();
  const queueSheet = ss.getSheetByName("Queue");

  if (!queueSheet) return "Queue sheet was not found.";

  const queueHeaders = getHeaderMapFlexible(queueSheet);
  const existing = findActiveQueueRowByEmail(queueSheet, queueHeaders, employeeEmail);

  if (!existing) {
    return "I could not find an active queue record for " + employeeEmail + ".";
  }

  return (
    "Queue status for " + employeeEmail + ":\n\n" +
    "Status: " + existing.status + "\n" +
    "Allocated seat: " + (existing.seatId || "Not allocated yet")
  );
}
