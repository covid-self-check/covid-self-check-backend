import * as functions from "firebase-functions";
import {
  validateImportPatientIdSchema,
  validateImportWhitelistSchema,
  validateImportRequestToRegisterSchema,
  ImportPatientIdType,
  ImportRequestToRegisterType,
  ImportWhitelistType,
} from "../../schema";
import { admin, collection } from "../../init";
import { success } from "../../response/success";
import { OnCallHandler } from "../../types";
import { WriteResult } from "@google-cloud/firestore";

type MapUser = { [key: string]: { status: number } }

export const importFinishR2C: OnCallHandler<ImportPatientIdType> = async (data, _context) => {
  const { value, error } = validateImportPatientIdSchema(data);
  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { users } = value;
  const map: MapUser = {};
  for (const user of users) {
    const { id, ...obj } = user;
    map[user.id] = obj;
  }

  const snapshot = await admin
    .firestore()
    .collection(collection.patient)
    .where("isRequestToCall", "==", true)
    .where("isRequestToCallExported", "==", true)
    .get();

  const legacyRef = admin
    .firestore()
    .collection(collection.legacyStat)
    .doc("stat");

  const batch = admin.firestore().batch();
  const promises: Promise<void>[] = [];
  snapshot.docs.forEach((doc) => {
    const docRef = admin.firestore().collection(collection.patient).doc(doc.id);
    // if user is not imported, there will not be updated

    if (!map[doc.id]) return;
    const { status } = map[doc.id];
    switch (status) {
      // not called
      case 0:
        batch.update(docRef, {
          isRequestToCallExported: false,
        });
        break;

      // has called
      case 1:
        batch.update(docRef, {
          isRequestToCall: false,
          isRequestToCallExported: false,
        });
        break;
      // out of system
      case 99:
        promises.push(
          docRef
            .get()
            .then((result) => result.data())
            .then((docData) => {
              const ref = admin
                .firestore()
                .collection(collection.legacyUser)
                .doc(doc.id);
              return { docData, ref };
            })
            .then(({ docData, ref }) => {
              batch.set(ref, {
                ...docData,
              });
              batch.delete(docRef);
            })
        );
        //increment Legacy user count
        batch.update(legacyRef, {
          count: admin.firestore.FieldValue.increment(1),
        });
        break;
      default:
        return;
    }
  });

  await Promise.all(promises);
  await batch.commit();
  return success();
};

export const importFinishR2R: OnCallHandler<ImportRequestToRegisterType> = async (data, _context) => {
  const { value, error } = validateImportRequestToRegisterSchema(data);
  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { users } = value;
  const map: MapUser = {};
  for (const user of users) {
    const { id, ...obj } = user;
    map[user.id] = obj;
  }

  const snapshot = await admin
    .firestore()
    .collection(collection.r2rAssistance)
    .where("isR2RExported", "==", true)
    .get();

  const batch = admin.firestore().batch();
  snapshot.docs.forEach((doc) => {
    // if user is not imported, there will not be updated

    if (!map[doc.id]) return;
    const { status } = map[doc.id];
    const docRef = admin
      .firestore()
      .collection(collection.r2rAssistance)
      .doc(doc.id);

    switch (status) {
      // not called
      case 0:
        batch.update(docRef, {
          isR2RExported: false,
        });
        break;
      default:
        return;
    }
  });

  await batch.commit();
  return success();
};

export const importWhitelist: OnCallHandler<ImportWhitelistType> = async (data, _context) => {
  const { value, error } = validateImportWhitelistSchema(data);
  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { users } = value;

  const promises: Promise<WriteResult>[] = [];
  users.forEach((user) => {
    promises.push(
      admin.firestore().collection("whitelist").doc(user.id).set({
        id: user.id,
      })
    );
  });
  await Promise.all(promises);
  return success();
};
