const functions = require("firebase-functions");
const {
  registerSchema,
  getProfileSchema,
  historySchema,
  //mon added this
  deletePatientSchema,
  //end mon code
} = require("../../schema");
const { admin } = require("../../init");
const { getProfile } = require("../../middleware/authentication");
const { success } = require("../../response/success");
const { makeStatusAPIPayload, makeRequest } = require("../../api");
const { statusList, statusListReverse } = require("../../api/const");
const { sendPatientstatus } = require("../../linefunctions/linepushmessage");
const { notifyToLine } = require("../../linenotify");
const { convertTimestampToStr } = require("../../utils/date");
const { config } = require("../../config/index");
const {
  setPatientStatus,
  snapshotExists,
  updateSymptomAddCreatedDate,
  updateSymptomCheckUser,
  updateSymptomCheckAmed,
  updateSymptomUpdateStatus,
  setAmedStatus,
} = require("./utils");

const addTotalPatientCount = async () => {
  const snapshot = await admin
    .firestore()
    .collection("userCount")
    .doc("users")
    .get();

  if (!snapshot.exists) {
    await snapshot.ref.create({ count: 1 });
  } else {
    await snapshot.ref.update("count", admin.firestore.FieldValue.increment(1));
  }
};

const decrementTotalPatientCount = async () => {
  const snapshot = await admin
    .firestore()
    .collection("userCount")
    .doc("users")
    .get();
  if (snapshot.exists) {
    await snapshot.ref.update(
      "count",
      admin.firestore.FieldValue.increment(-1)
    );
  }
};

const addTotalPatientCountByColor = async (status) => {
  const snapshot = await admin
    .firestore()
    .collection("userCount")
    .doc(status)
    .get();

  if (!snapshot.exists) {
    await snapshot.ref.create({ count: 1 });
  } else {
    await snapshot.ref.update("count", admin.firestore.FieldValue.increment(1));
  }
};

const decrementTotalPatientCountByColor = async (status) => {
  const snapshot = await admin
    .firestore()
    .collection("userCount")
    .doc(status)
    .get();

  if (snapshot.exists) {
    await snapshot.ref.update(
      "count",
      admin.firestore.FieldValue.increment(-1)
    );
  }
};

// Mon added this code
const deletePatient = async (personalID) => {
  const snapshot = await admin
    .firestore()
    .collection("patient")
    .where("personalID", "==", personalID)
    .get();

  if (snapshot.empty) {
    return false;
  } else {
    //deletes all patient with personalID = personalID and decrement relevant counters
    const batch = admin.firestore().batch();
    snapshot.forEach((doc) => {
      const patientDocRef = admin.firestore().collection("patient").doc(doc.id);
      const legacyRef = admin.firestore().collection("legacyUser").doc(doc.id);
      const patientCountRef = admin
        .firestore()
        .collection("userCount")
        .doc("users");
      const colorCountRef =
        doc.data().status in statusListReverse
          ? admin
              .firestore()
              .collection("userCount")
              .doc(statusListReverse[doc.data().status])
          : null;
      batch.delete(patientDocRef);
      batch.set(legacyRef, { ...doc.data() });
      batch.update(
        patientCountRef,
        "count",
        admin.firestore.FieldValue.increment(-1)
      );
      if (colorCountRef) {
        batch.update(
          colorCountRef,
          "count",
          admin.firestore.FieldValue.increment(-1)
        );
      }
    });
    return batch
      .commit()
      .then(() => true)
      .catch((error) => {
        console.log(error);
        return false;
      });
    // res = await Promise.all(snapshot.docs.map((doc) => {
    //   admin.firestore().collection("patient").doc(doc.id).delete();
    //   admin.firestore().collection("legacyUser").doc(doc.id).set({...doc.data()});
    //   decrementTotalPatientCount();
    //   if(doc.data().triage_score in statusListReverse) {
    //     decrementTotalPatientCountByColor(
    //       statusListReverse[doc.data().triage_score]
    //     );
    //   }
    // }))
    // .then(() => {
    //   return true;
    // })
    // .catch(error => {
    //   console.log(error);
    //   return false;
    // });
  }
};

exports.requestDeletePatient = async (data, _context) => {
  const { value, error } = deletePatientSchema.validate(data);

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
      "delete operation failed or id not found"
    );
  }
};
// end of mon's code

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

  const createdDate = new Date();
  setPatientStatus(obj, createdDate);

  //need db connection
  const snapshot = await admin
    .firestore()
    .collection("patient")
    .doc(lineUserID)
    .get();

  const whitelist = await admin
    .firestore()
    .collection("whitelist")
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
  try {
    await addTotalPatientCount();
  } catch (err) {
    console.log(err);
  }

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

  const date = new Date();
  const createdTimeStamp = admin.firestore.Timestamp.fromDate(date);
  updateSymptomAddCreatedDate(obj, createdTimeStamp);

  //need db connection
  const snapshot = await admin
    .firestore()
    .collection("patient")
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
    await sendPatientstatus(
      lineUserID,
      objWithOutCreatedDate,
      config.line.channelAccessToken
    );
  } catch (err) {
    console.log(err);
  }

  try {
    if (previousStatus !== null) {
      await decrementTotalPatientCountByColor(
        statusListReverse[previousStatus]
      );
    }
  } catch (err) {
    console.log(err);
  }

  try {
    if (objWithOutCreatedDate["toAmed"] === 1) {
      await decrementTotalPatientCount();
    }
  } catch (err) {
    console.log(err);
  }

  try {
    await addTotalPatientCountByColor(inclusion_label);
  } catch (err) {
    console.log(err);
  }

  return success({ status: inclusion_label });
};
