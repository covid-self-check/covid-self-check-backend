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
      case "ประเมินอาการ":
        await client.replyMessage(
          replyToken,
          jsonController("symptomDiagnostic")
        );
        break;
      case "สิ่งที่ควรรู้":
        await client.replyMessage(replyToken, [
          jsonController("info1"),
          jsonController("info2"),
          jsonController("info3"),
          jsonController("info4"),
          jsonController("info6"),
        ]);
        break;
      case "ติดต่อฉุกเฉิน":
        await client.replyMessage(replyToken, jsonController("help"));
        break;
      case "สอนการใช้งาน":
        await requestGuide(userObject, client, replyToken);
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


