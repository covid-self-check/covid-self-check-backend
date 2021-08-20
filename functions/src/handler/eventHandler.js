import { handleFollow } from "./subhandler/followHandler";
import { handleMessage } from "./subhandler/messageHandler";

const eventHandler = async (event, userObject, client) => {
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
module.exports = { eventHandler };
