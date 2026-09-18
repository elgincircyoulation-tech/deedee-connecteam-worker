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

      const requestUrl = new URL(request.url);
      const queryConversationId = requestUrl.searchParams.get("conversation_id");
      const queryTest = requestUrl.searchParams.get("test");

      const conversationId =
        queryConversationId ||
        data.conversation_id ||
        env.CONNECTEAM_CONVERSATION_ID ||
        "-MsaGGPunVxzculDAUSX";

      const isTest =
        queryTest === "true" ||
        data.is_test === true ||
        data.is_test === "true" ||
        conversationId === "eef0f52f-3c0f-4bad-b79f-c44b0d76138d";

      let alertText = "";
      if (data.event_type === "TRIP_CANCELLED") {
        alertText = buildCancellationAlert(data, isTest);
      } else {
        alertText = buildWillCallAlert(data, isTest);
      }

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

      const isSuccess = status === 200 || status === 201;

      return new Response(
        JSON.stringify({
          status: isSuccess ? "SUCCESS" : "CONNECTEAM_ERROR",
          environment: isTest ? "TEST" : "PRODUCTION",
          target_conversation_id: conversationId,
          extracted_data: {
            event_type: data.event_type || "WILL_CALL",
            rider_name: data.rider_name || null,
            trip_id: data.trip_id || null,
            broker_name: data.broker_name || null,
            activation_time: data.activation_time || null,
          },
          connecteam_http_code: status,
          connecteam_response: parsedResponse,
        }),
        {
          status: isSuccess ? 200 : 502,
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