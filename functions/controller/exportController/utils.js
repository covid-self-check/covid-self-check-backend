const { admin } = require("../../init");

const R2R_COLLECTION = "requestToRegisterAssistance";

exports.getUnExportedR2RUsers = () => {
  return admin
    .firestore()
    .collection(R2R_COLLECTION)
    .where("isR2RExported", "==", false)
    .get();
};

/**
 * marked users from R2R collection as exported
 * @param {FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>} snapshot
 * @returns
 */
exports.serializeData = (snapshot) => {
  const result = [];
  snapshot.docs.forEach((doc) => {
    result.push(doc.data());
  });

  return result;
};

/**
 * marked users from R2R collection as exported
 * @param {FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>} snapshot
 * @returns
 */
exports.updateExportedR2RUsers = (snapshot) => {
  return Promise.all(
    snapshot.docs.map((doc) => {
      const ref = admin.firestore().collection(R2R_COLLECTION).doc(doc.id);

      return ref.update({
        isR2RExported: true,
      });
    })
  );
};

exports.getUnExportedR2CUsers = () => {
  return admin
    .firestore()
    .collection("patient")
    .where("isRequestToCall", "==", true)
    .where("isRequestToCallExported", "==", false)
    .orderBy("lastUpdatedAt")
    .get();
};

/**
 * marked users from R2C collection as exported and return serialized data
 * @param {FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>} snapshot
 * @returns serialized snapshot data
 */
exports.updateAndSerializeR2CData = async (snapshot) => {
  const patientList = [];
  await Promise.all(
    snapshot.docs.map((doc) => {
      // WARNING SIDE EFFECT inside map
      const data = doc.data();
      const dataResult = this.makeR2CPayload(doc.id, data);
      patientList.push(dataResult);
      // end of side effects

      this.updateExportedR2CUser(id);
    })
  );

  return patientList;
};

exports.makeR2CPayload = (id, data) => {
  return {
    id,
    firstName: data.firstName,
    lastName: data.lastName,
    hasCalled: 0,
    personalPhoneNo: data.personalPhoneNo,
  };
};

exports.updateExportedR2CUser = (id) => {
  const ref = admin.firestore().collection("patient").doc(id);

  ref.update({
    isRequestToCallExported: true,
  });
};

exports.formatterR2R = (doc) => [doc.name, doc.personalPhoneNo];

exports.formatterR2C = (doc) => [
  doc.id,
  doc.firstName,
  doc.hasCalled,
  `="${doc.personalPhoneNo}"`,
];
