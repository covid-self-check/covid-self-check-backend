
const { jsonController } = require('../jsonHandler')
const handleFollow = async (event, userObject, client) => {
    const replyToken = event.replyToken
    try {
        let greeting = jsonController('greeting')
        greeting.contents.body.contents[2].text = `คุณ ${userObject.profile.displayName}`
        console.log(greeting)
        await client.replyMessage(replyToken,jsonController('greeting'));
    } catch (error) {
        console.log(error);
        await client.replyMessage(replyToken, { type: "text", text: "ERROR, please report admin !" });
    }
}

module.exports = {
    handleFollow,
};