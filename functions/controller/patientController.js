const functions = require("firebase-functions");
const {
  registerSchema,
  getProfileSchema,
  historySchema,
} = require("../schema");
const { admin } = require("../init");
const { getProfile } = require("../middleware/authentication");
const { convertTZ } = require("../utils");
const { success } = require("../response/success");
const { makeStatusAPIPayload, makeRequest, statusList } = require("../api/api");
const { sendPatientstatus } = require("../linefunctions/linepushmessage");
const { notifyToLine } = require("../linenotify");

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

exports.getProfile = async (data, _context) => {
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

  const { name, picture } = lineProfile;
  if (snapshot.exists) {
    const { followUp, ...patientData } = snapshot.data();
    const serializeData = convertTimestampToStr(patientData);
    return { line: { name, picture }, patient: serializeData };
  } else {
    return { line: { name, picture }, patient: null };
  }
};

exports.updateSymptom = async (data, _context) => {
  const { value, error } = historySchema.validate(data);
  if (error) {
    // DEBUG
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { lineUserID, lineIDToken, noAuth, ...obj } = value;
  const { error: authError, data: errorData } = await getProfile({
    lineUserID,
    lineIDToken,
    noAuth,
  });
  if (authError) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      errorData.error_description
    );
  }

  const createdDate = convertTZ(new Date(), "Asia/Bangkok");
  obj.createdDate = admin.firestore.Timestamp.fromDate(createdDate);

  const snapshot = await admin
    .firestore()
    .collection("patient")
    .doc(lineUserID)
    .get();
  if (!snapshot.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `ไม่พบผู้ใช้ ${lineUserID}`
    );
  }

  const snapshotData = snapshot.data();
  const {
    followUp,
    firstName,
    lastName,
    status: previousStatus,
  } = snapshotData;
  //TO BE CHANGED: snapshot.data.apply().status = statusCheckAPIorSomething;
  //update lastUpdatedAt field on patient
  await snapshot.ref.update({
    lastUpdatedAt: admin.firestore.Timestamp.fromDate(createdDate),
  });

  const formPayload = makeStatusAPIPayload(snapshotData, obj);
  const { inclusion_label, inclusion_label_type, triage_score } =
    await makeRequest(formPayload);

  const status = statusList[inclusion_label];
  obj["status"] = status;
  obj["status_label_type"] = inclusion_label_type;
  obj["triage_score"] = triage_score;

  if (!followUp) {
    await snapshot.ref.set({ ...obj, followUp: [obj] });
  } else {
    await snapshot.ref.update({
      ...obj,
      followUp: admin.firestore.FieldValue.arrayUnion(obj),
    });
  }

  try {
    // await sendPatientstatus(lineUserID, inclusion_label, config.channelAccessToken);
  } catch (err) {
    console.log(err);
  }
  const ALERT_STATUS = [
    statusList["Y1"],
    statusList["Y2"],
    statusList["R1"],
    statusList["R2"],
  ];
  if (status !== previousStatus && ALERT_STATUS.includes(status)) {
    await notifyToLine(
      `ผู้ป่วย: ${firstName} ${lastName} มีการเปลี่ยนแปลงอาการฉุกเฉิน`
    );
  }
  return success();
};
