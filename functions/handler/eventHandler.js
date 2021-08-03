const { handleFollow } = require("./subhandler/followHandler");
const eventHandler = async (event, userObject, client) => {
  switch (event.type) {
    case "message":
      await handleFollow(event, userObject, client);
  }
};
module.exports = { eventHandler };
