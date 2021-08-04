const { jsonController } = require('../jsonHandler')

const handleMessage = async (event, userObject, client) => {
    const replyToken = await event.replyToken
    const message = await event.message.text
    // console.log(message) 
    try {
        switch (message) {
            case 'ประเมินอาการ':
                await client.replyMessage(replyToken, jsonController('symptomDiagnostic'))
                break;
            case 'สิ่งที่ควรรู้':
                await client.replyMessage(replyToken, [jsonController('info1'), jsonController('info2'), jsonController('info3')])
                break;
            case 'ขอความช่วยเหลือ':
                await client.replyMessage(replyToken, jsonController('help'))
                break;
            case 'สอนการใช้งาน':
                await client.replyMessage(replyToken, jsonController('tutorial'))
                break;
            default:
                await client.replyMessage(replyToken,jsonController('defaultReply'))
                break;
        }
    } catch (error) {
        console.log(error);
        await client.replyMessage(replyToken, { type: "text", text: "ERROR, please report admin !" });
    }
}

module.exports = {
    handleMessage,
};