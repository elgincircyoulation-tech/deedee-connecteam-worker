export default {
  async fetch(request, env) {
    // 1. Verify incoming POST request
    if (request.method !== "POST") {
      return new Response(JSON.stringify({
        status: "ERROR",
        message: "Only POST requests are allowed from GHL"
      }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      // Parse incoming JSON body
      let data = {};
      try {
        data = await request.json();
      } catch (err) {
        return new Response(JSON.stringify({
          status: "ERROR",
          message: "No valid JSON POST body received from GHL"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // 2. Extract Variables (with Null & Empty String Protection)
      const riderName = (data.rider_name && data.rider_name !== "null" && data.rider_name !== "") ? data.rider_name : "Rider Name Unspecified";
      const tripId = (data.trip_id && data.trip_id !== "null" && data.trip_id !== "") ? data.trip_id : "N/A";
      const brokerName = (data.broker_name && data.broker_name !== "null" && data.broker_name !== "") ? data.broker_name : "Verida";

      // 3. Process Activation Time & Calculate +60 Min Pickup Deadline
      const timeZone = "America/New_York";
      let activationTimeStr = "";
      let pickupDeadlineStr = "";

      if (data.activation_time && data.activation_time !== "null" && data.activation_time !== "") {
        activationTimeStr = data.activation_time.trim();
        // Calculate +60 minutes directly from the passed activation_time string
        pickupDeadlineStr = add60Minutes(activationTimeStr);
      } else {
        // Fallback: Get current time in America/New_York
        const now = new Date();
        activationTimeStr = formatNYTime(now);
        const deadlineDate = new Date(now.getTime() + 60 * 60 * 1000);
        pickupDeadlineStr = formatNYTime(deadlineDate);
      }

      // 4. Construct Ronnie's Exact Alert Template
      const alertText = 
        "⚡ WILL CALL ACTIVATED | 60-MIN WINDOW⚡\n" +
        "=========================================\n" +
        "• BROKER: " + brokerName + "\n" +
        "• MEMBER: " + riderName + "\n" +
        "• TRP/LEG ID: " + tripId + "\n\n" +
        "TIME ACTIVATED: " + activationTimeStr + "\n" +
        "PICKUP DEADLINE: " + pickupDeadlineStr + "\n" +
        "=========================================\n" +
        "ACTION REQUIRED: Locate and dispatch the BEST available driver immediately!";

      // 5. Connecteam API Parameters
      const conversationId = "-MsaGGPunVxzculDAUSX";
      const senderId = 2411108; // Numeric integer
      const apiKey = "c66e0ff0-c332-48f5-9a37-4a13dbf2a7d5";
      const url = `https://api.connecteam.com/chat/v1/conversations/${conversationId}/message`;

      const payload = {
        senderId: senderId,
        text: alertText
      };

      // 6. Execute HTTP Request to Connecteam API
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseCode = response.status;
      const responseText = await response.text();

      let parsedConnecteamResponse;
      try {
        parsedConnecteamResponse = JSON.parse(responseText);
      } catch (err) {
        parsedConnecteamResponse = responseText;
      }

      // 7. Return Result back to GHL
      return new Response(JSON.stringify({
        status: (responseCode === 200 || responseCode === 201) ? "SUCCESS" : "CONNECTEAM_ERROR",
        connecteam_http_code: responseCode,
        connecteam_response: parsedConnecteamResponse
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        status: "MICROSERVICE_CRASH",
        error_details: error.toString()
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};

// --- HELPER FUNCTIONS ---

// Formats JS Date to America/New_York "hh:mm a"
function formatNYTime(dateObj) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(dateObj).toLowerCase();
}

// Takes input like "12:56 pm", "12:58", "11:30 AM" and adds 60 minutes (+1 hour)
function add60Minutes(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  
  if (!match) {
    // Fallback if string cannot be parsed: use current NY time + 60 min
    const now = new Date();
    return formatNYTime(new Date(now.getTime() + 60 * 60 * 1000));
  }

  let [_, hours, minutes, ampm] = match;
  hours = parseInt(hours, 10);

  if (ampm) {
    ampm = ampm.toLowerCase();
    
    // Convert 12-hour format to 24-hour cycle
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    // Add +60 minutes (+1 hour)
    hours = (hours + 1) % 24;

    // Convert back to 12-hour format string
    const newAmpm = hours < 12 ? 'am' : 'pm';
    let newHours = hours % 12;
    if (newHours === 0) newHours = 12;

    return `${newHours}:${minutes} ${newAmpm}`;
  } else {
    // 24-hour format handling
    hours = (hours + 1) % 24;
    return `${hours}:${minutes}`;
  }
}
