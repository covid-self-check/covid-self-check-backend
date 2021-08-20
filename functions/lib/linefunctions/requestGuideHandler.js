"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonHandler_1 = require("../handler/jsonHandler");
const success_1 = require("../response/success");
const requestGuide = async (userObject, client, replyToken) => {
  // const snapshot = await admin
  //   .firestore()
  //   .collection("patient")
  //   .doc(userObject.userId)
  //   .get();
  // if (!snapshot.exists) {
  //   //await client.replyMessage(replyToken, jsonController("tutorial2"));
  //   await client.replyMessage(replyToken, [
  //     jsonController("guide"),
  //     jsonController("r2cQuestion")
  //   ]);
  //   return success();
  // }
  //await client.replyMessage(replyToken, jsonController("tutorial1"));
  // const { isRequestToCall } = snapshot.data();
  // if (isRequestToCall) {
  //   return success(
  //     `userID: ${userObject.userId} has already requested to call`
  //   );
  // }
  await client.replyMessage(replyToken, [
    jsonHandler_1.jsonController("guide"),
    jsonHandler_1.jsonController("r2cQuestion"),
  ]);
  // await snapshot.ref.update({
  //   isRequestToCall: true,
  //   isRequestToCallExported: false,
  // });
  return success_1.success();
};
module.exports = { requestGuide };
//# sourceMappingURL=requestGuideHandler.js.map
