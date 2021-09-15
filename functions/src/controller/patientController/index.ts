import * as functions from "firebase-functions";
import {
  validateGetProfileSchema,
  validateHistorySchema,
  //mon added this
  validateDeletePatientSchema,
  DeletePatientType,
  GetProfileType,
  HistoryType,
  //end mon code
} from "../../schema";
import { admin, collection } from "../../init";
import { success } from "../../response/success";
import { statusList } from "../../api/const"
import { convertTimestampToStr } from "../../utils"
import config from "../../config"
import * as utils from "./utils";
import { Patient, OnCallHandler } from "../../types";



import { getProfile } from "../../middleware/authentication";
import { makeStatusAPIPayload, makeRequest } from "../../api";
import { sendPatientstatus } from "../../linefunctions/linepushmessage";

// Mon added this code
const deletePatient = async (personalID: string) => {
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

export const requestDeletePatient: OnCallHandler<DeletePatientType> = async (data, _context) => {
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


export const getProfileHandler: OnCallHandler<GetProfileType> = async (data, _context) => {
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
    const { followUp, ...patientData } = snapshot.data() as Patient;
    const serializeData = convertTimestampToStr(patientData);
    return { line: { name, picture }, patient: serializeData };
  } else {
    return { line: { name, picture }, patient: null };
  }
};

export const updateSymptom: OnCallHandler<HistoryType> = async (data, _context) => {
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
  // utils.updateSymptomCheckAmed(snapshotData);

  const formPayload = makeStatusAPIPayload(obj);
  const { inclusion_label, inclusion_label_type, triage_score } =
    await makeRequest(formPayload);

  const status = statusList[inclusion_label];

  const followUpObj = utils.createFollowUpObj(
    obj,
    status,
    inclusion_label_type,
    triage_score,
    createdTimeStamp
  )
  const snapshot = await admin
    .firestore()
    .collection(collection.patient)
    .doc(lineUserID)
    .get();

  if (!snapshot.exists) {
    await snapshot.ref.create({
      followUp: [followUpObj],
    });
  } else {
    await snapshot.ref.update({
      followUp: admin.firestore.FieldValue.arrayUnion(followUpObj),
    });
  }

  try {
    await sendPatientstatus(
      lineUserID,
      followUpObj,
      config.line.channelAccessToken
    );
  } catch (err) {
    console.log(err);
  }

  return success({ status: inclusion_label });
};

export const getFollowupHistory: OnCallHandler<GetProfileType> = async (data, context) => {
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
  const { data: errorData, error: authError } = await getProfile({
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

  const snapshot = await admin
    .firestore()
    .collection("patient")
    .doc(lineUserID)
    .get();

  if (!snapshot.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `ไม่พบข้อมูลผู้ใช้ ${lineUserID}`
    );
  }

  const patient = snapshot.data() as Patient
  return success(patient.followUp);


}
