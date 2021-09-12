import { LineHandler } from "../../types";
import { jsonController } from "../jsonHandler";
import { FollowEvent } from "@line/bot-sdk"

export const handleFollow: LineHandler<FollowEvent> = async (event, userObject, client) => {
  const replyToken = await event.replyToken;
  try {
    // let greeting = jsonController("greeting");
    await client.replyMessage(replyToken, [
      jsonController("welcomepos1"),
      jsonController("greeting"),
    ]);
  } catch (error) {
    console.log(error);
    await client.replyMessage(replyToken, {
      type: "text",
      text: "ERROR, please report admin !",
    });
  }
};


