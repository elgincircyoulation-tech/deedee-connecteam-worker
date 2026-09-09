export interface Env {
  CONNECTEAM_API_KEY?: string;
  CONNECTEAM_CONVERSATION_ID?: string;
  CONNECTEAM_SENDER_ID?: string;
}

export interface GHLPayload {
  event_type?: "WILL_CALL" | "TRIP_CANCELLED" | string;
  rider_name?: string | null;
  trip_id?: string | null;
  trip_date?: string | null;
  cancel_date?: string | null;
  cancellation_date?: string | null;
  date_of_trip?: string | null;
  pickup_date?: string | null;
  appointment_date?: string | null;
  scheduled_date?: string | null;
  broker_name?: string | null;
  activation_time?: string | null;
  cancel_status?: string | null;
  cancel_reason?: string | null;
  cancel_time?: string | null;
  cancel_type?: string | null;
  cancellation_reason?: string | null;
  cancellation_time?: string | null;
  cancellation_type?: string | null;
}

export interface ConnecteamPayload {
  senderId: number;
  text: string;
}