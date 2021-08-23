import { FollowEvent, MessageEvent } from "@line/bot-sdk";
import { LineHandler } from "../types";
import { handleFollow } from "./subhandler/followHandler";
import { handleMessage } from "./subhandler/messageHandler";


export const eventHandler: LineHandler = async (event, userObject, client) => {
  switch (await event.type) {
    case "follow":
      const followEvent = event as FollowEvent
      await handleFollow(followEvent, userObject, client);
      break;
    case "message":
      const messageEvent = event as MessageEvent
      await handleMessage(messageEvent, userObject, client);
      break;
    default:
      break;
  }
};

