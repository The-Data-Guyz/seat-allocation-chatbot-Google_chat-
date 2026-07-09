/* ---------------- Message parsing ---------------- */

function getChatMessageText(event) {
  if (event && event.chat && event.chat.messagePayload && event.chat.messagePayload.message) {
    return String(event.chat.messagePayload.message.text || "").trim();
  }

  if (event && event.message && event.message.text) {
    return String(event.message.text || "").trim();
  }

  return "";
}

function getChatSender(event) {
  let message = null;

  if (event && event.chat && event.chat.messagePayload && event.chat.messagePayload.message) {
    message = event.chat.messagePayload.message;
  } else if (event && event.message) {
    message = event.message;
  }

  const sender = message && message.sender ? message.sender : {};

  return {
    name: sender.displayName || "",
    email: sender.email || "",
    userId: sender.name || ""
  };
}

function getChatSpaceId(event) {
  if (event && event.chat && event.chat.messagePayload && event.chat.messagePayload.space) {
    return event.chat.messagePayload.space.name || "";
  }

  if (event && event.space) {
    return event.space.name || "";
  }

  return "";
}

function isJoinQueueRequest(message) {
  const text = normaliseText(message);

  return (
    text.includes("add me to queue") ||
    text.includes("add me to the queue") ||
    text.includes("join queue") ||
    text.includes("put me on the list") ||
    text.includes("add me to list")
  );
}

function extractEmailFromText(text) {
  const match = String(text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].trim() : "";
}

function extractSeatIdFromText(text) {
  const match = String(text || "").match(/\bS[0-9]{1,4}\b/i);
  return match ? match[0].toUpperCase().trim() : "";
}

function extractNameFromQueueMessage(text) {
  let cleaned = String(text || "").trim();

  cleaned = cleaned.replace(/add me to the queue/ig, "");
  cleaned = cleaned.replace(/add me to queue/ig, "");
  cleaned = cleaned.replace(/join queue/ig, "");
  cleaned = cleaned.replace(/put me on the list/ig, "");
  cleaned = cleaned.replace(/add me to list/ig, "");
  cleaned = cleaned.replace(extractEmailFromText(cleaned), "");
  cleaned = cleaned.replace(/[-:|,]/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

function normaliseText(value) {
  return String(value || "").trim().toLowerCase();
}