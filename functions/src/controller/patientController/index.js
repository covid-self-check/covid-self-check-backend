const functions = require("firebase-functions");
const {
  validateRegisterSchema,
  validateGetProfileSchema,
  validateHistorySchema,
  //mon added this
  validateDeletePatientSchema,
  //end mon code
} = require("../../schema");
const { admin, collection } = require("../../init");
const { getProfile } = require("../../middleware/authentication");
const { success } = require("../../response/success");
const { makeStatusAPIPayload, makeRequest } = require("../../api");
const { statusList, statusListReverse } = require("../../api/const");
const { sendPatientStatus } = require("../../linefunctions/linepushmessage");
const { notifyToLine } = require("../../linenotify");
const { convertTimestampToStr } = require("../../utils");
const { config } = require("../../config");

const {
  setPatientStatus,
  snapshotExists,
  updateSymptomAddCreatedDate,
  updateSymptomCheckUser,
  updateSymptomCheckAmed,
  updateSymptomUpdateStatus,
  setAmedStatus,
} = require("./utils");

// Mon added this code
const deletePatient = async (personalID) => {
  const snapshot = await admin
    .firestore()
    .collection(collection.patient)
    .where("personalID", "==", personalID)
    .get();

  if (snapshot.empty) {
    return false;
  } else {
    //deletes all patient with personalID = personalID and decrement relevant counters
    const batch = admin.firestore().batch();
    snapshot.forEach((doc) => {
      const patientDocRef = admin
        .firestore()
        .collection(collection.patient)
        .doc(doc.id);

      const legacyRef = admin
        .firestore()
        .collection(collection.legacyUser)
        .doc(doc.id);

      batch.delete(patientDocRef);

      batch.set(legacyRef, { ...doc.data() });
    });
    return batch
      .commit()
      .then(() => true)
      .catch((error) => {
        console.log("batch ", error);
        return false;
      });
  }
};

exports.requestDeletePatient = async (data, _context) => {
  const { value, error } = validateDeletePatientSchema(data);

  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "รหัสบัตรประชาชนคนไข้ไม่ถูกต้อง",
      error.details
    );
  }

  const { personalID } = value;
  const res = await deletePatient(personalID);
  if (res) {
    return success(
      `patient with personalID: ${personalID} was deleted successfully`
    );
  } else {
    throw new functions.https.HttpsError(
      "not-found",
      "delete operation failed or id not found"
    );
  }
};
// end of mon's code

exports.registerPatient = async (data, _context) => {
  const { value, error } = validateRegisterSchema(data);

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

  const createdDate = new Date();
  setPatientStatus(obj, createdDate);

  //need db connection
  const snapshot = await admin
    .firestore()
    .collection(collection.patient)
    .doc(lineUserID)
    .get();

  const whitelist = await admin
    .firestore()
    .collection(collection.whitelist)
    .doc(obj.personalID)
    .get();

  if (!whitelist.exists) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "You are not in our whitelist"
    );
  }

  snapshotExists(snapshot);

  //need db connection
  await snapshot.ref.create(obj);

  return success(`Registration with ID: ${lineUserID} added`);
};

exports.getProfile = async (data, _context) => {
  const { value, error } = validateGetProfileSchema(data);
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
    .collection(collection.patient)
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
  const { value, error } = validateHistorySchema(data);
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

  const date = new Date();
  const createdTimeStamp = admin.firestore.Timestamp.fromDate(date);
  updateSymptomAddCreatedDate(obj, createdTimeStamp);

  //need db connection
  const snapshot = await admin
    .firestore()
    .collection(collection.patient)
    .doc(lineUserID)
    .get();

  updateSymptomCheckUser(snapshot, lineUserID);

  const snapshotData = snapshot.data();
  const {
    followUp,
    firstName,
    lastName,
    toAmed,
    status: previousStatus,
  } = snapshotData;

  updateSymptomCheckAmed(snapshotData);
  //TO BE CHANGED: snapshot.data.apply().status = statusCheckAPIorSomething;
  //update lastUpdatedAt field on patient

  const formPayload = makeStatusAPIPayload(snapshotData, obj);
  const { inclusion_label, inclusion_label_type, triage_score } =
    await makeRequest(formPayload);

  const status = statusList[inclusion_label];
  updateSymptomUpdateStatus(
    obj,
    status,
    inclusion_label_type,
    triage_score,
    createdTimeStamp
  );

  const followUpObj = { ...obj };
  obj["isNurseExported"] = false;

  const ALERT_STATUS = [
    statusList["Y1"],
    statusList["Y2"],
    statusList["R1"],
    statusList["R2"],
  ];

  setAmedStatus(obj, status, previousStatus, ALERT_STATUS);

  const { createdDate, ...objWithOutCreatedDate } = obj;

  if (!followUp) {
    await snapshot.ref.set({
      ...objWithOutCreatedDate,
      followUp: [followUpObj],
    });
  } else {
    await snapshot.ref.update({
      ...objWithOutCreatedDate,
      followUp: admin.firestore.FieldValue.arrayUnion(followUpObj),
    });
  }

  try {
    if (ALERT_STATUS.includes(status)) {
      await notifyToLine(
        `ผู้ป่วย: ${firstName} ${lastName} มีการเปลี่ยนแปลงอาการฉุกเฉิน`
      );
    }
  } catch (err) {
    console.log(err);
  }

  try {
    await sendPatientStatus(
      lineUserID,
      objWithOutCreatedDate,
      config.line.channelAccessToken
    );
  } catch (err) {
    console.log(err);
  }

  return success({ status: inclusion_label });
};
