import { FollowEvent, MessageEvent } from "@line/bot-sdk";
import { LineHandler } from "../types";
import { handleFollow } from "./subhandler/followHandler";
import { handleMessage } from "./subhandler/messageHandler";


export const eventHandler: LineHandler = async (event, userObject, client) => {
  switch (await event.type) {
    case "follow":
      await handleFollow(event as FollowEvent, userObject, client);
      break;
    case "message":
      await handleMessage(event as MessageEvent, userObject, client);
      break;
    default:
      break;
  }
};

