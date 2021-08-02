
const eventHandler = async (event, userObject, client) =>{
    switch (event.type) {
        case 'follow':
            await handleFollow(event, userObject, client)
    }
}
module.exports = {eventHandler};