import { ReplyableEvent } from "@line/bot-sdk";
import { LineHandler } from "../../types";

export const handleDefault: LineHandler<ReplyableEvent> = async (event, userObject, client) => {
  const replyToken = event.replyToken;
  await client.replyMessage(replyToken, {
    type: "text",
    text: "ขอโทษด้วยเรายังไม่สามารถโต้ตอบได้",
  });
};

