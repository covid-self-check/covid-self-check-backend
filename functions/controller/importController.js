const functions = require("firebase-functions");
const { importPatientIdSchema } = require("../schema");
const { admin } = require("../init");
const { success } = require("../response/success");

exports.importFinishR2C = async (data, _context) => {
  const { value, error } = importPatientIdSchema.validate(data);

  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }
  const { ids } = value;
  const snapshot = await admin
    .firestore()
    .collection("patient")
    .where("isRequestToCall", "==", true)
    .where("isRequestToCallExported", "==", true)
    .get();

  const batch = admin.firestore().batch();

  snapshot.docs.forEach((doc) => {
    const hasCalled = ids.includes(doc.id);
    const docRef = admin.firestore().collection("patient").doc(doc.id);
    if (hasCalled) {
      batch.update(docRef, {
        isRequestToCall: false,
        isRequestToCallExported: false,
      });
    } else {
      batch.update(docRef, {
        isRequestToCallExported: false,
      });
    }
  });

  await batch.commit();
  return success();
};
