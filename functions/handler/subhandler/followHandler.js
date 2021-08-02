const handleFollow = async (event, userObject, client) => {
    const replyToken = event.replyToken
    await client.replyMessage(replyToken, "HELLO")
}

module.exports = {
    handleFollow,
}