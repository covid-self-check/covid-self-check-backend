const { admin } = require("../../init");
const functions = require("firebase-functions");
import { RegisterType, HistoryType } from '../../schema';
import { Patient, UpdatedPatient } from '../../types'
const { TO_AMED_STATUS } = require("../../utils/status")


export const setPatientStatus = (obj: Omit<RegisterType, 'noAuth' | 'lineIDToken' | 'lineUserID'>, createdDate: Date): Patient => {
  const createdTimestamp = admin.firestore.Timestamp.fromDate(createdDate);

  return {
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
};


export const createFollowUpObj = (
  obj: Omit<HistoryType, 'noAuth' | 'lineIDToken' | 'lineUserID'>,
  status: number,
  inclusion_label_type: string,
  triage_score: number,
  createdTimeStamp: any,
  prevStatus: number,
): UpdatedPatient => {

  // set To Amed Status
  const toAmed = checkAmedStatus(status, prevStatus, TO_AMED_STATUS)

  // update other status
  return {
    ...obj,
    status,
    triage_score,
    status_label_type: inclusion_label_type,
    lastUpdatedAt: createdTimeStamp,
    createdDate: createdTimeStamp,
    toAmed: toAmed ? 1 : 0
  }

}

const checkAmedStatus = (status: number, prevStatus: number, TO_AMED_STATUS: any,): boolean => {
  return status !== prevStatus && TO_AMED_STATUS.includes(status)
}

export const snapshotExists = (snapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>) => {
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

export const updateSymptomAddCreatedDate = (
  obj: Record<string, any>,
  timestamp: FirebaseFirestore.Timestamp
) => {
  obj.createdDate = timestamp;
};

export const updateSymptomCheckUser = (snapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>, lineUserID: string) => {
  if (!snapshot.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `ไม่พบผู้ใช้ ${lineUserID}`
    );
  }
};

export const updateSymptomCheckAmed = (snapshotData: Record<string, any>) => {
  const { toAmed } = snapshotData;
  if (toAmed === 1) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "your information is already handle by Amed"
    );
  }
};

export const updateSymptomUpdateStatus = (
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

export const setAmedStatus = (obj: Record<string, any>, status: number, previousStatus: number, TO_AMED_STATUS: any) => {
  if (status !== previousStatus && TO_AMED_STATUS.includes(status)) {
    obj["toAmed"] = 1;
  } else {
    obj["toAmed"] = 0;
  }
};
