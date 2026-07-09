/* ---------------- Optional timer for later testing ---------------- */

function checkExpiredOffers() {
  const ss = getAppSpreadsheet();
  const seatsSheet = ss.getSheetByName("Seats");
  const queueSheet = ss.getSheetByName("Queue");

  if (!seatsSheet || !queueSheet) return;

  const seatsHeaders = getHeaderMapFlexible(seatsSheet);
  const queueHeaders = getHeaderMapFlexible(queueSheet);

  const lastRow = queueSheet.getLastRow();
  if (lastRow < 2) return;

  const data = queueSheet.getRange(2, 1, lastRow - 1, queueSheet.getLastColumn()).getValues();
  const now = new Date();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const status = normaliseText(row[queueHeaders["Queue_Status"] - 1]);
    const seatId = String(row[queueHeaders["Allocated_Seat"] - 1] || "").trim();
    const offerTime = row[queueHeaders["Offer_Time"] - 1];

    if (status === "offered" && seatId && offerTime) {
      const minutesPassed = (now.getTime() - new Date(offerTime).getTime()) / 1000 / 60;

      if (minutesPassed >= getOfferResponseTimerMinutes()) {
        const queueRow = i + 2;
        queueSheet.getRange(queueRow, queueHeaders["Queue_Status"]).setValue("Expired");

        const seatRow = findSeatRowById(seatsSheet, seatsHeaders, seatId);

        if (seatRow) {
          seatsSheet.getRange(seatRow, seatsHeaders["Seat_Status"]).setValue("Vacant");

          if (seatsHeaders["Reserved_For"]) {
            seatsSheet.getRange(seatRow, seatsHeaders["Reserved_For"]).clearContent();
          }

          if (seatsHeaders["Current_Occupant"]) {
            seatsSheet.getRange(seatRow, seatsHeaders["Current_Occupant"]).clearContent();
          }
        }
      }
    }
  }

  allocateAllVacantSeats();
}