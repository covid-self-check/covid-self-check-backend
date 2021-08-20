"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("../init");
const jsonHandler_1 = require("../handler/jsonHandler");
const success_1 = require("../response/success");
const requestCall = async (userObject, client, replyToken) => {
  const snapshot = await init_1.admin
    .firestore()
    .collection("patient")
    .doc(userObject.userId)
    .get();
  if (!snapshot.exists) {
    await client.replyMessage(
      replyToken,
      jsonHandler_1.jsonController("tutorial2")
    );
    return success_1.success();
  }
  await client.replyMessage(
    replyToken,
    jsonHandler_1.jsonController("tutorial1")
  );
  const { isRequestToCall } = snapshot.data();
  if (isRequestToCall) {
    return success_1.success(
      `userID: ${userObject.userId} has already requested to call`
    );
  }
  await snapshot.ref.update({
    isRequestToCall: true,
    isRequestToCallExported: false,
  });
  return success_1.success();
};
module.exports = { requestCall };
//# sourceMappingURL=requestCallHandler.js.map
