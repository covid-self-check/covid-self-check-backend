"use strict";
const { admin } = require("../../init");
const functions = require("firebase-functions");
exports.setPatientStatus = (obj, createdDate) => {
  const needFollowUp = true;
  obj["status"] = 0;
  obj["needFollowUp"] = needFollowUp;
  obj["followUp"] = [];
  const createdTimestamp = admin.firestore.Timestamp.fromDate(createdDate);
  obj["createdDate"] = createdTimestamp;
  obj["lastUpdatedAt"] = createdTimestamp;
  obj["isRequestToCallExported"] = false;
  obj["isRequestToCall"] = false;
  obj["isNurseExported"] = false;
  obj["toAmed"] = 0;
};
exports.snapshotExists = (snapshot) => {
  if (snapshot.exists) {
    if (snapshot.data().toAmed === 1) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "your information is already handle by Amed"
      );
    }
    throw new functions.https.HttpsError(
      "already-exists",
      "มีข้อมูลผู้ใช้ในระบบแล้ว"
    );
  }
};
exports.updateSymptomAddCreatedDate = (obj, date) => {
  obj.createdDate = date;
};
exports.updateSymptomCheckUser = (snapshot, lineUserID) => {
  if (!snapshot.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `ไม่พบผู้ใช้ ${lineUserID}`
    );
  }
};
exports.updateSymptomCheckAmed = (snapshotData) => {
  const { toAmed } = snapshotData;
  if (toAmed === 1) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "your information is already handle by Amed"
    );
  }
};
exports.updateSymptomUpdateStatus = (
  obj,
  status,
  inclusion_label_type,
  triage_score,
  createdTimeStamp
) => {
  obj["status"] = status;
  obj["status_label_type"] = inclusion_label_type;
  obj["triage_score"] = triage_score;
  obj["lastUpdatedAt"] = createdTimeStamp;
};
exports.setAmedStatus = (obj, status, previousStatus, TO_AMED_STATUS) => {
  if (status !== previousStatus && TO_AMED_STATUS.includes(status)) {
    obj["toAmed"] = 1;
  } else {
    obj["toAmed"] = 0;
  }
};
//# sourceMappingURL=utils.js.map
