const axios = require('axios');
const baseURL = 'https://api.line.me/v2/bot/message/push';

const sendPatientstatus = async (userId, paitentStatus, channelAccessToken) => {
    console.log(channelAccessToken, 'token')
    const axiosConfig = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + channelAccessToken
        },
        data: {
            "to": userId,
            "messages": [
                {
                    "type": "text",
                    "text": paitentStatus
                }
            ]
        },
        baseURL
    }
    await axios(axiosConfig)
}
module.exports = { sendPatientstatus };