function createChatReply(text) {
  return {
    hostAppDataAction: {
      chatDataAction: {
        createMessageAction: {
          message: {
            text: text
          }
        }
      }
    }
  };
}

function onAddedToSpace(event) {
  return createChatReply(
    "Seat Queue Bot is ready 👋\n\n" +
    "Try:\n" +
    "add me to queue - Your Name - your.email@example.com"
  );
}

function onAppCommand(event) {
  return createChatReply("Command received. Try: add me to queue - Your Name - your.email@example.com");
}

function onRemovedFromSpace(event) {
  console.log("Removed from space: " + JSON.stringify(event));
}

function onMessage(event) {
  console.log("MESSAGE EVENT: " + JSON.stringify(event));

  try {
    const message = getChatMessageText(event);
    const lowerMessage = message.toLowerCase();
    const sender = getChatSender(event);
    const spaceId = getChatSpaceId(event);

    if (!message) {
      return createChatReply("I received your message, but I could not read the text.");
    }

    if (lowerMessage === "hello" || lowerMessage === "hi" || lowerMessage === "help") {
      return createChatReply(getHelpText());
    }

    if (isJoinQueueRequest(message)) {
      const email = extractEmailFromText(message) || sender.email;
      const name = extractNameFromQueueMessage(message) || sender.name;

      if (!name || !email) {
        return createChatReply(
          "I can add you to the queue, but I need your name and email.\n\n" +
          "Use this format:\n" +
          "add me to queue - Diwash Singh - diwash@example.com"
        );
      }

      const result = addEmployeeToQueue(name, email, sender.userId, spaceId, message);
      return createChatReply(result.message);
    }

    if (lowerMessage.includes("queue status")) {
      const email = extractEmailFromText(message) || sender.email;

      if (!email) {
        return createChatReply("Please include your email. Example: queue status diwash@example.com");
      }

      return createChatReply(getQueueStatus(email));
    }

    if (lowerMessage.includes("accept seat")) {
      const email = extractEmailFromText(message) || sender.email;
      const seatId = extractSeatIdFromText(message);

      if (!email) {
        return createChatReply("Please include your email. Example: accept seat S001 diwash@example.com");
      }

      const result = acceptSeatOffer(email, seatId, message);
      return createChatReply(result.message);
    }

    if (lowerMessage.includes("decline seat")) {
      const email = extractEmailFromText(message) || sender.email;
      const seatId = extractSeatIdFromText(message);

      if (!email) {
        return createChatReply("Please include your email. Example: decline seat S001 diwash@example.com");
      }

      const result = declineSeatOffer(email, seatId, message);
      return createChatReply(result.message);
    }

    if (lowerMessage.includes("release my seat") || lowerMessage.includes("release seat")) {
      const email = extractEmailFromText(message) || sender.email;
      const seatId = extractSeatIdFromText(message);

      if (!email) {
        return createChatReply("Please include your email. Example: release my seat diwash@example.com");
      }

      const result = releaseSeatForEmployee(email, seatId);
      return createChatReply(result.message);
    }

    return createChatReply(getHelpText());

  } catch (err) {
    console.error(err.stack || err);
    return createChatReply("Something went wrong while processing this request:\n\n" + err.message);
  }
}

function getHelpText() {
  return (
    "Hello 👋 I can help with the seat queue.\n\n" +
    "Try:\n" +
    "- add me to queue - Your Name - your.email@example.com\n" +
    "- queue status your.email@example.com\n" +
    "- accept seat S001 your.email@example.com\n" +
    "- decline seat S001 your.email@example.com\n" +
    "- release my seat your.email@example.com"
  );
}