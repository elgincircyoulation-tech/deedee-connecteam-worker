import { GHLPayload } from "./types";
import { formatNYTime } from "./helpers";

export function buildCancellationAlert(data: GHLPayload, isTest = false): string {
  const testBanner = isTest
    ? "🧪 [TEST / QA ENVIRONMENT ALERT - DO NOT DISPATCH]\n"
    : "";

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

  const tripDate =
    data.trip_date && data.trip_date !== "null" && data.trip_date.trim() !== ""
      ? data.trip_date.trim()
      : data.cancel_date && data.cancel_date !== "null" && data.cancel_date.trim() !== ""
      ? data.cancel_date.trim()
      : data.cancellation_date && data.cancellation_date !== "null" && data.cancellation_date.trim() !== ""
      ? data.cancellation_date.trim()
      : data.date_of_trip && data.date_of_trip !== "null" && data.date_of_trip.trim() !== ""
      ? data.date_of_trip.trim()
      : data.pickup_date && data.pickup_date !== "null" && data.pickup_date.trim() !== ""
      ? data.pickup_date.trim()
      : data.appointment_date && data.appointment_date !== "null" && data.appointment_date.trim() !== ""
      ? data.appointment_date.trim()
      : data.scheduled_date && data.scheduled_date !== "null" && data.scheduled_date.trim() !== ""
      ? data.scheduled_date.trim()
      : "Not Specified";

  const reason =
    data.cancel_reason && data.cancel_reason !== "null" && data.cancel_reason.trim() !== ""
      ? data.cancel_reason.trim()
      : data.cancellation_reason && data.cancellation_reason !== "null" && data.cancellation_reason.trim() !== ""
      ? data.cancellation_reason.trim()
      : "Not Specified";

  const cancelTime =
    data.cancel_time && data.cancel_time !== "null" && data.cancel_time.trim() !== ""
      ? data.cancel_time.trim()
      : data.cancellation_time && data.cancellation_time !== "null" && data.cancellation_time.trim() !== ""
      ? data.cancellation_time.trim()
      : formatNYTime(new Date());

  const tripTiming =
    data.cancellation_type && data.cancellation_type !== "null" && data.cancellation_type.trim() !== ""
      ? data.cancellation_type.trim().toUpperCase()
      : data.cancel_type && data.cancel_type !== "null" && data.cancel_type.trim() !== ""
      ? data.cancel_type.trim().toUpperCase()
      : "SAME-DAY";

  return (
    testBanner +
    "🚫 TRIP CANCELLATION ALERT 🚫\n" +
    "=========================================\n" +
    "• BROKER: " + brokerName + "\n" +
    "• MEMBER: " + riderName + "\n" +
    "• TRP/LEG ID: " + tripId + "\n" +
    "• TRIP DATE: " + tripDate + "\n\n" +
    "CANCELED AT: " + cancelTime + "\n" +
    "TRIP TIMING: " + tripTiming + "\n" +
    "REASON: " + reason + "\n" +
    "=========================================\n" +
    "⚠️ REQUIRED DISPATCH ACTIONS:\n" +
    "1. Unassign driver and remove trip in MediRoutes immediately.\n" +
    "2. IF SAME-DAY: FILE A FORMAL COMPLAINT against the Member for On-Time Performance (OTP) tracking due to same-day disruption."
  );
}