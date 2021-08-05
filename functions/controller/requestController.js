const functions = require("firebase-functions");
const { getProfile } = require("../middleware/authentication");
const { getProfileSchema, requestToRegisterSchema } = require("../schema");
const { admin } = require("../init");
const { success } = require("../response/success");

exports.requestToCall = async (data, _context) => {
  const { value, error } = getProfileSchema.validate(data);
  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { lineUserID, lineIDToken, noAuth } = value;
  const { error: authError } = await getProfile({
    lineUserID,
    lineIDToken,
    noAuth,
  });
  if (authError) {
    throw new functions.https.HttpsError("unauthenticated", "ไม่ได้รับอนุญาต");
  }

  const snapshot = await admin
    .firestore()
    .collection("patient")
    .doc(lineUserID)
    .get();
  if (!snapshot.exists) {
    if (snapshot.data().toAmed === 1) {
      success(`your information already handle by Amed`);
    }
    throw new functions.https.HttpsError(
      "not-found",
      `ไม่พบผู้ใช้ ${lineUserID}`
    );
  }
  const { isRequestToCall } = snapshot.data();

  if (isRequestToCall) {
    return success(`userID: ${lineUserID} has already requested to call`);
  }

  await snapshot.ref.update({
    isRequestToCall: true,
    isRequestToCallExported: false,
  });
  return success();
};

exports.requestToRegister = async (data, _context) => {
  const { value, error } = requestToRegisterSchema.validate(data);
  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { lineUserID, lineIDToken, noAuth } = value;
  const { data: lineProfile, error: authError } = await getProfile({
    lineUserID,
    lineIDToken,
    noAuth,
  });
  if (authError) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      lineProfile.error_description
    );
  }

  const snapshot = await admin
    .firestore()
    .collection("patient")
    .doc(value.lineUserID)
    .get();

  if (snapshot.exists) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `ผู้ใช้ ${lineUserID} ลงทะเบียนในระบบแล้ว ไม่จำเป็นต้องขอรับความช่วยเหลือในการลงทะเบียน`
    );
  } else {
    const requestRegisterSnapshot = await admin
      .firestore()
      .collection("requestToRegisterAssistance")
      .doc(lineUserID)
      .get();

    if (requestRegisterSnapshot.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        `มีข้อมูลผู้ใช้ ${lineUserID} ในรายชื่อการโทรแล้ว`
      );
    }
    const obj = {
      name: value.name,
      personalPhoneNo: value.personalPhoneNo,
      isR2RExported: false,
    };
    await requestRegisterSnapshot.ref.create(obj);
    return success();
  }
};
