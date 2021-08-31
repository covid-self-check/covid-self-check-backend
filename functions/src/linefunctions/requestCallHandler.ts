import { admin } from "../init";
import { jsonController } from "../handler/jsonHandler";
import { success } from "../response/success";
import { Patient } from "../types";

export const requestCall = async (userObject: any, client: any, replyToken: any) => {
  const snapshot = await admin
    .firestore()
    .collection("patient")
    .doc(userObject.userId)
    .get();
  if (!snapshot.exists) {
    await client.replyMessage(replyToken, jsonController("tutorial2"));

    return success();
  }

  await client.replyMessage(replyToken, jsonController("tutorial1"));

  const { isRequestToCall } = snapshot.data() as Patient;

  if (isRequestToCall) {
    return success(
      `userID: ${userObject.userId} has already requested to call`
    );
  }
  await snapshot.ref.update({
    isRequestToCall: true,
    isRequestToCallExported: false,
  });
  return success();
};

