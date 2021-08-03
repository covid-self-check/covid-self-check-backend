const { handleFollow } = require('./subhandler/followHandler')
const {handleMessage} = require('./subhandler/messageHandler')
const { handleDefault } = require('./subhandler/defaultHandler')

const eventHandler = async (event, userObject, client) => {
    switch (await event.type) {
        case 'follow':
            await handleFollow(event, userObject, client);
            break;
        case 'message':
            await handleMessage(event, userObject, client);
            break;
        default:
            break;
    }
}
module.exports = { eventHandler };
