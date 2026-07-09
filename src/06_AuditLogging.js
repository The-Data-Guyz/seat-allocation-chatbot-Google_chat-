function logChatbotRequest(employeeName, employeeEmail, chatUserId, chatSpaceId, userMessage, actionTaken, status, errorMessage) {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName("Chatbot_Requests");

  if (!sheet) return;

  appendRowByHeaders(sheet, {
    Request_ID: makeId("C"),
    Timestamp: new Date(),
    Employee_Name: employeeName,
    Employee_Email: employeeEmail,
    Chat_User_ID: chatUserId,
    Chat_Space_ID: chatSpaceId,
    User_Message: userMessage,
    Bot_Response: "",
    Action_Taken: actionTaken,
    Status: status,
    Error_Message: errorMessage
  });
}