import { LineHandler } from "../../types";

import { FollowEvent } from "@line/bot-sdk"
import messageMap from "../../messages";

export const handleFollow: LineHandler<FollowEvent> = async (event, userObject, client) => {
  const replyToken = await event.replyToken;
  try {
    // let greeting = jsonController("greeting");
    await client.replyMessage(replyToken, [
      messageMap.greetingPhoto,
      messageMap.greetingMessage,
    ]);
  } catch (error) {
    console.log(error);
    await client.replyMessage(replyToken, {
      type: "text",
      text: "ERROR, please report admin !",
    });
  }
};


