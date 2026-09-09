import { GHLPayload } from "./types";
import { formatNYTime, add60Minutes } from "./helpers";

export function buildWillCallAlert(data: GHLPayload): string {
  const riderName =
    data.rider_name && data.rider_name !== "null" && data.rider_name.trim() !== ""
      ? data.rider_name.trim()
      : "Rider Name Unspecified";

  const tripId =
    data.trip_id && data.trip_id !== "null" && data.trip_id.trim() !== ""
      ? data.trip_id.trim()
      : "N/A";

  const brokerName =
    data.broker_name && data.broker_name !== "null" && data.broker_name.trim() !== ""
      ? data.broker_name.trim()
      : "Verida";

  let activationTimeStr = "";
  let pickupDeadlineStr = "";

  if (data.activation_time && data.activation_time !== "null" && data.activation_time.trim() !== "") {
    activationTimeStr = data.activation_time.trim();
    pickupDeadlineStr = add60Minutes(activationTimeStr);
  } else {
    const now = new Date();
    activationTimeStr = formatNYTime(now);
    const deadlineDate = new Date(now.getTime() + 60 * 60 * 1000);
    pickupDeadlineStr = formatNYTime(deadlineDate);
  }

  return (
    "⚡ WILL CALL ACTIVATED | 60-MIN WINDOW⚡\n" +
    "=========================================\n" +
    "• BROKER: " + brokerName + "\n" +
    "• MEMBER: " + riderName + "\n" +
    "• TRP/LEG ID: " + tripId + "\n\n" +
    "TIME ACTIVATED: " + activationTimeStr + "\n" +
    "PICKUP DEADLINE: " + pickupDeadlineStr + "\n" +
    "=========================================\n" +
    "ACTION REQUIRED: Locate and dispatch the BEST available driver immediately!"
  );
}