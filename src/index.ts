import { Env, GHLPayload, ConnecteamPayload } from "./types";
import { buildWillCallAlert } from "./willcall";
import { buildCancellationAlert } from "./cancellation";
import { sendConnecteamAlert } from "./helpers";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          status: "ERROR",
          message: "Only POST requests are allowed from GHL",
        }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      let data: GHLPayload = {};
      try {
        data = (await request.json()) as GHLPayload;
      } catch {
        return new Response(
          JSON.stringify({
            status: "ERROR",
            message: "No valid JSON POST body received from GHL",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      let alertText = "";
      if (data.event_type === "TRIP_CANCELLED") {
        alertText = buildCancellationAlert(data);
      } else {
        alertText = buildWillCallAlert(data);
      }

      const conversationId = env.CONNECTEAM_CONVERSATION_ID || "-MsaGGPunVxzculDAUSX";
      const senderId = env.CONNECTEAM_SENDER_ID ? parseInt(env.CONNECTEAM_SENDER_ID, 10) : 2411108;
      const apiKey = env.CONNECTEAM_API_KEY || "c66e0ff0-c332-48f5-9a37-4a13dbf2a7d5";

      const payload: ConnecteamPayload = {
        senderId: senderId,
        text: alertText,
      };

      const { status, text } = await sendConnecteamAlert(conversationId, apiKey, payload);

      let parsedResponse: unknown;
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        parsedResponse = text;
      }

      return new Response(
        JSON.stringify({
          status: status === 200 || status === 201 ? "SUCCESS" : "CONNECTEAM_ERROR",
          connecteam_http_code: status,
          connecteam_response: parsedResponse,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({
          status: "MICROSERVICE_CRASH",
          error_details: errorMessage,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};