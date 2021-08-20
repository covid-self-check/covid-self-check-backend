"use strict";
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const {
  importPatientIdSchema,
  importWhitelistSchema,
  importRequestToRegisterSchema,
} = require("../schema");
const init_1 = require("../init");
const success_1 = require("../response/success");
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
  const { value, error } = importPatientIdSchema.validate(data);
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
    const { id } = user,
      obj = __rest(user, ["id"]);
    map[user.id] = obj;
  }
  const snapshot = await init_1.admin
    .firestore()
    .collection("patient")
    .where("isRequestToCall", "==", true)
    .where("isRequestToCallExported", "==", true)
    .get();
  const batch = init_1.admin.firestore().batch();
  const promises = [];
  snapshot.docs.forEach((doc) => {
    const docRef = init_1.admin.firestore().collection("patient").doc(doc.id);
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
              const ref = init_1.admin
                .firestore()
                .collection("legacyUser")
                .doc(doc.id);
              return { docData, ref };
            })
            .then(({ docData, ref }) => {
              batch.set(ref, Object.assign({}, docData));
              batch.delete(docRef);
            })
        );
        break;
      default:
        return;
    }
  });
  await Promise.all(promises);
  await batch.commit();
  return success_1.success();
};
exports.importFinishR2R = async (data, _context) => {
  const { value, error } = importRequestToRegisterSchema.validate(data);
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
    const { id } = user,
      obj = __rest(user, ["id"]);
    map[user.id] = obj;
  }
  const snapshot = await init_1.admin
    .firestore()
    .collection("requestToRegisterAssistance")
    .where("isR2RExported", "==", true)
    .get();
  const batch = init_1.admin.firestore().batch();
  snapshot.docs.forEach((doc) => {
    // if user is not imported, there will not be updated
    if (!map[doc.id]) return;
    const { status } = map[doc.id];
    const docRef = init_1.admin
      .firestore()
      .collection("requestToRegisterAssistance")
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
  return success_1.success();
};
exports.importWhitelist = async (data, _context) => {
  const { value, error } = importWhitelistSchema.validate(data);
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
      init_1.admin.firestore().collection("whitelist").doc(user.id).set({
        id: user.id,
      })
    );
  });
  await Promise.all(promises);
  return success_1.success();
};
//# sourceMappingURL=importController.js.map
