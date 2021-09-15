import * as  functions from "firebase-functions";
import { HistoryType } from '../../schema';
import { UpdatedPatient } from '../../types'
import { DocumentSnapshot } from "firebase-functions/v1/firestore";


export const createFollowUpObj = (
  obj: Omit<HistoryType, 'noAuth' | 'lineIDToken' | 'lineUserID'>,
  status: number,
  inclusion_label_type: string,
  triage_score: number,
  createdTimeStamp: any,
): UpdatedPatient => {

  // update other status
  return {
    ...obj,
    status,
    triage_score,
    status_label_type: inclusion_label_type,
    lastUpdatedAt: createdTimeStamp,
    createdDate: createdTimeStamp,
  }

}

export const snapshotExists = (snapshot: DocumentSnapshot) => {
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

export const updateSymptomCheckUser = (snapshot: DocumentSnapshot, lineUserID: string) => {
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

