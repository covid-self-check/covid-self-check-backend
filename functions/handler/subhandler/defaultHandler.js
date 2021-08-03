const handleDefault = async (event, userObject, client) => {
    const replyToken = event.replyToken
    await client.replyMessage(replyToken,{type: 'text',text: 'ขอโทษด้วยเรายังไม่สามารถโต้ตอบได้'});
}

module.exports = {
    handleDefault,
};