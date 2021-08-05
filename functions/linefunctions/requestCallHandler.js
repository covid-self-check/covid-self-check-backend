const { admin } = require("../init");
const { jsonController } = require('../handler/jsonHandler');

const requestCall = async (userObject, client, replyToken) => {
    const snapshot = await admin
        .firestore()
        .collection("patient")
        .doc(userObject.userId)
        .get();
    if (!snapshot.exists) {
        await client.replyMessage(replyToken, jsonController('tutorial2'))

        return success()
    }

    await client.replyMessage(replyToken, jsonController('tutorial1'))

    const { isRequestToCall } = snapshot.data();

    if (isRequestToCall) {
        return success(`userID: ${userObject.userId} has already requested to call`);
    }

    await snapshot.ref.update({
        isRequestToCall: true,
        isRequestToCallExported: false,
    });
    return success();
}
module.exports = { requestCall };