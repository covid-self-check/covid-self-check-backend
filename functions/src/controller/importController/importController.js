import * as functions from "firebase-functions";
const {
  validateImportPatientIdSchema,
  validateImportWhitelistSchema,
  validateImportRequestToRegisterSchema,
} = require("../../schema");
const { admin, collection } = require("../../init");
const { success } = require("../../response/success");

// exports.importFinishR2C = async (data, _context) => {
//     const { value, error } = importPatientIdSchema.validate(data)
//     if (error) {
//         console.log(error.details)
//         throw new functions.https.HttpsError(
//             'invalid-argument',
//             'ข้อมูลไม่ถูกต้อง',
//             error.details
//         )
//     }
//     const { ids } = value
//     const snapshot = await admin
//         .firestore()
//         .collection('patient')
//         .where('isRequestToCall', '==', true)
//         .where('isRequestToCallExported', '==', true)
//         .get()

//     const batch = admin.firestore().batch()

//     snapshot.docs.forEach((doc) => {
//         const hasCalled = ids.includes(doc.id)
//         const docRef = admin.firestore().collection('patient').doc(doc.id)
//         if (hasCalled) {
//             batch.update(docRef, {
//                 isRequestToCall: false,
//                 isRequestToCallExported: false,
//             })
//         } else {
//             batch.update(docRef, {
//                 isRequestToCallExported: false,
//             })
//         }
//     })

//     await batch.commit()
//     return success()
// }

exports.importFinishR2C = async (data, _context) => {
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
  const map = {};
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
  const promises = [];
  snapshot.docs.forEach((doc) => {
    const docRef = admin.firestore().collection(collection.patient).doc(doc.id);
    // if user is not imported, there will not be updated

    if (!map[doc.id]) return;
    const { status, reason } = map[doc.id];
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

exports.importFinishR2R = async (data, _context) => {
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
  const map = {};
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

exports.importWhitelist = async (data, _context) => {
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

  const promises = [];
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