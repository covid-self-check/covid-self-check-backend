import messageMap from "../../messages";
import { LineHandler } from "../../types";
import { MessageEvent, TextEventMessage } from "@line/bot-sdk"

export const handleMessage: LineHandler<MessageEvent> = async (event, userObject, client) => {
  const replyToken = await event.replyToken;
  const message = await (event.message as TextEventMessage).text;
  // console.log(message)
  try {
    switch (message) {
      case "ติดต่อฉุกเฉิน":
        await client.replyMessage(
          replyToken,
          messageMap.emergencyNumberMessage
        );
        break;

      // start Symptoms Carousel
      case "คำแนะนำตามอาการ":
        await client.replyMessage(replyToken, [messageMap.symptomListMessage, messageMap.symptomCarousel]);
        break;

      case "หายใจลำบาก":
        await client.replyMessage(replyToken, messageMap.breatheMessage);
        break;

      case "ท้องเสีย":
        await client.replyMessage(replyToken, messageMap.stomachMessage);
        break;

      case "มีไข้":
        await client.replyMessage(replyToken, messageMap.feverMessage);
        break;

      case "ไอเจ็บคอ":
        await client.replyMessage(replyToken, messageMap.coughMessage);
        break;
      // end symptoms Carousel

      // start faq carousel
      case "ข้อควรรู้":
        await client.replyMessage(replyToken, messageMap.faqCarousel);
        break;

      case "รายละเอียดข้อควรรู้":
        await client.replyMessage(replyToken, messageMap.faqMessage);
        break;

      case "สิทธิการเบิกประกัน":
        await client.replyMessage(replyToken, [
          messageMap.insurance1Message,
          messageMap.insurance2Message,
        ]);
        break;
      // end faq carousel
      default:
        await client.replyMessage(replyToken, messageMap.defaultReplyMessage);
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


