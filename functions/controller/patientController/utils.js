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
  const createdTimeStamp = admin.firestore.Timestamp.fromDate(date);
  obj.createdDate = createdTimeStamp;
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
