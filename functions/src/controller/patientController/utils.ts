const { admin } = require("../../init");
const functions = require("firebase-functions");
import { RegisterType } from '../../schema';
import { Patient } from '../../types'

exports.setPatientStatus = (obj: Omit<RegisterType, 'noAuth' | 'lineIDToken' | 'lineUserID'>, createdDate: Date): Patient => {
  const createdTimestamp = admin.firestore.Timestamp.fromDate(createdDate);

  const result = {
    status: 0,
    needFollowUp: true,
    followUp: [],
    createdDate: createdTimestamp,
    lastUpdatedAt: createdTimestamp,
    isRequestToCallExported: false,
    isRequestToCall: false,
    isNurseExported: false,
    toAmed: 0,
    ...obj
  }

  return result
};

exports.snapshotExists = (snapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>) => {
  if (snapshot.exists) {
    if (snapshot.data()?.toAmed === 1) {
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

exports.updateSymptomAddCreatedDate = (obj: Record<string, any>, date: Date) => {
  obj.createdDate = date;
};

exports.updateSymptomCheckUser = (snapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>, lineUserID: string) => {
  if (!snapshot.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `ไม่พบผู้ใช้ ${lineUserID}`
    );
  }
};

exports.updateSymptomCheckAmed = (snapshotData: Record<string, any>) => {
  const { toAmed } = snapshotData;
  if (toAmed === 1) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "your information is already handle by Amed"
    );
  }
};

exports.updateSymptomUpdateStatus = (
  obj: Record<string, any>,
  status: number,
  inclusion_label_type: string,
  triage_score: number,
  createdTimeStamp: any
) => {
  obj["status"] = status;
  obj["status_label_type"] = inclusion_label_type;
  obj["triage_score"] = triage_score;
  obj["lastUpdatedAt"] = createdTimeStamp;
};

exports.setAmedStatus = (obj: Record<string, any>, status: number, previousStatus: number, TO_AMED_STATUS: any) => {
  if (status !== previousStatus && TO_AMED_STATUS.includes(status)) {
    obj["toAmed"] = 1;
  } else {
    obj["toAmed"] = 0;
  }
};
