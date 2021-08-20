"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const followHandler_1 = require("./subhandler/followHandler");
const messageHandler_1 = require("./subhandler/messageHandler");
const eventHandler = async (event, userObject, client) => {
  switch (await event.type) {
    case "follow":
      await followHandler_1.handleFollow(event, userObject, client);
      break;
    case "message":
      await messageHandler_1.handleMessage(event, userObject, client);
      break;
    default:
      break;
  }
};
module.exports = { eventHandler };
//# sourceMappingURL=eventHandler.js.map
