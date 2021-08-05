const functions = require("firebase-functions");
const { registerSchema } = require("../schema");
const { admin } = require("../init");
const { getProfile } = require("../middleware/authentication");
const { convertTZ } = require("../utils");
const { success } = require("../response/success");

exports.registerPatient = async (data, _context) => {
  const { value, error } = registerSchema.validate(data);

  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { lineUserID, lineIDToken, noAuth, ...obj } = value;
  const { error: authError } = await getProfile({
    lineUserID,
    lineIDToken,
    noAuth,
  });
  if (authError) {
    throw new functions.https.HttpsError("unauthenticated", "ไม่ได้รับอนุญาต");
  }

  const needFollowUp = true;
  // TODO : fix schema
  obj["gotFavipiravir"] = obj["gotFavipiravia"];
  delete obj["gotFavipiravia"];
  obj["status"] = 0;
  obj["needFollowUp"] = needFollowUp;
  obj["followUp"] = [];
  const createdDate = convertTZ(new Date(), "Asia/Bangkok");
  const createdTimestamp = admin.firestore.Timestamp.fromDate(createdDate);
  obj["createdDate"] = createdTimestamp;
  obj["lastUpdatedAt"] = createdTimestamp;
  obj["isRequestToCallExported"] = false;
  obj["isRequestToCall"] = false;

  const snapshot = await admin
    .firestore()
    .collection("patient")
    .doc(lineUserID)
    .get();

  if (snapshot.exists) {
    throw new functions.https.HttpsError(
      "already-exists",
      "มีข้อมูลผู้ใช้ในระบบแล้ว"
    );
  }

  await snapshot.ref.create(obj);

  return success(`Registration with ID: ${lineUserID} added`);
};
