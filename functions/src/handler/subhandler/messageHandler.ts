import { jsonController } from "../jsonHandler";
import { requestGuide } from "../../linefunctions/requestGuideHandler";
import { LineHandler } from "../../types";
import { MessageEvent, TextEventMessage } from "@line/bot-sdk"


export const handleMessage: LineHandler<MessageEvent> = async (event, userObject, client) => {
  const replyToken = await event.replyToken;
  const message = await (event.message as TextEventMessage).text;
  // console.log(message)
  try {
    switch (message) {
      case "ติดต่อฉุกเฉิน":
        await client.replyMessage(replyToken, jsonController("help"));
        break;

      case "คำแนะนำตามอาการ":
        await client.replyMessage(
          replyToken,
          jsonController("symptomCarousel")
        );
        break;

      case "ข้อควรรู้":
        await client.replyMessage(
          replyToken,
          jsonController("faqCarousel")
        );
        break;

      case "ประเมินอาการ":
        await client.replyMessage(
          replyToken,
          jsonController("symptomDiagnostic")
        );
        break;

      default:
        await client.replyMessage(replyToken, jsonController("defaultReply"));
        break;
    }
  } catch (error) {
    console.log(error);
    await client.replyMessage(replyToken, {
      type: "text",
      text: "ERROR, please report admin !",
    });
  }
};


