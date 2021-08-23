import { handleFollow } from "./subhandler/followHandler";
import { handleMessage } from "./subhandler/messageHandler";

export const eventHandler = async (event: any, userObject: any, client: any) => {
  switch (await event.type) {
    case "follow":
      await handleFollow(event, userObject, client);
      break;
    case "message":
      await handleMessage(event, userObject, client);
      break;
    default:
      break;
  }
};

