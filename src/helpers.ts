import { ConnecteamPayload } from "./types";

/**
 * Formats a JS Date object into America/New_York "hh:mm a"
 */
export function formatNYTime(dateObj: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(dateObj)
    .toLowerCase();
}

/**
 * Parses time strings (e.g. "12:56 pm", "10:48 AM") and calculates +60 minutes (+1 hour)
 */
export function add60Minutes(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);

  if (!match) {
    const now = new Date();
    return formatNYTime(new Date(now.getTime() + 60 * 60 * 1000));
  }

  let [, rawHours, minutes, rawAmpm] = match;
  let hours = parseInt(rawHours, 10);

  if (rawAmpm) {
    const ampm = rawAmpm.toLowerCase();

    // Convert 12-hour format to 24-hour cycle
    if (ampm === "pm" && hours !== 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;

    // Add 1 hour
    hours = (hours + 1) % 24;

    const newAmpm = hours < 12 ? "am" : "pm";
    let newHours = hours % 12;
    if (newHours === 0) newHours = 12;

    return `${newHours}:${minutes} ${newAmpm}`;
  } else {
    // 24-hour format
    hours = (hours + 1) % 24;
    return `${hours}:${minutes}`;
  }
}

/**
 * Sends formatted alert payload to Connecteam Chat API
 */
export async function sendConnecteamAlert(
  conversationId: string,
  apiKey: string,
  payload: ConnecteamPayload
): Promise<{ status: number; text: string }> {
  const url = `https://api.connecteam.com/chat/v1/conversations/${conversationId}/message`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  return {
    status: response.status,
    text: text,
  };
}